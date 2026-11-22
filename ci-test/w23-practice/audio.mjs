// Audio is never required for a rule transition; failures are quiet.
const EVENTS = ['light-ready','shield-ready','friend-ready','round-success'];
export function createAudio() {
  let ctx=null, gain=null, volume=.45, stopped=false, unlocked=false, queued=Promise.resolve(), generation=0;
  const buffers=new Map(), live=new Set();
  async function unlock() {
    if(stopped)return false;
    try {
      if(!ctx) {
        const AudioCtor=globalThis.AudioContext ?? globalThis.webkitAudioContext;
        if(!AudioCtor)return false;
        ctx=new AudioCtor();gain=ctx.createGain();gain.gain.value=volume;gain.connect(ctx.destination);
      }
      await ctx.resume();unlocked=ctx.state==='running';return unlocked;
    } catch { return false; }
  }
  function setVolume(value) {
    if(!Number.isFinite(Number(value)))return;
    volume=Math.max(0,Math.min(1,Number(value)));
    if(gain)gain.gain.value=volume;
    if(!volume)cancel();
  }
  function cancel(){ generation++;for(const old of live){try{old.stop()}catch{}}live.clear(); }
  function play(effects=[]) {
    if(effects.some(e=>['paused','tracking-paused','round-start','round-retry','break'].includes(e.kind)))cancel();
    if(stopped||!unlocked||!volume)return;
    const kind=effects.map(e=>e.kind).filter(k=>EVENTS.includes(k)).at(-1);
    if(!kind)return;
    const token=++generation;
    queued=queued.then(async()=>{
      if(token!==generation||stopped||!volume||!ctx||ctx.state!=='running')return;
      try {
        if(!buffers.has(kind)){
          const r=await fetch(new URL(`art/audio/${kind}.wav`,import.meta.url));
          if(!r.ok)return;
          const b=await r.arrayBuffer();if(stopped)return;
          buffers.set(kind,await ctx.decodeAudioData(b));
        }
        if(token!==generation||stopped||!volume||ctx.state!=='running')return;
        for(const old of live){try{old.stop()}catch{}}live.clear();
        const source=ctx.createBufferSource();source.buffer=buffers.get(kind);source.connect(gain);
        live.add(source);source.onended=()=>live.delete(source);source.start();
      }catch{}
    });
  }
  function dispose() {
    if(stopped)return;stopped=true;unlocked=false;
    cancel();buffers.clear();
    if(ctx)void ctx.close().catch(()=>{});
  }
  return {unlock,play,setVolume,dispose};
}
