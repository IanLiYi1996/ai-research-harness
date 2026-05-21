# Stage 4 · Build · 数据 + 模型 + 训练

> **核心问题**：把 spec 落成可跑代码，且**不重新发明轮子**。
>
> **关键认知**：研究员的工作不是写训练 loop，是**把对的工具组合在 YAML 里**。

## 时间尺度警告

⚠️ 真实研究实验的 Build 阶段是 **周-月级**，不是小时级。
**AI 不让训练变快**——训练就是要烧那么多 GPU 小时。

但 harness 改变的是：
- **可重复**：spec.yaml 锁定，别人 git clone 即可重跑
- **可审计**：所有超参 / 决策有 trail
- **不重造轮子**：用 YAML driven 框架而不是手写 loop

## Skill 大全（按场景挑）

### 数据准备

| 工具 | 适用场景 |
|---|---|
| `nemo-curator` | 大规模去重 + 质量过滤 + PII 清理 |
| `ray-data` | 流式处理 + 多模态 |
| HF datasets | 标准化数据集 + tokenize 流水线 |

### 模型架构 / 实现

| 工具 | 适用场景 |
|---|---|
| `litgpt` | 干净的 reference 实现，适合学习 / 教学 |
| `nanogpt` | 极简 GPT-2 复现，~300 行 |
| `transformers` | 最广覆盖，production-ready |
| `mamba` / `rwkv` | 替代架构（state space / RNN+Transformer） |

### 分词

- `huggingface-tokenizers`: Rust 速度，支持训练自定义 vocab
- `sentencepiece`: 多语言友好

### 训练框架（按抽象层级）

| 工具 | 抽象层级 | 适用场景 |
|---|---|---|
| `peft` | 底层（HF 集成） | LoRA / QLoRA / IA³ 等 PEFT 方法 |
| `axolotl` | YAML 驱动 | 快速 fine-tune，模板丰富 |
| `llama-factory` | WebUI + YAML | 不想写代码的快速实验 |
| `unsloth` | 优化器导向 | 内存紧 + 速度优先 |
| `torchtitan` | 4D 并行 | 大规模预训练（Llama 3 / DeepSeek 量级） |

### 分布式

| 工具 | 用法 |
|---|---|
| `accelerate` | 入门级多 GPU |
| `deepspeed` | ZeRO 优化 + pipeline parallel |
| `pytorch-fsdp2` | 现代 FSDP，与 torch.compile 友好 |
| `ray-train` | 多机 + 异构集群 |

### RLHF / RL

| 工具 | 算法重点 |
|---|---|
| `trl` | DPO / PPO / GRPO，HF 自家 |
| `openrlhf` | Ray + vLLM 加速大规模 PPO |
| `verl` / `slime` | Megatron 集成，最大吞吐 |
| `grpo` / `simpo` | 新算法 |

### 量化

| 工具 | 阶段 |
|---|---|
| `bitsandbytes` | 训练时 8/4-bit |
| `awq` / `gptq` | 训练后量化 |
| `gguf` | llama.cpp 推理格式 |

### 实验追踪

- `wandb`: 最常用，UI 友好
- `mlflow`: 自托管 / 企业
- `tensorboard`: 简单 + 离线

## 流程

### 1. 从 spec.yaml 派生 trainer config

例如 axolotl：

```yaml
# train.config.yaml （从 spec.yaml 派生）
base_model: ${spec.stage_4_build.base_model.id}
load_in_4bit: true
adapter: lora
lora_r: ${spec.stage_4_build.hyperparams.lora_rank}
learning_rate: ${spec.stage_4_build.hyperparams.learning_rate}
# ...
```

### 2. 启动训练

```bash
axolotl train train.config.yaml
# 或 llama-factory cli train ...
# 或 python train.py（如果用 peft 直接写）
```

### 3. 全程 wandb / mlflow 追踪

不要让 hyperparam 漂流——所有改动都过 spec.yaml，重新跑。

## 关键纪律

- **YAML > 命令行**：所有超参进 YAML，不要让命令行 flags 散落
- **seed 必填**：不能省略 random seed，否则不可重复
- **不要手写训练 loop**（除非真的需要新算法）：让 Agent 帮你写 axolotl yaml
- **每次改 hyperparam = 新 spec.yaml**：不要原地改，建一个 `spec-v2.yaml`

## 失败也有产出

实验失败后，**spec.yaml 的 reflect 段必须填**：

```yaml
reflect:
  status: failure
  what_didnt: |
    learning_rate=2e-4 在这个 base model + 这个 dataset 上不收敛
  lessons: |
    对于 N=8B 模型 + UltraChat-100k，lr 必须 ≤ 1e-4
```

这条教训会被写回 `IMPROVEMENT.md`，下次相关实验自动避坑。
