# References · 参考资料

## 核心 4 篇博客 · Harness 工程的源头文献

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
