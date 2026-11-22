# 决策日志

## ADR-001 · U0-03 · 2026-11-22

- 用户确认：L 模式完整 3D 家庭体感游戏；iPhone 首要验收；独立研究、专业委员会、审美/玩法 U1 冻结、每里程碑审核、流程自迭代与 D 复核。
- 用户另明确批准继续使用公开的 `hzp15abc-collab/ultral-man` 开发仓库。仅公开可公开的文档与合规索引，禁止私人、受限素材及敏感信息入库。
- 初始基线：`main` commit `04ab5cc1f8e06e831eedcc5339d3d9e4fa9ad347`，README 保留；技术/美术选型均未决定。
- W1 G0/D1 已获独立监督 d_supervisor PASS，仅允许 G1a；生产开发、公开游戏部署未获当前门禁放行。研究后须独立初审、文档自迭代及 D，再到 U1 用户确认。

## ADR-002 · G1a 初筛 / W2 REVIEWED · 2026-11-22

- 五路研究详见 `research.md`。独立审核者 d_supervisor 实际只读 `research.md`、`AGENTS.md`、W1，PASS（仅支撑 U1 方向选择）；未独立实玩、试听或真机复跑。W2 提案仍需 D2，仅许可 D2 通过后呈交 U1；未放行 G1b、代码或发布。
- Kalidoface/Splat/Party Fowl 是体验参考、非生产依赖；Motion Bird 仅代码研究；第三方许可不清、专有、无法访问或隐私不符不得直接复用。外部相机仅供成人自愿体验。
- MoveNet、MediaPipe 条件候选；MediaPipe 精确锁版许可及零遥测、零上传、无第三方外联为硬门，失败淘汰；BlazePose TFJS 仅备选。Three.js/Babylon.js/PlayCanvas standalone 候选池，G1b 前确定 2–3 个可比组合。
- Quaternius/KayKit CC0 实际包与免费范围待核，Blender 原创可替代；官方 IP 仅合法链接参考，不公开再分发原素材。A 明亮玩具模型城市、B 明亮动画特摄或明确混合，由用户 U1 认可审美与玩法；儿童舒适、非接触、守护城市及无频闪是共同约束。
- 最终选型、许可、真实运行、iPhone、审美和音频仍 UNVERIFIED。U1 通过后另由 D 冻结同条件实验、硬门及失败阈值，再开 G1b。
- 独立 D2 已通过：workflow_iterate_w2 根据初筛提出四份文档修订；d_supervisor 实际只读 W2、reference-board、decisions、tests、research、AGENTS 共六份，PASS，仅放行 U1；未放行 G1b、生产或发布。

## ADR-003 · U1 / W3 REVIEWED · 2026-11-22

- 用户明确确认 B 明亮动画特摄，玩法沿 U0-03、儿童安全及 iPhone 首要硬门不变；A/混合为未选历史候选。本条不声称用户实际试玩、音频或真机验收。
- 候选实验提案：T1 Three.js + MoveNet；T2 Babylon.js + 同版 MoveNet（同模型比较引擎）；T3 同版 Three.js + MediaPipe（同引擎比较模型，精确权重/许可及零外联硬门）；PlayCanvas、BlazePose 保留备选。版本、资产、种子与配置按实际资格预检锁定，禁止未审变更。
- 同合法原创/CC0 GLB、场景、样本与负载；实际模型测量，分仅渲染/仅推理/并行。建议数值门槛、同源和资格预检见 `tests.md`，需 D3 独立审核冻结，实验结果均 UNVERIFIED。候选隔离工作目录及交付见 `workflow.md`；不得写生产或提交。
- 真机需要用户可打开的 HTTPS 实验入口，具体发布位置未授权，不擅自变更 Pages 或其他仓库。代理浏览器结果不等于 iPhone 通过。无真机或真实资格证据时停在待验；G1c 仅择通过全部硬门的候选。
- 独立 D3 已实际只读 workflow、tests、reference-board、decisions、design、AGENTS、research 七份文档并 PASS，仅放行隔离资格预检及代理实验，冻结阈值和共同配置要求。G1b/G1c 成绩、真机、生产及发布仍未获实测放行。

## ADR-004 · G1b 环境阻塞 / W4 REVIEWED · 2026-11-22

- T1/T2 精确依赖已安装并核锁文件，共享原创建模 GLB、官方 MoveNet Lightning v4 权重/合成 MP4、两组适配器/入口与共同 harness/runner 已建立并做语法及 hash 检查。共同配置及证据：`experiments/g1b/common/frozen-config.json`、`PROXY-STATUS.md`；公开安全摘要在 `tests.md`。此为预检/静态证据，不是实测结果或公开再分发验收。
- T3 MediaPipe Tasks Vision 1.2.3 静态 SDK 存在自动 Google POST 遥测路径，WASM/NOTICE 署名未核，资格硬门 FAIL/STOP，未执行 SDK，无真实网络 trace。
- T1 Chromium 在页面加载之前 socket() Operation not permitted (1) / SIGABRT，归因为环境权限 BLOCKED，并非模型或引擎失败，不绕过权限；T2 未重复同环境启动。没有代理结果目录或真实浏览器/推理/网络/性能/真机证据。d_supervisor 独立实际只读七个代码/配置及相关文档、复算 hash 并核无 proxy-results；不是独立运行复验。G1b/G1c 与 T1/T2 实际成绩 UNVERIFIED，不得选型或发布游戏。
- W4 仅自迭代记录阻塞，待 D4 独立审核。唯一下一步是在 D4 放行后由总控向用户请求明确授权当前公开仓库下隔离 HTTPS 实验入口（非正式发布；具体 Pages 配置/测试路径未核定）。公开仓库选择不等于 Pages 实验发布授权；此前不提交实验、不改配置、不切换环境。
- 即使用户授权，现有页面只是合成烟测，需新工作单及独立审查实现 iPhone 成人自愿相机/停流、完整 W3 指标、合法版本/权重/资源白名单/许可与署名、最小发布清单/hash/回滚和上线隐私复核；无授权与审查不可发布候选。W3 硬门原样保留，G1c 与后续生产仍不可前置。
- 独立 D4 已通过：d_supervisor 实际全文只读 workflow、decisions、tests、deployment、PROXY-STATUS 与 frozen-config 六份；仅放行向用户请求独立 HTTPS 实验入口授权，无实现或部署授权。
