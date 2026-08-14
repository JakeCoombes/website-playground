"""Select an actionable cross-sectional target without touching provider APIs."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

from signal_engine import FEATURE_COLUMNS, remove_correlated_features

HORIZONS = (20, 60, 126)
RANK_COLUMNS = ["relative21", "relative63", "relative126", "return21", "return63", "return126", "roc20", "roc60", "rsi14", "vol20", "vol60", "drawdown60", "distance_high252", "breakout20", "breakout60"]


def metric(y, probability):
    return {"auc": float(roc_auc_score(y, probability)), "brier": float(brier_score_loss(y, probability))}


def baseline_model():
    return Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler()), ("model", LogisticRegression(max_iter=3000, class_weight="balanced"))])


def candidate_model():
    return XGBClassifier(n_estimators=350, max_depth=2, learning_rate=.035, min_child_weight=50, subsample=.8, colsample_bytree=.8, reg_lambda=10, eval_metric="logloss", n_jobs=-1, random_state=42)


def make_targets(data: pd.DataFrame, symbols: list[str]) -> pd.DataFrame:
    spy = pd.read_csv("ml/data/cache/SPY.csv", parse_dates=["date"], index_col="date").sort_index().close
    pieces = []
    for symbol in symbols:
        stock = pd.read_csv(f"ml/data/cache/{symbol}.csv", parse_dates=["date"], index_col="date").sort_index().close
        part = pd.DataFrame(index=stock.index)
        part["symbol"] = symbol
        aligned_spy = spy.reindex(stock.index).ffill()
        for horizon in HORIZONS:
            part[f"excess_{horizon}"] = stock.shift(-horizon) / stock - aligned_spy.shift(-horizon) / aligned_spy
        pieces.append(part)
    targets = pd.concat(pieces).reset_index().rename(columns={"date": "date"})
    merged = data.reset_index().merge(targets, on=["date", "symbol"], how="left").set_index("date").sort_index()
    for horizon in HORIZONS:
        excess = f"excess_{horizon}"
        threshold = merged.groupby(merged.index)[excess].transform(lambda values: values.quantile(.75))
        merged[f"top_{horizon}"] = (merged[excess] >= threshold).where(merged[excess].notna())
        lower_threshold = merged.groupby(merged.index)[excess].transform(lambda values: values.quantile(.25))
        merged[f"bottom_{horizon}"] = (merged[excess] <= lower_threshold).where(merged[excess].notna())
    for column in RANK_COLUMNS:
        merged[f"rank_{column}"] = merged.groupby(merged.index)[column].rank(pct=True)
    return merged


def main() -> None:
    source = pd.read_pickle("ml/data/training.pkl").sort_index().dropna(subset=FEATURE_COLUMNS)
    symbols = sorted(source.symbol.unique())
    data = make_targets(source, symbols)
    base_columns = remove_correlated_features(data[data.index.year < 2022])
    enhanced = base_columns + [f"rank_{column}" for column in RANK_COLUMNS]
    years = (2022, 2023, 2024)
    results = {}
    for horizon in HORIZONS:
        target = f"top_{horizon}"
        folds = []
        for year in years:
            usable = data.dropna(subset=[target])
            train = usable[usable.index.year < year]
            valid = usable[usable.index.year == year]
            base = baseline_model().fit(train[base_columns], train[target].astype(int))
            candidate = candidate_model().fit(train[enhanced], train[target].astype(int))
            bm = metric(valid[target].astype(int), base.predict_proba(valid[base_columns])[:, 1])
            cm = metric(valid[target].astype(int), candidate.predict_proba(valid[enhanced])[:, 1])
            folds.append({"year": year, "baseline": bm, "candidate": cm})
        results[str(horizon)] = {
            "baselineAuc": float(np.mean([fold["baseline"]["auc"] for fold in folds])),
            "baselineBrier": float(np.mean([fold["baseline"]["brier"] for fold in folds])),
            "candidateAuc": float(np.mean([fold["candidate"]["auc"] for fold in folds])),
            "candidateBrier": float(np.mean([fold["candidate"]["brier"] for fold in folds])),
            "folds": folds,
        }
    eligible = [(h, value) for h, value in results.items() if value["candidateAuc"] >= .60 and value["candidateAuc"] >= value["baselineAuc"] and value["candidateBrier"] <= value["baselineBrier"] * .90]
    selected = max(eligible, key=lambda item: item[1]["candidateAuc"])[0] if eligible else None
    final = None
    if selected:
        target = f"top_{selected}"
        usable = data.dropna(subset=[target])
        development = usable[usable.index.year < 2025]
        holdout = usable[usable.index.year == 2025]
        base = baseline_model().fit(development[base_columns], development[target].astype(int))
        candidate = candidate_model().fit(development[enhanced], development[target].astype(int))
        bm = metric(holdout[target].astype(int), base.predict_proba(holdout[base_columns])[:, 1])
        cm = metric(holdout[target].astype(int), candidate.predict_proba(holdout[enhanced])[:, 1])
        final = {"horizon": int(selected), "baseline": bm, "candidate": cm, "passed": cm["auc"] >= .60 and cm["auc"] >= bm["auc"] and cm["brier"] <= bm["brier"] * .90}
    report = {"objective": "top quartile SPY-relative forward return", "selectionYears": years, "gate": "AUC >= 0.60, AUC >= logistic baseline, and Brier <= 90% of baseline", "results": results, "selected": selected, "final2025": final, "providerRequests": 0}
    Path("ml/artifacts/research-cross-sectional.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"selected": selected, "final2025": final, "results": {h: {k: v[k] for k in ("baselineAuc", "candidateAuc", "baselineBrier", "candidateBrier")} for h, v in results.items()}}, indent=2))


if __name__ == "__main__":
    main()
