# Mini Survey · Transformer 位置编码方法对比

- **Date**: YYYY-MM-DD
- **Tags**: #position-encoding #transformer #survey
- **Related**: papers/2026-rope-encoding.md, papers/2026-alibi.md, papers/2026-nope.md, papers/2026-yarn.md

## Context · 这份笔记的"为什么"

**写这份笔记的目的**：给硕士新生（第一年）作为入门综述材料；同时也是我自己的引用源——下次写 paper related work 时直接拉。

**核心结论**：**RoPE (Su et al. 2021) 已经成为 2024+ 大模型的事实标准。但在长上下文外推（≥ 32k）上，ALiBi (Press et al. 2022) 仍有不可替代的优势——零参数、零训练成本、外推稳定。** 选哪个不只是"哪个更好"，是"你优化哪个目标"。

## 1. 背景：位置编码的演化

Transformer 没有循环结构，必须显式注入位置信息。从 2017 到 2024，主流方案经过 3 代演化：

- **第一代 · 绝对位置编码（Absolute PE）**：sinusoidal (Vaswani 2017) + learned。简单，但**长度外推差**——训练时见过 N=512，推理到 N=2048 直接崩溃。
- **第二代 · 相对位置编码（Relative PE）**：T5 / Transformer-XL 等。给注意力分数加一个相对位置 bias，**外推稳定但有额外参数**。
- **第三代 · 旋转 / 衰减 PE**：RoPE (2021) / ALiBi (2022)。无参数、外推友好、被 Llama / Falcon / GPT-NeoX 等广泛采用。

**所以这意味着**：从绝对到相对到旋转/衰减，方向是**减少参数、提升外推、统一表达式**。RoPE 和 ALiBi 是当前两个主流答案。

## 2. 4 方法对比

### 2.1 RoPE — 旋转编码

> 核心：把 query/key 向量做位置相关的旋转，attention 内积自然只取决于相对位置 m-n。

- **优势**：无额外参数，数学优雅，attention 性质明确
- **劣势**：训练时见过的 N 长度外推到 4N+ 时性能下降（需要 NTK-aware / YaRN 扩展）
- **代表使用方**：Llama 1/2/3, GPT-NeoX, Falcon, PaLM

### 2.2 ALiBi — 线性偏置

> 核心：在 attention score 上直接加一个 -m * |i - j| 的线性 penalty，距离越远 penalty 越大。

- **优势**：**零参数 + 训练时只需 N=512，推理可直接外推到 N=16k+**
- **劣势**：表达力比 RoPE 弱一些，在某些任务上 1-2% 落后
- **代表使用方**：BLOOM, MPT

### 2.3 NoPE — 不要位置编码

> 核心：发现 causal mask 本身就提供了隐式的位置信号，**根本不需要显式 PE**。

- **优势**：最干净，零参数，最快
- **劣势**：仅 causal LM 适用；非 causal 任务（编码器）不行
- **状态**：2023 年提出，工业界尚未大规模采用

### 2.4 YaRN — RoPE 的长上下文扩展

> 核心：不是新的 PE，是给 RoPE 打补丁——通过 NTK-aware 频率缩放，把训练时见过的 N 扩到 4N+ 而不损失精度。

- **优势**：**与现有 RoPE 模型 100% 兼容**，少量微调即可启用
- **劣势**：还是基于 RoPE 的拐杖，不是根本解
- **代表使用方**：很多 long-context Llama 变体

## 3. 实验对比（按 5 个维度）

| 维度 | RoPE | ALiBi | NoPE | YaRN |
|---|---|---|---|---|
| 参数开销 | 0 | 0 | 0 | 0 |
| 训练时上下文长度 | 中 | 短 (512+) | 中 | 中 |
| 外推到 4N | 一般 | 好 | 一般 | 优秀 |
| 数学性质明确 | ✅ | ✅ | ❌（隐式） | ✅ |
| 跨任务通用 | ✅ | ✅ | ❌（只 causal） | ✅ |

**所以这意味着**：如果你做 **causal LM + 中等上下文**，RoPE 是默认选；如果做 **超长上下文 + 训练资源紧张**，ALiBi；如果做 **非 causal**，避开 NoPE；如果**已经训了 RoPE 模型想扩长上下文**，用 YaRN。

## 4. 我的判断

**短期（2026）**：RoPE 仍是工业事实标准——已有大量基础设施依赖它。但**在长上下文场景，RoPE + YaRN ≠ 一劳永逸**——超过 32k 仍有性能下降。

**中期（2-3 年）**：可能出现 RoPE 和 ALiBi 的**混合方案**——短距离用 RoPE 表达力，长距离用 ALiBi 衰减保稳定。

**值得追踪**：NoPE 在 causal LM 上的进一步实验。如果它真能在大模型上 work，"零位置编码"会是一个范式简化。

## Open Questions

- RoPE 在 1M+ token 上下文（如 Gemini 1.5）是怎么扩的？
- ALiBi 的衰减系数能不能学习而不是固定？
- NoPE 在 multi-modal 模型（视觉 + 文本）上怎么处理跨模态位置？

## TODO / Next Steps

- [ ] 实现 minimal RoPE forward + 验证 5 个 invariant
- [ ] 跑一次 ALiBi vs RoPE 在 8k 上下文上的对比实验
- [ ] 读 Gemini 1.5 / Llama 3.1 的长上下文 trick paper

## References

1. Su et al. "RoFormer". arXiv:2104.09864
2. Press et al. "Train short, test long: Attention with linear biases enables input length extrapolation". ICLR 2022
3. Kazemnejad et al. "The impact of positional encoding on length generalization in transformers". NeurIPS 2023
4. Peng et al. "YaRN: Efficient context window extension of large language models". arXiv:2309.00071
5. Vaswani et al. "Attention is all you need". NeurIPS 2017
