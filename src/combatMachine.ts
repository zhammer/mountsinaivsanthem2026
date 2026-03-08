import { setup, assign } from "xstate";

type Side = "left" | "right";

interface Hit {
  side: Side;
  crit: boolean;
  time: number;
}

interface CombatContext {
  turn: Side;
  lastHit: { side: Side; crit: boolean } | null;
  log: Hit[];
  manualPunch: boolean;
}

function randomDelay() {
  return 3000 + Math.random() * 9000;
}

function isCrit() {
  return Math.random() < 1 / 5;
}

export const combatMachine = setup({
  types: {
    context: {} as CombatContext,
    events: {} as { type: "PUNCH" } | { type: "PUNCH_LEFT" } | { type: "PUNCH_RIGHT" },
  },
  guards: {
    isCritHit: ({ context }) => context.lastHit?.crit === true,
  },
  actions: {
    recordHit: assign(({ context, event }) => {
      const manual = event.type === "PUNCH" || event.type === "PUNCH_LEFT" || event.type === "PUNCH_RIGHT";
      const side = event.type === "PUNCH_LEFT" ? "left" as Side
        : event.type === "PUNCH_RIGHT" ? "right" as Side
        : context.turn;
      const crit = isCrit();
      return {
        turn: (side === "left" ? "right" : "left") as Side,
        lastHit: { side, crit },
        log: [...context.log, { side, crit, time: Date.now() }],
        manualPunch: manual,
      };
    }),
  },
  delays: {
    PUNCH_DELAY: ({ context }: { context: CombatContext }) =>
      context.manualPunch ? 10000 : randomDelay(),
    HOLD_DELAY: ({ context }: { context: CombatContext }) =>
      context.lastHit?.crit ? 800 : 1600,
    CRIT_HOLD_DELAY: () => 1600,
    RETRACT_DELAY: ({ context }: { context: CombatContext }) =>
      context.lastHit?.crit ? 400 : 200,
  },
}).createMachine({
  id: "combat",
  initial: "ready",
  context: {
    turn: "left" as Side,
    lastHit: null,
    log: [],
    manualPunch: false,
  },
  states: {
    ready: {
      on: {
        PUNCH: "punching",
        PUNCH_LEFT: "punching",
        PUNCH_RIGHT: "punching",
      },
      after: {
        PUNCH_DELAY: "punching",
      },
    },
    punching: {
      entry: "recordHit",
      after: {
        210: "holding",
      },
    },
    holding: {
      after: {
        HOLD_DELAY: [
          { target: "critHolding", guard: "isCritHit" },
          { target: "retracting" },
        ],
      },
    },
    critHolding: {
      after: {
        CRIT_HOLD_DELAY: "retracting",
      },
    },
    retracting: {
      after: {
        RETRACT_DELAY: "ready",
      },
    },
  },
});
