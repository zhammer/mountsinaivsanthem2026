import { useEffect, useRef } from "react";
import { useMachine } from "@xstate/react";
import { combatMachine } from "./combatMachine";
import { startSway } from "./sway";

const PARTS = [
  "upper_arm_back",
  "forearm_back",
  "leg_back",
  "head",
  "torso",
  "leg_front",
  "upper_arm_front",
  "forearm_front",
];

const BACK_OFFSET = 5; // px offset for back parts to add depth

function Robot({ color, innerRef }) {
  return (
    <div className="robot-parts" ref={innerRef}>
      {PARTS.map((part) => (
        <img
          key={part}
          className={`robot-part ${part.includes("back") ? "back-part" : ""}`}
          src={`sprites/robot_${part}_${color}.png`}
          alt={`${color} ${part}`}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [state, send] = useMachine(combatMachine);
  const { turn, lastHit, log } = state.context;

  const blueRef = useRef(null);
  const redRef = useRef(null);

  useEffect(() => {
    if (blueRef.current && redRef.current) {
      startSway(blueRef.current, redRef.current);
    }
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.code === "Space" && state.matches("ready")) {
        e.preventDefault();
        send({ type: "PUNCH" });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [send, state]);

  return (
    <div className="arena">
      <div className="robot-wrap blue" ref={blueRef}>
        <Robot color="blue" />
      </div>
      <div className="robot-wrap red" ref={redRef}>
        <Robot color="red" />
      </div>
      <div className="hud">
        <div>State: {state.value}</div>
        <div>Next: {turn}</div>
        {lastHit && (
          <div>
            Last: {lastHit.side} {lastHit.crit ? "CRIT!" : "hit"}
          </div>
        )}
        <div>Total hits: {log.length} | Crits: {log.filter((h) => h.crit).length}</div>
      </div>
    </div>
  );
}
