import { shareLatest, state, useStateObservable } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { of, switchMap, tap, merge, map, filter, withLatestFrom } from "rxjs";
import "./App.css";
import { getCurrentSeason$, getSeasonCurrentPips$ } from "./gw2Api";
import {
  CacheData,
  LastResult,
  readCache$,
  readConfig$,
  writeCache$,
  writeConfig$,
} from "./localData";

const cacheData$ = readCache$().pipe(shareLatest());
const config$ = readConfig$().pipe(shareLatest());

const currentSeason$ = state(
  cacheData$.pipe(
    switchMap((cache) => {
      if (
        cache?.seasonData &&
        new Date(cache.seasonData.end).getTime() >= new Date().getTime()
      ) {
        console.log("returning from cache");
        return of(cache.seasonData);
      }

      console.log("refetching current season");
      return getCurrentSeason$().pipe(
        tap((seasonData) => {
          const newCache: CacheData = seasonData
            ? {
                ...cache,
                seasonData,
              }
            : {
                lastResult: cache?.lastResult,
              };
          writeCache$(newCache).subscribe();
        })
      );
    })
  ),
  null
);

const [apiKeyChange$, setApiKey] = createSignal<string>();
const apiKey$ = state(
  merge(
    config$.pipe(
      map((config) => config?.apiKey!),
      filter((v) => !!v)
    ),
    apiKeyChange$
  ),
  ""
);

const [calculate$, calculate] = createSignal();

const result$ = state(
  merge(
    cacheData$.pipe(
      map((cache) => cache?.lastResult!),
      filter((v) => !!v)
    ),
    calculate$.pipe(
      withLatestFrom(apiKey$, currentSeason$, config$), // TODO this config gets stale :( Ideally writeConfig/writeCache can accept partial updates
      tap(([, apiKey, _, config]) => {
        writeConfig$({
          version: 1,
          goals: [],
          holidays: [],
          ...config,
          apiKey,
        }).subscribe();
      }),
      switchMap(([, apiKey, season]) =>
        getSeasonCurrentPips$(apiKey, season!.id)
      ),
      map(
        (pips): LastResult => ({
          hadPips: pips,
          remainingDays: 20, // TODO
        })
      ),
      withLatestFrom(cacheData$),
      tap(([lastResult, cache]) => {
        writeCache$({
          ...cache,
          lastResult,
        }).subscribe();
      }),
      map(([lastResult]) => lastResult)
    )
  ),
  null
);

function App() {
  const season = useStateObservable(currentSeason$);
  const apiKey = useStateObservable(apiKey$);
  const result = useStateObservable(result$);

  console.log(result);

  return (
    <div className="App">
      {season ? <div>{season.name}</div> : <div>No season active</div>}
      <input
        placeholder="API Key"
        value={apiKey}
        onChange={(evt) => setApiKey(evt.target.value)}
      />
      <button onClick={calculate} disabled={!season}>
        Calculate
      </button>
    </div>
  );
}

export default App;
