// CSS-driven sway animation with JS pause/resume for punches.
// Keyframes are defined in index.html. This module just toggles them.

// Snap-to-closest values (cycle position 0% = robots closest together)
const SNAP_BODY_BLUE = 'scaleX(-1) translate(-12px, 0px)';
const SNAP_BODY_RED = 'scaleX(-1) translate(12px, 0px)';
const SNAP_FRONT_SHOULDER = 'translateX(-3px) rotate(26deg)';
const SNAP_FRONT_ELBOW = 'rotate(20.5deg)';
const SNAP_BACK_SHOULDER = 'translate(13px, -6px) rotate(27.6deg)';
const SNAP_BACK_ELBOW = 'rotate(23deg)';
const SNAP_LEG_FRONT = 'translateX(-2px)';
const SNAP_LEG_BACK = 'translate(12px, -6px)';

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

let blueEls: RobotEls;
let redEls: RobotEls;
let paused = false;

function snapAll(els: RobotEls, isBlue: boolean) {
  els.wrap.style.transform = isBlue ? SNAP_BODY_BLUE : SNAP_BODY_RED;
  els.frontShoulder.style.transform = SNAP_FRONT_SHOULDER;
  els.frontElbow.style.transform = SNAP_FRONT_ELBOW;
  els.backShoulder.style.transform = SNAP_BACK_SHOULDER;
  els.backElbow.style.transform = SNAP_BACK_ELBOW;
  els.legFront.style.transform = SNAP_LEG_FRONT;
  els.legBack.style.transform = SNAP_LEG_BACK;
}

function clearPuncherArms(els: RobotEls) {
  const cl = els.parts.classList;
  const isPuncher = cl.contains('punching') || cl.contains('holding') ||
    cl.contains('critHolding') || cl.contains('retracting') ||
    cl.contains('crit-retracting');
  if (isPuncher) {
    els.frontShoulder.style.transform = '';
    els.frontElbow.style.transform = '';
  }
}

function clearInlineStyles(els: RobotEls) {
  els.wrap.style.transform = '';
  els.frontShoulder.style.transform = '';
  els.frontElbow.style.transform = '';
  els.backShoulder.style.transform = '';
  els.backElbow.style.transform = '';
  els.legFront.style.transform = '';
  els.legBack.style.transform = '';
}

export function setPaused(p: boolean) {
  if (p === paused) return;
  paused = p;

  if (p) {
    // 1. Stop CSS animations
    blueEls.wrap.classList.remove('sway-active');
    redEls.wrap.classList.remove('sway-active');

    // 2. Set ALL snap inline styles (including puncher arms)
    //    to establish a stable "from" value for punch transitions
    snapAll(blueEls, true);
    snapAll(redEls, false);

    // 3. Force reflow so browser registers the snap as the current position
    void blueEls.wrap.offsetHeight;

    // 4. Clear puncher's front arm inline styles so CSS punch rules take over.
    //    The transition fires from the snap value to the punch value.
    clearPuncherArms(blueEls);
    clearPuncherArms(redEls);
  } else {
    // Clear inline snap styles and restart CSS animations from 0%.
    // 0% of the keyframe matches the snap position (closest together).
    clearInlineStyles(blueEls);
    clearInlineStyles(redEls);
    blueEls.wrap.classList.add('sway-active');
    redEls.wrap.classList.add('sway-active');
  }
}

export function startSway(blueWrap: HTMLElement, redWrap: HTMLElement) {
  blueEls = cacheEls(blueWrap);
  redEls = cacheEls(redWrap);
  blueWrap.classList.add('sway-active');
  redWrap.classList.add('sway-active');
}
