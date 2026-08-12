# Signal AI research pipeline

The pipeline estimates boom probability (beat SPY by at least five percentage points), bust probability (at least 15% drawdown), and expected excess return over 90 trading days. It does not claim certainty.

The web API refuses predictions until the untouched holdout beats logistic regression by at least 0.02 ROC-AUC, reaches 0.55 ROC-AUC, and improves Brier score.

## Leakage and data policy

- Twelve Data daily OHLCV uses `adjust=splits`; results are price returns, not dividend-inclusive total returns.
- Features at T use data at or before T. Labels use T+1 through T+90.
- Validation expands chronologically by year. The configured newest year remains an untouched final holdout.
- A separate chronological development tail calibrates probabilities with isotonic calibration.
- Never use random splitting.
- A modern ticker list has survivorship bias. Use a point-in-time universe including delisted stocks before treating results as investable research.

## Setup and run

Use Python 3.11–3.13 because scientific packages may not yet provide Python 3.14 wheels.

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r ml\requirements.txt
$env:TWELVE_DATA_API_KEY=(Get-Content .env.local | Where-Object { $_ -like 'TWELVE_DATA_API_KEY=*' }).Split('=',2)[1]
python ml\build_dataset.py --symbols AAPL,MSFT,NVDA,AMZN,GOOGL,META,AVGO,JPM,LLY,TSLA --refresh --max-credits 11
python ml\signal_engine.py --dataset ml\data\training.pkl --holdout-year 2025
```

Provider plans impose credit limits, so begin with a small universe. Training writes a report, models, and `ml/artifacts/current-predictions.json`. Failed validation writes no predictions and keeps the API closed.

`--refresh` is blocked before making any request unless `--max-credits` is explicitly large enough for the benchmark plus every requested symbol. The web market-data endpoint is also disabled unless `TWELVE_DATA_LIVE_REQUESTS_ENABLED=true`; leave it false when strict zero-credit operation is required.

## Limitations

- Ten symbols tests plumbing; it cannot establish a robust cross-sectional model.
- Transaction costs default to 10 bps. Real assumptions must reflect turnover and execution.
- Attribution currently uses tree importance times current feature value. Add TreeSHAP before treating explanations as robust.
- Fundamentals are excluded until point-in-time filing timestamps exist. VIX is excluded until historical access is confirmed.
