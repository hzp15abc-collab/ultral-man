// W25 local candidate. No environment side effects on import or construction.
// Adult consent and a fresh explicit start are required for every session.
import { classifyPose, TRACK_GAP_MS } from './w11/gate.mjs';

export const CAMERA_CONSTRAINTS = Object.freeze({
  video:Object.freeze({facingMode:'user',width:Object.freeze({ideal:480}),
    height:Object.freeze({ideal:270}),frameRate:Object.freeze({ideal:30})}),
  audio:false
});
const POINT_NAMES = ['left_shoulder','right_shoulder','left_wrist','right_wrist'];
const ACTIVE = new Set(['playing','paused']);
function stopTracks(stream) {
  for(const t of stream?.getTracks?.() ?? []) try{t.stop();}catch{}
}
function dispose(detector) {try {return Promise.resolve(detector?.dispose?.()).catch(()=>{});} catch{return Promise.resolve();}}

// Copy only the four necessary anonymous points, never retain entire pose or image.
export function anonymousEnvelope(poses, at, width, height) {
  const p=Array.isArray(poses)?poses[0]:null;
  const keypoints=[];
  for(const name of POINT_NAMES){
    const matches=Array.isArray(p?.keypoints)?p.keypoints.filter(k=>k?.name===name):[];
    if(matches.length!==1)continue;
    const k=matches[0];
    if([k.x,k.y,k.score].every(Number.isFinite))keypoints.push({name,x:k.x,y:k.y,score:k.score});
  }
  const poseScore=Number.isFinite(p?.score)?p.score:null;
  return {timestampMs:at,sourceWidth:width,sourceHeight:height,
    tracked:poseScore!==null&&classifyPose({keypoints}).valid,poseScore,keypoints};
}

