# 开放研究 · G1a

W1 D 已放行。2026-11-22 五路真实研究 Agent 并行；以下为原始阶段证据汇总，不是原型、最终选型或 iPhone 实测。G1a 独立初筛及 W2/D2 已通过，仅放行 U1；裁决见 workflow.md 与 ADR-002。

| ID | 方向 | 候选来源/证据 | 状态 |
|---|---|---|---|
| PLAY | 可玩 Demo、游戏机制、儿童教学 | Kalidoface、Party Fowl、Splat、Motion Bird | 来源已核，实玩/真机 UNVERIFIED |
| INPUT | 本地姿态识别/自然手势/丢失恢复 | MediaPipe、MoveNet、BlazePose TFJS | UNVERIFIED |
| 3D | 3D 引擎/移动 Web 性能 | Three.js、Babylon.js、PlayCanvas | UNVERIFIED |
| ASSET | 模型/动画/城市/音效/合法素材 | Quaternius、KayKit、Blender 原创 | UNVERIFIED |
| ART | 画风/光线/粒子/反馈/声音 | Kaiju-City、Pocket Kaiju、Kenney 等 | 来源已核，实际视听体验 UNVERIFIED |

## PLAY · research_play

- [Kalidoface 3D](https://3d.kalidoface.com/) · [yeemachine 源码](https://github.com/yeemachine/kalidoface-3d) · 网页入口可访问，未启相机。借鉴真人→虚拟 3D 角色、模型和动画独立。整站含第三方服务，不满足本项目隐私要求的部分不能借用；项目及第三方资产权限须分别核查。
- [Party Fowl](https://www.nex.inc/partyfowl) · [iOS](https://apps.apple.com/sg/app/party-fowl/id1622065672) · 官网介绍家庭前摄/投屏小游戏，iOS 免费含内购、专有，不复制资产。借鉴直观教学、短回合和趣味反馈。网页为参考，不是 iPhone 网页体感实测。
- [Splat](https://splat.netlify.app/) · [SusmoyNath GitHub](https://github.com/SusmoyNath/Motion-controlled-3D-game) · 实际页面可访问，提示大屏更适合；手部动作/3D 反馈，未启相机。未核到仓库许可，仅参考。
- [Motion Bird](https://github.com/Nirant07/motion-bird) · MIT LICENSE，README 仍有相反旧表述，第三方资产需另查。双臂姿态和低模3D 技术参考；线上页面本轮打不开，移动端未证实。

## INPUT · research_input

- MediaPipe Pose Landmarker，33 点。 [官方](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker) / [Demo](https://google-ai-edge.github.io/mediapipe-samples-web/) / [包版本](https://www.npmjs.com/package/@mediapipe/tasks-vision?activeTab=versions) / [示例](https://github.com/google-ai-edge/mediapipe-samples/blob/main/examples/pose_landmarker/js/README.md)。Apache-2.0 包，精确模型权重许可待核。关键风险：[隐私声明](https://developers.google.com/edge/mediapipe/solutions/privacy) 和 [维护者讨论](https://github.com/google-ai-edge/mediapipe/issues/6306)：本地推理不等于零遥测；只有精确锁版、同源以及实测零出站/零上传才可合格，否则淘汰。
- TensorFlow.js MoveNet，17 点；[实现](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/src/movenet) / [Demo](https://storage.googleapis.com/tfjs-models/demos/pose-detection/index.html?model=movenet) / [包](https://www.npmjs.com/package/@tensorflow-models/pose-detection) / [平台](https://www.tensorflow.org/js/guide/platform_environment)。Apache-2.0 包，模型权重、依赖、WASM/WebGL/真实 iPhone 同时跑 3D 待核。
- 备选 BlazePose TFJS Lite/Full（33 点、相对3D）；[源码](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/src/blazepose_tfjs) / [Demo](https://storage.googleapis.com/tfjs-models/demos/pose-detection/index.html?model=blazepose)。仅在更轻方案无法满足动作覆盖时进入备选；模型及性能未验。

## 3D · research_3d

- Three.js r187，MIT：[release](https://github.com/mrdoob/three.js/releases)、[GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html)、[骨骼/表情 Demo](https://threejs.org/examples/webgl_animation_skinning_morph)、[动画混合 Demo](https://threejs.org/examples/webgl_animation_skinning_blending.html)。WebGL2、骨骼动画、实例化；Demo 资产不可默认随引擎授权。
- Babylon.js 9.37.1，Apache-2.0：[release](https://github.com/BabylonJS/Babylon.js/releases)、[官方特性](https://www.babylonjs.com/featureDemos/)、[动画重定向](https://doc.babylonjs.com/features/featuresDeepDive/animation/animationRetargeting)、[WebGL](https://doc.babylonjs.com/setup/support/webGL2/)。动画、特效、GUI 与优化路线。
- PlayCanvas 2.24.2，MIT：[release](https://github.com/playcanvas/engine/releases)、[示例](https://playcanvas.com/examples/)、[动画混合](https://developer.playcanvas.com/user-manual/animation/blend-trees/)、[浏览器](https://developer.playcanvas.com/user-manual/engine/supported-browsers/)。ECS/动画状态图；免费 standalone 候选，不依赖付费云服务；实际 WebGL2 运行未测。
- 共同资产 [glTF](https://www.khronos.org/gltf/)，[Blender glTF 导出](https://docs.blender.org/manual/en/5.2/addons/scene_gltf2.html)，[WebGL 性能实践](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)。文档的兼容性不代替 iPhone 验收。

## ASSET · research_asset

- A Quaternius：[基础英雄](https://quaternius.com/packs/universalbasecharacters.html)、[可爱怪兽](https://quaternius.com/packs/cutemonsters.html)、[城市](https://quaternius.com/packs/downtowncitymegakit.html)、[通用动画](https://quaternius.com/packs/universalanimationlibrary.html)。作者页面列 CC0、免费子集；实际包格式、授权、质量和精简后体积待核。仅使用适龄非接触动作。
- B KayKit：[Adventurers](https://kaylousberg.itch.io/kaykit-adventurers)、[City Builder Bits](https://kaylousberg.itch.io/city-builder-bits)、[城市组件旧版许可](https://github.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0/blob/main/LICENSE.txt)。免费低模、共享纹理、CC0，混搭风格和实际包版本须核。
- C Blender 原创角色/怪兽/模块城市，GLB 骨骼/材质/动画：[Khronos 导出文档](https://github.com/KhronosGroup/glTF-Blender-IO/blob/main/docs/blender_docs/scene_gltf2.rst)、[glTF Transform](https://gltf-transform.dev/)。艺术一致性和制作投入待实验。
- [迪迦官方参考](https://tsuburaya-prod.com/heroes/ultraman-tiga)、[赛罗官方参考](https://tsuburaya-prod.com/heroes/ultraman-zero) 只作视觉/主题链接，无明确可再分发授权，不下载或提交官方模型、标志、音乐。实际产品素材必须有合法授权/自制原创；[CC0](https://creativecommons.org/publicdomain/zero/1.0/) 不自动清除第三方商标权。资产入库前记录精确来源、授权、版本、hash、修改及再分发条件。

## ART · research_art

- [Kaiju-City](https://vicksonzero.itch.io/kaiju-city)（WebGL、变身、巨大城市角色）；页面已访问，[赛事记录](https://itch.io/jam/game-off-2023/rate/2363657) 核实来源，GitHub 直开失败，许可未确认，仅作参考。
- [Pocket Kaiju](https://playnoodles.itch.io/pocket-kaiju)（3D、手机触控、插图指引）；不采用破坏性玩法。页面可见，[嵌入视频](https://www.youtube.com/embed/VC-j5RPFlyc) 因节流未播放，不宣称已看。
- [Kenney City Kit](https://kenney.nl/assets/city-kit-commercial)、[Quaternius Monster Pack](https://quaternius.com/packs/animatedmonster.html)、[Kenney UI Pack](https://kenney.nl/assets/ui-pack)、[Kenney Sci-fi Sounds](https://kenney.nl/assets/sci-fi-sounds) 为作者页面列 CC0 候选。试听环境不支持，未实听；不得因此签署音效合格。
- [Three.js 粒子示例源](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_points_sprites.html)、[动画混合示例](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_animation_skinning_blending.html) 实际读到源码；只借技术机制，贴图及其他资产独立核许可，未实渲染。
- U1 审美 A 明亮玩具模型城市（色块原创英雄、圆润怪兽、低复杂城市）；B 明亮动画特摄（流线原创英雄、巨人比例、轮廓光、柔和能量环，性能成本待测）。共同：守护城市而非毁城；一时一张动作提示、成功反馈；不频闪/震屏/惊吓，声音分开调节可静音，横屏安全区清晰。仅 U1 方向候选，最终审美须独立实物/音频验收。

## G1b 实验协议建议（独立审核与 U1 后才能冻结）

同条件、同设备（iPhone 真机）、同合规 GLB、固定城市/怪兽/光照/粒子预算和随机种子、同视口/输入样本（授权成人或合成，无儿童影像）、同实际模型版本；比较仅渲染/仅推理/并行的帧时 p50/p95、事件到反馈延迟 p50/p95、冷启/资源、持续多局、误触/漏识别/重复、遮挡/丢失/重标定、旋转/后台/权限拒绝/退出停流。记录合规与无外联证据、可见参考的视觉一致性，实验前由独立评审冻结阈值；不以平均分覆盖硬失败。

研究均已尝试 GitHub、官方站、游戏社区及 X 定向检索；X 未得可核实直接证据或访问失败。所有候选尚未做本项目真实原型、摄像头、iPhone 真机或最终许可/审美验收。独立初审及 W2/D2 仅放行 U1，禁止生产开发。
