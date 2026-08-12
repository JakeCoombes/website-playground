"""Leakage-safe feature, target, validation, calibration, and artifact pipeline.

Training is intentionally offline. Vercel serves only artifacts that pass the
validation gate; it never trains a model during a web request.
"""
from __future__ import annotations

import argparse
import json
import math
import os
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

import joblib
import numpy as np
import pandas as pd
import requests
from sklearn.calibration import CalibratedClassifierCV
from sklearn.frozen import FrozenEstimator
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier, XGBRegressor

HORIZON = 90
FEATURE_COLUMNS = [
    "price_sma20", "price_sma50", "price_sma100", "price_sma200", "sma20_sma50",
    "sma50_sma200", "price_ema20", "price_ema50", "macd", "macd_signal",
    "macd_hist", "adx14", "rsi14", "roc20", "roc60", "return21", "return63",
    "return126", "return252", "relative21", "relative63", "relative126",
    "relative252", "atr14_pct", "vol20", "vol60", "bb_width", "bb_position",
    "drawdown20", "drawdown60", "volume_ratio20", "volume_ratio60", "obv_slope20",
    "distance_high252", "distance_low252", "breakout20", "breakout60",
    "spy_price_sma200", "spy_rsi14", "spy_vol20", "spy_return63",
]


def _safe_div(a: pd.Series, b: pd.Series) -> pd.Series:
    return a.div(b.replace(0, np.nan))


def _rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff(); gain = delta.clip(lower=0); loss = -delta.clip(upper=0)
    rs = gain.ewm(alpha=1 / period, adjust=False, min_periods=period).mean().div(
        loss.ewm(alpha=1 / period, adjust=False, min_periods=period).mean().replace(0, np.nan)
    )
    return 100 - (100 / (1 + rs))


def _adx(frame: pd.DataFrame, period: int = 14) -> pd.Series:
    up = frame.high.diff(); down = -frame.low.diff()
    plus_dm = up.where((up > down) & (up > 0), 0.0); minus_dm = down.where((down > up) & (down > 0), 0.0)
    tr = pd.concat([(frame.high-frame.low), (frame.high-frame.close.shift()).abs(), (frame.low-frame.close.shift()).abs()], axis=1).max(axis=1)
    atr = tr.ewm(alpha=1/period, adjust=False, min_periods=period).mean()
    plus = 100 * plus_dm.ewm(alpha=1/period, adjust=False, min_periods=period).mean() / atr
    minus = 100 * minus_dm.ewm(alpha=1/period, adjust=False, min_periods=period).mean() / atr
    return 100 * (plus-minus).abs().div((plus+minus).replace(0, np.nan)).ewm(alpha=1/period, adjust=False).mean()


def _max_drawdown(close: pd.Series, window: int) -> pd.Series:
    return close.div(close.rolling(window).max()).sub(1)


