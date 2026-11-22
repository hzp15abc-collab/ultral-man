// W20 renderer bridge. Same scene selection, configuration and state for T1/T2.
export const poseForState = state => ({ light:'left_raise', shield:'cross', restore:'horizontal_vertical' })[state?.pose] ?? 'neutral';
export function sceneForChoice(manifest, choice) {
  if (!['T1','T2'].includes(choice.engine)) throw new Error('选择无效');
  const item = manifest.scenes.find(v => v.hero===choice.hero && v.friend===choice.friend && v.city===choice.city);
  if (!item || !/^scenes\/[a-z-]+\.glb$/.test(item.file)) throw new Error('场景未找到');
  return item;
}
export async function createVisual(canvas, choice) {
  const base = new URL('./', import.meta.url);
  const [cfg, manifest] = await Promise.all(['frozen-config.json','art/art-manifest.json'].map(async file => {
    const res = await fetch(new URL(file,base)); if(!res.ok) throw new Error('本地资源未加载'); return res.json();
  }));
  const scene = sceneForChoice(manifest,choice);
  const module = await (choice.engine==='T1'? import('./t1.bundle.js'): import('./t2.bundle.js'));
  const engine = await module.createEngine(canvas, cfg, new URL('art/'+scene.file,base).href);
  let disposed = false;
  return Object.freeze({
    draw(elapsedMs,state) {
      if(disposed)return;
      engine.draw(elapsedMs,poseForState(state),state?.city ?? {});
    },
    dispose() { if(!disposed){disposed=true;engine.dispose();} }
  });
}
