import { state } from "@react-rxjs/core";
import { filter, map, of, switchMap, tap } from "rxjs";
import { getCurrentSeason$ } from "../service/gw2Api";
import { cacheData$, SeasonData, writeCache$ } from "../service/localData";

export function seasonIsActive(season: SeasonData | null) {
  return season && new Date(season.end).getTime() >= new Date().getTime();
}

export const currentSeason$ = state(
  cacheData$.pipe(
    switchMap((cache) => {
      if (cache?.seasonData && seasonIsActive(cache.seasonData)) {
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

export const currentSeasonIsActive$ = state(
  currentSeason$.pipe(
    filter((v) => !!v),
    map((v) => seasonIsActive(v!))
  ),
  null
);