def engineer_features(stock: pd.DataFrame, spy: pd.DataFrame) -> pd.DataFrame:
    """Every row at T uses observations at or before T only."""
    stock = stock.sort_index().copy(); spy = spy.sort_index().reindex(stock.index).ffill()
    close = stock.close; returns = close.pct_change(); out = pd.DataFrame(index=stock.index)
    sma = {n: close.rolling(n).mean() for n in (20, 50, 100, 200)}
    ema20 = close.ewm(span=20, adjust=False).mean(); ema50 = close.ewm(span=50, adjust=False).mean()
    ema12 = close.ewm(span=12, adjust=False).mean(); ema26 = close.ewm(span=26, adjust=False).mean()
    macd = ema12-ema26; macd_signal = macd.ewm(span=9, adjust=False).mean()
    out["price_sma20"]=_safe_div(close,sma[20])-1; out["price_sma50"]=_safe_div(close,sma[50])-1
    out["price_sma100"]=_safe_div(close,sma[100])-1; out["price_sma200"]=_safe_div(close,sma[200])-1
    out["sma20_sma50"]=_safe_div(sma[20],sma[50])-1; out["sma50_sma200"]=_safe_div(sma[50],sma[200])-1
    out["price_ema20"]=_safe_div(close,ema20)-1; out["price_ema50"]=_safe_div(close,ema50)-1
    out["macd"]=_safe_div(macd,close); out["macd_signal"]=_safe_div(macd_signal,close); out["macd_hist"]=_safe_div(macd-macd_signal,close)
    out["adx14"]=_adx(stock)/100; out["rsi14"]=_rsi(close)/100
    out["roc20"]=close.pct_change(20); out["roc60"]=close.pct_change(60)
    for days,name in ((21,"return21"),(63,"return63"),(126,"return126"),(252,"return252")): out[name]=close.pct_change(days)
    spy_close=spy.close
    for days,name in ((21,"relative21"),(63,"relative63"),(126,"relative126"),(252,"relative252")): out[name]=close.pct_change(days)-spy_close.pct_change(days)
    tr=pd.concat([(stock.high-stock.low),(stock.high-close.shift()).abs(),(stock.low-close.shift()).abs()],axis=1).max(axis=1)
    out["atr14_pct"]=_safe_div(tr.rolling(14).mean(),close); out["vol20"]=returns.rolling(20).std()*math.sqrt(252); out["vol60"]=returns.rolling(60).std()*math.sqrt(252)
    std20=close.rolling(20).std(); upper=sma[20]+2*std20; lower=sma[20]-2*std20
    out["bb_width"]=_safe_div(upper-lower,sma[20]); out["bb_position"]=_safe_div(close-lower,upper-lower)
    out["drawdown20"]=_max_drawdown(close,20); out["drawdown60"]=_max_drawdown(close,60)
    out["volume_ratio20"]=_safe_div(stock.volume,stock.volume.rolling(20).mean()); out["volume_ratio60"]=_safe_div(stock.volume,stock.volume.rolling(60).mean())
    obv=(np.sign(close.diff()).fillna(0)*stock.volume).cumsum(); out["obv_slope20"]=_safe_div(obv-obv.shift(20),obv.abs().rolling(20).mean())
    high252=close.rolling(252).max(); low252=close.rolling(252).min(); out["distance_high252"]=_safe_div(close,high252)-1; out["distance_low252"]=_safe_div(close,low252)-1
    out["breakout20"]=(close>close.shift(1).rolling(20).max()).astype(float); out["breakout60"]=(close>close.shift(1).rolling(60).max()).astype(float)
    spy_ret=spy_close.pct_change(); out["spy_price_sma200"]=_safe_div(spy_close,spy_close.rolling(200).mean())-1
    out["spy_rsi14"]=_rsi(spy_close)/100; out["spy_vol20"]=spy_ret.rolling(20).std()*math.sqrt(252); out["spy_return63"]=spy_close.pct_change(63)
    return out.replace([np.inf,-np.inf],np.nan)


def create_targets(stock: pd.DataFrame, spy: pd.DataFrame, horizon: int = HORIZON) -> pd.DataFrame:
    """Targets start strictly after T and end at T+horizon."""
    close=stock.close; spy_close=spy.reindex(stock.index).ffill().close
    stock_forward=close.shift(-horizon)/close-1; spy_forward=spy_close.shift(-horizon)/spy_close-1
    future_min=pd.concat([close.shift(-step)/close-1 for step in range(1,horizon+1)],axis=1).min(axis=1)
    return pd.DataFrame({"boom":((stock_forward-spy_forward)>=.05).astype(float),"bust":(future_min<=-.15).astype(float),"excess_return":stock_forward-spy_forward,"forward_return":stock_forward,"spy_forward_return":spy_forward},index=stock.index).where(stock_forward.notna())


