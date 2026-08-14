"""Low-variance chronological experiments using only the cached dataset."""
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

from signal_engine import FEATURE_COLUMNS, remove_correlated_features


FOCUSED = ["relative21", "relative63", "relative126", "return126", "return252", "rsi14", "roc20", "roc60", "price_sma50", "price_sma200", "vol20", "vol60", "drawdown60", "distance_high252", "breakout60", "spy_price_sma200", "spy_rsi14", "spy_vol20", "spy_return63"]
RELATIVE = ["relative21", "relative63", "relative126", "return126", "return252", "roc20", "roc60", "vol20", "drawdown60", "distance_high252"]


def model(c: float = 1.0) -> Pipeline:
    return Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler()), ("model", LogisticRegression(C=c, max_iter=3000, class_weight="balanced"))])


def score(y, probability):
    return {"auc": float(roc_auc_score(y, probability)), "brier": float(brier_score_loss(y, probability))}


def add_features(data: pd.DataFrame) -> tuple[pd.DataFrame, list[str], list[str]]:
    result = data.copy()
    symbols = []
    for symbol in sorted(result.symbol.unique()):
        name = f"symbol_{symbol}"
        result[name] = (result.symbol == symbol).astype(float)
        symbols.append(name)
    interactions = []
    for column in RELATIVE:
        name = f"regime_{column}"
        result[name] = result[column] * result.spy_price_sma200
        interactions.append(name)
    return result, symbols, interactions


def main() -> None:
    raw = pd.read_pickle("ml/data/training.pkl").sort_index().dropna(subset=FEATURE_COLUMNS + ["boom"])
    data, symbols, interactions = add_features(raw)
    raw_columns = remove_correlated_features(data[data.index.year < 2022])
    specs = {
        "baseline_expanding": (raw_columns, None, 1.0),
        "raw_recent3": (raw_columns, 3, 1.0),
        "raw_recent5": (raw_columns, 5, 1.0),
        "raw_recent7": (raw_columns, 7, 1.0),
        "focused_expanding": (FOCUSED, None, 1.0),
        "focused_recent5": (FOCUSED, 5, 1.0),
        "focused_symbols": (FOCUSED + symbols, None, .3),
        "focused_regime": (FOCUSED + interactions, None, .1),
        "relative_only": (RELATIVE, None, 1.0),
    }
    years = [2022, 2023, 2024]
    results = {name: [] for name in specs}
    for year in years:
        valid = data[data.index.year == year]
        for name, (columns, window, c) in specs.items():
            start = year - window if window else data.index.year.min()
            train = data[(data.index.year < year) & (data.index.year >= start)]
            fitted = model(c).fit(train[columns], train.boom)
            results[name].append({"year": year, **score(valid.boom, fitted.predict_proba(valid[columns])[:, 1])})
    summary = {name: {"meanAuc": float(np.mean([x["auc"] for x in folds])), "meanBrier": float(np.mean([x["brier"] for x in folds])), "folds": folds} for name, folds in results.items()}
    base = summary["baseline_expanding"]
    eligible = [name for name, value in summary.items() if name != "baseline_expanding" and value["meanAuc"] >= base["meanAuc"] + .02 and value["meanBrier"] < base["meanBrier"]]
    winner = max(eligible, key=lambda name: summary[name]["meanAuc"]) if eligible else None
    final = None
    if winner:
        holdout = data[data.index.year == 2025]
        base_columns, _, base_c = specs["baseline_expanding"]
        baseline = model(base_c).fit(data[data.index.year < 2025][base_columns], data[data.index.year < 2025].boom)
        columns, window, c = specs[winner]
        start = 2025 - window if window else data.index.year.min()
        train = data[(data.index.year < 2025) & (data.index.year >= start)]
        candidate = model(c).fit(train[columns], train.boom)
        bm = score(holdout.boom, baseline.predict_proba(holdout[base_columns])[:, 1])
        cm = score(holdout.boom, candidate.predict_proba(holdout[columns])[:, 1])
        final = {"winner": winner, "baseline": bm, "candidate": cm, "passed": cm["auc"] >= max(.55, bm["auc"] + .02) and cm["brier"] < bm["brier"]}
    report = {"selectionYears": years, "summary": summary, "selected": winner, "final2025": final, "providerRequests": 0}
    Path("ml/artifacts/research-linear.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"selected": winner, "final2025": final, "summary": {k: {"meanAuc": v["meanAuc"], "meanBrier": v["meanBrier"]} for k, v in summary.items()}}, indent=2))


if __name__ == "__main__":
    main()
