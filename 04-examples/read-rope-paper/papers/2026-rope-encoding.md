# RoFormer: Enhanced Transformer with Rotary Position Embedding

- **arXiv**: `2104.09864` · [link](https://arxiv.org/abs/2104.09864)
- **Authors**: Jianlin Su, Yu Lu, Shengfeng Pan, Bo Wen, Yunfeng Liu
- **Venue**: arXiv (later widely adopted: LLaMA, GPT-NeoX, PaLM)
- **Date read**: YYYY-MM-DD
- **Tags**: #position-encoding #transformer #rope

## 一句话定位

把绝对位置和相对位置编码统一为**对 query/key 向量的旋转操作**，相比 absolute / relative PE，**只取决于 token 之间的相对位置 + 不需要额外参数**。

## Linked Artifacts

- **Models**: `null`（论文本身不发模型；后续被 Llama / Falcon / GPT-NeoX 等采用）
- **Datasets**: `null`
- **Code**: [https://github.com/ZhuiyiTechnology/roformer](https://github.com/ZhuiyiTechnology/roformer)
- **Demo**: `null`

## 关键 insight (1-3 条，每条 ≤ 30 字)

1. 用 2D 旋转矩阵编码位置，attention 内积自然只依赖相对位置 m-n
2. 相比加法 / 拼接 PE，旋转操作**保持范数不变**，数值更稳定
3. 长上下文外推天然有距离衰减，不像 absolute PE 那样泛化困难

## 方法核心 (≤ 200 字)

对 query 和 key 向量做位置相关的旋转：把 d 维向量两两配对（d/2 个 2D 子空间），每对在不同位置 m 上旋转角度 `m * theta_i`，其中 `theta_i = 10000^(-2i/d)` 沿用 sinusoidal 设计。

attention score `q_m · k_n` 经过这种旋转后，**只取决于 (m-n)**——也就是相对位置。这一点是 RoPE 的核心数学性质。

实现上，用 `cos(m*theta), sin(m*theta)` 做元素级乘加即可，**无额外参数**。

## 实验 takeaway (3 个最关键数字)

| Setting | Result | Source |
|---|---|---|
| RoFormer vs BERT base on GLUE avg | +0.5 ~ +1.0 | Table 1 |
| 长文本翻译 (WMT14 En-De, 10k tokens) BLEU | RoFormer 比 baseline +0.6 | Table 3 |
| Pretraining loss curve at 100k steps | RoFormer 收敛更平滑，loss 低 ~3% | Figure 4 |

## 局限

**作者自己承认的：**
- 主要在分类 / 翻译实验，未充分验证在生成任务上的效果
- 长上下文外推能力当时未测到 32k+

**我应该追问的：**
- RoPE 在 ≥ 32k token 上下文表现如何？后来 NTK-aware / YaRN 等方法是怎么扩的？
- RoPE 与 attention sink / streaming attention 的兼容性？
- 训练时只见过 N 长度，推理时外推到 4N 的性能曲线怎样？

## 如果我要复现，最小可行版本是什么

```python
import torch

def build_rope_matrix(seq_len: int, dim: int, base: float = 10000.0):
    """构造 [seq_len, dim] 的 cos/sin 矩阵"""
    inv_freq = 1.0 / (base ** (torch.arange(0, dim, 2).float() / dim))
    positions = torch.arange(seq_len).float()
    freqs = torch.einsum("i,j->ij", positions, inv_freq)  # [seq_len, dim/2]
    # repeat each freq twice to match dim
    emb = torch.cat([freqs, freqs], dim=-1)  # [seq_len, dim]
    return torch.cos(emb), torch.sin(emb)


def apply_rope(x: torch.Tensor, cos: torch.Tensor, sin: torch.Tensor):
    """x: [..., seq, dim]; cos/sin: [seq, dim]"""
    # split into even / odd dims, rotate
    x1, x2 = x[..., 0::2], x[..., 1::2]
    rotated = torch.stack([
        x1 * cos[..., 0::2] - x2 * sin[..., 0::2],
        x1 * sin[..., 0::2] + x2 * cos[..., 0::2],
    ], dim=-1).flatten(-2)
    return rotated
```

```yaml
# minimal spec sketch
base_model:    null  # 自己从头训一个 mini transformer
dataset:       wikitext-103
metric:        perplexity
invariants:
  - orthogonality_R_T_R_eq_I
  - relative_position_only
  - norm_preserved
estimated_cost: ~4 GPU hours on A100
```

## 我的评价

- **值得复现吗**：✅ 强烈建议——RoPE 是 2026 年所有大模型的标配，理解它的数学性质和实现细节对做长上下文 / 推理优化都有用
- **可能的扩展方向**：
  - YaRN / NTK-aware extrapolation
  - RoPE + attention sink 长上下文方案
  - 自适应 base 调整（针对不同任务）
- **是否影响我当前课题**：<根据你的课题填>

## Notes / TODO

- [ ] 跑一遍 minimal RoPE 实现，验证 5 条 invariant
- [ ] 读 follow-up: YaRN / Position Interpolation / NTK-aware
- [ ] 复现 paper Table 3 的长文本翻译实验

## References

- Original paper: arXiv:2104.09864
- Llama 1/2/3 都用 RoPE: [Llama paper](https://arxiv.org/abs/2302.13971)
- YaRN extrapolation: arXiv:2309.00071
- RoFormer GitHub: https://github.com/ZhuiyiTechnology/roformer
