# 04 · Examples · 真实跑通的工作流

> 三幕完整 working examples，对应分享 deck 的三幕 demo。

## 三幕（+ 一个 0 号 minimal example）

| # | 主题 | 目录 |
|---|---|---|
| 0 | **Minimal agent loop**（30 行剥神秘感） | [`00-minimal-agent-loop/`](./00-minimal-agent-loop/) |
| 1 | 读论文（用 templ-1） | [`read-rope-paper/`](./read-rope-paper/) |
| 2 | 写笔记（spec-driven） | [`write-survey-note/`](./write-survey-note/) |
| 3 | 复现 RoPE（TDD-first + reviewer） | [`reproduce-rope-tdd/`](./reproduce-rope-tdd/) |

> 第 0 号是给"第一次接触 agent" 的人看的——剥掉所有 harness 装饰，看清楚 agent 内核就 30 行。

每个 example 都是**端到端可跑**的——你 clone 后按各自 README 操作即可重现整个流程。

## 怎么用 examples 学习

### 模式 1：照抄

最简单——把整个 example 目录拷到你自己的项目，改 placeholder。

### 模式 2：复跑

看 README 的 "How to reproduce" 一步步跟做，跟你自己跑出来的对比，找差异。

### 模式 3：fork + 改造

挑离你课题最近的一个 example，fork 一份，按你的 hypothesis 改造。

## 想看更多 examples？

欢迎 PR 你自己的 case study！见 [CONTRIBUTING.md](../CONTRIBUTING.md#1-case-studies)。

特别欢迎下面方向：

- 不同领域的 paper reading 流程（bio / 物理 / NLP / CV / robotics）
- 工业研究场景（不只是学术）
- 团队协作的 spec.yaml 实践
- 失败案例 + 教训（这种最珍贵！）
