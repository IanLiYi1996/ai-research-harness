# References · 参考资料

## 学术综述（必读）

> **2026 年 5 月一个月之内，两份独立的 harness 综述同时挂出**——一份用 7 层结构主干（ETCLOVG），一份把 code 当作 substrate。两个角度互补，值得对比阅读。

### A · 7 层分类视角

**[Agent Harness Engineering: A Survey](https://openreview.net/forum?id=eONq7FdiHa)**
Li, Xiao, Zhang, Liu et al. · TMLR under review · 2026-05
*第一篇把 agent harness engineering 作为独立学科系统化的综述。提出 binding-constraint thesis、ETCLOVG 七层分类法（Execution / Tool / Context / Lifecycle / Observability / Verification / Governance），把 170+ 开源项目按层级映射。作者来自 CMU / Yale / JHU / Tulane / UAB / OSU / Virginia Tech / Amazon。*

- 项目主页：[picrew.github.io/LLM-Harness/](https://picrew.github.io/LLM-Harness/)
- 配套数据集：[huggingface.co/datasets/ChenLiu1996/Agent-Harness-Engineering](https://huggingface.co/datasets/ChenLiu1996/Agent-Harness-Engineering)
- GitHub 目录：[Picrew/awesome-agent-harness](https://github.com/Picrew/awesome-agent-harness) — 持续维护的 170+ 项目分类清单

### 论文核心贡献

1. **Binding-Constraint Thesis** — 对长程任务，benchmark 差异主要来自 harness 不是模型。3 个支撑数据：
   - Bölük 2026: 改 edit-tool 格式 → +10× 编程 benchmark
   - LangChain DeepAgents: 固定 GPT-5.2-Codex + harness 改造 → 52.8% → 66.5% (+13.7pp)
   - Meta-Harness (Stanford/MIT): 自动化优化 → 76.4% on Terminal-Bench-2

2. **ETCLOVG 七层分类法** — 4 结构主干（E·T·C·L）+ 3 控制平面（O·V·G）

3. **Three Engineering Phases**：
   - 2022-2024 · Prompt Engineering
   - 2025 · Context Engineering
   - 2026+ · Harness Engineering

4. **5 个开放问题**：
   - 强化和扩展 execution environment
   - 长程 state 管理（recast as state estimation）
   - Trace-native 失败诊断
   - 标准化交接协议
   - 随模型能力提升的自适应简化

### B · Code-as-Substrate 视角

**[Code as Agent Harness](https://arxiv.org/abs/2605.18747)**
Ning, Tieu, Fu, Wei, Li et al. · arXiv 2605.18747 · 2026-05
*提出 "code as the basis for agent infrastructure" 的中心论点——code 不只是产出，也是 agent 推理 / 行动 / 环境建模 / 验证的<u>operational substrate</u>。42 位作者主要来自 UIUC（Hanghang Tong / Jingrui He 实验室）+ 多个工业界。*

#### 核心贡献

1. **三层结构**：
   - **Harness Interface** · code 怎么连接 reasoning / action / environment
   - **Harness Mechanisms** · planning / memory / tool use / feedback control
   - **Scaling** · 从 single → multi-agent，shared code artifacts 作为协调媒介

2. **应用清单**（覆盖比 Li et al. 更广）：
   - coding assistants
   - GUI / OS automation
   - embodied agents
   - **scientific discovery** ← 跟本仓库最相关
   - personalization & recommendation
   - DevOps & enterprise workflows

3. **5 个开放问题**：
   - Evaluation beyond final-task-success
   - Verification under incomplete feedback
   - Regression-free harness improvement
   - Consistent shared state across agents
   - Human oversight for safety-critical actions

#### 跟 Li et al. 的关系

| 维度 | Li et al. (TMLR) | Ning et al. (arXiv) |
|---|---|---|
| 切入点 | 工程层级（什么在做什么） | 表达媒介（用什么做） |
| 分类粒度 | 7 层（ETCLOVG） | 3 层（interface / mechanism / scaling） |
| 实证 | 170+ 项目 → 层级映射 | 应用域 → mechanism 对应 |
| 论点定位 | binding-constraint thesis | code 作为 unified substrate |

**两者互补**：Li 把 harness <u>分解</u>为多层；Ning 把 harness <u>统一</u>到一个媒介。先看 Li 知道有哪些层，再看 Ning 知道为什么 code 能贯穿这些层。

## 核心 4 篇博客 · Harness 工程的工业实践源头

这一组博客是 2025-11 到 2026-03 由 Anthropic 和 OpenAI 不约而同提出的"harness engineering" 概念的奠基文献。

### Anthropic

1. **[Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)**
   Justin Young · 2025-11-26
   *Harness 概念的最早系统阐述。引入 "session amnesia"、"context anxiety" 等核心问题。*

2. **[Harness Design for Long-Running Application Development](https://www.anthropic.com/engineering/harness-design-long-running-apps)**
   Prithvi Rajasekaran · 2026-03-24
   *Generator-Evaluator 架构 + V2 演进。提出 "Out of the box, Claude is a poor QA agent."*

### OpenAI

3. **[Harness Engineering: Leveraging Codex in an Agent-First World](https://openai.com/index/harness-engineering/)**
   Ryan Lopopolo · 2026-02-11
   *从 Codex 内部使用经验提炼的 harness 工程范式。"Humans steer. Agents execute." 出处。*

4. **[Unlocking the Codex Harness: How We Built the App Server](https://openai.com/index/unlocking-the-codex-harness/)**
   Celia Chen · 2026-02-04
   *Codex App Server 的 JSON-RPC 协议层设计。把 harness 当作可标准化的接口。*

## AIDLC · 工业级落地

**[awslabs/aidlc-workflows](https://github.com/awslabs/aidlc-workflows)**
AWS · 2026-04
*AI-Driven Development Lifecycle，方法论作为代码。提出 DDD + SDD + TDD 三件套。*

相关 pitch deck（AWS 内部首讲材料）：
- AIDLC pitch by Xiaogang Wang · 2026-05

## Claude Code 源码分析

**Claude Code** · ~512K 行 TypeScript · [claude.ai/code](https://claude.ai/code)
*5 层架构（Bootstrap / Context / Skills / Memory）的具体实现。*

## 推荐工具与 Skills

### Skills

- **[superpowers](https://github.com/anthropics/skills/tree/main/superpowers)** — brainstorming / writing-plans / TDD / debugging
- **[huggingface-papers](https://github.com/huggingface/papers-skill)** — HF 论文页 markdown
- **[arxiv-mcp-server](https://github.com/blazickjp/arxiv-mcp-server)** — arXiv 全文 + 语义搜索 + watch_topic
- **[html-ppt](https://github.com/lewislulu/html-ppt-skill)** — 本 kit 的 slides 用的工具

### 训练框架

- [peft](https://github.com/huggingface/peft) — LoRA / QLoRA
- [axolotl](https://github.com/axolotl-ai-cloud/axolotl) — YAML 驱动 fine-tune
- [llama-factory](https://github.com/hiyouga/LLaMA-Factory) — WebUI + 100+ 模型
- [unsloth](https://github.com/unslothai/unsloth) — 内存优化
- [torchtitan](https://github.com/pytorch/torchtitan) — 4D 并行
- [trl](https://github.com/huggingface/trl) — DPO / PPO / GRPO

### 评测

- [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness)
- [bigcode-evaluation-harness](https://github.com/bigcode-project/bigcode-evaluation-harness)
- [nemo-evaluator](https://github.com/NVIDIA/NeMo-Evaluator)

## 概念阅读

### 科学方法论

- Karl Popper, *The Logic of Scientific Discovery* — 可证伪性
- Thomas Kuhn, *The Structure of Scientific Revolutions* — 范式转移
- 5 个科学性属性（可重复 / 可证伪 / 可审计 / 可累积 / 可比较）综合自上述传统

### 软件工程

- Eric Evans, *Domain-Driven Design* — DDD 起源
- Kent Beck, *Test-Driven Development by Example* — TDD 起源
- Spec-Driven 是 AIDLC 的提法，借鉴 contract-first / API-first 思想

### Agent 工程

- Anthropic, [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) · 2024
- *从 chains 到 agents 的 reasoning loop 演化*

## 发明者们

致谢：

- Justin Young, Prithvi Rajasekaran, Celia Chen (Anthropic / OpenAI)
- Ryan Lopopolo (OpenAI)
- Xiaogang Wang (AWS) 及 AIDLC team
- Lewis (html-ppt)
- 所有 superpowers / HF / arxiv-mcp 相关 contributors

如果你觉得这个 kit 有用，去给上面这些项目和作者点 star / 写 thank-you tweet。

## 引用本 kit

如果你在研究 / 课程中用到这个 kit：

```bibtex
@misc{ai-research-harness-2026,
  title  = {AI Research Harness: A starter kit for doing research with AI harnesses},
  author = {<contributors>},
  year   = {2026},
  url    = {https://github.com/IanLiYi1996/ai-research-harness}
}
```
