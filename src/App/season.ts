import { state } from "@react-rxjs/core";
import { of, switchMap, tap } from "rxjs";
import { getCurrentSeason$ } from "../service/gw2Api";
import { cacheData$, writeCache$ } from "../service/localData";

export const currentSeason$ = state(
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
