import { fetch as tauriFetch } from "@tauri-apps/api/http";
import { defer, filter, map, switchMap } from "rxjs";
import { SeasonData } from "./localData";
import { isTauri } from "./tauri";

const nativeFetch = window.fetch;

const fetch: typeof tauriFetch = isTauri()
  ? tauriFetch
  : (url, options) =>
      nativeFetch(url, {
        method: options?.method ?? "GET",
        headers: (options?.headers as any) ?? {},
      }).then(async (response) => {
        const data = await response.json();

        return {
          url: response.url,
          status: response.status,
          ok: response.status >= 200 && response.status < 300,
          headers: response.headers as any,
          rawHeaders: response.headers as any,
          data,
        };
      });

export function getCurrentSeason$() {
  return defer(() => {
    console.log("fetching current season");
    return fetch(`https://api.guildwars2.com/v2/pvp/seasons`);
  }).pipe(
    map((result) => result.data as any),
    map((result): string => result[result.length - 1]),
    switchMap((seasonId) =>
      fetch(`https://api.guildwars2.com/v2/pvp/seasons/${seasonId}`)
    ),
    map((result) => result.data as any),
    // tap((result) => console.log(result)),
    map((result): SeasonData | null =>
      result.active
        ? {
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
          }
        : null
    )
    // tap((result) => console.log(result))
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
        result.find((line: any) => line.season_id === season_id).current
          .total_points
    )
  );
}
