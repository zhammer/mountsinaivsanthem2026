import { useEffect, useRef, useState } from "react";
import { useMachine } from "@xstate/react";
import { combatMachine } from "./combatMachine";
import { startSway, setPaused } from "./sway";
import { TESTIMONIALS } from "./testimonials";

type RobotColor = "blue" | "red";

function Sprite({
  part,
  color,
  className = "",
}: {
  part: string;
  color: RobotColor;
  className?: string;
}) {
  return (
    <img
      className={`robot-part ${className}`}
      src={`sprites/robot_${part}_${color}.png`}
      alt={`${color} ${part}`}
    />
  );
}

function Robot({
  color,
  punchPhase,
  hitPhase,
}: {
  color: RobotColor;
  punchPhase: string;
  hitPhase: string;
}) {
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
  const [popoverText, setPopoverText] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [copied, setCopied] = useState(false);
  const nextIndexRef = useRef(Math.floor(Math.random() * TESTIMONIALS.length));
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
      if (!state.matches("ready")) return;
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        send({ type: "PUNCH_LEFT" });
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        send({ type: "PUNCH_RIGHT" });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [send, state]);

  return (
    <>
      <div className="arena">
        <div className="day-counter">
          Day{" "}
          {Math.floor(
            (Date.now() - new Date("2026-01-01").getTime()) / 86400000
          )}
        </div>
        <div className="title-card">
          <div className="fighter left">
            <img
              className="fighter-logo"
              src="sprites/logo_mount_sinai.png"
              alt="Mt. Sinai logo"
            />
            <span className="fighter-name">Mt. Sinai</span>
          </div>
          <div className="fighter right">
            <img
              className="fighter-logo"
              src="sprites/logo_anthem.png"
              alt="Anthem logo"
            />
            <span className="fighter-name">Anthem</span>
          </div>
        </div>
        <div
          className={`robot-wrap red${
            isPunching && punchSide === "left" ? " punching-wrap" : ""
          }`}
          ref={redRef}
          onClick={() => state.matches("ready") && send({ type: "PUNCH_LEFT" })}
        >
          <Robot
            color="red"
            punchPhase={
              isPunching && punchSide === "left"
                ? isCrit && punchPhase === "retracting"
                  ? "crit-retracting"
                  : punchPhase
                : ""
            }
            hitPhase={
              isPunching && punchSide === "right"
                ? `hit-${punchPhase}${isCrit ? " hit-crit" : ""}`
                : ""
            }
          />
        </div>
        <div
          className={`robot-wrap blue${
            isPunching && punchSide === "right" ? " punching-wrap" : ""
          }`}
          ref={blueRef}
          onClick={() =>
            state.matches("ready") && send({ type: "PUNCH_RIGHT" })
          }
        >
          <Robot
            color="blue"
            punchPhase={
              isPunching && punchSide === "right"
                ? isCrit && punchPhase === "retracting"
                  ? "crit-retracting"
                  : punchPhase
                : ""
            }
            hitPhase={
              isPunching && punchSide === "left"
                ? `hit-${punchPhase}${isCrit ? " hit-crit" : ""}`
                : ""
            }
          />
        </div>
      </div>
      <div className="what-is-this" onClick={() => setShowInfo(true)}>
        What is this website?
      </div>
      {shownTestimonials.length > 0 && (
        <div className="testimonials">
          {shownTestimonials.map((msg, i) => (
            <div
              key={`${i}-${msg.slice(0, 20)}`}
              className="testimonial-card"
              onClick={() => setPopoverText(msg)}
            >
              <p>
                <span className="quote-mark">&ldquo;</span>
                {msg}
                <span className="quote-mark">&rdquo;</span>
              </p>
            </div>
          ))}
        </div>
      )}
      {showInfo && (
        <div className="info-overlay" onClick={() => setShowInfo(false)}>
          <div className="info-card" onClick={(e) => e.stopPropagation()}>
            <button className="info-close" onClick={() => setShowInfo(false)}>
              ✕
            </button>
            <p>
              Mount Sinai and Anthem Blue Cross Blue Shield have been in failing
              contract negotiations with each other since January 1st, 2026. It
              appears they may not come to an agreement. The two multi-billion
              dollar corporations{" "}
              <a
                className="link-red"
                href="https://keepmountsinai.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                trade
              </a>{" "}
              <a
                className="link-blue"
                href="https://www.anthem.com/update/mountsinai"
                target="_blank"
                rel="noopener noreferrer"
              >
                jabs
              </a>
              , accusing each other of unfairness on their public communications
              pages. But it is the patients who get hurt: hundreds of thousands
              of New Yorkers must now scramble to find new surgeons, primary
              care physicians, and specialists needed or ongoing treatment.
            </p>
            <p>
              Across social media posts and comment sections, New Yorkers share
              their stories. But there has been little journalistic attention to
              the situation, and Mayor Mamdani, who{" "}
              <a
                href="https://x.com/NYCMayor/status/2010532423994364346"
                target="_blank"
                rel="noopener noreferrer"
              >
                only recently stated
              </a>{" "}
              that "No New Yorker should have to fear losing access to health
              care" (while admirably standing beside the New York State Nurses
              Association), has done nothing publicly to bring attention to this
              issue or to pressure the parties to settle.
            </p>
            <p>
              This website seeks to bring attention to this ongoing struggle,
              assembling a collective voice from the scattered public
              testimonials, inquiries, and pleas shared across the web. As one
              person writes: "where is the public pressure to force these guys
              to sign this contract?!? Where are the politicians that are
              supposed to be standing up for us? [...]
            </p>
            <p>I feel like I’m screaming into the void."</p>
            <div className="info-actions">
              <span
                className="info-action"
                onClick={() => {
                  navigator.clipboard.writeText(
                    "https://mountsinaivsanthem2026.com"
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                [<span className="info-action-text">Share this website</span>]
              </span>
              <a
                className="info-action"
                href="mailto:zach.the.hammer@gmail.com?subject=My%20Mount%20Sinai%20%2F%20Anthem%20Negotiations%20Story"
              >
                [<span className="info-action-text">Share your story</span>]
              </a>
            </div>
            <p className="info-credit">
              INSTRUCTIONS: &#x2190; key or tap red robot for red punch.
              &#x2192; key or tap blue robot for blue punch.
            </p>
            <p className="info-credit">
              CREDITS: Rock ‘Em Sock ‘Em Robots 3D model by{" "}
              <a
                href="https://sketchfab.com/3d-models/rock-em-sock-em-robots-85f17c83f71a4acb85867881cd67b649"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sebastián Espinoza
              </a>
              .
            </p>
          </div>
        </div>
      )}
      {copied && <div className="copied-overlay">Link copied!</div>}
      {popoverText && (
        <div className="popover-overlay" onClick={() => setPopoverText(null)}>
          <div className="popover-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="popover-close"
              onClick={() => setPopoverText(null)}
            >
              ✕
            </button>
            <p>
              <span className="quote-mark">&ldquo;</span>
              {popoverText}
              <span className="quote-mark">&rdquo;</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
