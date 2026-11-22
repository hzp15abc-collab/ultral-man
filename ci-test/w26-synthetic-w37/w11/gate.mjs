// W11 local diagnostic: W9 confidence, two-frame stability, neutral rearm.
// No camera device, model-specific rules downstream, browser or networking.
import { gestureToAction } from '../w10/logic/city-guardian.mjs';

export const TRACK_GAP_MS = 500;
export const POINT_SCORE_MIN = 0.3;
export const STABLE_FRAMES = 2;

// Semantic classifier copied from audited W9 app.mjs (same thresholds/order).
// The four-point score gate is retained; the pose score is recorded, not
// substituted for per-point confidence. Envelope finiteness is checked first.
export function classifyPose(pose) {
  const points = pose?.keypoints;
  if (!Array.isArray(points)) return { valid: false, gesture: 'neutral' };
  const good = p => p && Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.score) && p.score >= POINT_SCORE_MIN;
  const k = Object.fromEntries(points.map(p => [p?.name, p]));
  const a=k.left_shoulder,b=k.right_shoulder,l=k.left_wrist,r=k.right_wrist;
  if (![a,b,l,r].every(good)) return {valid:false,gesture:'neutral'};
  const span=Math.max(1,Math.abs(a.x-b.x));
  if(Math.abs(l.x-r.x)<.35*span && l.y<Math.max(a.y,b.y)+.65*span && r.y<Math.max(a.y,b.y)+.65*span)
    return {valid:true,gesture:'cross'};
  const left=l.y<a.y-.25*span,right=r.y<b.y-.25*span;
  if(right&&Math.abs(l.y-a.y)<.45*span)return {valid:true,gesture:'horizontal_vertical'};
  if(left&&!right)return {valid:true,gesture:'left_raise'};
  if(right&&!left)return {valid:true,gesture:'right_raise'};
  return {valid:true,gesture:'neutral'};
}

// W11 envelope preserves raw real inference data and source time/size.
export function envelopeFromModel(poses, timestampMs, sourceWidth, sourceHeight) {
  const p = Array.isArray(poses) ? poses[0] : null;
  return {
    tracked: !!p && Number.isFinite(p.score) && classifyPose(p).valid,
    timestampMs, sourceWidth, sourceHeight,
    poseScore: Number.isFinite(p?.score) ? p.score : null,
    keypoints: Array.isArray(p?.keypoints) ? p.keypoints : [],
  };
}

// Gate produces events only for the W10 input-independent state engine.
// Loss clears both gate and game rearm. Stable neutral is mandatory.
export function createPoseGate(game) {
  let lastAt = null, lastSampleAt = null, lastGoodAt = null, stable = null, count = 0, armed = false, tracking = false;
  const gateState = () => ({ tracking, stable, count, armed, lastGoodAt });
  function advance(at) {
    if (!Number.isFinite(at) || at < 0 || (lastAt !== null && at < lastAt)) throw new RangeError('invalid diagnostic clock');
    lastAt=at;
  }
  function emit(events, event) {
    const result=game.dispatch(event);
    events.push({ event, effects: result.effects });
  }
  function lose(events, at) {
    stable=null;count=0;armed=false;lastGoodAt=null;
    if(tracking){tracking=false;emit(events,{type:'tracking',at,tracked:false});}
  }
  function expire(events, at) {
    if(lastGoodAt!==null && at-lastGoodAt>=TRACK_GAP_MS) lose(events,lastGoodAt+TRACK_GAP_MS);
  }
  function tick(at) {
    advance(at);const events=[];
    expire(events,at);emit(events,{type:'tick',at});
    return {events,gate:gateState(),state:game.snapshot()};
  }
  function sample(s) {
    if (!s || !Number.isFinite(s.timestampMs) || !Number.isInteger(s.sourceWidth) || !Number.isInteger(s.sourceHeight) || s.sourceWidth<=0 || s.sourceHeight<=0 || typeof s.tracked!=='boolean') throw new TypeError('invalid sample envelope');
    const at=s.timestampMs;
    if(lastSampleAt!==null&&at<=lastSampleAt)throw new RangeError('duplicate or backwards sample time');
    advance(at);lastSampleAt=at;
    const events=[];expire(events,at);
    const p=classifyPose(s);
    const valid=s.tracked&&Number.isFinite(s.poseScore)&&p.valid;
    if(!valid){lose(events,at);emit(events,{type:'tick',at});return {classification:{valid:false,gesture:'neutral'},events,gate:gateState(),state:game.snapshot()};}
    lastGoodAt=at;
    if(!tracking){tracking=true;emit(events,{type:'tracking',at,tracked:true});}
    if(stable===p.gesture)count=Math.min(STABLE_FRAMES,count+1);else{stable=p.gesture;count=1;}
    if(count>=STABLE_FRAMES){
      if(stable==='neutral'&&!armed){armed=true;emit(events,{type:'pose',at,action:'neutral'});}
      else if(stable!=='neutral'&&armed){armed=false;emit(events,{type:'pose',at,action:gestureToAction[stable]});}
    }
    emit(events,{type:'tick',at});
    return {classification:p,events,gate:gateState(),state:game.snapshot()};
  }
  return {sample,tick,snapshot:gateState};
}
