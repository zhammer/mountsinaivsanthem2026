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
}

function randomDelay() {
  return 5000 + Math.random() * 7000;
}

function isCrit() {
  return Math.random() < 1 / 10;
}

export const combatMachine = setup({
  types: {
    context: {} as CombatContext,
    events: {} as { type: "PUNCH" },
  },
  guards: {
    isCritHit: ({ context }) => context.lastHit?.crit === true,
  },
  actions: {
    recordHit: assign(({ context }) => {
      const side = context.turn;
      const crit = isCrit();
      return {
        turn: (side === "left" ? "right" : "left") as Side,
        lastHit: { side, crit },
        log: [...context.log, { side, crit, time: Date.now() }],
      };
    }),
  },
  delays: {
    PUNCH_DELAY: randomDelay,
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
  },
  states: {
    ready: {
      on: {
        PUNCH: "punching",
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
