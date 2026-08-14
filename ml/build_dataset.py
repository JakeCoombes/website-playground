"""Fetch split-adjusted daily OHLCV and build a point-in-time dataset."""
from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path

import pandas as pd
import requests

from signal_engine import FEATURE_COLUMNS, create_targets, engineer_features


def fetch_history(symbol: str, api_key: str, cache: Path, refresh: bool) -> tuple[pd.DataFrame, bool]:
    path=cache/f"{symbol}.csv"
    if path.exists() and not refresh:
        frame=pd.read_csv(path,parse_dates=["date"],index_col="date")
        return frame.sort_index(), False
    response=requests.get("https://api.twelvedata.com/time_series",params={"symbol":symbol,"interval":"1day","outputsize":5000,"order":"ASC","adjust":"splits","timezone":"America/New_York","apikey":api_key},timeout=45)
    payload=response.json()
    if not response.ok or payload.get("status")=="error" or not payload.get("values"):
        raise RuntimeError(f"{symbol}: {payload.get('message','provider returned no history')}")
    frame=pd.DataFrame(payload["values"]).rename(columns={"datetime":"date"})
    frame["date"]=pd.to_datetime(frame.date); frame=frame.set_index("date")
    for column in ("open","high","low","close","volume"): frame[column]=pd.to_numeric(frame[column],errors="coerce")
    frame=frame[["open","high","low","close","volume"]].dropna().sort_index(); cache.mkdir(parents=True,exist_ok=True); frame.to_csv(path)
    return frame, True


def main() -> None:
    parser=argparse.ArgumentParser(); parser.add_argument("--symbols",default="AAPL,MSFT,NVDA,AMZN,GOOGL,META,AVGO,JPM,LLY,TSLA"); parser.add_argument("--benchmark",default="SPY"); parser.add_argument("--output",default="ml/data/training.pkl"); parser.add_argument("--refresh",action="store_true"); parser.add_argument("--max-credits",type=int,default=0,help="Hard upper bound for every provider-request attempt in this run"); parser.add_argument("--delay",type=float,default=13.0); args=parser.parse_args()
    key=os.environ.get("TWELVE_DATA_API_KEY");
    if not key: raise SystemExit("TWELVE_DATA_API_KEY is required in the process environment")
    symbols=list(dict.fromkeys([item.strip().upper() for item in args.symbols.split(",") if item.strip()])); cache=Path("ml/data/cache")
    requested=[args.benchmark]+symbols
    required_credits=sum(1 for symbol in requested if args.refresh or not (cache/f"{symbol}.csv").exists())
    if required_credits and (args.max_credits<=0 or required_credits>args.max_credits):
        raise SystemExit(f"Provider access blocked before any request: needs at most {required_credits} credits; pass --max-credits {required_credits} or a higher explicit limit")
    print(json.dumps({"providerRequestsPlanned":required_credits,"maxCredits":args.max_credits,"delaySeconds":args.delay}),flush=True)
    attempts=0; last_request_at=None
    def safely_fetch(symbol: str) -> pd.DataFrame:
        nonlocal attempts,last_request_at
        will_request=args.refresh or not (cache/f"{symbol}.csv").exists()
        if will_request:
            if attempts>=args.max_credits: raise RuntimeError(f"{symbol}: run credit cap reached")
            if last_request_at is not None:
                time.sleep(max(0,args.delay-(time.monotonic()-last_request_at)))
            attempts+=1; last_request_at=time.monotonic()
        frame,did_request=fetch_history(symbol,key,cache,args.refresh)
        if did_request: print(f"Fetched {symbol} ({attempts}/{args.max_credits} authorized attempts)",flush=True)
        return frame
    spy=safely_fetch(args.benchmark); frames=[]; failures=[]
    for index,symbol in enumerate(symbols):
        try:
            stock=safely_fetch(symbol); features=engineer_features(stock,spy); targets=create_targets(stock,spy)
            frame=features.join(targets); frame["symbol"]=symbol; frames.append(frame)
        except Exception as error:
            failures.append(str(error)); print(f"Failed {symbol}: {error}",flush=True)
    if not frames: raise SystemExit("No symbols could be prepared")
    dataset=pd.concat(frames).sort_index(); output=Path(args.output); output.parent.mkdir(parents=True,exist_ok=True); dataset.to_pickle(output)
    manifest={"symbols":symbols,"benchmark":args.benchmark,"rows":len(dataset),"firstDate":str(dataset.index.min().date()),"lastDate":str(dataset.index.max().date()),"features":FEATURE_COLUMNS,"failures":failures,"priceAdjustment":"splits","targetHorizonTradingDays":90}
    output.with_suffix(".manifest.json").write_text(json.dumps(manifest,indent=2)); print(json.dumps(manifest,indent=2))


if __name__=="__main__": main()
