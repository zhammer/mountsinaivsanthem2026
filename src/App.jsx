import { useEffect, useRef } from "react";
import { useMachine } from "@xstate/react";
import { combatMachine } from "./combatMachine";
import { startSway, setPaused } from "./sway";

function Sprite({ part, color, className = "" }) {
  return (
    <img
      className={`robot-part ${className}`}
      src={`sprites/robot_${part}_${color}.png`}
      alt={`${color} ${part}`}
    />
  );
}

function Robot({ color, punchPhase }) {
  return (
    <div className={`robot-parts ${punchPhase}`}>
      {/* Back parts (behind everything) */}
      <Sprite part="upper_arm_back" color={color} className="back-part" />
      <Sprite part="forearm_back" color={color} className="back-part" />
      <Sprite part="leg_back" color={color} className="back-part" />
      {/* Body */}
      <Sprite part="head" color={color} />
      <Sprite part="torso" color={color} />
      <Sprite part="leg_front" color={color} />
      {/* Front arm with pivot joints */}
      <div className="shoulder-pivot">
        <Sprite part="forearm_front" color={color} />
        <div className="elbow-pivot">
          <Sprite part="upper_arm_front" color={color} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [state, send] = useMachine(combatMachine);
  const { turn, lastHit, log } = state.context;

  const blueRef = useRef(null);
  const redRef = useRef(null);

  const isPunching = !state.matches("ready");
  const punchSide = lastHit?.side;
  const punchPhase = state.value;

  useEffect(() => {
    setPaused(isPunching);
  }, [isPunching]);

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
        <Robot
          color="blue"
          punchPhase={isPunching && punchSide === "left" ? punchPhase : ""}
        />
      </div>
      <div className="robot-wrap red" ref={redRef}>
        <Robot
          color="red"
          punchPhase={isPunching && punchSide === "right" ? punchPhase : ""}
        />
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
