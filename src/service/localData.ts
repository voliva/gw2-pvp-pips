import {
  BaseDirectory,
  createDir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { defer, switchMap } from "rxjs";
import { shareLatest } from "@react-rxjs/core";

export interface Goal {
  title: string;
  value: number;
}

export interface Config {
  version: 1;
  apiKey: string;
  holidays: number[]; // day0 = start of season
  goals: Goal[];
}

const defaultConfig: Config = {
  version: 1,
  apiKey: "",
  holidays: [],
  goals: [],
};

const readConfig$ = () =>
  defer(async () => {
    try {
      const content = await readTextFile("config.json", {
        dir: BaseDirectory.App,
      });

      return JSON.parse(content) as Config;
    } catch (ex) {
      console.error(ex);
      return defaultConfig;
    }
  });

export const initialConfig$ = readConfig$().pipe(shareLatest());

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

export interface SeasonData {
  id: string;
  name: string;
  start: string;
  end: string;
  divisions: Array<{
    name: string;
    repeatable: boolean;
    icon: string;
    pips: number;
  }>;
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
