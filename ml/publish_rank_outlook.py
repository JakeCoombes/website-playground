"""Publish independently calibrated top/bottom quartile outlooks."""
from __future__ import annotations
import json
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.frozen import FrozenEstimator
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from research_cross_sectional import RANK_COLUMNS, make_targets
from signal_engine import FEATURE_COLUMNS, remove_correlated_features

def base_model(): return Pipeline([("impute",SimpleImputer(strategy="median")),("scale",StandardScaler()),("model",LogisticRegression(C=1,max_iter=3000,class_weight="balanced"))])
def fit(train,calibration,columns,target):
    base=base_model().fit(train[columns],train[target].astype(int))
    return CalibratedClassifierCV(FrozenEstimator(base),method="sigmoid").fit(calibration[columns],calibration[target].astype(int))
def metrics(y,p):
    prevalence=float(y.mean()); brier=float(brier_score_loss(y,p)); reference=float(brier_score_loss(y,np.full(len(y),prevalence)))
    return {"auc":float(roc_auc_score(y,p)),"brier":brier,"prevalenceBrier":reference,"brierSkill":float(1-brier/reference)}
def confidence(value): return float(np.clip(.6*((value["auc"]-.5)/.25)+.4*(value["brierSkill"]/.25),0,1))
def factors(model,row,columns):
    pipeline=model.calibrated_classifiers_[0].estimator; values=pipeline.named_steps["scale"].transform(pipeline.named_steps["impute"].transform(row[columns].to_frame().T))[0]
    weighted=sorted(zip(columns,pipeline.named_steps["model"].coef_[0]*values),key=lambda x:x[1])
    return {"positive":[name for name,value in weighted[-3:][::-1] if value>0],"negative":[name for name,value in weighted[:3] if value<0]}
def main():
    source=pd.read_pickle("ml/data/training.pkl").sort_index().dropna(subset=FEATURE_COLUMNS); data=make_targets(source,sorted(source.symbol.unique()))
    columns=remove_correlated_features(data[data.index.year<2024])+[f"rank_{c}" for c in RANK_COLUMNS]
    targets={"boom":"top_126","bust":"bottom_126"}; validations={}; validation_models={}
    for name,target in targets.items():
        usable=data.dropna(subset=[target]); model=fit(usable[usable.index.year<2024],usable[usable.index.year==2024],columns,target); holdout=usable[usable.index.year==2025]
        validations[name]=metrics(holdout[target].astype(int),model.predict_proba(holdout[columns])[:,1]); validation_models[name]=model
    passed_targets={name:value["auc"]>=.65 and value["brier"]<value["prevalenceBrier"] for name,value in validations.items()}; passed=any(passed_targets.values())
    version=f"rank-outlook-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"; predictions=[]
    if passed:
        production={}
        for name,target in targets.items():
            usable=data.dropna(subset=[target]); production[name]=fit(usable[usable.index.year<2025],usable[usable.index.year==2025],columns,target)
        latest=data.groupby("symbol",sort=False).tail(1).dropna(subset=columns); bp=production["boom"].predict_proba(latest[columns])[:,1]; xp=production["bust"].predict_proba(latest[columns])[:,1]
        for (_,row),boom,bust in zip(latest.iterrows(),bp,xp): predictions.append({"symbol":row.symbol,"generatedAt":datetime.now(timezone.utc).isoformat(),"horizonDays":126,"boomDefinition":"Rank in the top 25% of tracked stocks by SPY-relative return","bustDefinition":"Rank in the bottom 25% of tracked stocks by SPY-relative return","boomProbability":float(boom) if passed_targets["boom"] else None,"boomConfidence":confidence(validations["boom"]) if passed_targets["boom"] else None,"bustProbability":float(bust) if passed_targets["bust"] else None,"bustConfidence":confidence(validations["bust"]) if passed_targets["bust"] else None,"modelVersion":version,"boomFactors":factors(production["boom"],row,columns) if passed_targets["boom"] else {"positive":[],"negative":[]},"bustFactors":factors(production["bust"],row,columns) if passed_targets["bust"] else {"positive":[],"negative":[]}})
    artifact={"modelVersion":version,"validationPassed":passed,"targetValidationPassed":passed_targets,"generatedAt":datetime.now(timezone.utc).isoformat(),"validation":validations,"predictions":predictions}
    Path("ml/artifacts/current-predictions.json").write_text(json.dumps(artifact,indent=2),encoding="utf-8"); Path(f"ml/artifacts/{version}-report.json").write_text(json.dumps({"gate":"Each target: AUC >= .65 and Brier below prevalence baseline","validation":validations,"passed":passed},indent=2),encoding="utf-8")
    print(json.dumps({"version":version,"passed":passed,"targets":passed_targets,"validation":validations,"predictions":len(predictions)},indent=2))
if __name__=="__main__": main()