export function createInputLifecycle({
  clock, requestStream, bindVideo, unbindVideo, readFrame, loadDetector,
  readGeometry=()=>readFrame(),
  schedule, unschedule, available=()=>true, onStatus=()=>{}, onResult=()=>{}, onInvalidated=()=>{}
}) {
  let current=null, busy=null, epoch=0, status='idle';
  const live=s=>current===s&&!s.ended;
  function publish(value,reason='') {status=value;try{onStatus(value,reason);}catch{}}
  function observe(s,result){
    if(live(s)&&result)onResult(s.controller,result);
  }
  function stop(reason='stop',kind='stopped') {
    const s=current;
    if(!s)return false;
    current=null;s.ended=true;epoch++;
    if(s.scheduled!==null){try{unschedule(s.scheduled);}catch{}s.scheduled=null;}
    if(s.token){try{s.controller.cancelInference(s.token);}catch{}s.token=null;}
    if(s.track&&s.listener)try{s.track.removeEventListener('ended',s.listener);}catch{}
    stopTracks(s.stream);
    if(s.stream)try{unbindVideo(s.stream);}catch{}
    publish(kind,reason);
    try{onInvalidated(s.controller,reason);}catch{}
    // Keep the session lock until pending permission/load/play/inference
    // settles and its resources release. No concurrent old/new detector.
    void releaseIfDone(s);
    return true;
  }
  async function releaseIfDone(s){
    if(!s.ended||s.starting||s.pending||s.releasing)return;
    s.releasing=true;
    const d=s.detector;s.detector=null;await dispose(d);
    if(busy===s){busy=null;try{onStatus(status,'released');}catch{}}
  }
  function queue(s) {
    if(live(s)&&s.scheduled===null)s.scheduled=schedule(()=>{s.scheduled=null;tick(s);});
  }
  function geometry(){
    const g=readGeometry();
    if(!g||!Number.isInteger(g.width)||!Number.isInteger(g.height)||g.width<=0||g.height<=0)return null;
    return {width:g.width,height:g.height,source:g.source};
  }
  function matchesGeometry(s,g){
    return !!g&&s.geometry.width===g.width&&s.geometry.height===g.height&&s.geometry.source===g.source;
  }
  function tick(s){
    if(!live(s))return;
    try{
      if(!available()){stop('unavailable','error');return;}
      const snapshot=s.controller.snapshot();
      if(!ACTIVE.has(snapshot.phase)||snapshot.stopped||snapshot.pauseReasons.includes('manual')){stop('round-inactive');return;}
      const time=clock();
      // Geometry validity is independent of decoded-frame availability.
      // In particular, pending work must not bypass this boundary.
      if(!matchesGeometry(s,geometry())){stop('frame-changed','error');return;}
      if(s.pending){
        if(time-s.began>=TRACK_GAP_MS){stop('slow-inference','error');return;}
        queue(s);return;
      }
      const f=readFrame();
      if(f===null){queue(s);return;} // no new delivered frame yet
      if(!f||!(f.width>0&&f.height>0)||!Number.isInteger(f.width)||!Number.isInteger(f.height)||!Number.isFinite(f.time)){
        stop('invalid-frame','error');return;
      }
      if(f.width!==s.geometry.width||f.height!==s.geometry.height||f.time<s.lastFrame){stop('frame-changed','error');return;}
      if(f.time===s.lastFrame){queue(s);return;}
      s.lastFrame=f.time;
      const begun=s.controller.beginInference(time);
      if(!begun){queue(s);return;}
      s.token=begun.token;s.began=time;
      observe(s,begun);
      if(!live(s))return;
      s.pending=true;
      // Promise is created synchronously; the pending lock is already held.
      void infer(s,f);
      queue(s);
    }catch{stop('input-error','error');}
  }
  async function infer(s,f){
    const token=s.token;
    try{
      const poses=await s.detector.estimatePoses(f.input);
      if(!live(s)||s.token!==token)return;
      // Resolve may occur before the next scheduler tick. Never submit
      // points from old geometry or a replaced/detached media source.
      if(!available()||!matchesGeometry(s,geometry())){stop('frame-changed','error');return;}
      const at=clock();
      if(at-s.began>=TRACK_GAP_MS){stop('slow-inference','error');return;}
      if(at<=s.lastSubmitted||at<s.began){s.controller.cancelInference(token);s.token=null;return;}
      const envelope=anonymousEnvelope(poses,at,f.width,f.height);
      s.token=null;s.lastSubmitted=at;
      observe(s,s.controller.submitEnvelope(token,envelope,at));
    }catch{if(live(s))stop('inference-error','error');}
    finally{
      // If submit itself threw, cancel the underlying single-use token.
      try{s.controller.cancelInference(token);}catch{}
      s.pending=false;
      if(s.ended)void releaseIfDone(s);
    }
  }
  async function start({consented=false,explicit=false,controller}={}) {
    if(!consented||!explicit||busy||controller?.snapshot().inputSource!=='model'||!available())return false;
    const first=controller.snapshot();
    if(!ACTIVE.has(first.phase)||first.stopped||first.pauseReasons.includes('manual'))return false;
    const s={epoch:++epoch,controller,ended:false,starting:true,pending:false,releasing:false,
      stream:null,track:null,listener:null,detector:null,scheduled:null,token:null,
      lastFrame:-Infinity,lastSubmitted:-Infinity,geometry:null};
    busy=current=s;publish('requesting');
    try{
      const stream=await requestStream(CAMERA_CONSTRAINTS);
      if(!live(s)||!available()){stopTracks(stream);if(live(s))stop('unavailable','error');return false;}
      s.stream=stream;
      const tracks=stream?.getVideoTracks?.()??[], audio=stream?.getAudioTracks?.()??[];
      const all=stream?.getTracks?.()??[];
      if(tracks.length!==1||audio.length!==0||all.length!==1||all[0]!==tracks[0]||tracks[0].readyState==='ended')throw Error('invalid media');
      const facing=tracks[0].getSettings?.()?.facingMode;
      if(facing&&facing!=='user')throw Error('unexpected camera direction');
      s.track=tracks[0];s.listener=()=>{if(live(s))stop('track-ended','error');};
      s.track.addEventListener?.('ended',s.listener,{once:true});
      await bindVideo(stream);
      if(!live(s)||!available()){if(live(s))stop('unavailable','error');return false;}
      publish('loading');
      const d=await loadDetector(()=>live(s)&&available());
      if(!live(s)||!available()){await dispose(d);if(live(s))stop('unavailable','error');return false;}
      s.detector=d;
      if(typeof d?.estimatePoses!=='function')throw Error('invalid detector');
      s.geometry=geometry();
      if(!s.geometry)throw Error('invalid video');
      publish('running');queue(s);return true;
    }catch{if(live(s))stop('startup-error','error');return false;}
    finally{s.starting=false;if(s.ended)void releaseIfDone(s);}
  }
  return Object.freeze({start,stop,snapshot:()=>Object.freeze({status,busy:!!busy,active:!!current,epoch})});
}

