"""Offline chronological model search. Never contacts a data provider."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import ExtraTreesClassifier, HistGradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

from signal_engine import FEATURE_COLUMNS, remove_correlated_features


RANK_FEATURES = [
    "relative21", "relative63", "relative126", "return126", "return252",
    "rsi14", "roc20", "roc60", "vol20", "vol60", "drawdown60",
    "distance_high252", "breakout20", "breakout60", "volume_ratio20",
]


def metrics(y: pd.Series, probability: np.ndarray) -> dict[str, float]:
    return {"auc": float(roc_auc_score(y, probability)), "brier": float(brier_score_loss(y, probability))}


def add_rank_features(frame: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    result = frame.copy()
    names = []
    for column in RANK_FEATURES:
        name = f"rank_{column}"
        result[name] = result.groupby(result.index)[column].rank(pct=True)
        names.append(name)
    return result, names


def candidates(seed: int = 42):
    linear = lambda c: Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
        ("model", LogisticRegression(C=c, max_iter=3000, class_weight="balanced")),
    ])
    return {
        "xgb_depth1": XGBClassifier(n_estimators=300, max_depth=1, learning_rate=.04, min_child_weight=30, subsample=.8, colsample_bytree=.8, reg_lambda=8, eval_metric="logloss", n_jobs=-1, random_state=seed),
        "xgb_depth2": XGBClassifier(n_estimators=250, max_depth=2, learning_rate=.035, min_child_weight=40, subsample=.8, colsample_bytree=.8, reg_lambda=10, eval_metric="logloss", n_jobs=-1, random_state=seed),
    }


def main() -> None:
    source = pd.read_pickle("ml/data/training.pkl").sort_index()
    source = source.dropna(subset=FEATURE_COLUMNS + ["boom"])
    data, ranks = add_rank_features(source)
    base_columns = remove_correlated_features(data[data.index.year < 2022])
    enhanced_columns = base_columns + ranks
    fold_years = [2022, 2023, 2024]
    results: dict[str, list[dict]] = {"baseline": []}
    specs = candidates()
    for name in specs:
        results[name] = []

    for year in fold_years:
        train = data[data.index.year < year]
        valid = data[data.index.year == year]
        baseline = linear_baseline = Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler()), ("model", LogisticRegression(max_iter=3000, class_weight="balanced"))])
        linear_baseline.fit(train[base_columns], train.boom)
        base_probability = baseline.predict_proba(valid[base_columns])[:, 1]
        results["baseline"].append({"year": year, **metrics(valid.boom, base_probability)})
        for name, model in candidates().items():
            model.fit(train[enhanced_columns], train.boom)
            probability = model.predict_proba(valid[enhanced_columns])[:, 1]
            results[name].append({"year": year, **metrics(valid.boom, probability)})

    summary = {}
    for name, folds in results.items():
        summary[name] = {
            "meanAuc": float(np.mean([fold["auc"] for fold in folds])),
            "meanBrier": float(np.mean([fold["brier"] for fold in folds])),
            "folds": folds,
        }
    baseline_summary = summary["baseline"]
    eligible = [(name, value) for name, value in summary.items() if name != "baseline" and value["meanAuc"] >= baseline_summary["meanAuc"] + .02 and value["meanBrier"] < baseline_summary["meanBrier"]]
    winner = max(eligible, key=lambda item: item[1]["meanAuc"])[0] if eligible else None

    final = None
    if winner:
        development = data[data.index.year < 2025]
        holdout = data[data.index.year == 2025]
        baseline = candidates()["logistic_c1"].fit(development[base_columns], development.boom)
        model = candidates()[winner].fit(development[enhanced_columns], development.boom)
        base_metrics = metrics(holdout.boom, baseline.predict_proba(holdout[base_columns])[:, 1])
        model_metrics = metrics(holdout.boom, model.predict_proba(holdout[enhanced_columns])[:, 1])
        final = {"winner": winner, "baseline": base_metrics, "candidate": model_metrics, "passed": model_metrics["auc"] >= max(.55, base_metrics["auc"] + .02) and model_metrics["brier"] < base_metrics["brier"]}

    report = {"selectionYears": fold_years, "summary": summary, "selected": winner, "final2025": final, "providerRequests": 0}
    output = Path("ml/artifacts/research-models.json")
    output.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"selected": winner, "final2025": final, "summary": {name: {"meanAuc": value["meanAuc"], "meanBrier": value["meanBrier"]} for name, value in summary.items()}}, indent=2))


if __name__ == "__main__":
    main()
