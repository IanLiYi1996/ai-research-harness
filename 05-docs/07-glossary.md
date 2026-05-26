# 07 · Glossary · 术语表

> 这是 deck 第 3 页那 13 个核心术语的<u>详细版</u>——加上来源、用途、和"如果只看一次该看哪一段"的指引。
>
> 听众版（速查）：见 `06-slides/slides.html` 第 3 页（按 `S` 进入演讲者视图）。

---

## 索引（按使用频率排）

| # | 中文 | 英文 | 类别 |
|---|---|---|---|
| 01 | 脚手架 / 套具 | [Harness](#01-harness--脚手架--套具) | 方法论 |
| 02 | Spec 驱动开发 | [SDD · Spec-Driven Development](#02-sdd--spec-driven-development) | 方法论 |
| 03 | 测试驱动开发 | [TDD · Test-Driven Development](#03-tdd--test-driven-development) | 方法论 |
| 04 | 领域驱动设计 | [DDD · Domain-Driven Design](#04-ddd--domain-driven-design) | 方法论 |
| 05 | 生成-评估分离 | [Generator-Evaluator](#05-generator-evaluator--生成-评估分离) | 模式 |
| 06 | 自评偏差 | [Self-Evaluation Bias](#06-self-evaluation-bias--自评偏差) | 问题 |
| 07 | 上下文焦虑 + 会话失忆 | [Context Anxiety + Session Amnesia](#07-context-anxiety--session-amnesia--两个病根) | 问题 |
| 08 | 不变量 | [Invariant](#08-invariant--不变量) | 工程 |
| 09 | 产物注册中心 | [Artifact Registry](#09-artifact-registry--产物注册中心) | 工程 |
| 10 | MCP | [Model Context Protocol](#10-mcp--model-context-protocol) | 协议 |
| 11 | 技能包 | [Skill](#11-skill--技能包) | 工程 |
| 12 | ETCLOVG | [ETCLOVG](#12-etclovg--七层分类法) | 学术 |
| 13 | 约束论 | [Binding-Constraint Thesis](#13-binding-constraint-thesis--约束论) | 学术 |
| 14 | 三阶段演化 | [Prompt → Context → Harness](#14-prompt--context--harness-engineering) | 学术 |
| 15 | 可重复 / 可证伪 / 可审计 / 可累积 / 可比较 | [5 Properties of Science](#15-五个科学性属性) | 评测 |
| 16 | 三层成熟度 | [L1 / L2 / L3 Maturity](#16-三层成熟度--l1--l2--l3) | 自查 |
| 17 | 四件套 | [4-Piece Minimum Viable Harness](#17-四件套--最小可用 harness) | 工程 |
| 18 | 6 阶段 pipeline | [Discover / Digest / Spec / Build / Evaluate / Publish](#18-6-阶段-ai-研究-pipeline) | pipeline |
| 19 | 渐进式披露 | [Progressive Disclosure](#19-progressive-disclosure--渐进式披露) | 模式 |
| 20 | 可恢复执行 | [Resumable Execution](#20-resumable-execution--可恢复执行) | 模式 |

> 1-13 是 deck 第 3 页的同一份 13 个术语；14-20 是这份详细版扩展进来的、deck 后续幕里会用到的概念。

---

## 01 · Harness · 脚手架 / 套具

**定义** · 包裹在 LLM 外面的程序化框架，管理运行环境（sandbox）/ 上下文（context）/ 状态（state / memory）/ 工具（tools）/ 生命周期（lifecycle）。

**核心论点** · 不改模型本身，但决定了"同一个模型能发挥到几成"。

**类比** · 马具之于马——马（模型）的奔跑能力固定，但马具（harness）决定了它能不能拉车、走多远、安不安全。

**这门分享里的位置** · 全场最重要的一个词。

**起源** · Anthropic 2025 年 9 月 [《Effective Harnesses for Long-Running Agents》](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) 把这个词带火。

**深读** · [`05-docs/01-what-is-harness.md`](./01-what-is-harness.md)

---

## 02 · SDD · Spec-Driven Development

**定义** · `spec.yaml` / `spec.md` 是 single source of truth（唯一可信来源）。代码不直接改——改 spec → 重新生成代码。

**关键转变** · 工作流从"改代码 + 同步文档"变成"改 spec → 自动生成代码"。

**对比 prompt 工程** · "Here's the spec." vs "Here's the code, fix it."

**起源** · AWS [AIDLC Workflows](https://github.com/awslabs/aidlc-workflows)，Anthropic Spec-Driven 系列。

**深读** · [`05-docs/05-spec-driven.md`](./05-spec-driven.md)

---

## 03 · TDD · Test-Driven Development

**定义** · 先写测试再写实现。流程是 RED（失败）→ GREEN（通过）→ REFACTOR（重构）。

**为什么对 AI 协作格外重要** · AI 生成代码常见两个失败模式——① 写错但自己评自己说"测试通过"（Self-Evaluation Bias）② 看似合理但违反基本不变量。**先写测试 = 把 "什么叫做对" 用代码固定下来**。

**起源** · Kent Beck 2003 · *Test-Driven Development: By Example*。

**Anthropic 工程实践** · [`superpowers:test-driven-development`](https://github.com/anthropics/skills) skill。

---

## 04 · DDD · Domain-Driven Design

**定义** · 4 个文档（PRODUCT / TECH / IMPROVEMENT / PROJECT）回答 Agent 必须解决的 4 个判断题：要做什么 / 怎么做 / 哪里改 / 工程怎么管。

**核心问题** · "What should we build?"（**不是** "How do we code it?"）。

**起源** · Eric Evans 2003 · *Domain-Driven Design*。AWS AIDLC 把它"AI 化"——4 个文档变成 Agent 可消费的 markdown。

**这门分享里的位置** · 收尾时讲 4 件套（CLAUDE.md / MEMORY.md / templates / tools.sh）就是 DDD 的轻量版。

---

## 05 · Generator-Evaluator · 生成-评估分离

**定义** · 受 GAN 启发——**写代码的 Agent 和 review 的 Agent 必须是不同的实例**。永远不让一个 Agent 评估自己。

**为什么必要** · 因为 [Self-Evaluation Bias](#06-self-evaluation-bias--自评偏差)。

**实现方式** · Claude Code 的 sub-agent / `Agent` 工具 / OpenAI Agents SDK 的 reviewer agent。

**深读** · [`05-docs/02-six-patterns.md`](./02-six-patterns.md)

---

## 06 · Self-Evaluation Bias · 自评偏差

**定义** · "Agents tend to confidently praise mediocre work."（Anthropic 原话）。

**症状** · Agent 写完代码自评 "测试通过 ✅" → 你跑一下发现根本没跑测试，或者跑了但有 silent error。

**这门分享里** · 第三幕 demo（跑实验）的"啊哈时刻"——故意让 Claude 写错的 RoPE，然后让它自评 → 它说 "looks correct"。然后起 reviewer sub-agent 真的揪出问题。

**对应工程模式** · [Generator-Evaluator](#05-generator-evaluator--生成-评估分离)。

---

## 07 · Context Anxiety + Session Amnesia · 两个病根

**Context Anxiety（上下文焦虑）** · 上下文窗口快满时，模型会草草收尾——跳过验证、不再问澄清问题、强行交付。

**Session Amnesia（会话失忆）** · 每次新会话从零开始——昨天讨论过的设计决策今天要重新讲一遍。

**为什么不是 prompt 能解决的** · 这两个都是<u>系统层</u>问题——需要 [Resumable Execution](#20-resumable-execution--可恢复执行) 和持久化 memory（CLAUDE.md / NOTES.md / `--resume`）才能根治。

**起源** · Anthropic [《Harness Design》](https://www.anthropic.com/engineering/harness-design-long-running-apps)。

---

## 08 · Invariant · 不变量

**定义** · 一个算法<u>必须满足</u>的数学 / 物理性质，能写成可执行的 `pytest`。

**例子** · RoPE 必须满足旋转对称性 → `assert_close(rotate(q, m+k), rotate(rotate(q, m), k))`。Attention mask 必须严格下三角 → `assert torch.equal(mask, mask.tril())`。

**为什么重要** · 把"什么叫做对" 用代码固定下来，不依赖 Agent 的"看起来合理"判断。

**对应评测层级** · L2 invariant（L1 unit test / **L2 invariant** / L3 statistical check）。

---

## 09 · Artifact Registry · 产物注册中心

**定义** · 给科研产物（paper / model / dataset / demo）提供"**稳定 ID** + **provenance**（来源链）+ **跨阶段引用**"的系统。

**为什么不绑死 HF Hub** · 这是<u>抽象</u>，不是<u>具体产品</u>：

| Registry | 适用场景 |
|---|---|
| Hugging Face Hub | 主流公开 model / dataset |
| GitHub Releases | 代码 / 小型 artifact |
| Weights & Biases | 实验 metrics + checkpoint |
| ModelScope | 国内合规场景 |
| DVC + S3/OSS | 内部隔离环境 |
| 自建 manifest.yaml | 完全离线 |

**关键属性** · 凡产物必有<u>稳定 ID</u>（论文里能引用 / 师弟能复现）。

---

## 10 · MCP · Model Context Protocol

**定义** · Anthropic 2024 年 11 月提出，**让任何 LLM 客户端能调用任何工具的标准协议**。

**类比** · LLM 世界的 USB-C——以前每个 LLM 接每个工具都要单独写适配，现在统一一个协议。

**这门分享里的实例** · `arxiv-mcp-server` / `huggingface-mcp` / `aws-documentation-mcp`——Claude Code 启动时自动连上。

**生态** · 2025 年 OpenAI / Google / Anthropic 都开始支持 MCP，已成为事实标准。

**对应学术分量** · ETCLOVG 七层里的 **T**（Tool Interface）层。

---

## 11 · Skill · 技能包

**定义** · Claude Code / Cursor / Copilot 的<u>可复用</u> prompt + 工具配置。

**核心设计原则** · "**地图，不是百科**"——按需加载（progressive disclosure），不是把所有工具描述全部塞进上下文。

**这门分享里的实例** · `superpowers:test-driven-development` / `superpowers:brainstorming` / `huggingface-papers`。

**深读** · [Anthropic Engineering: Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/agent-skills)

---

## 12 · ETCLOVG · 七层分类法

**全称** · **E**xecution / **T**ool / **C**ontext / **L**ifecycle / **O**bservability / **V**erification / **G**overnance。

**结构** · 4 层结构主干（E·T·C·L）+ 3 层控制平面（O·V·G）。

**起源** · Junjie Li, Xi Xiao, Yunbei Zhang, Chen Liu et al. 2026 · *Agent Harness Engineering: A Survey* · TMLR under review · [openreview.net/forum?id=eONq7FdiHa](https://openreview.net/forum?id=eONq7FdiHa)

**这门分享里的位置** · 学术背书页——把 Anthropic / OpenAI 的工业实践<u>学术化</u>。

**项目映射数据**（170+ 开源项目）：

| 层 | N | 状态 |
|---|---|---|
| L Lifecycle | 47 | 🔥 最热 |
| V Verification | 21 | 🔥 |
| E Execution | 20 | 🔥 |
| O Observability | 15 | ⚠ |
| G Governance | 14 | ⚠ |
| T Tool | 12 | ⚠ |
| C Context | 9 | ⚠ 最稀缺 |

---

## 13 · Binding-Constraint Thesis · 约束论

**论断** · "For long-horizon tasks evaluated across comparable frontier models, **benchmark variance may be driven as much by the execution harness as by the model itself**."

**通俗版** · 长程任务的 benchmark 表现差异，主要来自 harness，**不是模型**。

**3 个跨独立团队的硬数据**：

| 来源 | 改动 | 结果 |
|---|---|---|
| Bölük 2026 | 仅修改 edit-tool 格式 | 跨 15 个模型 **+10×** 编程 benchmark |
| Trivedy 2026 (LangChain DeepAgents) | 固定模型，仅改 system prompt + middleware | Terminal-Bench 2.0：**52.8% → 66.5% (+13.7pp)** |
| Lee et al. 2026 (Stanford / MIT Meta-Harness) | 自动化 harness 优化 | Terminal-Bench-2：**76.4%**（超过所有手工调优） |

**关键对比** · 每一个数都<u>超过</u>同期"更好模型"在同 benchmark 上 **2-4pp** 的典型涨幅。

**含义** · 工业界 / 学术界投资方向应该重排——与其追下一代模型，不如投 harness。

---

## 14 · Prompt → Context → Harness Engineering

**三阶段演化**：

| 阶段 | 时间 | 优化目标 | 核心问题 |
|---|---|---|---|
| Prompt Engineering | 2022–2024 | 单次输入文本 | "What's the input?" |
| Context Engineering | 2025 | 单步看到的所有信息 | "What should the model see at each step?" |
| Harness Engineering | 2026+ | 整个执行环境 | "What governance / constraints / feedback / execution control must we design?" |

**关键性质** · 后一个阶段<u>包含</u>前一个（harness ⊃ context ⊃ prompt）。

**含义** · prompt 写再好也没用——上限被 harness 卡住。

---

## 15 · 五个科学性属性

> 一个实验是不是"科研"，不看用没用 AI，看 5 个属性：

| 属性 | 怎么落地 |
|---|---|
| **可重复**（Reproducible） | spec.yaml + seed + lock file + sandbox |
| **可证伪**（Falsifiable） | 预先声明假设 → 写好 invariant → 跑了才知道 |
| **可审计**（Auditable） | trace / log / observability |
| **可累积**（Cumulative） | Registry 给稳定 ID + provenance |
| **可比较**（Comparable） | 同一个 benchmark 跨 method 跑 |

**这门分享里的位置** · 第 4 段 pipeline 的收口页——回答"怎么用 AI 但仍是科研"。

---

## 16 · 三层成熟度 · L1 / L2 / L3

| Level | 名字 | 特征 | 典型动作 |
|---|---|---|---|
| **L1** | Typewriter / 打字员 | 把 LLM 当聊天机器人 | "帮我写一段 Python ..." |
| **L2** | Collaborator / 协作者 | 用 skill / memory / spec | `/brainstorm` → spec → `/writing-plans` |
| **L3** | System Designer / 系统设计师 | 设计 harness（CLAUDE.md / sub-agent / pipeline） | 写 reviewer agent / Generator-Evaluator |

**深读** · [`05-docs/03-three-maturity-levels.md`](./03-three-maturity-levels.md)

---

## 17 · 四件套 · 最小可用 Harness

**最低成本能跑通的 4 个文件**：

| 文件 | 作用 |
|---|---|
| `CLAUDE.md` | 项目级指令（commands / conventions / context） |
| `MEMORY.md` | 跨会话身份（user profile / preferences / working style） |
| `templates/` | 论文笔记 / 实验 spec / digest 模板 |
| `tools.sh` | 自定义工具（论文下载 / 索引刷新 / batch eval） |

**这门分享里的位置** · 收尾页——师弟师妹周末就能动手。

**示例** · 见根目录 `CLAUDE.md` 和 `02-memory/MEMORY.md`。

---

## 18 · 6 阶段 AI 研究 Pipeline

**Discover → Digest → Spec → Build → Evaluate → Publish**

| 阶段 | 目标 | AI 加速点 |
|---|---|---|
| **Discover** | 找到 today's papers / 热点 | 从"拉" 到 "推"——HF Daily Papers + alerts |
| **Digest** | 读懂 + 留下笔记 | brainstorming + spec + 命名规则 |
| **Spec** | 把 idea 变成 spec.yaml | "Spec-as-Config" |
| **Build** | 写训练 / 评测 / 复现 | Claude Code + TDD + reviewer |
| **Evaluate** | 三层评测 (unit / invariant / statistical) | 自动 regression |
| **Publish** | 四件套 (paper / model / dataset / demo) | Registry 自动产出 stable ID |

**深读** · [`05-docs/04-pipeline-overview.md`](./04-pipeline-overview.md)

---

## 19 · Progressive Disclosure · 渐进式披露

**定义** · 工具描述 / 上下文 / skill 都<u>按需加载</u>，不是开局全塞进上下文。

**为什么** · 上下文越满 → U 型曲线越严重 → 中段信息丢失 30%+ → 越满越蠢（"context rot"）。

**实现** · MCP 协议的 tool discovery / Claude Code 的 skill 按需触发 / sub-agent 的 isolated context。

---

## 20 · Resumable Execution · 可恢复执行

**定义** · Agent 的执行可以被中断、检查、修改、然后从中间 resume——不必每次从头跑。

**为什么** · 长程任务（几小时 - 几天）总会出 bug——如果不能 resume，每次重跑成本爆炸。

**实现** · `claude --resume`、stateful workflow（Vibe Kanban / Symphony）、checkpoint based agents。

**对应 ETCLOVG** · L 层（Lifecycle）。

---

## 互参索引

- 学术综述：Junjie Li et al. 2026 · *Agent Harness Engineering: A Survey* · [TMLR · openreview.net/forum?id=eONq7FdiHa](https://openreview.net/forum?id=eONq7FdiHa)
- 工程博客：Anthropic [Effective Harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) / [Harness Design](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- 工程博客：OpenAI [Harness Engineering](https://openai.com/index/harness-engineering/) / [Codex App Server](https://openai.com/index/unlocking-the-codex-harness/)
- 方法论栈：AWS [AIDLC Workflows](https://github.com/awslabs/aidlc-workflows)
- 项目目录：[Picrew/awesome-agent-harness](https://github.com/Picrew/awesome-agent-harness) (170+ 项目)
