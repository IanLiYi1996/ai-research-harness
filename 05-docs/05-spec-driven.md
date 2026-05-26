# 5 · Spec-Driven Development（SDD）

> 来源：AWS AIDLC（[awslabs/aidlc-workflows](https://github.com/awslabs/aidlc-workflows)）的核心方法论之一。

## 学术背书 · "Code as Substrate" 视角

> Ning et al. 2026 在 [*Code as Agent Harness*](https://arxiv.org/abs/2605.18747) 里给 SDD 提供了一个更深的理论支持：
>
> **"Code is no longer only a target output. It increasingly serves as an operational substrate for agent reasoning, acting, environment modeling, and execution-based verification."**

也就是说，code（包括 spec.yaml）同时承担四件事：

| 角色 | SDD 怎么用 |
|---|---|
| 推理基底（reasoning） | spec.yaml 是 agent 推断"实验在做什么" 的输入 |
| 行动接口（action） | `axolotl train spec.yaml` 让 agent 一行命令跑出整个实验 |
| 环境模型（environment） | spec.yaml 用 registry ID 把外部世界的状态钉死 |
| 可执行验证（verification） | TDD invariant + spec.yaml 一起，让"对不对" 可以自动判定 |

SDD 不是"用 yaml 写实验" 这么轻——它是把<u>整个实验</u>从"代码 + 隐含约定" 变成"code as substrate"：所有变量、状态、验证一致地用 code 表达。

> 这条线索的另一种叙述见 [`07-glossary.md` · Code as Substrate](./07-glossary.md#21--code-as-substrate--代码即基底)。

## 一句话定义

**Spec is the single source of truth. Code is never edited directly.**

- 改实现 = 改 spec.yaml + 重新生成
- 改 hyperparam = 改 spec.yaml 里的字段
- 改 metric = 改 spec.yaml 里的字段
- 跑实验 = `axolotl train spec.yaml` 之类的命令

## 为什么 spec-driven

### 旧方式（"colab + 命令行"）

```python
# train.py
model = AutoModel.from_pretrained("meta-llama/Llama-3-8B")  # 写死
data = load_dataset("ultrachat")  # 写死
lr = 2e-4  # 藏在某行
batch_size = 8  # 藏在另一行

for epoch in range(3):  # 藏在 for 循环
    ...
```

问题：
- 超参散落在代码各处
- 不可重复（cell 顺序、随机种子飘移）
- 不可审计（"上次我用的是 lr=2e-4 还是 1e-4？"）
- 不可比较（两次实验之间到底改了什么？看 git diff 也不一定看得清）

### 新方式（spec-driven）

```yaml
# spec.yaml
base_model:
  registry: huggingface
  id: meta-llama/Llama-3-8B
dataset:
  registry: huggingface
  id: HuggingFaceH4/ultrachat
hyperparams:
  method: lora
  learning_rate: 2.0e-4
  batch_size: 8
  epochs: 3
  seed: 42
```

```bash
axolotl train spec.yaml
```

好处：
- 所有变量在一个地方
- git diff 一眼看清"实验 v1 vs v2 改了什么"
- 别人 clone 你的 spec.yaml + 一行命令就能复现
- AI 能机器读这份 spec——下游 evaluate / publish 都从它派生

## SDD 的 3 个原则

### 1. spec 是契约

实验过程中改 spec **必须**：
- 改 `spec.yaml`（不是改代码 / 改命令行）
- 在 git commit 信息里说清楚"为什么改"
- 改到 `spec.yaml` 的 `version` 字段（如 v1.1 → v1.2）

### 2. spec 之外没有真理

如果某个超参不在 spec 里，它**不存在**。

- ❌ 在命令行临时加个 `--lr 1e-4`
- ❌ 在 cell 里临时改个 `temperature=0.5`
- ✅ 改 spec.yaml 重跑

### 3. spec 是可机读的

不是给人看的设计文档，是**机器可读的执行单**。

格式必须严格（YAML schema），字段必须明确（不留 placeholder 跑实验），引用必须用 registry ID（不写本地路径）。

## SDD ≠ 一定要写 yaml

YAML 只是一种载体。本质是 "**结构化、版本化、机器可读、唯一权威**"。

也可以用：
- TOML
- pyproject.toml + Hydra config
- Python dataclass + 序列化

**但不推荐**：
- 散落在 \*.py 文件里
- 散落在 Jupyter notebook cell 里
- 散落在 `--flag` 命令行里
- 完全在脑子里

## SDD 的兄弟方法论：DDD 和 TDD

来自 AIDLC 的 3 件套：

| 方法 | 一句话 | 何时用 |
|---|---|---|
| **DDD** (Domain-Driven Design) | "What should we build?" | 立项 / 长期决策 |
| **SDD** (Spec-Driven Development) | "Here's the spec" | 每个具体实验 |
| **TDD** (Test-Driven Development) | "Proof we built it" | 每个具体 component |

三者配合：

```
DDD（4 文档）→ 决定优先级
  ↓
SDD（spec.yaml）→ 描述"什么是这个实验"
  ↓
TDD（pytest invariants）→ 验证"实现是否对"
```

## 在这个 kit 里的体现

- `01-quickstart/templates/experiment-spec.yaml` — SDD 的具体形态
- `03-pipeline/3-spec/` — SDD 阶段的全部 recipe
- `03-pipeline/3-spec/ddd/` — DDD 4 文档的 templates
- `04-examples/reproduce-rope-tdd/` — TDD 的实战例子

## 反向警告

### Spec 不能太详尽

写 spec 也是个 spec-driven 过程——**先写最少能跑的 spec，再迭代**。

不要一开始就写 100 行 spec.yaml 把每个 edge case 都覆盖。先跑通最小路径，再补字段。

### Spec ≠ 文档

**spec 是机器可读的执行单**。不要把它当作"项目说明书" 写——那是 PRODUCT.md / README 的事。

混淆了，spec 会变得太"叙述"，机器不好读，AI 也不好执行。

## 推荐阅读

- AWS AIDLC: [awslabs/aidlc-workflows](https://github.com/awslabs/aidlc-workflows)
- [`03-pipeline/3-spec/`](../03-pipeline/3-spec/) 完整 recipe
- [`04-examples/reproduce-rope-tdd/spec.yaml`](../04-examples/reproduce-rope-tdd/spec.yaml) reference example
