# 1 · 什么是 Harness？

## 起源视角 · Agency 来自模型，不是 harness

在讨论"造 harness"之前，先把一件根本的事说清楚：

> **Agency —— 感知、推理、行动的能力 —— 是<u>训练</u>出来的，不是<u>编</u>出来的。**

这个观点在 [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) 里写得最清楚。一个能干活的 agent 产品，需要模型和 harness 缺一不可——但智能的来源永远是模型。

历史已经写好了铁证：

| 年份 | 系统 | 智能怎么来的 |
|---|---|---|
| 2013 · DeepMind DQN | 玩 49 款 Atari | 神经网络从原始像素学，没有游戏专属规则 |
| 2019 · OpenAI Five | Dota 2 击败 OG（TI8 冠军） | 自我对弈 45,000 年，**没有脚本化策略** |
| 2019 · DeepMind AlphaStar | StarCraft II 宗师段位 | 同上 |
| 2024-2026 · LLM Agent | 写代码 / 读论文 / 做研究 | 在人类全部代码 + 推理上训练的 LLM |

每一个里程碑都指向同一个事实：**Agency 是模型学到的，环境（harness）只是让 agency 落地的载具**。

**含义** · 当我们说"用好 AI 做科研" 时，不是要替模型"想"，而是要给模型一个能感知 + 行动的好环境。模型是驾驶者，harness 是载具。

这跟 OpenAI 的 *"Humans steer. Agents execute."* 是<u>同一件事的两个角度</u>——OpenAI 强调分工，shareAI 强调起源。

## 定义

**Harness（脚手架/套具）** 是包裹在 LLM 外部的程序化框架，负责管理 Agent 的运行环境、上下文、状态、工具和生命周期。

它**不改变模型本身的能力**，而是通过工程手段让模型在复杂任务中发挥出更接近上限的表现。

## 5-Component 公式 · 速记版

```
Harness = Tools + Knowledge + Observation + Action + Permissions

  Tools         · 给 agent 一双手 — 文件读写、shell、API 调用、浏览器
  Knowledge     · 给 agent 领域专长 — 论文笔记、命名规则、风格约定
  Observation   · 给 agent 一双眼 — git diff、错误日志、实验输出
  Action        · 让 agent 能动 — CLI 命令 / API 调用 / 提交 PR
  Permissions   · 给 agent 边界 — 沙箱、审批、写权限、机密文件保护
```

