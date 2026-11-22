// W10-L / D10: independent fantasy city restoration rules.
// No DOM, camera, GPU, model, storage, network, or wall-clock dependency.
const GOALS = Object.freeze([
  Object.freeze({ action: 'light', effect: 'light-ready', hint: '轻轻举手，让城市亮起来' }),
  Object.freeze({ action: 'shield', effect: 'shield-ready', hint: '双臂轻轻交叉，让城市出现保护光环' }),
  Object.freeze({ action: 'restore', effect: 'friend-ready', hint: '做出舒适的光线姿势，让小伙伴恢复开心' }),
]);
const COLORS = ['清晨蓝', '晚霞橙', '星光紫'];
const FRIENDS = ['云朵怪兽', '星星怪兽', '花花怪兽', '泡泡怪兽'];
const POSES = new Set(['neutral', 'light', 'shield', 'restore']);
const TYPES = new Set(['start', 'tick', 'tracking', 'pose', 'pause', 'resume', 'retry', 'next', 'restart']);
const DEFAULT_SEED = 20261122;
const DEFAULT_DURATION_MS = 30_000;

// The adapter is deliberately semantic; model confidence, coordinates and
// timing are validated at the input layer, not in this game rule module.
export const gestureToAction = Object.freeze({
  neutral: 'neutral', left_raise: 'light', right_raise: 'light',
  cross: 'shield', horizontal_vertical: 'restore',
});

function roundAppearance(seed, round) {
  let x = (seed ^ Math.imul(round, 0x9e3779b9)) >>> 0;
  function sample(limit) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return Math.floor(x / 4294967296 * limit);
  }
  return { palette: COLORS[sample(COLORS.length)], friend: FRIENDS[sample(FRIENDS.length)] };
}

/** An isolated input-independent deterministic game clock and rule engine. */
export function createCityGuardian({ seed = DEFAULT_SEED, roundDurationMs = DEFAULT_DURATION_MS } = {}) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError('invalid seed');
  if (!Number.isFinite(roundDurationMs) || roundDurationMs <= 0) throw new RangeError('invalid round duration');
  let lastAt = null;
  let round = 1, goalIndex = 0, totalStars = 0, remainingMs = roundDurationMs;
  let phase = 'ready', outcome = null, tracking = false, manualPause = false, armed = false;
  let activePose = 'neutral';

  function running() { return phase === 'round' && tracking && !manualPause; }
  function resetInput() { armed = false; activePose = 'neutral'; }
  function beginRound(preserveProgress = false) {
    if (!preserveProgress) goalIndex = 0;
    remainingMs = roundDurationMs;
    phase = 'round'; outcome = null; manualPause = false;
    tracking = false; resetInput();
  }
  function freeze() {
    phase = 'complete'; outcome = 'break'; remainingMs = 0; resetInput();
  }
  function view() {
    const next = GOALS[goalIndex] ?? null;
    return {
      phase: phase === 'round' ? (running() ? 'playing' : 'paused') : phase,
      round, roundDurationMs, remainingMs,
      pauseReasons: phase === 'round' ? [!tracking && 'tracking', manualPause && 'manual'].filter(Boolean) : [],
      outcome, completedGoals: goalIndex, roundStars: goalIndex, totalStars,
      goals: GOALS.map(({ action, hint }) => ({ action, hint })),
      nextGoal: next ? { action: next.action, hint: next.hint } : null,
      appearance: roundAppearance(seed, round),
      city: { luminous: goalIndex >= 1, shielded: goalIndex >= 2, restored: goalIndex >= 3 },
      friendState: goalIndex >= 3 ? 'happy' : 'needs-kindness',
      tracking, armed, pose: activePose,
      controls: { canStart: phase === 'ready', canRetry: phase === 'complete' && outcome === 'break', canNext: phase === 'complete' && outcome === 'success' },
    };
  }

  function dispatch(event) {
    if (!event || !TYPES.has(event.type)) throw new TypeError('unknown game event');
    const at = event.at;
    if (!Number.isFinite(at) || at < 0 || (lastAt !== null && at < lastAt)) throw new RangeError('non-monotonic event clock');
    if (event.type === 'tracking' && typeof event.tracked !== 'boolean') throw new TypeError('tracking boolean required');
    if (event.type === 'pose' && !POSES.has(event.action)) throw new TypeError('unknown semantic pose');

    const effects = [];
    // Charge only the time during which the last known game state was active.
    // Adapter must dispatch loss/pause as soon as observed; do not extrapolate
    // transient model observations into wall-clock truth.
    if (lastAt !== null && running()) {
      remainingMs = Math.max(0, remainingMs - (at - lastAt));
      if (remainingMs === 0) {
        freeze(); effects.push({ kind: 'break', round, preservedGoals: goalIndex });
      }
    }
    lastAt = at;

    switch (event.type) {
      case 'tick': break;
      case 'start':
        if (phase === 'ready') { beginRound(); effects.push({ kind: 'round-start', round }); }
        break;
      case 'restart':
        round = 1; totalStars = 0; beginRound(); effects.push({ kind: 'round-start', round });
        break;
      case 'retry':
        if (phase === 'complete' && outcome === 'break') {
          beginRound(true); effects.push({ kind: 'round-retry', round, preservedGoals: goalIndex });
        }
        break;
      case 'next':
        if (phase === 'complete' && outcome === 'success') {
          round++; beginRound(); effects.push({ kind: 'round-start', round });
        }
        break;
      case 'tracking':
        if (phase === 'round' && tracking !== event.tracked) {
          tracking = event.tracked; resetInput();
          effects.push({ kind: tracking ? 'tracking-recovered' : 'tracking-paused', round });
        }
        break;
      case 'pause':
        if (phase === 'round' && !manualPause) {
          manualPause = true; resetInput(); effects.push({ kind: 'paused', round });
        }
        break;
      case 'resume':
        if (phase === 'round' && manualPause) {
          manualPause = false; resetInput(); effects.push({ kind: 'resumed', round });
        }
        break;
      case 'pose': {
        if (!running()) break;
        const action = event.action;
        activePose = action;
        if (action === 'neutral') { armed = true; break; }
        // Only a fresh neutral -> action sequence can produce an event. An
        // incorrect pose consumes the arm and prompts a relaxed neutral reset.
        if (!armed) break;
        armed = false;
        const goal = GOALS[goalIndex];
        if (action !== goal.action) {
          effects.push({ kind: 'gentle-hint', expected: goal.action }); break;
        }
        goalIndex++;
        effects.push({ kind: goal.effect, round, action, stars: goalIndex });
        if (goalIndex === GOALS.length) {
          phase = 'complete'; outcome = 'success'; totalStars += GOALS.length;
          resetInput();
          effects.push({ kind: 'round-success', round, totalStars });
        }
        break;
      }
    }
    return { state: view(), effects };
  }

  return Object.freeze({ dispatch, snapshot: view });
}
