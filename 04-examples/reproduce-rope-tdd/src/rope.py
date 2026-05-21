"""
RoPE (Rotary Positional Embedding) — minimal forward pass.

Reference: Su et al. "RoFormer" (arXiv:2104.09864), Equation 13.

5 条 invariant 见 tests/test_invariants.py。
"""

import torch


def build_rope_matrix(seq_len: int, dim: int, base: float = 10000.0):
    """
    构造 RoPE 的 cos/sin 矩阵。

    Args:
        seq_len: 序列长度
        dim: head dim（必须是偶数，因为按 2 维一对旋转）
        base: 频率基数（默认 10000.0，与 RoFormer / sinusoidal 一致）

    Returns:
        cos, sin: 都是 [seq_len, dim] 形状
    """
    assert dim % 2 == 0, "dim 必须是偶数"

    # 频率：theta_i = base^(-2i/dim), i = 0, 1, ..., dim/2 - 1
    inv_freq = 1.0 / (base ** (torch.arange(0, dim, 2).float() / dim))  # [dim/2]
    positions = torch.arange(seq_len).float()  # [seq_len]

    # outer product: [seq_len, dim/2]
    freqs = torch.einsum("i,j->ij", positions, inv_freq)

    # 把每个频率重复一次，得到 [seq_len, dim]
    # 注意：这里采用 (a, a, b, b, ...) 的排列，而不是 (a, b, a, b)
    emb = torch.repeat_interleave(freqs, repeats=2, dim=-1)

    return torch.cos(emb), torch.sin(emb)


def apply_rope(x: torch.Tensor, cos: torch.Tensor, sin: torch.Tensor) -> torch.Tensor:
    """
    把 RoPE 旋转应用到向量 x 上。

    Args:
        x: [..., seq_len, dim]，必须最后两维分别是 seq 和 dim
        cos, sin: [seq_len, dim]

    Returns:
        旋转后的 x，shape 与输入一致
    """
    # 把 x 的偶数 / 奇数维度配对
    x1 = x[..., 0::2]  # [..., seq_len, dim/2]
    x2 = x[..., 1::2]  # [..., seq_len, dim/2]

    # 把 cos/sin 也只取偶数索引（因为我们 repeat_interleave 让 [c0, c0, c1, c1, ...]）
    cos_half = cos[..., 0::2]  # [seq_len, dim/2]
    sin_half = sin[..., 0::2]

    # 2D 旋转：
    #   x1' = x1 * cos - x2 * sin
    #   x2' = x1 * sin + x2 * cos
    rotated_x1 = x1 * cos_half - x2 * sin_half
    rotated_x2 = x1 * sin_half + x2 * cos_half

    # 重新交错回原维度顺序
    out = torch.empty_like(x)
    out[..., 0::2] = rotated_x1
    out[..., 1::2] = rotated_x2

    return out
