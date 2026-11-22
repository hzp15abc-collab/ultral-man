# 工作流 · W6（REVIEWED · D6 PASS）

U0-03 / 2026-11-22 / L 模式。用户已批准多 Agent 监督体系、3D 与 iPhone 优先、公开开发仓库，U1 选择 B 明亮动画特摄。W1–W5 与原独立审核记录保留：代理运行权限阻塞，T3 资格硬门停止；用户明确授权现仓库内隔离 HTTPS 对照实验。W5 经 D5 放行并完成本地静态构建，独立实物静态审查 PASS；W6 经 D6 放行，仅暂存精确已审核构建到新建 gh-pages 分支并核远端。没有运行、真实相机、G1b/G1c、Pages 启用/上线证据，不能声称实验已部署可用或进入生产。

| 门禁 | 状态 | 放行条件 |
|---|---|---|
| U0 | PASS | 用户明确认可 U0-03 |
| G0/D1 | PASS | 独立监督 d_supervisor 实际只读核对 9 份项目文档 |
| G1a | PASS | 独立初筛研究证据与候选可进入 U1；非原型/实玩/真机验收 |
| W2/D2 | PASS | d_supervisor 独立只读审核六份相关文档；仅放行 U1 |
| U1 | PASS | 2026-11-22 用户明确选择 B 审美方向，玩法沿 U0-03；并非实际试玩通过 |
| W3/D3 | PASS | d_supervisor 独立核准协议、工作单及数值硬门；仅放行 G1b 隔离预检/合规代理实验 |
| G1b | UNVERIFIED / BLOCKED | T1/T2 仅资格预检及静态检查；浏览器启动失败；T3 资格 FAIL/STOP；未获运行或 iPhone 证据 |
| W4/D4 | PASS | d_supervisor 独立只读六份证据/文档；仅允许呈交阻塞及向用户请求独立 HTTPS 实验授权 |
| 实验入口用户授权 | PASS | 2026-11-22 用户明确许可现仓库内隔离 HTTPS 实验，非生产/正式发布 |
| W5/D5 | PASS | d_supervisor 独立只读六份文档；仅放行 T1/T2 构建及本地静态审查 |
| W5 最终静态构建独立复核 | PASS（限静态） | d_supervisor 实际只读产物/源码及逐文件哈希复算，无阻塞；运行与 Pages 未验 |
| W6/D6 | PASS | d_supervisor 实际只读六份文档及清单；仅放行精确新分支暂存与远端验真 |
| gh-pages 暂存/HTTPS 实验入口 | UNVERIFIED | 精确分支树及 blob 核对，Pages 配置/线上资源实证，不自动等于上线 |
| G1c/D | UNVERIFIED | 非实现者复验、择优、更新文档并独立复核 |
| G2 | UNVERIFIED | 逐模块实际产物及独立评审 |
| G3 | UNVERIFIED | 独立视觉/音频/体验实物审核 |
| G4 | UNVERIFIED | 独立 QA 和最终构建；未验真机明确标记 |
| G5 | UNVERIFIED | 授权测试版、用户 iPhone 真机验收 |

## 角色与工作单

总控唯一合并、裁决和发布。独立流程自迭代负责依据每次 Review 修订文档，独立 D 监督负责放行，不互相兼任。研究与候选实验独立于选型审核；实现独立于 QA、审美验收。按真实风险增减角色，不追求固定人数。

W1 放行 G1a：并行研究 G1a-PLAY（可玩 3D/体感 Demo、儿童可读玩法指南），G1a-INPUT（自然手势、姿态推理、坐标与 iOS 支持），G1a-3D（Three.js/Babylon.js 等实际候选、移动端渲染），G1a-ASSET（角色、怪兽、城市、Blender/资源制作、动画和许可），G1a-ART（游戏设计/美术/特效/声音真实对标）。研究者只读已复核文档、在各自隔离路径保存公开可引用资料或返回证据；不生产、不提交远端、不执行不可信外部代码。每条记录来源 URL、作者/版本、访问日期、实看/实玩状态、许可/费用、限制及实验假设；尝试 GitHub、X 和现实游戏/官方渠道，渠道不可用记录。每路优先 2–3 个有证据的候选，不以数量凑数；预算为本轮单批调研，证据或渠道不足如实标记，不绕行权限。必要时合并任务但独立审核不合并。