def remove_correlated_features(train: pd.DataFrame, threshold: float=.95) -> list[str]:
    corr=train[FEATURE_COLUMNS].corr().abs(); upper=corr.where(np.triu(np.ones(corr.shape),k=1).astype(bool))
    return [column for column in FEATURE_COLUMNS if not any(upper[column]>threshold)]


def classification_metrics(y: pd.Series, p: np.ndarray) -> dict:
    prediction=(p>=.5).astype(int)
    return {"rocAuc":float(roc_auc_score(y,p)) if y.nunique()>1 else None,"precision":float(precision_score(y,prediction,zero_division=0)),"recall":float(recall_score(y,prediction,zero_division=0)),"f1":float(f1_score(y,prediction,zero_division=0)),"brier":float(brier_score_loss(y,p))}


def regression_metrics(y: pd.Series, prediction: np.ndarray) -> dict:
    error=np.asarray(y)-prediction
    return {"mae":float(np.mean(np.abs(error))),"rmse":float(np.sqrt(np.mean(error**2))),"correlation":float(np.corrcoef(y,prediction)[0,1]) if len(y)>1 else None}


def performance_metrics(returns: pd.Series, spy_returns: pd.Series, costs_bps: float=10) -> dict:
    """Metrics for non-overlapping 90-trading-day portfolio observations."""
    net=returns-(costs_bps/10000); cumulative=(1+net).prod(); periods=max(len(net),1)
    downside=net[net<0].std(); curve=(1+net).cumprod(); drawdown=curve/curve.cummax()-1
    return {"totalReturn":float(cumulative-1),"cagr":float(cumulative**(252/(HORIZON*periods))-1) if cumulative>0 else -1.0,"excessReturn":float(net.sum()-spy_returns.sum()),"sharpe":float(net.mean()/net.std()*math.sqrt(252/HORIZON)) if net.std()>0 else 0.0,"sortino":float(net.mean()/downside*math.sqrt(252/HORIZON)) if downside and downside>0 else 0.0,"maxDrawdown":float(drawdown.min()),"winRate":float((net>0).mean()),"averageForwardReturn":float(net.mean()),"trades":int(len(net))}


def rebalance_portfolios(frame: pd.DataFrame, score: str | None, top_n: int=5) -> tuple[pd.Series,pd.Series]:
    """Select equal-weight cohorts every 90 trading days so returns never overlap."""
    dates=frame.index.unique().sort_values()[::HORIZON]; portfolio=[]; benchmark=[]
    for date in dates:
        cross_section=frame.loc[[date]]
        selected=cross_section.nlargest(min(top_n,len(cross_section)),score) if score else cross_section
        portfolio.append(float(selected.forward_return.mean())); benchmark.append(float(selected.spy_forward_return.mean()))
    return pd.Series(portfolio,dtype=float),pd.Series(benchmark,dtype=float)


@dataclass
class FoldResult:
    validation_year:int; boom:dict; bust:dict; excess:dict


