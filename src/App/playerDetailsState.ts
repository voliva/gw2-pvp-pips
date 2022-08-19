import { state } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { filter, map, merge, switchMap, tap, withLatestFrom } from "rxjs";
import { getSeasonCurrentPips$ } from "../service/gw2Api";
import {
  cacheData$,
  initialConfig$,
  writeCache$,
  writeConfig$,
} from "../service/localData";
import { currentSeason$ } from "./season";

const [apiKeyChange$, setApiKey] = createSignal<string>();
export const apiKey$ = state(
  merge(initialConfig$.pipe(map((config) => config.apiKey)), apiKeyChange$),
  ""
);

const [refresh$, refresh] = createSignal();
export { refresh, setApiKey };

export const playerDetails$ = state(
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
    refresh$.pipe(
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
  ),
  null
);
