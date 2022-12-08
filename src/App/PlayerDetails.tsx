import { useStateObservable } from "@react-rxjs/core";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { useEffect, useState } from "react";
import { Pip } from "../components/Pip";
import {
  apiKey$,
  endDate$,
  playerDetails$,
  refresh,
  selectedType$,
  selectType,
  setApiKey,
  setEndDate,
  setPips,
} from "./playerDetailsState";
import { currentSeasonIsActive$ } from "./season";
import "./PlayerDetails.css";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en");

function APIPlayerDetails() {
  const apiKey = useStateObservable(apiKey$);
  const playerDetails = useStateObservable(playerDetails$);

  return (
    <div className="painted-box">
      <div>
        <input
          placeholder="API Key"
          value={apiKey}
          onChange={(evt) => setApiKey(evt.target.value)}
        />
        <button onClick={refresh} disabled={!apiKey}>
          Refresh Pips
        </button>
      </div>
      <div>
        <RefreshingTimeAgo date={playerDetails?.timestamp} />
        <div style={{ fontSize: "1.2rem" }}>
          <Pip active={true} />
          {playerDetails ? playerDetails.pips : "N/A"}
        </div>
      </div>
    </div>
  );
}
function ManualPlayerDetails() {
  const details = useStateObservable(playerDetails$);
  const selectedType = useStateObservable(selectedType$);
  const endDate = useStateObservable(endDate$);
  console.log("endDate", endDate);

  return (
    <div className="painted-box">
      <div>⚠️ The API didn't return an active season yet ⚠️</div>
      <div>
        <Pip active={true} />
        <input
          type="number"
          placeholder="Pips"
          value={details?.pips ?? 0}
          onChange={(evt) => setPips(Number(evt.target.value))}
        />
      </div>
      <div>
        <label className="season-pick">
          <input
            type="radio"
            name="season_type"
            value="2v2"
            checked={selectedType === "2v2"}
            onChange={(e) => selectType(e.target.value as any)}
          />
          2v2
        </label>
        <label className="season-pick">
          <input
            type="radio"
            name="season_type"
            value="3v3"
            checked={selectedType === "3v3"}
            onChange={(e) => selectType(e.target.value as any)}
          />
          3v3
        </label>
        <label className="season-pick">
          <input
            type="radio"
            name="season_type"
            value="5v5"
            checked={selectedType === "5v5"}
            onChange={(e) => selectType(e.target.value as any)}
          />
          5v5
        </label>
      </div>
      <div>
        Season end:
        <label>
          <input
            value={endDate ?? ""}
            onChange={(evt) => setEndDate(evt.target.value)}
            type="date"
          />
        </label>
      </div>
    </div>
  );
}

function PlayerDetails() {
  const isActive = useStateObservable(currentSeasonIsActive$);

  if (!isActive == null) return null;

  if (isActive) {
    return <APIPlayerDetails />;
  }
  return <ManualPlayerDetails />;
}

function RefreshingTimeAgo({ date }: { date?: Date }) {
  const [formattedTime, setFormattedTime] = useState(
    date ? timeAgo.format(date) : "N/A"
  );

  useEffect(() => {
    const token = setInterval(() => {
      setFormattedTime(date ? timeAgo.format(date) : "N/A");
    }, 60_000);
    setFormattedTime(date ? timeAgo.format(date) : "N/A");

    return () => {
      clearInterval(token);
    };
  }, [date]);

  return <div>Last update: {formattedTime}</div>;
}

export default PlayerDetails;