def train_and_validate(dataset: pd.DataFrame, holdout_year: int, costs_bps: float=10) -> tuple[dict,dict]:
    data=dataset.sort_index(); development=data[data.index.year<holdout_year]; holdout=data[data.index.year>=holdout_year]
    validation_years=sorted(set(development.index.year))[-4:]; fold_results=[]; oof=[]
    for year in validation_years:
        train=development[development.index.year<year]; valid=development[development.index.year==year]
        if len(train)<500 or len(valid)<50: continue
        columns=remove_correlated_features(train)
        boom=XGBClassifier(n_estimators=500,max_depth=3,learning_rate=.03,subsample=.8,colsample_bytree=.8,eval_metric="logloss",early_stopping_rounds=30,n_jobs=-1)
        bust=XGBClassifier(n_estimators=400,max_depth=3,learning_rate=.03,subsample=.8,colsample_bytree=.8,eval_metric="logloss",early_stopping_rounds=30,n_jobs=-1)
        excess=XGBRegressor(n_estimators=500,max_depth=3,learning_rate=.03,subsample=.8,colsample_bytree=.8,objective="reg:squarederror",early_stopping_rounds=30,n_jobs=-1)
        boom.fit(train[columns],train.boom,eval_set=[(valid[columns],valid.boom)],verbose=False); bust.fit(train[columns],train.bust,eval_set=[(valid[columns],valid.bust)],verbose=False); excess.fit(train[columns],train.excess_return,eval_set=[(valid[columns],valid.excess_return)],verbose=False)
        bp=boom.predict_proba(valid[columns])[:,1]; xp=bust.predict_proba(valid[columns])[:,1]; ep=excess.predict(valid[columns])
        fold_results.append(FoldResult(year,classification_metrics(valid.boom,bp),classification_metrics(valid.bust,xp),regression_metrics(valid.excess_return,ep)))
        part=valid[["symbol","boom","bust","excess_return","forward_return","spy_forward_return"]].copy(); part[["boom_probability","bust_probability","expected_excess_return"]]=np.column_stack([bp,xp,ep]); oof.append(part)
    if not oof: raise ValueError("Not enough chronological history for walk-forward validation")
    oof_frame=pd.concat(oof).sort_index(); columns=remove_correlated_features(development)
    baseline=Pipeline([("scale",StandardScaler()),("model",LogisticRegression(max_iter=2000,class_weight="balanced"))]); baseline.fit(development[columns],development.boom)
    baseline_metrics=classification_metrics(holdout.boom,baseline.predict_proba(holdout[columns])[:,1])
    calibration_start=development.index.unique().sort_values()[int(len(development.index.unique())*.8)]
    model_train=development[development.index<calibration_start]; calibration=development[development.index>=calibration_start]
    boom_base=XGBClassifier(n_estimators=500,max_depth=3,learning_rate=.03,subsample=.8,colsample_bytree=.8,eval_metric="logloss",n_jobs=-1).fit(model_train[columns],model_train.boom)
    bust_base=XGBClassifier(n_estimators=400,max_depth=3,learning_rate=.03,subsample=.8,colsample_bytree=.8,eval_metric="logloss",n_jobs=-1).fit(model_train[columns],model_train.bust)
    boom=CalibratedClassifierCV(FrozenEstimator(boom_base),method="isotonic").fit(calibration[columns],calibration.boom)
    bust=CalibratedClassifierCV(FrozenEstimator(bust_base),method="isotonic").fit(calibration[columns],calibration.bust)
    reg=XGBRegressor(n_estimators=500,max_depth=3,learning_rate=.03,subsample=.8,colsample_bytree=.8,objective="reg:squarederror",n_jobs=-1).fit(development[columns],development.excess_return)
    bp=boom.predict_proba(holdout[columns])[:,1]; xp=bust.predict_proba(holdout[columns])[:,1]; ep=reg.predict(holdout[columns])
    holdout_metrics={"boom":classification_metrics(holdout.boom,bp),"bust":classification_metrics(holdout.bust,xp),"excess":regression_metrics(holdout.excess_return,ep),"baselineBoom":baseline_metrics}
    momentum_returns,momentum_spy=rebalance_portfolios(holdout,"relative126",5); holdout_metrics["momentumBaseline"]=performance_metrics(momentum_returns,momentum_spy,costs_bps)
    buy_returns,buy_spy=rebalance_portfolios(holdout,None); holdout_metrics["buyAndHoldBaseline"]=performance_metrics(buy_returns,buy_spy,costs_bps)
    scored=holdout.assign(predictedBoom=bp,predictedBust=xp,predictedExcess=ep); eligible=scored.query("predictedBust <= .35")
    selected_returns,selected_spy=rebalance_portfolios(eligible,"predictedBoom",5); holdout_metrics["investment"]=performance_metrics(selected_returns,selected_spy,costs_bps) if len(selected_returns) else {}
    useful=(holdout_metrics["boom"]["rocAuc"] or 0) >= max(.55,(baseline_metrics["rocAuc"] or 0)+.02) and holdout_metrics["boom"]["brier"]<baseline_metrics["brier"]
    report={"holdoutYear":holdout_year,"features":columns,"folds":[asdict(item) for item in fold_results],"holdout":holdout_metrics,"validationPassed":bool(useful),"gate":"Boom ROC-AUC >= max(0.55, baseline + 0.02) and lower Brier score"}
    return report,{"boom":boom,"bust":bust,"excess":reg,"features":columns,"importance":dict(zip(columns,boom_base.feature_importances_.tolist()))}