这是给师弟师妹的<u>速记版</u>。再深一层有 [ETCLOVG 七层分类](./06-faq.md#etclovg)（学术综述用），先把 5-component 记牢就够。

## 类比

如果 LLM 是一位能力出众的工程师，那么 Harness 就是这位工程师的工作环境——

- 项目管理工具
- 代码仓库
- CI/CD 流水线
- Code Review 流程
- 团队协作协议

**单独一个厉害的工程师 ≠ 一个配备完善工程体系的团队**。同一个工程师在不同环境里，产出质量天差地别。

## 一句话总结

> **"Humans steer. Agents execute."**
>
> — Ryan Lopopolo, OpenAI · Harness Engineering, 2026-02

## 为什么不能只靠模型本身？

### Anthropic 的诊断 — 模型的内在缺陷

Justin Young (Anthropic, 2025-11) 观察到三大病根：

1. **Context Anxiety（上下文焦虑）**：模型在接近上下文窗口限制时，会"begin wrapping up work prematurely"——提前收尾、草草了事。

2. **Self-Evaluation Bias（自评偏差）**：Prithvi Rajasekaran (Anthropic, 2026-03) 发现："*When asked to evaluate work they've produced, agents tend to respond by confidently praising the work — even when, to a human observer, the quality is obviously mediocre.*"

3. **Session Amnesia（会话失忆）**：每次新会话从零开始——"*Each new session begins with no memory of what came before.*"

### OpenAI 的诊断 — 环境的根本欠缺

Ryan Lopopolo (OpenAI, 2026-02)：

> "*Early progress was slower than we expected, **not because Codex was incapable, but because the environment was underspecified**. The fix was almost never 'try harder.'*"

正确的反应不是再写一个更好的 prompt，而是问：**"What capability is missing, and how do we make it both legible and enforceable for the agent?"**

### 殊途同归

两家公司从不同角度得出同一个结论：

> **这些问题不是 prompt 能解决的。它们需要系统层面的工程方案——这就是 Harness。**

## Harness 不是新东西

这个词本身借自机械工程——"harness" 在英文里指给马、给降落伞、给婴儿的"安全束具"。它的核心特征都一样：

- ✅ 不改变被束缚物的本质
- ✅ 让被束缚物在更复杂的环境中安全有效地工作
- ✅ 提供"控制 + 反馈" 的物理接口

LLM Harness 的本质就是这个——**把通用 LLM 工程化、约束化、可审计化的接口层**。

## 反面教材 · 什么<u>不是</u> harness

要避免几种"看起来像但不是"的东西：

### ❌ 提示词水管工（Prompt Plumbing）

把 LLM API 调用用 if-else、节点图、硬编码路由串起来，就以为自己"造了 agent"。

> *"它们做出来的东西是鲁布·戈德堡机械——一个过度工程化的、脆弱的过程式规则流水线，LLM 被楔在里面当一个美化了的文本补全节点。那不是 Agent。那是一个有着宏大妄想的 shell 脚本。"*
>
> — shareAI-lab · learn-claude-code

**症状**：
- 拖拽式工作流构建器
- 庞大的规则树 / 决策树
- 链式提示词瀑布流（"先让 LLM 做 X，再让它做 Y，再让它做 Z..."）

**为什么不是 harness**：harness 是给模型<u>提供能力</u>，不是<u>替代</u>模型的判断。

### ❌ GOFAI 还魂

GOFAI = *Good Old-Fashioned AI*，1980-90 年代的符号专家系统——大量手工规则 + 决策树。这种 paradigm 已经被深度学习证伪一次，现在喷一层 LLM 漆又登场——同一条死路。

**症状**：硬编码所有 corner case 而不是让模型决定。

### ❌ 一次性 RAG = harness

"我做了 RAG 检索 + LLM 调用，是不是 harness？"

不是。RAG 只是 [5-component](#5-component-公式--速记版) 里 **Knowledge** 的一种实现。一个完整 harness 还需要 Tools / Observation / Action / Permissions。

### ✅ 真正的 harness 长什么样

- 给 agent 工具（不是写死流程）
- 让 agent 看得见环境（git diff / 错误日志 / 实验输出）
- 给 agent 边界（不能偷偷推到 main / 不能删 .env）
- 让 agent 自己决定下一步（不是程序员决定）

**一句话** · *Agency 是学出来的，不是编出来的。Harness 是让学出来的 agency 能落地的载具。*

## Harness 不是 Agent

很多人把这两个词混用，其实是不同层次：

| 概念 | 是什么 |
|---|---|
| **LLM** | 模型本身——给文本，出文本 |
| **Agent** | LLM + 工具调用 + 多轮规划——一个能"做事" 的实体 |
| **Harness** | Agent 的运行框架——给 Agent 提供 memory / skills / coordinator / hook 等基础设施 |

类比：
- LLM = 人脑
- Agent = 一个具体的工人
- Harness = 工厂的生产流水线 + 安全规范 + 协作协议

## 何时需要 Harness

不是所有 AI 用法都需要 harness。看场景：

| 场景 | 需要 harness 吗 |
|---|---|
| 一次性问答（"今天天气怎么样"） | ❌ 不需要 |
| 写一行代码 | ❌ 不需要 |
| 批改一段文档 | ⚠️ 有 1 件 memory.md 就够 |
| 跨会话的研究项目 | ✅ 需要 4 件套 |
| 多 Agent 协作的复杂任务 | ✅ 需要完整 harness |
| 长期产品级 agent 应用 | ✅ 需要全栈 harness |

## 推荐阅读

- [02 · 6 大设计模式](./02-six-patterns.md) — 进一步看 harness 的具体形态
- [03 · 3 层成熟度](./03-three-maturity-levels.md) — 怎么判断你目前在哪一层
- [04 · Pipeline 总览](./04-pipeline-overview.md) — 把 harness 落地到 AI 研究上
- [References](./references.md) — 4 篇核心博客 + AIDLC + 其他文献
