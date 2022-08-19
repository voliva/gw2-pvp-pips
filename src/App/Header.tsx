import { useStateObservable } from "@react-rxjs/core";
import { appWindow } from "@tauri-apps/api/window";
import { currentSeason$ } from "./season";
import "./Header.css";
import { isTauri } from "../service/tauri";

function Header() {
  const season = useStateObservable(currentSeason$);

  return (
    <div className="header" data-tauri-drag-region>
      <div className="header-title painted-line" data-tauri-drag-region>
        {season ? season.name : "PvP Pips Calculator"}
      </div>
      {isTauri() ? (
        <div className="header-actions">
          <div onClick={() => appWindow.minimize()}>
            <img
              src="https://api.iconify.design/mdi:window-minimize.svg"
              alt="minimize"
            />
          </div>
          <div onClick={() => appWindow.close()}>
            <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Header;
