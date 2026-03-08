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
  return 3000 + Math.random() * 6000;
}

function isCrit() {
  return Math.random() < 1 / 20;
}

export const combatMachine = setup({
  types: {
    context: {} as CombatContext,
    events: {} as { type: "PUNCH" },
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
    },
    punching: {
      entry: "recordHit",
      after: {
        210: "holding",
      },
    },
    holding: {
      after: {
        400: "retracting",
      },
    },
    retracting: {
      after: {
        200: "ready",
      },
    },
  },
});
