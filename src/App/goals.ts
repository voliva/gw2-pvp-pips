import { state } from "@react-rxjs/core";
import { createSignal, mergeWithKey } from "@react-rxjs/utils";
import { map, scan, startWith, switchMap, tap } from "rxjs";
import { Goal, initialConfig$, writeConfig$ } from "../service/localData";

const [newGoal$, createGoal] = createSignal<Goal>();
const [deleteGoal$, deleteGoal] = createSignal<number>(); // id by index

export { createGoal, deleteGoal };

export const goals$ = state(
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
