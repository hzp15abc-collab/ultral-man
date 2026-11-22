// This page deliberately exposes only a no-camera practice session. The
// frozen W11 envelope controller is reserved for separately approved tests.
import { createCityGuardian } from './w10/logic/city-guardian.mjs';
import { createPoseGate, TRACK_GAP_MS } from './w11/gate.mjs';
import { createExperienceController, runSemanticPracticeCheck } from './controller.mjs';
import { createVisual } from './visual.mjs';
import { createAudio } from './audio.mjs';

const $ = id => document.getElementById(id);
const now = () => performance.now();
const newController = () => createExperienceController({createCityGuardian, createPoseGate,
  trackGapMs: TRACK_GAP_MS, source:'practice'});
const titles = {light:'先点亮我们的城市',shield:'给城市戴上光环',restore:'让小伙伴笑起来'};
const hints = {light:'先点放松，再点点亮。',shield:'先点放松，再点守护。',restore:'先点放松，再点帮助。'};
const words = {'round-start':'新的一轮开始，先放松一下。','round-retry':'休息好了，再试一次！',
  'light-ready':'太棒了！城市窗户亮起来啦。','shield-ready':'漂亮！保护光环出现啦。',
  'friend-ready':'小伙伴开心地笑了！','round-success':'三颗星星！大家都很开心。',
  'gentle-hint':'没关系，先放松，再尝试当前任务。','break':'时间到了，休息一下也很棒。',
  'paused':'休息一下。准备好再继续。','resumed':'欢迎回来，先点放松。'};
