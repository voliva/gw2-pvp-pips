import { appWindow } from "@tauri-apps/api/window";
import { shareLatest, state, useStateObservable } from "@react-rxjs/core";
import { createSignal, mergeWithKey } from "@react-rxjs/utils";
import {
  combineLatestWith,
  filter,
  map,
  merge,
  of,
  scan,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs";
import "./App.css";
import { getCurrentSeason$, getSeasonCurrentPips$ } from "./gw2Api";
import {
  Goal,
  readCache$,
  readConfig$,
  writeCache$,
  writeConfig$,
} from "./localData";
import pipActive from "./pipActive.png";
import pipNotActive from "./pipNotActive.png";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { Fragment } from "react";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en");

const cacheData$ = readCache$().pipe(shareLatest());
const initialConfig$ = readConfig$().pipe(shareLatest());

const currentSeason$ = state(
  cacheData$.pipe(
    switchMap((cache) => {
      if (
        cache?.seasonData &&
        new Date(cache.seasonData.end).getTime() >= new Date().getTime()
      ) {
        return of(cache.seasonData);
      }

      return getCurrentSeason$().pipe(
        tap((seasonData) => {
          writeCache$({
            seasonData: seasonData ?? undefined,
          }).subscribe();
        })
      );
    })
  ),
  null
);

const [apiKeyChange$, setApiKey] = createSignal<string>();
const apiKey$ = state(
  merge(initialConfig$.pipe(map((config) => config.apiKey)), apiKeyChange$),
  ""
);

const [newGoal$, createGoal] = createSignal<Goal>();
const [deleteGoal$, deleteGoal] = createSignal<number>(); // id by index

(window as any).createGoal = createGoal;

const goals$ = state(
  initialConfig$.pipe(
    map((config) => config.goals),
    switchMap((initialGoals) =>
      mergeWithKey({ newGoal$, deleteGoal$ }).pipe(
        scan((acc, { payload, type }) => {
          switch (type) {
            case "deleteGoal$":
              return acc.filter((_, i) => i !== payload);
            case "newGoal$":
              return [...acc, payload];
          }
        }, initialGoals),
        tap((goals) => {
          writeConfig$({
            goals,
          }).subscribe();
        }),
        startWith(initialGoals)
      )
    )
  ),
  []
);

const holidays$ = state(
  initialConfig$.pipe(map((config) => config.holidays)),
  []
);

const [calculate$, calculate] = createSignal();

// TODO config
const POINTS_WIN = 11;
const POINTS_LOSE = 4;
const POINT_AVG = (POINTS_LOSE + POINTS_WIN) / 2;

const result$ = state(
  merge(
    // Cached result
    cacheData$.pipe(
      map((cache) => cache?.lastResult!),
      filter((v) => !!v),
      map((lastResult) => ({
        timestamp: new Date(lastResult.timestamp),
        pips: lastResult.hadPips,
      }))
    ),
    // New result
    calculate$.pipe(
      withLatestFrom(apiKey$, currentSeason$),
      tap(([, apiKey]) => {
        writeConfig$({
          apiKey,
        }).subscribe();
      }),
      switchMap(([, apiKey, season]) =>
        getSeasonCurrentPips$(apiKey, season!.id)
      ),
      map((pips) => ({
        timestamp: new Date(),
        pips,
      })),
      tap((result) => {
        writeCache$({
          lastResult: {
            timestamp: result.timestamp.toISOString(),
            hadPips: result.pips,
          },
        }).subscribe();
      })
    )
  ).pipe(
    combineLatestWith(holidays$, currentSeason$.pipe(filter((v) => !!v))),
    map(([{ pips, timestamp }, holidays, season]) => {
      const seasonStart = new Date(season!.start);
      const seasonEnd = new Date(season!.end);
      const seasonDays = Math.round(
        (seasonEnd.getTime() - seasonStart.getTime()) / (24 * 60 * 60_000)
      );
      const currentDay = Math.floor(
        (timestamp.getTime() - seasonStart.getTime()) / (24 * 60 * 60_000)
      );
      const relevantHolidays = holidays.filter((h) => h >= currentDay).length;
      const remainingDays = seasonDays - currentDay - relevantHolidays;

      return { pips, remainingDays, timestamp };
    }),
    combineLatestWith(goals$),
    map(([{ pips, remainingDays, timestamp }, goals]) => ({
      timestamp,
      pips,
      goals: goals.map(({ value }) => {
        const missingPips = Math.max(0, value - pips);
        const pipsPerDay = missingPips / remainingDays;
        const gamesPerDay = pipsPerDay / POINT_AVG;
        const resultsPerDay = getGames(pipsPerDay);

        return { missingPips, pipsPerDay, gamesPerDay, resultsPerDay };
      }),
    }))
  ),
  null
);

function getGames(pips: number) {
  const result: number[][] = [];

  let wins = 0;
  while (wins * POINTS_WIN < pips) {
    const loses = Math.ceil((pips - wins * POINTS_WIN) / POINTS_LOSE);

    result.push([wins, loses]);

    wins++;
  }

  result.push([wins, 0]);

  // Sometimes it could happen that there are redundant values.
  // Example 0/4 1/1 2/0 => The 2/0 is redundant, because we can also get all the pips by just winning once and losing once.

  const filtered = result.filter(([cW, cL], i) => {
    if (i === 0) return true;
    const [pW, pL] = result[i - 1];
    return cW + cL < pW + pL;
  });

  return filtered.reverse();
}

function App() {
  const season = useStateObservable(currentSeason$);
  const apiKey = useStateObservable(apiKey$);
  const result = useStateObservable(result$);
  const goals = useStateObservable(goals$);

  function renderResultsPerDay(rpd: number[][]) {
    return rpd.map(([w, l], i) => (
      <Fragment key={i}>
        {i === 0 ? null : " or "}
        <span className="wins">{w}</span>/<span className="losses">{l}</span>
      </Fragment>
    ));
  }

  return (
    <div className="App">
      <div className="header" data-tauri-drag-region>
        <div className="header-title painted-box" data-tauri-drag-region>
          {season ? season.name : "PvP Pips Calculator"}
        </div>
        <div className="header-actions">
          <div onClick={() => appWindow.minimize()}>
            <img
              src="https://api.iconify.design/mdi:window-minimize.svg"
              alt="minimize"
            />
          </div>
          <div onClick={() => appWindow.close()}>
            <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
          </div>
        </div>
      </div>
      <div className="painted-box">
        <div>
          <input
            placeholder="API Key"
            value={apiKey}
            onChange={(evt) => setApiKey(evt.target.value)}
          />
          <button onClick={calculate} disabled={!season}>
            Refresh Pips
          </button>
        </div>
        <div>
          <div>
            Last update: {result ? timeAgo.format(result.timestamp) : "N/A"}
          </div>
          <div style={{ fontSize: "1.2rem" }}>
            <img
              style={{
                height: "1.5rem",
                verticalAlign: "middle",
                marginRight: "0.2rem",
              }}
              alt="pips"
              src={pipActive}
            />
            {result ? result.pips : "N/A"}
          </div>
        </div>
      </div>
      <div className="goals">
        {goals.map(({ title }, id) => (
          <div key={id} className="goal-box painted-box">
            <div className="goal-title">{title}</div>
            {result?.goals[id] ? (
              <div className="goal-results">
                <div>
                  <img
                    style={{
                      height: "1.5rem",
                      verticalAlign: "middle",
                      marginRight: "0.2rem",
                    }}
                    alt="pips"
                    src={pipNotActive}
                  />
                  {result.goals[id].missingPips}
                </div>
                <div>
                  <img
                    style={{
                      height: "1.5rem",
                      verticalAlign: "middle",
                      marginRight: "0.2rem",
                    }}
                    alt="pips"
                    src={pipActive}
                  />
                  per day: {result.goals[id].pipsPerDay.toFixed(2)}
                </div>
                <div>
                  Games per day: {result.goals[id].gamesPerDay.toFixed(2)}
                </div>
                <div>
                  Results per day:{" "}
                  {renderResultsPerDay(result.goals[id].resultsPerDay)}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
