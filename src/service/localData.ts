import { shareLatest, state } from "@react-rxjs/core";
import {
  BaseDirectory,
  createDir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { defer, switchMap } from "rxjs";

export interface Goal {
  title: string;
  value: number;
}

export interface ManualSeason {
  type: "2v2" | "3v3" | "5v5";
  end: string | undefined;
}

export interface Config {
  version: 1;
  apiKey: string;
  holidays: number[]; // day0 = start of season
  season: ManualSeason;
  goals: Goal[];
}

const defaultConfig: Config = {
  version: 1,
  apiKey: "",
  holidays: [],
  season: {
    type: "2v2",
    end: undefined,
  },
  goals: [
    {
      title: "All chests",
      value: 670,
    },
  ],
};

const readConfig$ = () =>
  defer(async () => {
    try {
      const content = await readTextFile("config.json", {
        dir: BaseDirectory.App,
      });

      const parsed = JSON.parse(content) as Partial<Config>;
      return {
        ...defaultConfig,
        ...parsed,
      };
    } catch (ex) {
      console.error(ex);
      return defaultConfig;
    }
  });

export const initialConfig$ = state(readConfig$());

export const writeConfig$ = (config: Partial<Config>) =>
  readConfig$().pipe(
    switchMap(async (previousConfig) => {
      try {
        // Create directory if it doesn't exist
        await createDir("", { dir: BaseDirectory.App });
      } catch (ex) {}

      try {
        await writeTextFile(
          "config.json",
          JSON.stringify({ ...defaultConfig, ...previousConfig, ...config }),
          {
            dir: BaseDirectory.App,
          }
        );
      } catch (ex) {
        console.error(ex);
      }
    })
  );

/** CACHED DATA **/
export interface Division {
  name: string;
  repeatable: boolean;
  icon: string;
  pips: number;
}
// This is the data needed to calculate everything, but it doesn't have data generated from API
export interface SeasonDetails {
  type: "2v2" | "3v3" | "5v5";
  end: string;
  divisions: Array<Division>;
}

export interface SeasonData extends SeasonDetails {
  id: string;
  name: string;
  start: string;
}

export interface LastResult {
  timestamp: string;
  hadPips: number;
}

export interface CacheData {
  seasonData?: SeasonData;
  lastResult?: LastResult;
}

const readCache$ = () =>
  defer(async () => {
    try {
      const content = await readTextFile("gw2PipsCache.json", {
        dir: BaseDirectory.Cache,
      });

      return JSON.parse(content) as CacheData;
    } catch (ex) {
      console.error(ex);
      return null;
    }
  });

export const cacheData$ = readCache$().pipe(shareLatest());

export const writeCache$ = (cacheData: Partial<CacheData>) =>
  readCache$().pipe(
    switchMap(async (prevCache) => {
      try {
        await writeTextFile(
          "gw2PipsCache.json",
          JSON.stringify({ ...prevCache, ...cacheData }),
          {
            dir: BaseDirectory.Cache,
          }
        );
      } catch (ex) {
        console.error(ex);
      }
    })
  );
