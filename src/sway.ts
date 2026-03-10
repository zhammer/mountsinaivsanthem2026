const SWAY_X = 12;
const BOB_Y = 7;
const CYCLE = 4;
const PAUSE = 0.05;
const DESYNC = CYCLE / 2;
const BOB_SHAPE = 2;

// How much the arms shift (in degrees) relative to sway
const ARM_SWAY = 1;
// How many pixels the arms shift laterally (simulates torso rotation)
const ARM_SHIFT = 3;
// How many pixels the legs shift laterally
const LEG_SHIFT = 2;

// Resting angles for the guard stance
const REST_SHOULDER = 27;
const REST_ELBOW = 21;
const REST_BACK_SHOULDER = 27;
const REST_BACK_ELBOW = 21;

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

interface RobotEls {
  wrap: HTMLElement;
  parts: HTMLElement;
  frontShoulder: HTMLElement;
  frontElbow: HTMLElement;
  backShoulder: HTMLElement;
  backElbow: HTMLElement;
  legFront: HTMLElement;
  legBack: HTMLElement;
}

function cacheEls(wrap: HTMLElement): RobotEls {
  return {
    wrap,
    parts: wrap.querySelector('.robot-parts')!,
    frontShoulder: wrap.querySelector('.shoulder-pivot')!,
    frontElbow: wrap.querySelector('.elbow-pivot')!,
    backShoulder: wrap.querySelector('.back-shoulder-pivot')!,
    backElbow: wrap.querySelector('.back-elbow-pivot')!,
    legFront: wrap.querySelector('.leg-front')!,
    legBack: wrap.querySelector('.leg-back')!,
  };
}

function clearArmStyles(els: RobotEls) {
  els.frontShoulder.style.transform = '';
  els.frontElbow.style.transform = '';
}

function updateParts(els: RobotEls, xNorm: number) {
  // Don't touch anything if a punch phase is active (CSS handles it)
  const cl = els.parts.classList;
  if (cl.contains('punching') || cl.contains('holding') ||
      cl.contains('critHolding') || cl.contains('retracting') ||
      cl.contains('crit-retracting')) return;

  const shift = xNorm * ARM_SHIFT;

  els.frontShoulder.style.transform = `translateX(${shift}px) rotate(${REST_SHOULDER + xNorm * ARM_SWAY}deg)`;
  els.frontElbow.style.transform = `rotate(${REST_ELBOW + xNorm * ARM_SWAY * 0.5}deg)`;
  els.backShoulder.style.transform = `translate(${10 - shift}px, -6px) rotate(${REST_BACK_SHOULDER - xNorm * ARM_SWAY * 0.6}deg)`;
  els.backElbow.style.transform = `rotate(${REST_BACK_ELBOW - xNorm * ARM_SWAY * 2}deg)`;

  const legShift = xNorm * LEG_SHIFT;
  els.legFront.style.transform = `translateX(${legShift}px)`;
  els.legBack.style.transform = `translate(${10 - legShift}px, -6px)`;
}

export function startSway(blueWrap: HTMLElement, redWrap: HTMLElement) {
  const blue = cacheEls(blueWrap);
  const red = cacheEls(redWrap);
  let start: number | null = null;

  function tick(timestamp: number) {
    if (!start) start = timestamp;

    if (paused) {
      blueWrap.style.transform = `scaleX(-1) translate(${-SWAY_X}px, 0px)`;
      redWrap.style.transform = `scaleX(-1) translate(${SWAY_X}px, 0px)`;
      clearArmStyles(blue);
      clearArmStyles(red);
      start = null;
      requestAnimationFrame(tick);
      return;
    }

    const elapsed = (timestamp - start) / 1000;

    const tBlue = (elapsed % CYCLE) / CYCLE;
    const posBlue = swayPos(tBlue);
    blueWrap.style.transform = `scaleX(-1) translate(${posBlue.x}px, ${posBlue.y}px)`;
    updateParts(blue, posBlue.x / SWAY_X);

    const tRed = ((elapsed + DESYNC) % CYCLE) / CYCLE;
    const posRed = swayPos(tRed);
    redWrap.style.transform = `scaleX(-1) translate(${posRed.x}px, ${posRed.y}px)`;
    updateParts(red, -posRed.x / SWAY_X);

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
