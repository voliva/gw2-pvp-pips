import { fetch } from "@tauri-apps/api/http";
import { defer, filter, map, switchMap } from "rxjs";
import { SeasonData } from "./localData";

export function getCurrentSeason$() {
  return defer(() => {
    console.log("fetching current season");
    return fetch(`https://api.guildwars2.com/v2/pvp/seasons`);
  }).pipe(
    map((result) => result.data as any),
    // tap((result) => console.log(result)),
    map((result): string => result[result.length - 1]),
    switchMap((seasonId) =>
      fetch(`https://api.guildwars2.com/v2/pvp/seasons/${seasonId}`)
    ),
    map((result) => result.data as any),
    map(
      (result): SeasonData => ({
        id: result.id,
        name: result.name,
        start: result.start,
        end: result.end,
        divisions: result.divisions.map((division: any) => ({
          name: division.name,
          repeatable: division.flags.includes("Repeatable"),
          pips: (division.tiers as Array<any>).reduce(
            (acc, tier) => acc + tier.points,
            0
          ),
          icon: division.large_icon,
        })),
      })
    )
  );
}

export function getSeasonCurrentPips$(apiKey: string, season_id: string) {
  return defer(() => {
    console.log("fetching current pips");
    return fetch(`https://api.guildwars2.com/v2/pvp/standings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }).pipe(
    map((result) => result.data as any),
    filter((result) => Array.isArray(result)),
    map(
      (result): number =>
        result.find((line: any) => line.season_id === season_id)?.current
          .total_points ?? 0
    )
  );
}
