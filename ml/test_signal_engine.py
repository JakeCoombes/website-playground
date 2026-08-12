import unittest

import numpy as np
import pandas as pd

from signal_engine import FEATURE_COLUMNS, create_targets, engineer_features


def sample_frame(seed: int, periods: int = 700) -> pd.DataFrame:
    rng=np.random.default_rng(seed); index=pd.bdate_range("2020-01-01",periods=periods)
    close=100*np.exp(np.cumsum(rng.normal(.0003,.015,periods)))
    return pd.DataFrame({"open":close*(1+rng.normal(0,.002,periods)),"high":close*1.01,"low":close*.99,"close":close,"volume":rng.integers(1_000_000,5_000_000,periods)},index=index)


class FeatureSafetyTests(unittest.TestCase):
    def test_future_changes_do_not_change_past_features(self):
        stock=sample_frame(1); spy=sample_frame(2); cutoff=stock.index[500]
        original=engineer_features(stock,spy).loc[:cutoff]
        changed=stock.copy(); changed.loc[changed.index>cutoff,"close"]*=5
        mutated=engineer_features(changed,spy).loc[:cutoff]
        pd.testing.assert_frame_equal(original,mutated)

    def test_targets_are_unknown_without_full_horizon(self):
        stock=sample_frame(3); spy=sample_frame(4); targets=create_targets(stock,spy)
        self.assertTrue(targets.tail(90).isna().all().all())

    def test_all_documented_features_exist(self):
        features=engineer_features(sample_frame(5),sample_frame(6))
        self.assertEqual(set(FEATURE_COLUMNS),set(features.columns))


if __name__ == "__main__": unittest.main()
