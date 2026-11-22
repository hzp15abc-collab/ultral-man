// W20-B local-only, input-source-explicit experience adapter. Rules and gate
// are the unchanged W10/W11 implementations supplied by the integration root.
const PRACTICE_POSES = Object.freeze(['neutral', 'light', 'shield', 'restore']);
const COMMANDS = new Set(['start', 'pause', 'resume', 'retry', 'next', 'restart']);

/**
 * All times use one monotonically increasing observation clock. Model samples
 * enter from a future adapter only, via a single-use token. No model, camera,
 * DOM, browser timers or storage are created here.
 */
export function createExperienceController({createCityGuardian, createPoseGate,
    trackGapMs, source = 'practice', seed = 20261122, roundDurationMs = 30000} = {}) {
  if (typeof createCityGuardian !== 'function' || typeof createPoseGate !== 'function' ||
      trackGapMs !== 500) throw new TypeError('frozen W11 rule and 500 ms gate required');
  if (!['practice', 'model'].includes(source)) throw new TypeError('unknown input source');
  const game = createCityGuardian({seed, roundDurationMs});
  let gate = createPoseGate(game);
  let lastAt = null, lastModelAt = null, stopped = false, revision = 0, pending = null;
  const snapshot = () => ({...game.snapshot(), inputSource: source, stopped});
  const reject = reason => ({accepted:false, reason, state:snapshot(), effects:[]});
  const goodClock = at => Number.isFinite(at) && at >= 0 && (lastAt === null || at >= lastAt);
  const accept = (effects = []) => ({accepted:true, state:snapshot(), effects});
  function dispatch(event, effects) { effects.push(...game.dispatch(event).effects); }
  function advance(at, effects) {
    lastAt = at;
    // Always expire model tracking before dispatching any interleaved rule
    // action. This prevents loss events from being backdated across commands.
    if (source === 'model') {
      for (const row of gate.tick(at).events) effects.push(...row.effects);
    } else dispatch({type:'tick', at}, effects);
  }
  function resetTracking(at, effects) {
    pending = null;
    revision++;
    dispatch({type:'tracking', at, tracked:false}, effects);
    gate = createPoseGate(game);
  }
  function practiceTrack(at, effects) {
    if (source === 'practice') dispatch({type:'tracking', at, tracked:true}, effects);
  }
  function tick(at) {
    if (stopped) return reject('stopped');
    if (!goodClock(at)) return reject('stale-clock');
    const effects = [];
    advance(at, effects);
    return accept(effects);
  }
  function command(type, at) {
    if (stopped) return reject('stopped');
    if (!COMMANDS.has(type)) return reject('unknown-command');
    if (!goodClock(at)) return reject('stale-clock');
    const effects = [];
    advance(at, effects);
    const before = game.snapshot();
    if ((type === 'start' && !before.controls.canStart) ||
        (type === 'next' && !before.controls.canNext) ||
        (type === 'retry' && !before.controls.canRetry) ||
        (type === 'pause' && !['playing','paused'].includes(before.phase)) ||
        (type === 'resume' && !before.pauseReasons.includes('manual'))) {
      return {accepted:false, reason:'inapplicable-command', state:snapshot(), effects};
    }
    dispatch({type, at}, effects);
    if (['start','restart','retry','next','pause','resume'].includes(type)) {
      resetTracking(at, effects);
      if (type !== 'pause') practiceTrack(at, effects);
    }
    return accept(effects);
  }
  function practicePose(action, at) {
    if (stopped) return reject('stopped');
    if (source !== 'practice') return reject('wrong-input-source');
    if (!PRACTICE_POSES.includes(action)) return reject('unknown-practice-pose');
    if (!goodClock(at)) return reject('stale-clock');
    const effects = [];
    advance(at, effects);
    dispatch({type:'pose', action, at}, effects);
    return accept(effects);
  }
  function beginInference(at) {
    if (stopped || source !== 'model' || pending || !goodClock(at)) return null;
    const state = game.snapshot();
    if (!['playing','paused'].includes(state.phase) || state.pauseReasons.includes('manual')) return null;
    const effects = [];
    advance(at, effects);
    if (game.snapshot().phase === 'complete') return null;
    pending = Object.freeze({revision: ++revision, beganAt: at});
    return Object.freeze({token:pending, state:snapshot(), effects});
  }
  function submitEnvelope(token, envelope, observedAt) {
    if (stopped || source !== 'model') return reject('wrong-input-source-or-stopped');
    if (!pending || token !== pending) return reject('unknown-or-used-token');
    pending = null; // consume on every outcome; stale work may not be retried
    const before=game.snapshot();
    if(!['playing','paused'].includes(before.phase)||before.pauseReasons.includes('manual'))return reject('round-inactive');
    if (!goodClock(observedAt) || observedAt < token.beganAt || observedAt - token.beganAt >= trackGapMs ||
        !envelope || envelope.timestampMs !== observedAt || (lastModelAt !== null && observedAt <= lastModelAt)) {
      return reject('stale-or-duplicate-envelope');
    }
    if (!Number.isInteger(envelope.sourceWidth) || envelope.sourceWidth <= 0 ||
        !Number.isInteger(envelope.sourceHeight) || envelope.sourceHeight <= 0 || typeof envelope.tracked !== 'boolean' ||
        !Array.isArray(envelope.keypoints)) return reject('invalid-envelope');
    // Gate receives only the anonymous W11 envelope fields; no pixels, ID or
    // unrelated caller data are retained. Gate samples validate confidence.
    const sample = {timestampMs:observedAt, sourceWidth:envelope.sourceWidth,
      sourceHeight:envelope.sourceHeight, tracked:envelope.tracked,
      poseScore:envelope.poseScore, keypoints:envelope.keypoints};
    lastAt = observedAt;
    lastModelAt = observedAt;
    const result = gate.sample(sample);
    return accept(result.events.flatMap(row => row.effects));
  }
  function cancelInference(token) {
    if (!pending || token !== pending) return false;
    pending = null; revision++; return true;
  }
  function stop(at) {
    if (stopped) return reject('stopped');
    if (!goodClock(at)) return reject('stale-clock');
    const effects = [];
    advance(at, effects);
    dispatch({type:'pause', at}, effects);
    resetTracking(at, effects);
    stopped = true;
    return accept(effects);
  }
  return Object.freeze({snapshot, tick, command, practicePose, beginInference, submitEnvelope, cancelInference, stop});
}

// Clearly labelled synthetic semantic self-check only, never an inference.
export function runSemanticPracticeCheck(createController) {
  const c = createController();
  const actions = [];
  actions.push(c.command('start',0));
  for (const [i, action] of ['light','shield','restore'].entries()) {
    actions.push(c.practicePose('neutral',i*200+100));
    actions.push(c.practicePose(action,i*200+200));
  }
  return {source:'semantic-self-check-no-model', state:c.snapshot(), effects:actions.flatMap(r=>r.effects)};
}