const selectors = ['hero','friend','city','engine'].map($);
const buttons = Array.from(document.querySelectorAll('#poses button'));
const goals = Array.from(document.querySelectorAll('#mission-list li'));
let controller = newController(), state = controller.snapshot();
let visual = null, audio = null, visualLoading = false, visualVersion = 0, closed = false;
let chain = Promise.resolve(), frame = null, uiKey = '', muted = false, audioReady = false, visualTime = 0, lastFrameAt = null;
const chosen = () => Object.fromEntries(selectors.map(el=>[el.id,el.value]));
function showFeedback(text) { $('feedback').textContent=text; }
function safePromise(p) { Promise.resolve(p).catch(()=>{}); }
function setVisualStatus(text, failed = false) {
  const node=$('visual-status');node.textContent=text;node.hidden=!text;node.classList.toggle('is-error',failed);
}
function disposeVisual(v=visual) {
  if (v === visual) visual=null;
  if (v) try { safePromise(v.dispose()); } catch {}
}
function disposeAudio() {
  const old=audio;audio=null;audioReady=false;
  if(old)try {safePromise(old.dispose());} catch {}
}
function currentVolume() { return muted ? 0 : Number($('volume').value); }
function applyVolume() {
  $('mute').textContent=muted?'开启声音':'静音';
  $('mute').setAttribute('aria-pressed', String(muted));
  if(audio)try{safePromise(audio.setVolume(document.hidden?0:currentVolume()));}catch{}
}
async function prepareAudio() {
  // A real user click is required before unlock; no autoplay.
  try {
    if(!audio) audio=createAudio();
    const a=audio;
    applyVolume(); const unlocked=await a.unlock();
    if(audio!==a || closed || state.stopped){return;}
    audioReady=unlocked===true;
    $('volume').title=audioReady?'':'声音暂不可用；练习不受影响';
    $('audio-state').hidden=audioReady;
  } catch { $('volume').title='声音暂不可用；练习不受影响'; $('audio-state').hidden=false; }
}
function renderUI(force=false) {
  const s=state;
  const key=JSON.stringify([s.phase,s.outcome,s.completedGoals,s.totalStars,s.round,Math.ceil(s.remainingMs/1000),s.armed,s.stopped,visualLoading]);
  if(!force && key===uiKey)return; uiKey=key;
  $('round').textContent=s.round;
  $('progress-count').textContent=s.completedGoals;
  $('total-stars').textContent=s.totalStars;
  $('time').textContent=Math.ceil(s.remainingMs/1000);
  $('timebar').max=s.roundDurationMs; $('timebar').value=s.remainingMs;
  $('stars').setAttribute('aria-label',`本轮星星 ${s.roundStars} 颗`);
  Array.from($('stars').children).forEach((el,i)=>{
    const earned=i<s.roundStars;el.textContent=earned?'★':'☆';el.classList.toggle('earned',earned);
  });
  const live=s.phase==='playing';
  const active=['playing','paused'].includes(s.phase)&&!s.stopped;
  for(let i=0;i<goals.length;i++){
    const el=goals[i],done=i<s.completedGoals,current=active&&i===s.completedGoals;
    el.classList.toggle('done',done);el.classList.toggle('active',current);
    if(current)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');
    el.querySelector('.goal-state').textContent=done?'已完成':current?'进行中':'待开始';
  }
  for(const b of buttons){
    const enabled=live&&!s.stopped;
    b.disabled=!enabled;
    b.classList.toggle('next-action',enabled&&b.dataset.action===(s.armed?s.nextGoal?.action:'neutral'));
  }
  $('start').hidden=!(s.controls.canStart||s.stopped);
  $('start').disabled=visualLoading;
  $('start').textContent=s.stopped?'开始新练习':'开始练习';
  $('pause').hidden=!(live&&!s.stopped);
  $('resume').hidden=!(s.phase==='paused'&&s.pauseReasons.includes('manual')&&!s.stopped);
  $('retry').hidden=!(s.controls.canRetry&&!s.stopped);
  $('next').hidden=!(s.controls.canNext&&!s.stopped);
  $('retry').disabled=visualLoading;$('next').disabled=visualLoading;
  $('restart').hidden=!(s.phase==='complete'&&!s.stopped);
  $('restart').disabled=visualLoading;
  $('stop').hidden=!(active||s.phase==='complete'&&!s.stopped);
  for(const select of selectors) select.disabled=active;
  if(s.stopped){$('goal-title').textContent='练习结束啦';$('goal-hint').textContent='可以换个伙伴，开始新的练习。';}
  else if(s.phase==='ready'){$('goal-title').textContent='准备一起出发';$('goal-hint').textContent='选好英雄和伙伴，再点开始练习。';}
  else if(s.phase==='paused'){$('goal-title').textContent='先休息一下';$('goal-hint').textContent='时间会等待你。继续之前记得放松。';}
  else if(s.phase==='complete'){
    $('goal-title').textContent=s.outcome==='success'?'守护完成！':'今天也很棒！';
    $('goal-hint').textContent=s.outcome==='success'?'收集了三颗星星。再玩一轮，或者休息一下。':'不用着急，休息后可以继续未完成的任务。';
  } else {
    $('goal-title').textContent=titles[s.nextGoal.action];
    $('goal-hint').textContent=s.armed?`好了！点「${{light:'点亮',shield:'守护',restore:'帮助'}[s.nextGoal.action]}」。`:hints[s.nextGoal.action];
  }
}
function apply(result) {
  if(!result)return;
  state=result.state;
  const messages=result.effects.map(e=>words[e.kind]).filter(Boolean);
  if(messages.length)showFeedback(messages.at(-1));
  if(audio&&audioReady&&result.effects.length)try{safePromise(audio.play(result.effects));}catch{}
  renderUI();
}
function cancelFrame(){if(frame!==null){cancelAnimationFrame(frame);frame=null;}lastFrameAt=null;}
function ensureFrame(){if(frame===null&&!closed&&!document.hidden&&!state.stopped)frame=requestAnimationFrame(tickFrame);}
function tickFrame(at) {
  frame=null;
  if(closed||document.hidden||state.stopped)return;
  apply(controller.tick(now()));
  if(lastFrameAt!==null&&state.phase!=='paused')visualTime+=Math.max(0,at-lastFrameAt);
  lastFrameAt=at;
  if(visual){
    try{
      visual.draw(visualTime,state);
      if(!visualLoading&&!$('visual-status').classList.contains('is-error'))setVisualStatus('');
    }catch{
      disposeVisual();setVisualStatus('3D 预览暂不可用 · 仍可进行规则练习',true);
    }
  }
  ensureFrame();
}
function preview() {
  // Serialize asynchronous engine creation, use a fresh canvas for each
  // candidate, and discard a superseded load without interleaving contexts.
  const version=++visualVersion;
  const selection=chosen();
  $('world-name').textContent=$('city').selectedOptions[0].textContent;
  visualLoading=true;setVisualStatus('正在准备原创 3D 场景…');renderUI(true);
  chain=chain.catch(()=>{}).then(async()=>{
    if(closed||version!==visualVersion)return;
    disposeVisual();
    const old=$('scene');
    const canvas=old.cloneNode(false);old.replaceWith(canvas);
    try{
      const created=await createVisual(canvas,selection);
      if(closed||version!==visualVersion||state.stopped){disposeVisual(created);return;}
      if(!created||typeof created.draw!=='function'||typeof created.dispose!=='function')throw new Error('invalid visual adapter');
      visual=created;visualTime=0;lastFrameAt=null;
      setVisualStatus('场景已准备，等待首次绘制…');
    }catch{
      if(!closed&&version===visualVersion)setVisualStatus('3D 预览暂不可用 · 仍可进行规则练习',true);
    } finally {
      if(version===visualVersion){visualLoading=false;renderUI(true);ensureFrame();}
    }
  });
}
function startNew() {
  if(state.stopped){
    controller=newController();state=controller.snapshot();uiKey='';closed=false;preview();
    safePromise(prepareAudio());
    const nextController=controller;
    chain.then(()=>{if(!closed&&!document.hidden&&controller===nextController&&state.controls.canStart){apply(controller.command('start',now()));ensureFrame();}});
    return;
  }
  // Only when the player starts do we initialize sound. If 3D preview is
  // still loading the initial start button is disabled by renderUI.
  safePromise(prepareAudio());
  apply(controller.command('start',now()));ensureFrame();
}
function stopSession() {
  apply(controller.stop(now()));
  cancelFrame();visualVersion++;visualLoading=false;
  disposeVisual();disposeAudio();setVisualStatus('已结束 · 3D 资源已请求释放');
  showFeedback('今天也很棒，休息一下吧！');renderUI(true);
}
$('start').addEventListener('click',startNew);
for(const id of ['pause','resume','retry','next','restart']){
  $(id).addEventListener('click',()=>{
    if(id==='resume'||id==='retry'||id==='next'||id==='restart')safePromise(prepareAudio());
    apply(controller.command(id,now()));if(id==='pause')disposeAudio();ensureFrame();
  });
}
$('stop').addEventListener('click',stopSession);
for(const select of selectors)select.addEventListener('change',()=>{if(!state.stopped)preview();});
for(const b of buttons)b.addEventListener('click',()=>{
  const action=b.dataset.action;
  const before=state;
  apply(controller.practicePose(action,now()));
  if(action==='neutral'&&state.phase==='playing')showFeedback('放松好了，开始下一步吧！');
  else if(action!=='neutral'&&!before.armed&&state.phase==='playing')showFeedback('先点「放松」，然后再做任务。');
});
$('volume').addEventListener('input',applyVolume);
$('mute').addEventListener('click',()=>{muted=!muted;applyVolume();});
$('selfcheck').addEventListener('click',()=>{
  const check=runSemanticPracticeCheck(newController);
  $('check-result').textContent=`${check.state.completedGoals}/3 规则目标 · 语义模拟，无真实识别`;
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    if(['playing','paused'].includes(state.phase)&&!state.stopped)apply(controller.command('pause',now()));
    cancelFrame();disposeAudio();
  }else{applyVolume();ensureFrame();} // no automatic gameplay resume
});
window.addEventListener('pagehide',()=>{
  if(!state.stopped)stopSession();
  closed=true;visualVersion++;cancelFrame();disposeVisual();disposeAudio();
});
window.addEventListener('pageshow',()=>{if(closed){closed=false;renderUI(true);}});

renderUI(true);preview();ensureFrame();
