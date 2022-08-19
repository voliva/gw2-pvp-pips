import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { isTauri } from "./service/tauri";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (isTauri()) {
  document.addEventListener("contextmenu", (evt) => evt.preventDefault());
}
