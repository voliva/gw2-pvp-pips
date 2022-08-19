import { CSSProperties } from "react";
import pipActive from "./pipActive.png";
import pipNotActive from "./pipNotActive.png";

export function Pip({
  active,
  style,
}: {
  active: boolean;
  style?: CSSProperties;
}) {
  return (
    <img
      style={{
        height: "1.5rem",
        verticalAlign: "middle",
        margin: "0 0.2rem",
        ...style,
      }}
      alt="pips"
      src={active ? pipActive : pipNotActive}
    />
  );
}
