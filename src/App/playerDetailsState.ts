import { state } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import {
  combineLatest,
  concat,
  filter,
  map,
  merge,
  Observable,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs";
import { getSeasonCurrentPips$ } from "../service/gw2Api";
import {
  cacheData$,
  Division,
  initialConfig$,
  writeCache$,
  writeConfig$,
} from "../service/localData";
import { currentSeason$, currentSeasonIsActive$ } from "./season";

const [apiKeyChange$, setApiKey] = createSignal<string>();
export const apiKey$ = state(
  merge(initialConfig$.pipe(map((config) => config.apiKey)), apiKeyChange$),
  ""
);

const [refresh$, refresh] = createSignal();
const [pipsInput$, setPips] = createSignal<number>();
const [selectedTypeChange$, selectType] = createSignal<"2v2" | "3v3" | "5v5">();
const [endDateChange$, setEndDate] = createSignal<string>();
export { refresh, setApiKey, setPips, selectType, setEndDate };

export interface PlayerDetails {
  pips: number;
  timestamp: Date;
}

const cachedPlayerDetails$ = cacheData$.pipe(
  map((cache) => cache?.lastResult!),
  map((lastResult) =>
    lastResult
      ? {
          timestamp: new Date(lastResult.timestamp),
          pips: lastResult.hadPips,
        }
      : null
  )
);
function cachePlayerDetails() {
  return (source$: Observable<PlayerDetails>) =>
    source$.pipe(
      tap((result) =>
        writeCache$({
          lastResult: {
            timestamp: result.timestamp.toISOString(),
            hadPips: result.pips,
          },
        }).subscribe()
      )
    );
}

const APIPlayerDetails$ = concat(
  cachedPlayerDetails$.pipe(
    filter((v) => !!v),
    map((v) => v!)
  ),
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
    cachePlayerDetails()
  )
);

const manualPlayerDetails$ = concat(
  cachedPlayerDetails$.pipe(
    map((v) =>
      v
        ? v
        : {
            timestamp: new Date(),
            pips: 0,
          }
    )
  ),
  pipsInput$.pipe(
    map((pips) => ({
      pips,
      timestamp: new Date(),
    })),
    cachePlayerDetails()
  )
);

export const playerDetails$ = state<PlayerDetails | null>(
  currentSeasonIsActive$.pipe(
    switchMap((isActive) =>
      isActive ? APIPlayerDetails$ : manualPlayerDetails$
    )
  ),
  null
);

export interface SeasonDetails {
  name: string; // TODO
  end: Date;
  divisions: Array<Division>;
}

export const selectedType$ = state(selectedTypeChange$, "2v2");
export const endDate$ = state(
  endDateChange$.pipe(map((v) => (v ? v : null))),
  null
);

export const selectedSeason$ = state(
  combineLatest({
    divisions: selectedType$.pipe(
      map((v) =>
        v === "2v2"
          ? mini2v2Divisions
          : v === "3v3"
          ? mini3v3Divisions
          : regularDivisions
      )
    ),
    end: endDate$.pipe(
      filter((v) => !!v),
      map((v) => new Date(v!))
    ),
  }),
  null
);

const regularDivisions: Array<Division> = [
  {
    name: "Cerulean",
    repeatable: false,
    icon: "https://render.guildwars2.com/file/CBACFFCD30B623FCCAF3CC7296056265F15E09BB/1614868.png",
    pips: 60,
  },
  {
    name: "Jasper",
    repeatable: false,
    icon: "https://render.guildwars2.com/file/769445B8AFC30D92345AB6A84ACD02A223B5B1B5/1614869.png",
    pips: 80,
  },
  {
    name: "Saffron",
    repeatable: false,
    icon: "https://render.guildwars2.com/file/509921D3BFDC049BC20758B71AD85592A043A439/1614870.png",
    pips: 100,
  },
  {
    name: "Persimmon",
    repeatable: false,
    icon: "https://render.guildwars2.com/file/5807B5E8BC4658DE9CB44664C125A6A3900D80A9/1614871.png",
    pips: 100,
  },
  {
    name: "Amaranth",
    repeatable: false,
    icon: "https://render.guildwars2.com/file/9CEAC0D269EC685D2818320FACC4130151C9B4B7/1614872.png",
    pips: 150,
  },
  {
    name: "Byzantium (Repeatable)",
    repeatable: true,
    icon: "https://render.guildwars2.com/file/52F72F4C72B517B0955D00CE0415E9B778191395/1614873.png",
    pips: 180,
  },
];
const mini3v3Divisions: Array<Division> = [
  {
    name: "Cerulean",
    repeatable: false,
    icon: "https://render.guildwars2.com/file/CBACFFCD30B623FCCAF3CC7296056265F15E09BB/1614868.png",
    pips: 60,
  },
  {
    name: "Jasper",
    repeatable: false,
    icon: "https://render.guildwars2.com/file/769445B8AFC30D92345AB6A84ACD02A223B5B1B5/1614869.png",
    pips: 80,
  },
  {
    name: "Saffron (Repeatable)",
    repeatable: true,
    icon: "https://render.guildwars2.com/file/509921D3BFDC049BC20758B71AD85592A043A439/1614870.png",
    pips: 100,
  },
];
const mini2v2Divisions: Array<Division> = [
  {
    name: "Cerulean",
    repeatable: false,
    icon: "https://render.guildwars2.com/file/CBACFFCD30B623FCCAF3CC7296056265F15E09BB/1614868.png",
    pips: 60,
  },
  {
    name: "Jasper",
    repeatable: false,
    icon: "https://render.guildwars2.com/file/769445B8AFC30D92345AB6A84ACD02A223B5B1B5/1614869.png",
    pips: 80,
  },
  {
    name: "Saffron",
    repeatable: false,
    icon: "https://render.guildwars2.com/file/509921D3BFDC049BC20758B71AD85592A043A439/1614870.png",
    pips: 100,
  },
  {
    name: "Persimmon (Repeatable)",
    repeatable: true,
    icon: "https://render.guildwars2.com/file/5807B5E8BC4658DE9CB44664C125A6A3900D80A9/1614871.png",
    pips: 100,
  },
];
