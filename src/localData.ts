import {
  BaseDirectory,
  createDir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { defer } from "rxjs";

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

export const readConfig$ = () =>
  defer(async () => {
    try {
      const content = await readTextFile("config.json", {
        dir: BaseDirectory.App,
      });

      return JSON.parse(content) as Config;
    } catch (ex) {
      console.error(ex);
      return null;
    }
  });

export const writeConfig$ = (config: Config) =>
  defer(async () => {
    try {
      await createDir("", { dir: BaseDirectory.App });
    } catch (ex) {}

    try {
      console.log("writing config", config);
      await writeTextFile("config.json", JSON.stringify(config), {
        dir: BaseDirectory.App,
      });
    } catch (ex) {
      console.error(ex);
    }
  });

/** CACHED DATA **/

export interface SeasonData {
  id: string;
  name: string;
  start: string;
  end: string;
  divisions: Array<{ name: string; pips: number }>;
}

export interface LastResult {
  hadPips: number;
  remainingDays: number;
}

export interface CacheData {
  seasonData?: SeasonData;
  lastResult?: LastResult;
}

export const readCache$ = () =>
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

export const writeCache$ = (cacheData: CacheData) =>
  defer(async () => {
    try {
      await writeTextFile("gw2PipsCache.json", JSON.stringify(cacheData), {
        dir: BaseDirectory.Cache,
      });
    } catch (ex) {
      console.error(ex);
    }
  });
