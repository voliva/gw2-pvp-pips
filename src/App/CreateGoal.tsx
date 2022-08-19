import { state, useStateObservable } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { useMemo } from "react";
import { combineLatest, map, of, startWith, switchMap } from "rxjs";
import { SeasonData } from "../service/localData";
import { getRewardForGoal } from "../service/rewards";
import "./CreateGoal.css";
import { createGoal } from "./goals";
import { currentSeason$ } from "./season";

const [nameChange$, setName] = createSignal<string>();
const name$ = state(nameChange$, "");

const [divisionsChange$, setDivisions] = createSignal<number>();
const divisions$ = state(divisionsChange$, 1); // TODO minimum depends on current result

const [repeatsChange$, setRepeats] = createSignal<number>();
const repeats$ = state(
  combineLatest([currentSeason$, divisionsChange$]).pipe(
    switchMap(([season, divisions]) =>
      divisions === season?.divisions.length
        ? repeatsChange$.pipe(
            startWith(0),
            map((value) => ({
              disabled: false,
              value: Math.min(100, value),
            }))
          )
        : of({
            disabled: true,
            value: 0,
          })
    )
  ),
  {
    disabled: true,
    value: 0,
  }
);

export function CreateGoal({ onClose }: { onClose: () => void }) {
  const season = useStateObservable(currentSeason$);
  const name = useStateObservable(name$);
  const divisions = useStateObservable(divisions$);
  const repeats = useStateObservable(repeats$);

  const rewards = useMemo(
    () => getRewardForGoal(divisions, repeats.value),
    [divisions, repeats.value]
  );
  const pips = useMemo(
    () => (season ? calculateCost(season, divisions, repeats.value) : 0),
    [season, divisions, repeats.value]
  );

  if (!season) return null;

  function renderRewardWhenValue(label: string, value: number | string) {
    if (!value) return null;
    return (
      <li>
        {label}: {value}
      </li>
    );
  }

  const repeatable = season.divisions.find((d) => d.repeatable)!;

  return (
    <div className="create-goal painted-box">
      <input
        type="text"
        placeholder="Goal name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="division-range">
        <input
          type="range"
          min={1}
          max={season.divisions.length}
          value={divisions}
          onChange={(e) => setDivisions(Number(e.target.value))}
        />
        <div>
          {season.divisions.map((d) => (
            <img key={d.name} src={d.icon} alt={d.name} />
          ))}
        </div>
      </div>
      <div>
        <div>
          Repeatable
          <img className="chest" src={repeatable.icon} alt={repeatable.name} />
        </div>
        <input
          type="range"
          disabled={divisions < season.divisions.length}
          min={0}
          max={24}
          value={repeats.value}
          onChange={(e) => setRepeats(Number(e.target.value))}
          style={{ width: "50%" }}
        />
        <span>{repeats.value}</span>
      </div>
      <ul className="rewards">
        {renderRewardWhenValue("Pips needed", pips)}
        {renderRewardWhenValue("Shards of Glory", rewards.shardOfGlory)}
        {renderRewardWhenValue(
          "Ascended Shards of Glory",
          rewards.ascendedShardOfGlory
        )}
        {renderRewardWhenValue("PvP League Tickets", rewards.pvpLeagueTicket)}
        {renderRewardWhenValue("Gold", formatGold(rewards.gold))}
        {renderRewardWhenValue(
          "Box of Grandmaster Marks",
          rewards.boxOfGrandmasterMarks
        )}
        {renderRewardWhenValue("Unidentified Dye", rewards.unidentifiedDye)}
        {renderRewardWhenValue("Warlord Armor Box", rewards.warlordArmorBox)}
        {renderRewardWhenValue(
          "Transmutation Charge",
          rewards.transmutationCharge
        )}
        {renderRewardWhenValue(
          "Llama Mini Choice Box",
          rewards.llamaMiniChoiceBox
        )}
      </ul>
      <button
        onClick={() => {
          createGoal({
            title: name,
            value: pips,
          });
          onClose();
        }}
        disabled={name.trim().length === 0}
      >
        Create
      </button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}

function calculateCost(season: SeasonData, divisions: number, repeats: number) {
  let result = 0;
  for (let i = 0; i < divisions; i++) {
    result += season.divisions[i].pips;
  }
  for (let i = 0; i < repeats; i++) {
    result += season.divisions[season.divisions.length - 1].pips;
  }

  return result;
}

function formatGold(value: number) {
  const str = String(value);
  const copper = str.substring(str.length - 2).padStart(2, "0");
  const silver = str.substring(str.length - 4, str.length - 2).padStart(2, "0");
  const gold = str.substring(0, str.length - 4);
  return `${gold},${silver},${copper}`.trim();
}
