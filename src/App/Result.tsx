import { state, useStateObservable } from "@react-rxjs/core";
import { createSignal, mergeWithKey } from "@react-rxjs/utils";
import { Fragment } from "react";
import {
  combineLatestWith,
  filter,
  map,
  scan,
  startWith,
  switchMap,
  tap,
} from "rxjs";
import { Pip } from "../components/Pip";
import { Goal, initialConfig$, writeConfig$ } from "../service/localData";
import { playerDetails$ } from "./playerDetailsState";
import "./Result.css";
import { currentSeason$ } from "./season";

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

// TODO config
const POINTS_WIN = 11;
const POINTS_LOSE = 4;
const POINT_AVG = (POINTS_LOSE + POINTS_WIN) / 2;

const result$ = state(
  playerDetails$.pipe(
    filter((v) => !!v),
    map((v) => v!),
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

function Result() {
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
    <div className="goals">
      {goals.map(({ title }, id) => (
        <div key={id} className="goal-box painted-box">
          <div className="goal-title">{title}</div>
          {result?.goals[id] ? (
            <div className="goal-results">
              <div>
                <Pip active={false} />
                {result.goals[id].missingPips}
              </div>
              <div>
                <Pip active={true} />
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
  );
}

export default Result;