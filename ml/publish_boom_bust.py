"""Publish independently validated boom and bust probabilities from cached data."""
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

from signal_engine import FEATURE_COLUMNS, remove_correlated_features


def base_model():
    return Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler()), ("model", LogisticRegression(C=1, max_iter=3000, class_weight="balanced"))])


def fit_calibrated(train, calibration, columns, target):
    fitted = base_model().fit(train[columns], train[target].astype(int))
    return CalibratedClassifierCV(FrozenEstimator(fitted), method="sigmoid").fit(calibration[columns], calibration[target].astype(int))


def metrics(y, probability):
    prevalence = float(y.mean())
    brier = float(brier_score_loss(y, probability))
    reference = float(brier_score_loss(y, np.full(len(y), prevalence)))
    return {"auc": float(roc_auc_score(y, probability)), "brier": brier, "prevalenceBrier": reference, "brierSkill": float(1 - brier / reference)}


def confidence(validation):
    discrimination = np.clip((validation["auc"] - .5) / .25, 0, 1)
    calibration_skill = np.clip(validation["brierSkill"] / .25, 0, 1)
    return float(.6 * discrimination + .4 * calibration_skill)


def contributions(model, row, columns):
    pipeline = model.calibrated_classifiers_[0].estimator
    transformed = pipeline.named_steps["scale"].transform(pipeline.named_steps["impute"].transform(row[columns].to_frame().T))[0]
    weighted = sorted(zip(columns, pipeline.named_steps["model"].coef_[0] * transformed), key=lambda item: item[1])
    return {"positive":[name for name,value in weighted[-3:][::-1] if value>0], "negative":[name for name,value in weighted[:3] if value<0]}


def main():
    data = pd.read_pickle("ml/data/training.pkl").sort_index().dropna(subset=FEATURE_COLUMNS + ["boom", "bust"])
    columns = remove_correlated_features(data[data.index.year < 2024])
    train, calibration, holdout = data[data.index.year < 2024], data[data.index.year == 2024], data[data.index.year == 2025]
    validations, validation_models = {}, {}
    for target in ("boom", "bust"):
        model = fit_calibrated(train, calibration, columns, target)
        validations[target] = metrics(holdout[target].astype(int), model.predict_proba(holdout[columns])[:, 1])
        validation_models[target] = model
    target_passed = {target: value["auc"] >= .65 and value["brier"] < value["prevalenceBrier"] for target, value in validations.items()}
    passed = all(target_passed.values())
    version = f"boom-bust-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
    predictions = []
    if passed:
        production = {target: fit_calibrated(data[data.index.year < 2025], data[data.index.year == 2025], columns, target) for target in ("boom", "bust")}
        latest = data.groupby("symbol", sort=False).tail(1).dropna(subset=columns)
        boom_probability = production["boom"].predict_proba(latest[columns])[:, 1]
        bust_probability = production["bust"].predict_proba(latest[columns])[:, 1]
        for (_, row), boom, bust in zip(latest.iterrows(), boom_probability, bust_probability):
            predictions.append({"symbol":row.symbol,"generatedAt":datetime.now(timezone.utc).isoformat(),"horizonDays":90,"boomDefinition":"Beat SPY by at least 5 percentage points over 90 trading days","bustDefinition":"Experience a drawdown of at least 15% during the next 90 trading days","boomProbability":float(boom),"boomConfidence":confidence(validations["boom"]),"bustProbability":float(bust),"bustConfidence":confidence(validations["bust"]),"modelVersion":version,"boomFactors":contributions(production["boom"],row,columns),"bustFactors":contributions(production["bust"],row,columns)})
    artifact={"modelVersion":version,"validationPassed":passed,"targetValidationPassed":target_passed,"generatedAt":datetime.now(timezone.utc).isoformat(),"validation":validations,"predictions":predictions}
    Path("ml/artifacts/current-predictions.json").write_text(json.dumps(artifact,indent=2),encoding="utf-8")
    Path(f"ml/artifacts/{version}-report.json").write_text(json.dumps({"gate":"Each target: AUC >= 0.65 and Brier below prevalence baseline","validation":validations,"targetValidationPassed":target_passed,"passed":passed},indent=2),encoding="utf-8")
    print(json.dumps({"version":version,"passed":passed,"targetValidationPassed":target_passed,"validation":validations,"predictions":len(predictions)},indent=2))


if __name__ == "__main__": main()
