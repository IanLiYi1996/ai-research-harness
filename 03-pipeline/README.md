# 03 · Pipeline · 6 阶段研究流水线

> 把"用 AI 做研究"拆成 6 个明确的阶段。每个阶段有自己的工具栈、产物、检查清单。

![pipeline](../06-slides/diagrams/fig-pipeline.svg)

## 6 阶段总览

| 阶段 | 目标 | 工具栈示例 | 产物 |
|---|---|---|---|
| [1 · Discover](./1-discover/) | 找该读什么 | hf-mcp paper_search, arxiv-mcp watch_topic | 待读队列 |
| [2 · Digest](./2-digest/) | 把论文变成知识 | huggingface-papers, templ-1 | 结构化笔记 + linked IDs |
| [3 · Spec](./3-spec/) | 想法 → 假设 | superpowers:brainstorming, spec.yaml | spec + DDD 4 docs |
| [4 · Build](./4-build/) | 数据 + 模型 + 训练 | peft, axolotl, trl, torchtitan | checkpoints + runs |
| [5 · Evaluate](./5-evaluate/) | 三层评测 | lm-eval-harness, pytest, sub-agent | 评测报告 |
| [6 · Publish](./6-publish/) | 让别人能复现 | HF Hub / GitHub Releases / W&B | paper × model × dataset × demo |

## 关键认知

研究 pipeline 的时间尺度是**周-月级**，单点加速比意义不大。Harness 真正改变的是：

> **真实实验本身不会变快——harness 改变的是 "实验能不能算数"。**
>
> 可重复 / 可证伪 / 可审计 / 可累积 / 可比较，从 "自觉" 变成 "机械化保证"。

详见 [`05-docs/04-pipeline-overview.md`](../05-docs/04-pipeline-overview.md)。

## 不要全做完才上手

每个阶段都有"最小动作"——本周内能动手的版本。先挑一段闭环跑通，再扩展。

| 阶段 | 本周最小动作 | 一个月升级 |
|---|---|---|
| Discover | 订阅 1 个 watch_topic | cron 跑 auto-digest |
| Digest | 用 templ-1 模板写 5 篇笔记 | 每篇都补 registry IDs |
| Spec | 下个 idea 不写代码，先写 spec.md | spec.yaml 串起 build/eval/publish |
| Build | 用 axolotl YAML 跑一次 LoRA | 所有超参进 config，全程 wandb |
| Evaluate | 下次实验跑 lm-eval-harness | 三层评测全做 |
| Publish | push 1 个 model 或 dataset | 硕士论文交付四件套 |

## 关于 DDD

`3-spec/ddd/` 下是 AIDLC 的"4 文档自治判断" 体系（PRODUCT / TECH / IMPROVEMENT / PROJECT），用于团队 / 长期项目。**单人短期项目可以跳过**，但跨学期 / 跨人合作时强烈建议引入。