def build_prediction_artifact(dataset: pd.DataFrame, report: dict, models: dict, version: str) -> dict:
    if not report["validationPassed"]: return {"modelVersion":version,"validationPassed":False,"generatedAt":datetime.now(timezone.utc).isoformat(),"predictions":[]}
    latest=dataset.sort_index().groupby("symbol",group_keys=False).tail(1).dropna(subset=models["features"])
    bp=models["boom"].predict_proba(latest[models["features"]])[:,1]; xp=models["bust"].predict_proba(latest[models["features"]])[:,1]; ep=models["excess"].predict(latest[models["features"]])
    predictions=[]
    for row_index,(_,row) in enumerate(latest.iterrows()):
        contributions={name:float(row[name])*models["importance"].get(name,0) for name in models["features"]}; ranked=sorted(contributions,key=lambda name:abs(contributions[name]),reverse=True)[:8]
        history=min(1.0,float(row.notna().mean())); agreement=1-min(1,abs(float(bp[row_index])-(1-float(xp[row_index])))); calibration=max(0,1-report["holdout"]["boom"]["brier"]*2); confidence=.4*calibration+.3*history+.3*agreement
        predictions.append({"symbol":row.symbol,"generatedAt":datetime.now(timezone.utc).isoformat(),"horizonDays":HORIZON,"boomProbability":float(bp[row_index]),"bustProbability":float(xp[row_index]),"expectedExcessReturn":float(ep[row_index]),"confidence":float(np.clip(confidence,0,1)),"modelVersion":version,"asOf":str(row.name),"factors":{"positive":[name for name in ranked if contributions[name]>0][:4],"negative":[name for name in ranked if contributions[name]<0][:4]},"scores":{"trend":float(np.clip((row.price_sma200+.2)*250,0,100)),"momentum":float(np.clip((row.rsi14)*100,0,100)),"relativeStrength":float(np.clip((row.relative126+.2)*250,0,100)),"volatilityRisk":float(np.clip(100-row.vol60*100,0,100)),"volume":float(np.clip(row.volume_ratio20*50,0,100))}})
    return {"modelVersion":version,"validationPassed":True,"generatedAt":datetime.now(timezone.utc).isoformat(),"validation":report["holdout"],"predictions":predictions}


def main() -> None:
    parser=argparse.ArgumentParser(); parser.add_argument("--dataset",required=True); parser.add_argument("--holdout-year",type=int,required=True); parser.add_argument("--output",default="ml/artifacts"); args=parser.parse_args()
    data=pd.read_pickle(args.dataset).dropna(subset=FEATURE_COLUMNS+["boom","bust","excess_return"]); report,models=train_and_validate(data,args.holdout_year)
    output=Path(args.output); output.mkdir(parents=True,exist_ok=True); version=datetime.now(timezone.utc).strftime("signal-%Y%m%dT%H%M%SZ")
    (output/f"{version}-report.json").write_text(json.dumps(report,indent=2)); joblib.dump(models,output/f"{version}-models.joblib"); artifact=build_prediction_artifact(data,report,models,version); (output/"current-predictions.json").write_text(json.dumps(artifact,indent=2))
    print(json.dumps({"version":version,"validationPassed":report["validationPassed"],"report":str(output/f'{version}-report.json')},indent=2))


if __name__=="__main__": main()