G1a 五路候选及证据见 `research.md`、`reference-board.md`。网页/源码/商店入口已核，实际体感实玩、试听、兼容与 iPhone 真机仍 UNVERIFIED；不可称为已验证可玩的成品。外部相机仅由成人在了解第三方隐私后自愿体验，禁止儿童影像与私人数据进入测试或仓库。

## W2 候选分流与 U1

- 玩法参考：Kalidoface 3D、Splat、Party Fowl 仅供体验和设计参考，不作为生产依赖；Motion Bird 仅代码研究，非可玩入口。不同许可与第三方资源需独立核查。
- 输入：MoveNet 与 MediaPipe Pose 待选实验；MediaPipe 精确锁版、权重/依赖许可及零遥测/上传/第三方外联为硬门，失败淘汰；BlazePose TFJS 仅备选。
- 3D：Three.js、Babylon.js、PlayCanvas standalone 为待选池；后续由独立评审按风险和可比性确定 2–3 个组合，不凭文档直接选型。
- 资产：Quaternius/KayKit 的 CC0 声明须核实际下载包、版本、免费范围和再分发条件；Blender 原创为替代候选。官方 IP 仅合法来源链接参考，不公开再分发官方素材或标识。
- U1 审美提供 A 明亮玩具模型城市、B 明亮动画特摄或经用户明确描述的混合方向；同时明确认可玩法与动作反馈。守护城市、非接触、儿童舒适、无频闪/惊吓为共同硬约束。用户选择写入决策并经独立 D 再核定实验协议，才能启动 G1b，生产开发仍不得前置。

G1b 待冻结协议见 `tests.md`。同场景、同输入、同随机种子、同合规同源资产；模型/引擎分组对照；真实 iPhone 测试误触/漏识、重复事件与去重、丢失暂停/恢复、帧时/反馈延迟 p50/p95、持续多局、内存/冷启动、权限拒绝/旋转/后台/退出停流、零遥测/上传/第三方外联以及舒适阈值。须在实验前冻结数值门槛和失败条件；硬门不以平均分覆盖。无实机则候选待测，不用代理结果冒充。

## W3 · G1b 独立实验工作单（D3 已放行）

共同只读基线为 W3 经 D3 审核后的 `AGENTS.md`、`docs/design.md`、`docs/reference-board.md`、`docs/tests.md` 和 G1a 来源清单；运行前冻结确切版本、锁文件、权重和共同 GLB 的来源/许可/哈希。如无法合法取得版本、权重，或隐私资格不可证明，记录 UNVERIFIED/硬门 FAIL 并停止该组，不通过外链或不明资源补齐。实验者不得改生产、改其他候选、提交远端、变更 Pages 或权限。

| 工作单 | 候选（待锁精确版本） | 唯一可写目录 | 对照关系 |
|---|---|---|---|
| G1b-T1 | Three.js + TFJS MoveNet | `experiments/g1b/t1/` | 基线 |
| G1b-T2 | Babylon.js + 同一 TFJS MoveNet | `experiments/g1b/t2/` | T1 对比引擎 |
| G1b-T3 | 同一 Three.js + MediaPipe Pose | `experiments/g1b/t3/` | T1 对比模型；精确版本/权重许可及零遥测硬门 |

PlayCanvas standalone 与 BlazePose TFJS 保留备选，不默认加试，不凑数。各组共用已冻结的原创/核权 CC0 GLB、场景、视口、相机/样本、灯光/粒子负载、随机种子与事件规则；同样记录仅渲染、仅实际模型推理、二者并行。用实际模型处理合成或获授权成人输入；注入坐标/触屏仅可标记逻辑测试，不冒充相机或推理。版本选择依据实际可获得、许可可核的包；三组的依赖版本、同源资产清单和配置必须在运行前按协议记录，不把研究中的版本当安装完成。

