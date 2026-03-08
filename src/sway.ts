const SWAY_X = 12;
const BOB_Y = 7;
const CYCLE = 4;
const PAUSE = 0.05;
const DESYNC = CYCLE / 2;
const BOB_SHAPE = 2;

let paused = false;

export function setPaused(p: boolean) {
  if (p && !paused) {
    paused = true;
  } else if (!p && paused) {
    paused = false;
  }
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function swayPos(t: number): { x: number; y: number } {
  const halfPause = PAUSE;
  const moveTime = 1 - halfPause;

  const half = t < 0.5 ? 0 : 1;
  const ht = half === 0 ? t * 2 : (t - 0.5) * 2;

  let moveT: number;
  if (ht < halfPause / 2) {
    moveT = 0;
  } else if (ht > 1 - halfPause / 2) {
    moveT = 1;
  } else {
    moveT = (ht - halfPause / 2) / moveTime;
  }

  const easedT = easeInOut(moveT);

  const x = half === 0
    ? -SWAY_X + easedT * 2 * SWAY_X
    : SWAY_X - easedT * 2 * SWAY_X;

  const y = -BOB_Y * Math.pow(Math.sin(moveT * Math.PI), BOB_SHAPE);

  return { x, y };
}

export function startSway(blueWrap: HTMLElement, redWrap: HTMLElement) {
  let start: number | null = null;
  let lastElapsed = 0;
  let frozenElapsed = 0;

  function tick(timestamp: number) {
    if (!start) start = timestamp;

    if (paused) {
      if (frozenElapsed === 0) frozenElapsed = lastElapsed;
    } else {
      if (frozenElapsed > 0) {
        // Resume: adjust start so elapsed continues from where we froze
        start = timestamp - frozenElapsed * 1000;
        frozenElapsed = 0;
      }
      lastElapsed = (timestamp - start) / 1000;
    }

    const elapsed = paused ? frozenElapsed : lastElapsed;

    const tBlue = (elapsed % CYCLE) / CYCLE;
    const posBlue = swayPos(tBlue);
    blueWrap.style.transform = `scaleX(-1) translate(${posBlue.x}px, ${posBlue.y}px)`;

    const tRed = ((elapsed + DESYNC) % CYCLE) / CYCLE;
    const posRed = swayPos(tRed);
    redWrap.style.transform = `scaleX(-1) translate(${posRed.x}px, ${posRed.y}px)`;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
