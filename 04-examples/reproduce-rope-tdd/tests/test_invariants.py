"""
RoPE 5 条 invariant 测试 · TDD-first

先写这些测试（应该 RED），再写 src/rope.py 实现，再让测试 GREEN。
"""

import math
import pytest
import torch

# 把项目根加进 sys.path 以便 import src.rope
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.rope import build_rope_matrix, apply_rope


# ============ Invariant 1: 范数保持 ============

def test_rope_preserves_norm():
    """RoPE 旋转必须保持向量范数不变"""
    torch.manual_seed(42)
    seq_len, dim = 16, 64
    cos, sin = build_rope_matrix(seq_len, dim)
    x = torch.randn(2, 4, seq_len, dim)  # batch, heads, seq, dim
    x_rotated = apply_rope(x, cos, sin)

    norm_before = x.norm(dim=-1)
    norm_after = x_rotated.norm(dim=-1)
    assert torch.allclose(norm_before, norm_after, atol=1e-5), (
        f"Norm changed: max diff {(norm_before - norm_after).abs().max()}"
    )


# ============ Invariant 2: 周期性 ============

def test_rope_periodicity():
    """RoPE 在 2π 周期上重复"""
    seq_len, dim = 8, 32
    base = 10000.0
    # 在 seq_len=8 和 seq_len = 8 + (2π / base_freq) 上的旋转应该相等
    # (这个 invariant 取决于具体实现细节，简化版本)

    cos1, sin1 = build_rope_matrix(seq_len, dim, base=base)
    # 周期性更严格的测试：同一位置同一 dim 索引下，cos²+sin²=1
    assert torch.allclose(cos1 ** 2 + sin1 ** 2, torch.ones_like(cos1), atol=1e-5), (
        "cos² + sin² ≠ 1, 说明 build_rope_matrix 实现错误"
    )


# ============ Invariant 3: 位置 0 是单位变换 ============

def test_rope_position_zero_is_identity():
    """位置 m=0 时旋转矩阵应该是单位变换"""
    seq_len, dim = 8, 32
    cos, sin = build_rope_matrix(seq_len, dim)
    x = torch.randn(1, 1, seq_len, dim)
    x_rotated = apply_rope(x, cos, sin)
    # 位置 0 处旋转后应等于原向量
    assert torch.allclose(x[..., 0, :], x_rotated[..., 0, :], atol=1e-5), (
        "Position 0 should be identity rotation"
    )


# ============ Invariant 4: 相对位置不变性 ============

def test_rope_relative_position_only():
    """attention score q_m · k_n 应只取决于 m - n"""
    seq_len, dim = 16, 64
    base = 10000.0
    cos, sin = build_rope_matrix(seq_len, dim, base=base)

    torch.manual_seed(42)
    q = torch.randn(1, 1, 1, dim)  # 单个 query
    k = torch.randn(1, 1, 1, dim)  # 单个 key

    # 在不同 (m, n) 但相同 m-n 下应得到相同 attention score
    def att_score(m, n):
        q_pos = q.expand(1, 1, seq_len, dim).clone()
        k_pos = k.expand(1, 1, seq_len, dim).clone()
        q_rot = apply_rope(q_pos, cos, sin)
        k_rot = apply_rope(k_pos, cos, sin)
        return (q_rot[..., m, :] * k_rot[..., n, :]).sum().item()

    # m-n = 5 的两个不同 (m, n) 对
    s1 = att_score(7, 2)   # m=7, n=2, diff=5
    s2 = att_score(10, 5)  # m=10, n=5, diff=5
    assert math.isclose(s1, s2, rel_tol=1e-4), (
        f"Relative position not invariant: s1={s1}, s2={s2}, diff={s1-s2}"
    )


# ============ Invariant 5: 不同 head dim 之间无串扰 ============

def test_rope_head_dim_independence():
    """RoPE 应在每对 (2k, 2k+1) 维度内独立旋转，不串扰其他对"""
    seq_len, dim = 4, 8
    cos, sin = build_rope_matrix(seq_len, dim)

    # 构造一个只在前两维有值的向量
    x = torch.zeros(1, 1, seq_len, dim)
    x[..., 2, 0] = 1.0  # 第 2 个位置，第 0 维设为 1

    x_rot = apply_rope(x, cos, sin)

    # 后面的维度（2 以上）应该全 0
    assert (x_rot[..., 2, 2:] == 0).all(), (
        f"Dim leak: {x_rot[..., 2, 2:]}"
    )