每组交付离线可复验操作步骤、版本/许可/hash、运行环境、源和配置、原始匿名数值、网络证据、界面/动画证据、失败和停止条件；不得写儿童影像或其他私人资料。单组当前批最多两次有依据修复；硬门失败停止该组，任何新候选或协议实质变化回 D。

允许先在合规本地/桌面/代理浏览器运行，清楚标识环境。iPhone 为硬门，真实用户设备验证须有用户可访问的 HTTPS 实验入口；该位置/发布范围目前未授权，不能擅自修改 Pages、其他仓库或扩大公开范围。若无合法入口/真机，则保留待验候选，不报 G1b/G1c 通过；总控向用户请求最小必要授权。G1c 仅由非实验实施者复跑并对通过所有适用硬门者择优，证据不足标 UNVERIFIED；随后文档自迭代→D 放行才进入生产。

## W4 · G1b 阻塞证据及唯一下一步（待 D4）

2026-11-22 实际预检：T1 Three.js 0.187.0、T2 Babylon.js core/loaders 9.37.1，均使用 TFJS 4.22.0 与 pose-detection 2.1.3、官方 MoveNet SinglePose Lightning v4；精确依赖与共同原创建模资产、合成输入、源码语法和 SHA256 检查完成。它们尚不具备真实浏览器/推理/隐私/性能/iPhone 通过证据，也不是最终许可或再分发结论。T3 MediaPipe Tasks Vision 1.2.3 SDK 静态发现自动 Google POST 遥测路径，WASM/NOTICE 署名未解决，违反资格硬门，FAIL/STOP，未执行 SDK，不把静态线索冒充运行期网络记录。

证据见本地 `experiments/g1b/common/PROXY-STATUS.md`、`frozen-config.json`、T1/T2 各自锁文件及适配器/入口、共同 harness/runner。T1 的 Chromium 在页面或候选代码启动之前遇到 socket() Operation not permitted (1)，随后 SIGABRT；属于环境权限 BLOCKED，不是引擎、模型或游戏运行失败。T2 因同一环境权限不重复启动；没有 `proxy-results`、真实渲染、推理、网络、性能或真机测试数据。独立 d_supervisor 实际只读七份代码/配置与相关文档，独立复算 hash、核查无结果目录；没有独立运行复验。完整公开安全 hash 摘要见 `tests.md`，原始检查点留在隔离目录，不含个人资料。

当前唯一允许的后续：W4 流程自迭代提案 → 独立 D4 审核 → 总控向用户明确请求仅在当前公开仓库下的隔离 HTTPS 实验入口（非正式游戏、非稳定版；Pages 配置和具体路径待核）。在独立 D4 和用户明确授权前，禁止任何实验提交、Pages/权限更改、外部替代执行环境或部署，保留原检查点。授权以后也不是直接发布：现有两页仅合成输入烟测，缺少真实 iPhone 自愿相机、停流和 W3 完整计量。须新工作单及独立审批，补齐真实摄像头路径、本地隐私/完整指标、精确许可/署名/NOTICE、资源白名单、最小可发布清单与哈希、部署隔离/回滚；实施后另经独立审查才可发布实验候选。任何实质改协议回 D，W3 数值硬门不降低；真实 iPhone 与 G1b/G1c 未完成时不得进入生产。

## W5 · HTTPS 实验候选工作单（D5 已独立放行）

用户已授权的实验入口只供 G1b 验证，禁止生产 G2、正式游戏、其他仓库、扩展公开范围。先按 W3 冻结协议构建 T1/T2 同源静态对照，T3 继续 FAIL/STOP。版本基线须为此前精确锁定且能核实际再分发许可的依赖/权重/共同原创 GLB；若必要引入 esbuild，先核精确版本、MIT 许可与实际安装来源/锁/hash，不将构建工具、node_modules、源码研究资料、测试夹具或私人数据放入发行目录。

