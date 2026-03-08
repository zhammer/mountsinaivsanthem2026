import { useEffect, useRef, useState } from "react";
import { useMachine } from "@xstate/react";
import { combatMachine } from "./combatMachine";
import { startSway, setPaused } from "./sway";
import { TESTIMONIALS } from "./testimonials";

type RobotColor = "blue" | "red";

function Sprite({ part, color, className = "" }: { part: string; color: RobotColor; className?: string }) {
  return (
    <img
      className={`robot-part ${className}`}
      src={`sprites/robot_${part}_${color}.png`}
      alt={`${color} ${part}`}
    />
  );
}

function Robot({ color, punchPhase, hitPhase }: { color: RobotColor; punchPhase: string; hitPhase: string }) {
  return (
    <div className={`robot-parts ${punchPhase} ${hitPhase}`}>
      {/* Back parts (behind everything) */}
      <Sprite part="upper_arm_back" color={color} className="back-part" />
      <Sprite part="forearm_back" color={color} className="back-part" />
      <Sprite part="leg_back" color={color} className="back-part" />
      {/* Body */}
      <Sprite part="head" color={color} className="head" />
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
  const { lastHit } = state.context;

  const blueRef = useRef<HTMLDivElement>(null);
  const redRef = useRef<HTMLDivElement>(null);

  const isPunching = !state.matches("ready");
  const punchSide = lastHit?.side;
  const isCrit = lastHit?.crit ?? false;
  const punchPhase = state.value as string;

  const [shownTestimonials, setShownTestimonials] = useState<string[]>([]);
  const nextIndexRef = useRef(0);
  const lastHitCountRef = useRef(0);
  const holdingTriggeredRef = useRef(false);

  useEffect(() => {
    setPaused(isPunching);
  }, [isPunching]);

  useEffect(() => {
    if (redRef.current && blueRef.current) {
      startSway(redRef.current, blueRef.current);
    }
  }, []);

  useEffect(() => {
    const hitCount = state.context.log.length;
    if (hitCount > lastHitCountRef.current) {
      lastHitCountRef.current = hitCount;
      holdingTriggeredRef.current = false;
    }
  }, [state.context.log.length]);

  useEffect(() => {
    const isHolding = state.matches("holding");
    if (isHolding && !holdingTriggeredRef.current) {
      holdingTriggeredRef.current = true;
      const hit = state.context.log[state.context.log.length - 1];

      const addOne = () => {
        const idx = nextIndexRef.current % TESTIMONIALS.length;
        setShownTestimonials((prev) => [TESTIMONIALS[idx].message, ...prev]);
        nextIndexRef.current++;
      };

      if (hit?.crit) {
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 0; i < 5; i++) {
          timers.push(setTimeout(addOne, i * 150));
        }
        return () => timers.forEach(clearTimeout);
      } else {
        addOne();
      }
    }
  }, [punchPhase]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && state.matches("ready")) {
        e.preventDefault();
        send({ type: "PUNCH" });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [send, state]);

  return (
    <><div className="arena">
      <div className="day-counter">
        Day {Math.floor((Date.now() - new Date("2026-01-01").getTime()) / 86400000)}
      </div>
      <div className="title-card">
        <div className="fighter left">
          <img className="fighter-logo" src="sprites/logo_mount_sinai.png" alt="Mt. Sinai logo" />
          <span className="fighter-name">Mt. Sinai</span>
        </div>
        <div className="fighter right">
          <img className="fighter-logo" src="sprites/logo_anthem.png" alt="Anthem logo" />
          <span className="fighter-name">Anthem</span>
        </div>
      </div>
      <div className={`robot-wrap red${isPunching && punchSide === "left" ? " punching-wrap" : ""}`} ref={redRef}>
        <Robot
          color="red"
          punchPhase={isPunching && punchSide === "left" ? (isCrit && punchPhase === "retracting" ? "crit-retracting" : punchPhase) : ""}
          hitPhase={isPunching && punchSide === "right" ? `hit-${punchPhase}${isCrit ? " hit-crit" : ""}` : ""}
        />
      </div>
      <div className={`robot-wrap blue${isPunching && punchSide === "right" ? " punching-wrap" : ""}`} ref={blueRef}>
        <Robot
          color="blue"
          punchPhase={isPunching && punchSide === "right" ? (isCrit && punchPhase === "retracting" ? "crit-retracting" : punchPhase) : ""}
          hitPhase={isPunching && punchSide === "left" ? `hit-${punchPhase}${isCrit ? " hit-crit" : ""}` : ""}
        />
      </div>
    </div>
    {shownTestimonials.length > 0 && (
      <div className="testimonials">
        {shownTestimonials.map((msg, i) => (
          <div key={`${i}-${msg.slice(0, 20)}`} className="testimonial-card">
            <p>{msg}</p>
          </div>
        ))}
      </div>
    )}
    </>
  );
}
