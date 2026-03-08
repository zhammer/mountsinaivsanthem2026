const SWAY_X = 12;
const BOB_Y = 7;
const CYCLE = 4;
const PAUSE = 0.05;
const DESYNC = CYCLE / 2;
const BOB_SHAPE = 2;

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function swayPos(t) {
  const halfPause = PAUSE;
  const moveTime = 1 - halfPause;

  const half = t < 0.5 ? 0 : 1;
  const ht = half === 0 ? t * 2 : (t - 0.5) * 2;

  let moveT;
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

export function startSway(blueWrap, redWrap) {
  let start = null;

  function tick(timestamp) {
    if (!start) start = timestamp;
    const elapsed = (timestamp - start) / 1000;

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
