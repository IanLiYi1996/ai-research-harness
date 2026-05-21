# Stage 3 · Spec · 想法 → 可测假设

> **核心问题**：从 "我觉得 X 有意思" 到 "X 满足 N 个 invariant"。
>
> **关键纪律**：Spec-as-Config——把 idea 变成机器可读的对象。

## 这是 pipeline 里**最容易被低估**的一步

大多数硕士生跳过这一步，直接进 Build——结果是改了 5 次代码也没真正回答问题，因为**问题本身从来没明确过**。

## 工具栈

| 工具 | 作用 |
|---|---|
| `superpowers:brainstorming` | 一问一答把模糊想法变 spec |
| `superpowers:writing-plans` | spec → 可执行计划 |
| `MEMORY.md` | 自动注入你的偏好和过去课题 |
| `spec.template.yaml` | spec 起点 |

## 流程

### 1. 建实验目录

```bash
./tools.sh experiment <slug>
# 创建 experiments/<slug>/ + spec.yaml + tests/test_invariants.py
```

### 2. Brainstorming

不要立刻动手。让 Agent 先问你：

- **Hypothesis**: 你期待这个实验回答什么？
- **Metric**: 怎么衡量 work / 不 work？
- **Invariants**: 哪些是必须满足的不变性？（数学性质 / 物理约束 / 业务规则）
- **Baseline**: 跟什么比？为什么是它？
- **Cost estimate**: 预计 GPU 小时？数据准备时间？

### 3. 填 spec.yaml

复制 [`spec.template.yaml`](./spec.template.yaml) 到 `experiments/<slug>/spec.yaml`，按 brainstorming 结果填。

### 4. 关键字段

`base_model` 和 `dataset` 必须写 **registry ID**（HF Hub / GitHub / W&B / 内部都行），不要写本地路径。

```yaml
base_model:
  registry: huggingface
  id: meta-llama/Llama-3-8B
  revision: main

dataset:
  registry: huggingface
  id: HuggingFaceH4/ultrachat
  split: train
  num_samples: 100000
```

### 5. spec.yaml 是 single source of truth

下游 Build / Eval / Publish 全部从这一份 yaml 派生：

- Build 阶段 axolotl YAML 引用 spec.yaml 的字段
- Eval 阶段用 spec.invariants 派生 pytest
- Publish 阶段把 model / dataset / paper 填回 spec.publish 槽位

## DDD 团队协作（可选）

跨学期 / 跨人合作时，引入 4 文档：

| 文档 | 回答 |
|---|---|
| [PRODUCT.md](./ddd/PRODUCT.md.template) | "Should we do this?"（路线 / 优先级） |
| [TECH.md](./ddd/TECH.md.template) | "Can we do this?"（架构 / 约束 / 成本） |
| [IMPROVEMENT.md](./ddd/IMPROVEMENT.md.template) | "Have we tried this?"（历史教训） |
| [PROJECT.md](./ddd/PROJECT.md.template) | "Should we do it now?"（当前焦点 / 决策） |

参考 AWS AIDLC：https://github.com/awslabs/aidlc-workflows

## 关键纪律

- **spec 写不出来 = idea 还没准备好**：如果你说不出 hypothesis 和 metric，**不该动手做这个实验**
- **超参全部进 yaml**，不要藏在 cell / 命令行 / 脑子里
- **invariant 先于代码**：先把"什么叫做对"写下来，再写实现
- **Spec 是契约**：跑实验过程中改 spec，必须明确记录"为什么改"
