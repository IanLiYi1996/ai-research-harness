# FY26 Summit Builder Lab (AgentCore) — 提名内容

> 填入 Quip 提名表的一行。各列对应 Demo Owner 行动项（B/C/D/F/G…）。
> 架构图见 `docs/architecture.svg`（PNG: `docs/architecture.png`，AgentCore 高亮）。
>
> **定位**：企业算法团队的「技术选型与验证副驾」——一个真实、跨行业、高度涉及算法的
> 企业业务场景；弱化具体行业，突出通用算法工程能力。

---

## A · Demo 名称（≤10 字）
**算法选型副驾**
（备选：算法验证副驾 / 算法落地副驾）

> 注：提名表第 14 行已有「自主科研Agent」(Synapse, weiyihao)，主打 **Gateway + Runtime + MCP/GPU 编排**的科研项目编排。
> 本 Demo 走 **不同的 AgentCore 服务组合与业务场景**：面向**企业算法团队的技术选型与方案验证**，
> 高潮是 **Memory 跨会话沉淀评估结论 + Code Interpreter 真跑 benchmark 验证**，不重复。

## B · Demo 简介（≤150 字，含 AgentCore/Bedrock 如何实现、用了哪些 service、区别在哪）

> 面向企业算法团队的「技术选型与验证副驾」：当团队要引入一个新算法/模型/技术（如新的量化压缩、检索增强、排序模型改进），副驾自动「读源材料 → 沉淀评估结论 → 跨会话复用 → 在隔离沙箱真跑 benchmark 验证宣称指标」。**AgentCore Memory**（SEMANTIC+SUMMARIZATION）把团队历次评估结论沉淀为长期记忆，新会话直接召回，不重复造轮子；**AgentCore Code Interpreter** 让选型不靠论文/厂商口述指标，而是当场跑出真实数字再决策，根治「宣称很好、落地翻车」；评估 SOP 固化为可复用 **Skills**（含 huggingface/skills）。基于 Strands Agents，一条 `cdk deploy` 起全栈，GitHub+Gitee 可复刻。换 tools/skills 即泛化到任意算法域。

## C · AgentCore Services（最多 3 个，按演示重点排序，不要默认 Runtime 在前）

**AgentCore Memory · AgentCore Code Interpreter · AgentCore Runtime**

- **Memory（高潮 1）**：企业算法知识沉淀——跨会话记住「评估过哪些算法、结论/坑是什么」，SEMANTIC + SUMMARIZATION 抽取，namespace 化按团队/项目召回。
- **Code Interpreter（高潮 2）**：选型验证——隔离沙箱真跑 benchmark/消融，返回真实数值与图表，落地前先验真。
- **Runtime（承载底座）**：Serverless ARM64 microVM，按会话隔离，托管 Strands Agent。
- *（加分，可插拔，不计入 3 个主线）* Observability（评估全链路可审计）、Gateway（接企业内部数据/工具）、Browser、Identity。

## D · 架构图
`docs/architecture.png`（AgentCore 橙色高亮；三主线服务 + Skills 在 Runtime 内；账户安全的 Cognito→API Gateway→relay Lambda 边缘层；可复刻 CLI 旁路）。

## E · Content Link
- 设计文档：`docs/superpowers/specs/2026-06-03-agentcore-research-copilot-demo-design.md`
- （可选）配套分享 slides：仓库 `06-slides/`

## F · GitHub Link
`https://github.com/IanLiYi1996/ai-research-harness`（demo 在 `07-agentcore-demo/`；Gitee 镜像同步）

## G · Live Demo
**YES** — 现场可跑：Web 控制台（登录 → 输入要选型的算法/技术 → 三块仪表盘实时点亮：评估流水线 / Memory 召回历史结论 / Sandbox 真跑 benchmark）+ CLI `demo.sh` 旁路（复刻演示）。

## 其他列
| 列 | 内容 |
|---|---|
| Nominator Login | ianleely |
| Team | IVT |
| Key AWS Product/Service | Amazon Bedrock AgentCore (Memory / Code Interpreter / Runtime / Observability), Strands Agents SDK, Cognito, API Gateway, Lambda, CloudFront, CDK |
| LLM Model | Claude（Nova / DeepSeek 可切换） |
| 特殊设备需求 | 无特殊要求；10Mbps 有线 + 1 Win PC 双屏即可（一屏 Web 控制台、一屏 CLI/日志） |
| 时间安排 | 待定 |

---

## 演示脚本（展台 ~2.5 分钟，双高潮）

场景设定：企业算法团队要评估是否引入某个新技术（例：一种长文本检索增强 / 一种量化压缩方法）。

1. **Evaluate + Digest**：观众给出要选型的技术（arXiv id / 开源 repo / 内部文档）→ 副驾抓取源材料、激活评估 skill、产出结构化「选型评估卡」，并把关键结论写入 Memory。
2. **🎬 高潮 1 · Memory 跨会话沉淀召回**：操作员**新开一个会话**，问「我们团队之前评估过哪些长文本方案？结论是什么？」——副驾从 Memory 召回本会话从未出现过的历史评估结论与踩坑。Memory 面板亮起召回记录 + 相似度。**价值：团队算法知识不流失、不重复评估。**
3. **🎬 高潮 2 · Code Interpreter 真跑验证**：观众说「别看它宣称的指标，帮我真跑验证」——副驾激活相关 skill，写最小 benchmark，在 **Code Interpreter** 沙箱真跑，返回**真实数字 + 图**，与宣称值对比。Sandbox 面板流式打印 stdout。**价值：落地前先验真，避免选型翻车。**
4. **沉淀**：新结论写回 Memory → 下次选型直接复用，团队知识复利。

## 与「真实涉及算法的业务场景 + 弱化行业 + 突出通用性」的呼应
- **真实算法业务**：技术选型 / PoC 验证 / benchmark 复现，是任何有算法团队的企业反复在做、且成本高的工程活动。
- **弱化行业**：算法选型是跨行业的通用工程能力，不绑定具体垂直行业。
- **通用性**：README 结尾给出泛化表——换掉 `tools/` + `skills/` + system prompt，同一套 Runtime+Memory+CI+Skills 骨架即可从「评估量化方法」变成「评估推荐排序 / RAG 检索 / 多模态模型」的算法选型副驾，**零基础设施改动**。