| 工作单 | 写入范围 | 产出 |
|---|---|---|
| W5-T1 | `experiments/g1b/t1/` | Three.js 对照适配器与局部构建 |
| W5-T2 | `experiments/g1b/t2/` | Babylon.js 对照适配器与局部构建 |
| W5-COMMON | `experiments/g1b/common/` | 共同移动端测试交互、相机生命周期、本地匿名计量与统一配置 |
| W5-PACK | `experiments/g1b/release/` | 最小同源静态构建、文件/资产及许可来源署名 NOTICE、白名单/hash/回滚清单 |

只有总控整合共享内容，不允许候选覆盖彼此成果；实施者不得自审、提交/发布。成人主动点击才申请视频相机权限，禁止麦克风；所有视频仅设备本地推理、不录制/存储/上传，退出/后台/切换候选停止流和推理，恢复需明确重新确认/标定。真实摄像头与合成烟测须醒目区分，匿名测试数值只本地展示、按需由成人手动分享匿名数值，不自动外传。T1/T2 采用同一 MoveNet v4/TFJS/WebGL 后端、同已核共同资产/场景、960×540、32 粒子、相同试验条件；完整 W3 正反例、丢失/恢复、延迟帧时、3局、首载、内存、异常、网络隐私、舒适阈值均保留，采样/日志须可复核。未满足实测数据一律 UNVERIFIED；短合成烟测、坐标注入、静态检查不冒充真实成人或 iPhone。

W5-D5 仅先放行构建及本地静态审查。完成后保存确切构建/hash、最小文件差分、依赖/资产/NOTICE/白名单及隐私证据、回滚点和已知限制，由独立非实施者第二次实际构建/隐私/许可/目录审查；只在其通过且 Pages 实际配置与发布权限明确时总控才可发布隔离实验候选。已核远端公开 main 与 admin push 权限，HTTPS 根 GET 404；工具未提供 Pages settings 能力，拟采用独立 `gh-pages` 发行分支/单独 `g1b/` 路径，发布范围仅测试静态构建。先核准确 Pages 配置，缺开启权限时请求用户做最小开启动作，禁止借其他环境/仓库绕过或改 main 其他内容。上线必须真实核对匿名访问及具体 HTTPS 路径后报告，404/无验证绝不算上线。此入口不是正式游戏；G1b/G1c 均仍 UNVERIFIED。

## W6 · 精确发行树暂存方案（D6 已复核）

独立 d_supervisor 实际只读 W5 最终静态构建、完整 app/index/NOTICE、metafiles/verifier 源、打包证据，并独立复算全部文件 SHA256、Git blob SHA1 及树哈希；静态审核相机/权限/生命周期、隐私、资源白名单、许可及署名，未发现阻塞。证据路径 `experiments/g1b/release/PACKAGE-EVIDENCE.md`、`release-manifest.json`、`dist/g1b/`。仅锁定此精确构建：29 个普通文件，10,663,193 bytes，buildId `w5-g1b-9e3f86e3598c25a3`，树 SHA256 `9e3f86e3598c25a3eb9cbab0cf0d922d31547e3588c8e5daedd4f3c3ff536c36`。静态 PASS 不等于运行期隐私/相机/性能、线上或真机 PASS。

本轮用户明确授权仅现有公开仓库 `hzp15abc-collab/ultral-man` 的独立 HTTPS 实验。暂存条件：经独立 D6 审核 W6 后，总控先重新只读核 main 实际 HEAD 及 gh-pages 不存在（最近观察：main `afec3db49dfc8891b3e35fa1f961be10cb148217`，gh-pages 查询 404）；如实际分支已存在、权限/目标或基线无法核实则停止，不覆盖、不强推。用 29 个已审核文件的精确 blob 原子构建从空树起的仅 `g1b/` 路径发行树，以当前 main HEAD 为父提交建立新提交，再以该提交创建 **新** gh-pages 分支；main 不变（除项目文档正常提交），不得携带其他文件、私料、T3、构建工具或开发资料。暂存后核远端真实 branch/tree/blob 数量、精确路径、大小/hash 及无额外内容；不把本地清单或 API 成功回执当作线上部署成功。

