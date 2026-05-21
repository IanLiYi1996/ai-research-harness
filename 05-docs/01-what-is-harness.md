# 1 · 什么是 Harness？

## 定义

**Harness（脚手架/套具）** 是包裹在 LLM 外部的程序化框架，负责管理 Agent 的运行环境、上下文、状态、工具和生命周期。

它**不改变模型本身的能力**，而是通过工程手段让模型在复杂任务中发挥出更接近上限的表现。

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
