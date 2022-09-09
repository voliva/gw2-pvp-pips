import { useStateObservable } from "@react-rxjs/core";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { useEffect, useState } from "react";
import { Pip } from "../components/Pip";
import {
  apiKey$,
  playerDetails$,
  refresh,
  setApiKey,
} from "./playerDetailsState";
import { currentSeason$ } from "./season";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en");

function PlayerDetails() {
  const season = useStateObservable(currentSeason$);
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
        <button onClick={refresh} disabled={!season || !apiKey}>
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

function RefreshingTimeAgo({ date }: { date?: Date }) {
  const [formattedTime, setFormattedTime] = useState(
    date ? timeAgo.format(date) : "N/A"
  );

  useEffect(() => {
    const token = setInterval(() => {
      setFormattedTime(date ? timeAgo.format(date) : "N/A");
    }, 60_000);
    return () => {
      clearInterval(token);
    };
  }, [date]);

  return <div>Last update: {formattedTime}</div>;
}

export default PlayerDetails;