Pages 根 URL 仍为观察 404，配置未知，工具没有 settings 能力。不得代理更改 Pages 设置或权限，仅在暂存验证通过且确实需要时，请用户最小开启 Pages 来源 `gh-pages` / `/(root)`。实际启用后匿名核 `g1b/` HTTPS、必要资源返回与 build ID/版本，记录实际 URL 和证据后才能称为可访问实验。若分支/配置出现冲突或 404 持续，记录阻塞；不另起仓库或绕过权限。回滚保留新分支创建前为空的证据、main 实际 HEAD、发行 commit/tree/blob；若需撤回，另获明确授权才移除本次新建分支或由用户禁用对应 Pages 来源，或在有先前已审核产物时用同路径后继提交恢复其精确内容，不自动删除、不变 main、不强推。

D6 只拟放行上列精确暂存路径及复核，不授权 Pages 设置、真实相机、生产或正式发布。用户实际成人 iPhone 测试须在匿名 HTTPS 实物验证后自愿进行，达到 W3 冻结门槛并独立复核才可判断 G1b/G1c；本节点不新增或降低任何 W3 阈值。

## 迭代制度

每个里程碑绑定当前已审核 W revision、范围、只读基线、隔离写路径、交付证据、硬门槛、资源/失败上限。比较 2–3 个合理候选；G1b 实验前冻结相同输入/环境/场景/指标及停止条件。独立 G1c 只从全部硬门通过者择优。每项关键 Review 先归因→流程 Agent 提出递增 W revision→D 复核才派发下一任务；不先改代码后补文档。保留事实、失败和回退记录。每个失败点默认最多两次有证据的修复尝试，无新证据即停止或返回研究。

G2 里程碑：最小 3D/体感可玩切片 → 角色/场景资产 → 游戏循环/引导 → 特效与声音 → 集成；每个节点适用的游戏设计、独立视觉、3D、输入、移动性能、儿童体验及 QA 角色实际验收。独立审核比较同一个构建与冻结参考，必须提供观察/复跑证据；未执行不签 PASS。iPhone 实机验证由用户完成，不用桌面代理冒充。

## W1 独立 D 记录

2026-11-22，独立审核者 d_supervisor，PASS（仅 G1a）。实际只读全部 9 份文档：AGENTS.md 与 docs/architecture.md、decisions.md、deployment.md、design.md、reference-board.md、research.md、tests.md、workflow.md；核对 U0-03、公开安全边界、3D、iPhone 优先、U1、专业委员会、失败回路和独立 D，未发现阻塞缺口。放行 G1a 并行隔离调研；G1a 完成后独立初审→独立流程自迭代 Agent→D 复核→U1 用户确认。其他门禁一律 UNVERIFIED。当前仓库初始 commit 04ab5cc1f8e06e831eedcc5339d3d9e4fa9ad347。

## G1a 独立初筛与 W2 状态

2026-11-22，独立审核者 d_supervisor，实际只读核对 `research.md`、`AGENTS.md`、W1。结论 PASS（证据足以提出 U1 方向），仅放行流程自迭代 W2 → D2 → U1，未独立实玩、试听或真机复跑；实际原型、许可最终确认、选型、体验、审美与性能均 UNVERIFIED。

## W2 独立 D2 记录

