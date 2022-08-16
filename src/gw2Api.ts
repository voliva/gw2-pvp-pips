import { defer, map, switchMap } from "rxjs";
import { SeasonData } from "./localData";
import { fetch } from "@tauri-apps/api/http";

export function getCurrentSeason$() {
  return defer(() => fetch(`https://api.guildwars2.com/v2/pvp/seasons`)).pipe(
    map((result) => result.data as any),
    map((result): string => result[result.length - 1]),
    switchMap((seasonId) =>
      fetch(`https://api.guildwars2.com/v2/pvp/seasons/${seasonId}`)
    ),
    map((result) => result.data as any),
    map((result): SeasonData | null =>
      result.active
        ? {
            id: result.id,
            name: result.name,
            start: result.start,
            end: result.end,
            divisions: result.divisions.map((division: any) => ({
              name: division.name,
              pips: (division.tiers as Array<any>).reduce(
                (acc, tier) => acc + tier.points,
                0
              ),
            })),
          }
        : null
    )
  );
}

// Last of https://api.guildwars2.com/v2/pvp/seasons
export function getSeasonCurrentPips$(apiKey: string, season_id: string) {
  return defer(() =>
    fetch(`https://api.guildwars2.com/v2/pvp/standings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
  ).pipe(
    map((result) => result.data as any),
    map(
      (result): number =>
        result.find((line: any) => line.season_id === season_id).current
          .total_points
    )
  );
}