// Pure descriptor check: only the production wrapper supplies actual module
// URL and browser values. No module URL override in browserInputDependencies.
export function httpsCameraEligible({moduleProtocol,moduleOrigin,pageProtocol,pageOrigin,visible,secure,mediaCapable}={}) {
  return moduleProtocol==='https:'&&pageProtocol==='https:'&&
    typeof moduleOrigin==='string'&&moduleOrigin!=='null'&&moduleOrigin.startsWith('https://')&&
    moduleOrigin===pageOrigin&&visible===true&&secure===true&&mediaCapable===true;
}

// Independent decoded-frame evidence only. This observer never requests a
// camera or model; it observes delivered frames on an explicitly bound video.
// When RVFC exists, absence of a callback never falls back to playback clocks
// or quality. Fallback quality counts subtract dropped frames and establish
// a per-bound-source baseline before accepting strictly increasing counts.
export function createDecodedFrameObserver(video){
  let source=null, generation=0, callback=null, latest=null, lastCount=null,
    lastTotal=null,lastDropped=null,baseCount=null,failed=false,kind=null;
  const supported=()=>typeof video.requestVideoFrameCallback==='function'?
    typeof video.cancelVideoFrameCallback==='function':
    typeof video.getVideoPlaybackQuality==='function';
  const active=()=>source!==null&&video.srcObject===source;
  const geometry=()=>active()&&video.readyState>=2&&Number.isInteger(video.videoWidth)&&
    Number.isInteger(video.videoHeight)&&video.videoWidth>0&&video.videoHeight>0?
    {width:video.videoWidth,height:video.videoHeight,source}:null;
  function quality(){
    const q=video.getVideoPlaybackQuality();
    const total=q?.totalVideoFrames,dropped=q?.droppedVideoFrames;
    if(!Number.isSafeInteger(total)||!Number.isSafeInteger(dropped)||total<0||dropped<0||dropped>total)
      throw Error('unreliable decoded frame quality');
    const count=total-dropped;
    if(lastTotal!==null&&(total<lastTotal||dropped<lastDropped||count<lastCount))
      throw Error('nonmonotonic decoded frame quality');
    lastTotal=total;lastDropped=dropped;lastCount=count;
    return count;
  }
  function stop(){
    generation++;
    if(callback!==null){try{video.cancelVideoFrameCallback(callback.id);}catch{}}
    callback=null;source=null;latest=null;lastCount=null;
    lastTotal=null;lastDropped=null;baseCount=null;failed=false;kind=null;
  }
  function arm(epoch){
    if(epoch!==generation||!active()||failed)return;
    const token={id:null};callback=token;
    try{
      token.id=video.requestVideoFrameCallback((_,metadata)=>{
        // Old/double-delivered callbacks cannot schedule successors.
        if(epoch!==generation||callback!==token||!active())return;
        callback=null;
        const count=metadata?.presentedFrames;
        if(!Number.isSafeInteger(count)||count<=0||(lastCount!==null&&count<lastCount)){
          failed=true;return;
        }
        if(lastCount===null||count>lastCount){
          lastCount=count;
          const g=geometry();
          if(g)latest={input:video,time:count,width:g.width,height:g.height,source:g.source};
        }
        arm(epoch);
      });
    }catch{callback=null;failed=true;}
  }
  function start(bound){
    stop();
    if(!bound||video.srcObject!==bound||!supported())throw Error('decoded frame identity unavailable');
    source=bound;
    if(typeof video.requestVideoFrameCallback==='function'){
      kind='rvfc';arm(generation);
      if(failed)throw Error('decoded callback unavailable');
    }else{
      kind='quality';baseCount=quality();
    }
  }
  function readFrame(){
    if(!active())return null;
    if(failed)throw Error('unreliable decoded frame identity');
    const g=geometry();
    if(!g)return null;
    if(kind==='rvfc'){
      if(!latest)return null;
      if(latest.width!==g.width||latest.height!==g.height||latest.source!==g.source)
        throw Error('decoded frame geometry changed');
      return latest;
    }
    const count=quality();
    if(count<=baseCount)return null;
    return {input:video,time:count,width:g.width,height:g.height,source:g.source};
  }
  return Object.freeze({supported,start,stop,readFrame,geometry});
}