2026-11-22，自迭代 Agent workflow_iterate_w2 根据 G1a Review 更新 workflow、reference-board、decisions、tests，保留 W1 历史，分流证据与候选、明确 U1，以及 G1b 前实验硬门槛冻结。独立审核者 d_supervisor 实际只读全文 W2、reference-board.md、decisions.md、tests.md，及 research.md、AGENTS.md；PASS（仅放行 U1）。范围、许可、隐私、真实 iPhone、审美、同条件实验及历史记录无阻塞缺口。当前 W2 REVIEWED；等待用户 U1 明确确认 A/B/混合及玩法，随后另行 D 冻结 G1b 实验协议。U1、G1b、G1c、G2–G5 仍 UNVERIFIED；禁止提前实验、生产或发布。

## W3 自迭代记录（D3 已复核）

2026-11-22，U1 用户明确选 B 明亮动画特摄，保留 U0-03 玩法与硬约束。流程自迭代 Agent workflow_iterate_w2 根据 U1 更新本文件及 reference-board、tests、decisions、design，提出三组隔离对照、资格预检、统一协议与建议数值阈值、真机阻塞边界。历史 W2 记录不改写。独立审核者 d_supervisor 实际全文只读 workflow.md(W3)、tests.md、reference-board.md、decisions.md、design.md、AGENTS.md、research.md 共七份，D3 PASS，仅放行 G1b 隔离依赖资格预检及符合冻结协议的代理实验。运行前记录并核对真实精确版本、锁文件、模型/GLB/hash/许可、共同配置；无法核资格或硬门失败必须停该组。冻结 tests.md 数值阈值，真实 iPhone、G1b/G1c 成绩、生产和发布仍 UNVERIFIED；禁止擅自提交实验代码、改 Pages 或权限。

## W4 自迭代记录（D4 已复核）

2026-11-22，流程自迭代 Agent workflow_iterate_w2 根据 G1b 环境阻塞和独立只读复核，提出本文件、decisions、tests、deployment 的 W4 记录，保留 W1–W3 及原阈值。d_supervisor 独立全文只读 workflow、decisions、tests、deployment、experiments/g1b/common/PROXY-STATUS.md、frozen-config.json 共六份，D4 PASS，仅放行阻塞报告和向用户请求当前公开仓库下的隔离 HTTPS 实验入口授权，不授权实现、改权限、提交实验、部署、复跑或生产。用户授权后仍需新工作单及独立审批真实相机/停流、完整 W3 测量、许可/白名单、最小清单/hash/回滚等；G1b/G1c、真机及所有后续门禁仍 UNVERIFIED。

## W5 自迭代记录（D5 已复核）

2026-11-22 用户明确授权现有公开仓库下独立 HTTPS 实验入口并委托技术决策，非正式发布。流程自迭代 Agent workflow_iterate_w2 更新 workflow、decisions、tests、deployment，保留 W1–W4 和所有 W3 阈值。d_supervisor 实际全文只读 workflow、decisions、tests、deployment、AGENTS、PROXY-STATUS 共六份，D5 PASS，仅放行 T1/T2 同源静态实验候选构建及本地静态审查。实际部署仍须第二次独立实际构建/隐私/许可/清单/回滚审核及确切 Pages 配置/权限确认；不得启动真实相机、提交实验或部署、正式开发。页面 404 是总控环境证据，不等同已证明 Pages 未启用。链接实际验真后方可称上线。

## W6 自迭代记录（D6 已复核）

2026-11-22，流程自迭代 Agent workflow_iterate_w2 根据 W5 实际构建及 d_supervisor 独立静态复核结论更新 workflow、decisions、tests、deployment，保留 W1–W5 和全部 W3 门槛。d_supervisor 实际只读 workflow、decisions、tests、deployment、release-manifest、PACKAGE-EVIDENCE 六份，D6 PASS，仅放行重新核对实际 main/仓库权限与 gh-pages 确实不存在后，原子暂存该 29 个精确文件于同仓库新 gh-pages/g1b 及远端树/blob 验真。禁止改 main（文档除外）、强推覆盖、改 Pages 或权限；不代表 HTTPS 上线、真实运行、G1b/G1c 或生产通过。当前没有远端实验提交或运行时结果，待执行。
