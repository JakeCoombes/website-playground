"""Validate and publish the calibrated 126-day cross-sectional model offline."""
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


def base_model():
    return Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler()), ("model", LogisticRegression(C=1, max_iter=3000, class_weight="balanced"))])


def metrics(y, probability):
    prevalence = float(y.mean())
    return {"auc": float(roc_auc_score(y, probability)), "brier": float(brier_score_loss(y, probability)), "prevalenceBrier": float(brier_score_loss(y, np.full(len(y), prevalence)))}


def fit_calibrated(train, calibration, columns, target):
    base = base_model().fit(train[columns], train[target].astype(int))
    return CalibratedClassifierCV(FrozenEstimator(base), method="sigmoid").fit(calibration[columns], calibration[target].astype(int))


def main() -> None:
    source = pd.read_pickle("ml/data/training.pkl").sort_index().dropna(subset=FEATURE_COLUMNS)
    data = make_targets(source, sorted(source.symbol.unique()))
    target = "top_126"
    usable = data.dropna(subset=[target])
    base_columns = remove_correlated_features(usable[usable.index.year < 2024])
    columns = base_columns + [f"rank_{column}" for column in RANK_COLUMNS]
    model = fit_calibrated(usable[usable.index.year < 2024], usable[usable.index.year == 2024], columns, target)
    holdout = usable[usable.index.year == 2025]
    validation = metrics(holdout[target].astype(int), model.predict_proba(holdout[columns])[:, 1])
    passed = validation["auc"] >= .65 and validation["brier"] < validation["prevalenceBrier"]
    version = f"cross-sectional-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
    predictions = []
    if passed:
        production = fit_calibrated(usable[usable.index.year < 2025], usable[usable.index.year == 2025], columns, target)
        latest = data.groupby("symbol", sort=False).tail(1).dropna(subset=columns)
        probabilities = production.predict_proba(latest[columns])[:, 1]
        coefficients = production.calibrated_classifiers_[0].estimator.named_steps["model"].coef_[0]
        for (_, row), probability in zip(latest.iterrows(), probabilities):
            contributions = sorted(zip(columns, coefficients * production.calibrated_classifiers_[0].estimator.named_steps["scale"].transform(production.calibrated_classifiers_[0].estimator.named_steps["impute"].transform(row[columns].to_frame().T))[0]), key=lambda item: item[1])
            predictions.append({"symbol":row.symbol,"generatedAt":datetime.now(timezone.utc).isoformat(),"horizonDays":126,"objective":"Probability of ranking in the top 25% of tracked stocks by SPY-relative return","topQuartileProbability":float(probability),"confidence":float(max(.5,1-validation["brier"])),"modelVersion":version,"factors":{"positive":[name for name,value in contributions[-3:][::-1] if value>0],"negative":[name for name,value in contributions[:3] if value<0]}})
    artifact = {"modelVersion":version,"validationPassed":passed,"generatedAt":datetime.now(timezone.utc).isoformat(),"validation":validation,"objective":"top-quartile SPY-relative return over 126 trading days","predictions":predictions}
    Path("ml/artifacts/current-predictions.json").write_text(json.dumps(artifact,indent=2),encoding="utf-8")
    Path(f"ml/artifacts/{version}-report.json").write_text(json.dumps({"gate":"AUC >= 0.65 and Brier below prevalence baseline","validation":validation,"passed":passed},indent=2),encoding="utf-8")
    print(json.dumps({"version":version,"passed":passed,"validation":validation,"predictions":len(predictions)},indent=2))


if __name__ == "__main__":
    main()
