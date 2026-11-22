// W25 isolated candidate: practice by default; optional adult-consented
// local body input. Real camera and model behavior still unverified.
import { createCityGuardian } from './w10/logic/city-guardian.mjs';
import { createPoseGate, TRACK_GAP_MS } from './w11/gate.mjs';
import { createExperienceController, runSemanticPracticeCheck } from './controller.mjs';
import { createVisual } from './visual.mjs';
import { createAudio } from './audio.mjs';
import { createInputLifecycle, browserInputDependencies } from './input-lifecycle.mjs';

const $ = id => document.getElementById(id);
const now = () => performance.now();
let inputSource='practice';
const newController = (source=inputSource) => createExperienceController({createCityGuardian, createPoseGate,
  trackGapMs: TRACK_GAP_MS, source});
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
const inputStatusText={idle:'相机未开启',requesting:'正在请求前置相机权限',loading:'正在准备本地识别',running:'相机已开启 · 本机识别',stopped:'相机已关闭',error:'相机未恢复 · 可重新同意或主动换回触屏'};
const input = createInputLifecycle({
  ...browserInputDependencies({video:$('input-video'),clock:now}),
  onStatus(status,reason){
    $('input-status').textContent=inputStatusText[status] || inputStatusText.error;
    if(reason==='released'&&status==='error')$('input-status').textContent=inputStatusText.error;
    renderUI(true);
  },
  onResult(owner,result){if(owner===controller)apply(result);},
  onInvalidated(owner){
    $('adult-consent').checked=false;
    if(owner===controller&&!state.stopped&&['playing','paused'].includes(state.phase)&&!state.pauseReasons.includes('manual'))
      apply(owner.command('pause',now()));
    renderUI(true);
  }
});
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
  const model=inputSource==='model', media=input.snapshot();
  const allowMedia=!model||($('adult-consent').checked&&!media.busy);
  const key=JSON.stringify([s.phase,s.outcome,s.completedGoals,s.totalStars,s.round,Math.ceil(s.remainingMs/1000),s.armed,s.stopped,visualLoading,model,media.status,media.busy,$('adult-consent').checked]);
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
    const enabled=live&&!s.stopped&&!model;
    b.disabled=!enabled;
    b.classList.toggle('next-action',enabled&&b.dataset.action===(s.armed?s.nextGoal?.action:'neutral'));
  }
  $('start').hidden=!(s.controls.canStart||s.stopped);
  $('start').disabled=visualLoading||!allowMedia;
  $('start').textContent=model?'同意后开始体感':s.stopped?'开始新练习':'开始练习';
  $('pause').hidden=!(live&&!s.stopped);
  $('resume').hidden=!(s.phase==='paused'&&s.pauseReasons.includes('manual')&&!s.stopped);
  $('retry').hidden=!(s.controls.canRetry&&!s.stopped);
  $('next').hidden=!(s.controls.canNext&&!s.stopped);
  $('retry').disabled=visualLoading||!allowMedia;$('next').disabled=visualLoading||!allowMedia;
  $('restart').hidden=!(s.phase==='complete'&&!s.stopped);
  $('restart').disabled=visualLoading||!allowMedia;
  $('resume').disabled=!allowMedia;
  $('consent-controls').hidden=!model;
  $('practice-heading').hidden=model;
  $('poses').hidden=model;
  $('camera-actions').hidden=!model;
  $('input-status').hidden=!model;
  $('mode-pill').textContent=model?(media.active?'相机体感 · '+(media.status==='running'?'本机识别':'准备中'):'相机体感 · 未开启'):'触屏练习 · 无相机';
  $('compact-input-mode').textContent=$('mode-pill').textContent;
  $('rotate-input-hint').textContent=model?'横放设备观看更完整；旋转时相机会关闭，需成年人重新同意。':'横放设备，守护城市会看得更完整。也可以继续竖屏触屏练习。';
  $('input-close').hidden=!model||!media.active;
  $('stop').hidden=!(active||s.phase==='complete'&&!s.stopped);
  for(const select of selectors) select.disabled=active;
  if(s.stopped){$('goal-title').textContent='练习结束啦';$('goal-hint').textContent='可以换个伙伴，开始新的练习。';}
  else if(s.phase==='ready'){$('goal-title').textContent='准备一起出发';$('goal-hint').textContent=model?'请成年人确认相机同意，再开始体感。':'选好英雄和伙伴，再点开始练习。';}
  else if(s.phase==='paused'){$('goal-title').textContent='先休息一下';$('goal-hint').textContent=model?(s.pauseReasons.includes('manual')?'相机已关闭。重新同意并继续前，请先放松。':'识别尚未准备好，请自然站立，保持舒适距离。'):'时间会等待你。继续之前记得放松。';}
  else if(s.phase==='complete'){
    $('goal-title').textContent=s.outcome==='success'?'守护完成！':'今天也很棒！';
    $('goal-hint').textContent=s.outcome==='success'?'收集了三颗星星。再玩一轮，或者休息一下。':'不用着急，休息后可以继续未完成的任务。';
  } else {
    $('goal-title').textContent=titles[s.nextGoal.action];
    $('goal-hint').textContent=model?(s.armed?s.nextGoal.hint:'先自然放松，准备下一步。'):
      s.armed?`好了！点「${{light:'点亮',shield:'守护',restore:'帮助'}[s.nextGoal.action]}」。`:hints[s.nextGoal.action];
  }
}
function apply(result) {
  if(!result)return;
  state=result.state;
  const messages=result.effects.map(e=>words[e.kind]).filter(Boolean);
  if(messages.length)showFeedback(messages.at(-1));
  if(audio&&audioReady&&result.effects.length)try{safePromise(audio.play(result.effects));}catch{}
  renderUI();
  if(inputSource==='model'&&(state.phase==='complete'||state.stopped))input.stop('round-ended');
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
  if(inputSource==='model'){
    if(!$('adult-consent').checked||input.snapshot().busy)return;
    if(state.stopped){controller=newController();state=controller.snapshot();uiKey='';closed=false;preview();}
    startModelCommand('start');return;
  }
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
  $('adult-consent').checked=false;
  input.stop('user-stop');
  apply(controller.stop(now()));
  cancelFrame();visualVersion++;visualLoading=false;
  disposeVisual();disposeAudio();setVisualStatus('已结束 · 3D 资源已请求释放');
  showFeedback('今天也很棒，休息一下吧！');renderUI(true);
}
function startModelCommand(id){
  if(inputSource!=='model'||!$('adult-consent').checked||input.snapshot().busy)return;
  safePromise(prepareAudio());
  const owner=controller;
  const result=owner.command(id,now());
  apply(result);
  if(!result.accepted)return;
  // This call starts getUserMedia synchronously on the user's button action.
  void input.start({consented:true,explicit:true,controller:owner}).then(ok=>{
    if(!ok&&owner===controller&&!input.snapshot().active&&inputSource==='model'){
      $('adult-consent').checked=false;
      if(['playing','paused'].includes(state.phase)&&!state.pauseReasons.includes('manual'))apply(owner.command('pause',now()));
      $('input-status').textContent='相机未开启，请重新同意或选择触屏练习。';
      renderUI(true);
    }
  }).catch(()=>{if(owner===controller){input.stop('startup-error','error');}});
  ensureFrame();
}
$('start').addEventListener('click',startNew);
for(const id of ['pause','resume','retry','next','restart']){
  $(id).addEventListener('click',()=>{
    if(inputSource==='model'){
      if(id==='pause'){apply(controller.command('pause',now()));input.stop('pause');disposeAudio();renderUI(true);}
      else startModelCommand(id);
      return;
    }
    if(id==='resume'||id==='retry'||id==='next'||id==='restart')safePromise(prepareAudio());
    apply(controller.command(id,now()));if(id==='pause')disposeAudio();ensureFrame();
  });
}
$('stop').addEventListener('click',stopSession);
function revokeInput(reason){$('adult-consent').checked=false;input.stop(reason);renderUI(true);}
for(const select of selectors)select.addEventListener('change',()=>{revokeInput('candidate-change');if(!state.stopped)preview();});
$('input-mode').addEventListener('change',()=>{
  const next=$('input-mode').value;
  if(!['practice','model'].includes(next)||next===inputSource)return;
  input.stop('mode-change');
  controller.stop(now());disposeAudio();
  inputSource=next;controller=newController();state=controller.snapshot();uiKey='';closed=false;
  $('adult-consent').checked=false;$('input-status').textContent='相机未开启';
  if(!visual||visualLoading)preview();
  renderUI(true);ensureFrame();
});
$('adult-consent').addEventListener('change',()=>{
  if(!$('adult-consent').checked)input.stop('consent-withdrawn');
  renderUI(true);
});
$('input-close').addEventListener('click',()=>input.stop('user-close'));
const orientationStop=()=>revokeInput('orientation-change');
window.addEventListener('orientationchange',orientationStop);
window.screen?.orientation?.addEventListener?.('change',orientationStop);
for(const b of buttons)b.addEventListener('click',()=>{
  if(inputSource!=='practice')return;
  const action=b.dataset.action;
  const before=state;
  apply(controller.practicePose(action,now()));
  if(action==='neutral'&&state.phase==='playing')showFeedback('放松好了，开始下一步吧！');
  else if(action!=='neutral'&&!before.armed&&state.phase==='playing')showFeedback('先点「放松」，然后再做任务。');
});
$('volume').addEventListener('input',applyVolume);
$('mute').addEventListener('click',()=>{muted=!muted;applyVolume();});
$('selfcheck').addEventListener('click',()=>{
  const check=runSemanticPracticeCheck(()=>newController('practice'));
  $('check-result').textContent=`${check.state.completedGoals}/3 规则目标 · 语义模拟，无真实识别`;
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    revokeInput('background');
    if(['playing','paused'].includes(state.phase)&&!state.stopped)apply(controller.command('pause',now()));
    cancelFrame();disposeAudio();
  }else{applyVolume();ensureFrame();} // no automatic gameplay resume
});
window.addEventListener('pagehide',()=>{
  revokeInput('pagehide');
  if(!state.stopped)stopSession();
  closed=true;visualVersion++;cancelFrame();disposeVisual();disposeAudio();
});
window.addEventListener('pageshow',()=>{if(closed){closed=false;renderUI(true);}});

renderUI(true);preview();ensureFrame();
