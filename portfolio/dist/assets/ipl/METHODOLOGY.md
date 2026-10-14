# Methodology and original-project audit

## Scope

This project studies the men's Indian Premier League records contained in the included Cricsheet archive. The original author credit, notebook, README and match data are retained under `archive/`. The original notebook is reference material and contains known methodological issues; use the new root notebook.

The expanded project uses a consistent source instead of appending unrelated match IDs to the old CSV. Match-level rows, innings, deliveries, wickets and player appearances come from the same JSON match files. This avoids duplicate matches and broken player joins. The original dataset's external source and license were not recorded, so its files are retained as user-supplied archival material, not used as the new analytical source.

## Corrections to the original notebook

| Original issue | Resolution |
| --- | --- |
| README claims 2008–2019, but supplied CSV has 577 matches from 2008–2016 | Corrected the coverage claim; downloaded source includes later seasons with exact date coverage and checksum recorded |
| Deccan Chargers mapped to Sunrisers Hyderabad; Pune Warriors mapped to Rising Pune | Distinct franchises remain distinct; only name changes are combined |
| Random split mixes old and new seasons | Train on earlier seasons, select on the penultimate season, test on the latest season |
| LabelEncoder imposes arbitrary order on team/city names | Training-only one-hot encoding, unknown categories handled explicitly |
| Unknown categories silently replaced by the first known category | Unknown venue receives an unknown-category encoding and a flag; invalid teams/toss inputs are rejected |
| Baseline computed on the full dataset | Baseline probability is estimated on the training period only |
| City filling overwrites existing values | Original city is retained, Bangalore spelling standardized, absent city marked Unknown |
| No ball-by-ball analysis | Player, innings and phase statistics now use delivery events |
| Unexecuted claims about the better model | Report metrics and conclusions are generated from executed chronological evaluation |

## Normalization

Team aliases: Delhi Daredevils → Delhi Capitals; Kings XI Punjab → Punjab Kings; Royal Challengers Bangalore → Royal Challengers Bengaluru; Rising Pune Supergiants → Rising Pune Supergiant. Other franchises are kept distinct. Venue aliases are explicit and reviewable in `src/ipl_analytics/data.py`. Raw venue names and both original team labels are retained. Unknown venue variants can remain separate; a venue-name group is not a guarantee of unchanged pitch conditions across renovations.

`season` is the match calendar year for IPL. `season_raw` retains source labels such as 2007/08. Team 1 is the alphabetically first canonical team; it is not necessarily the home or batting-first team. `team1_raw` / `team2_raw` retain the original source order and are not positionally aligned with the canonical ordering.

## Cricket statistics

- Delivery events include wides and no-balls. A legal ball excludes either kind of illegal delivery.
- Batting balls faced exclude wides; no-ball deliveries count. Runs include only runs off the bat.
- A four/six is counted only when that many batter runs were scored and `non_boundary` is not set.
- Batting average = runs / dismissals. Retired hurt is not a dismissal; run outs, retired out and obstructing the field count as dismissals. A player with no dismissals has an undefined (blank) average.
- Bowler runs = batter runs + wides + no-ball extras. Byes, leg-byes and penalty extras are excluded.
- Bowler wickets exclude run out, retired hurt, retired out and obstructing the field. Economy = conceded runs × 6 / legal balls. Bowling average = conceded runs / wickets; bowling strike rate = legal balls / wickets.
- `innings_with_delivery` counts batting innings where the player appears as striker on at least one recorded delivery; it is not a full scorecard appearances count. Non-strikers who never face are still present in player appearances and wicket tables.
- Super Overs are retained and flagged in detailed data but excluded from player career statistics, phase analysis and historical scoring-rate features. Resolved ties count as decided match wins, using the source eliminator/bowl-out winner.
- Innings-level pre/post penalty runs are stored separately and included in innings totals, not assigned to a batter or bowler.
- Chasing comparison excludes source ties/Super Overs and results with a recorded rain-adjustment method. It uses actual first-innings team and reported winner.
- First-innings trend includes scheduled 20-over innings with no recorded adjustment method and either at least 120 legal balls or 10 wickets. Some unusual completed innings (for example absent-hurt or miscounted overs) may fall outside this definition.
- Phase bands are fixed overs 1–6, 7–15 and 16–20, not an attempt to reproduce every official powerplay. They exclude matches with a recorded rain method and scheduled innings shorter than 20 overs; abandoned matches or unrecorded reductions may remain. Run rate uses legal balls.

## Prediction protocol

Prediction is **post-toss**. Inputs include toss information, so it must not be described as a forecast made before the toss. All current-match outcomes, winning margins, player awards and innings totals are excluded from model inputs.

Features are calculated before all matches on each date. Only after that date are results added to history. This conservative rule prevents leakage between double-header matches when start times are unavailable.

- Elo: initial rating 1500, K-factor 20; a win updates both opponents after the date.
- Win form: last ten decided matches, initial prior 0.5.
- Head to head: (wins + 2)/(decided meetings + 4), centered symmetrically.
- Scoring form: total runs per six legal balls over a team's last ten recorded normal innings in decided matches, initial prior 8.0. This is a coarse indicator and includes rain-affected historical innings.
- Experience: difference in log(1 + prior decided match count).
- Team identity and venue: one-hot encoding fitted on the training data only.

Candidates are logistic regression and a depth-limited random forest, with fixed hyperparameters. Lowest validation log loss selects the model. The chosen specification is refitted using train + validation data, then assessed once on the last available season. Test features update after earlier test-season dates, while weights remain fixed. This is a sequential, match-by-match backtest, not a forecast of an entire season made in advance.

Training rows are mirrored to avoid arbitrary team-order bias, and inference averages the original prediction with the complement of the reversed-teams prediction. The reported test accuracy, log loss, Brier score, ROC AUC and approximate Wilson accuracy interval are computed on original test matches, not mirrored duplicates. The training-prior baseline uses only the earlier training labels; a 0.5 probability baseline is also stored.

The stored `coin_flip_test` comparator means a constant 0.5 probability, not simulated random guesses. Its hard-label accuracy uses the same threshold convention as other metrics (ties predict Team 1); its log loss and Brier score are the relevant neutral probability benchmarks.

`holdout_model.joblib` is the evaluated model. `win_model.joblib` is separately refitted on all decided matches for hypothetical future use. Its performance is not independently re-estimated. Load only model files from trusted sources.

## Coverage and limits

The included snapshot is reproducible; it is not a live data feed. A source may omit abandoned or unplayed fixtures, have missing information, or revise old records. Source missing-information flags are preserved, and the report includes row counts and unmatched legacy matches. No player bio, auction, injury, lineup, live score or weather data is fabricated.

Historical chasing and toss differences are descriptive, not causal. Team rosters, playing rules, stadiums and competitive balance change over time. One held-out season is a small sample. Calibration bins and accuracy intervals are descriptive diagnostics, not proof of stable predictive power. Optional future research includes rolling-season backtests, roster-aware form, external pitch/weather data and a separately evaluated in-play model.

## Sources

- Cricsheet data download: https://cricsheet.org/downloads/
- Direct snapshot endpoint: https://cricsheet.org/downloads/ipl_male_json.zip
- JSON schema: https://cricsheet.org/format/json/
- Data licensing: https://cricsheet.org/licensing/

Source: Cricsheet / Stephen Rushe. JSON data is provided under Open Data Commons Attribution License 1.0. Original notices are preserved in `data/raw/`. The derived database contains normalization and calculated statistics; this project is not endorsed by Cricsheet.
