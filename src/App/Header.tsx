import { useStateObservable } from "@react-rxjs/core";
import { appWindow } from "@tauri-apps/api/window";
import { currentSeason$ } from "./season";
import "./Header.css";

function Header() {
  const season = useStateObservable(currentSeason$);

  return (
    <div className="header" data-tauri-drag-region>
      <div className="header-title painted-line" data-tauri-drag-region>
        {season ? season.name : "PvP Pips Calculator"}
      </div>
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
    </div>
  );
}

export default Header;