// Future authorized browser entry only. Do not instantiate detector or request
// media until the lifecycle's explicit adult consent start path reaches it.
export function browserInputDependencies({video,clock,documentRef=document,windowRef=window}) {
  const root=new URL('.',import.meta.url), scripts=new Map();
  const nav=windowRef.navigator;
  const frames=createDecodedFrameObserver(video);
  const valid=()=>httpsCameraEligible({moduleProtocol:root.protocol,moduleOrigin:root.origin,
    pageProtocol:windowRef.location.protocol,pageOrigin:windowRef.location.origin,
    visible:documentRef.hidden===false,secure:windowRef.isSecureContext===true,
    mediaCapable:typeof nav.mediaDevices?.getUserMedia==='function'})&&frames.supported();
  const guard=()=>{if(!valid())throw Error('HTTPS camera entry unavailable');};
  function localScript(name){
    guard();
    if(!['tf.min.js','pose-detection.min.js'].includes(name))return Promise.reject(Error('invalid script'));
    if(scripts.has(name))return scripts.get(name);
    const url=new URL(name,root);
    if(url.protocol!=='https:'||url.origin!==root.origin||url.origin!==windowRef.location.origin)return Promise.reject(Error('invalid origin'));
    const work=new Promise((resolve,reject)=>{
      const script=documentRef.createElement('script');
      script.src=url.href;script.async=false;
      script.addEventListener('load',resolve,{once:true});
      script.addEventListener('error',()=>{script.remove();reject(Error('local script failed'));},{once:true});
      documentRef.head.append(script);
    }).catch(err=>{scripts.delete(name);throw err});
    scripts.set(name,work);return work;
  }
  return {
    clock,available:valid,
    requestStream:constraints=>{guard();return nav.mediaDevices.getUserMedia(constraints);},
    bindVideo:async stream=>{guard();video.muted=true;video.playsInline=true;video.srcObject=stream;frames.start(stream);await video.play();guard();},
    unbindVideo:stream=>{frames.stop();if(video.srcObject===stream){video.pause();video.srcObject=null;}},
    readFrame:()=>valid()?frames.readFrame():null,
    readGeometry:()=>valid()?frames.geometry():null,
    schedule:f=>windowRef.requestAnimationFrame(f),unschedule:id=>windowRef.cancelAnimationFrame(id),
    loadDetector:async alive=>{
      const aliveGuard=()=>{guard();if(!alive())throw Error('interrupted');};
      aliveGuard();await localScript('tf.min.js');aliveGuard();
      await localScript('pose-detection.min.js');aliveGuard();
      const tf=windowRef.tf, pd=windowRef.poseDetection;
      if(!tf||!pd||!await tf.setBackend('webgl'))throw Error('backend unavailable');
      aliveGuard();await tf.ready();aliveGuard();if(tf.getBackend()!=='webgl')throw Error('backend unavailable');
      return pd.createDetector(pd.SupportedModels.MoveNet,{modelType:pd.movenet.modelType.SINGLEPOSE_LIGHTNING,
        modelUrl:new URL('model.json',root).href,enableSmoothing:false});
    }
  };
}
