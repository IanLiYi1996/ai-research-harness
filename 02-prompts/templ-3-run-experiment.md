# templ-3 · 跑实验（替代 "帮我实现 X"）

## 背景

**烂 prompt 长什么样**：

> "帮我实现 RoPE positional encoding"

**输出会是**：100 行代码，AI 自信地说"测试通过！完美！"。你跑一下：**结果是错的**。

> Anthropic 的 Prithvi Rajasekaran：
> *"Out of the box, Claude is a poor QA agent."*

**好 prompt 应该做的**：让 AI 在写代码之前先**把 "什么叫做对" 写成可执行测试**——这就是 TDD-first。

## Prompt 模板

```
我要实现 [algorithm name]。请按 test-driven-development 流程：

1. 先列出 5 条这个算法必须满足的数学/物理 invariant（不变性）
   每条要可以转化为可执行测试（避免 "看起来合理" 这种不可测的描述）

2. 把这 5 条 invariant 写成 pytest 测试代码（保存到 tests/test_invariants.py）
   测试应该 RED（因为还没实现）

3. 现在写实现（保存到 src/<module_name>.py）

4. 跑测试 pytest tests/test_invariants.py -v，把完整输出贴回来
   不要只说 "测试通过"——要把 verbose 输出贴出来

5. 测试 GREEN 后，启动一个 sub-agent reviewer：
   "批判性审查这段实现，验证数学正确性，找潜在 bug 和未覆盖的边界情况"
```

## 使用示例

**输入**：

```
我要实现 RoPE (rotary positional encoding) 的 forward pass。请按 test-driven-development 流程...
(上面完整模板)
```

**期望 5 条 invariant**（参考）：

```python
def test_invariant_1_orthogonality():
    """RoPE 矩阵是正交的：R^T R = I"""

def test_invariant_2_periodicity():
    """周期性：R(theta) == R(theta + 2π)"""

def test_invariant_3_rotation_preserves_norm():
    """保持向量范数：||R x|| == ||x||"""

def test_invariant_4_relative_position_only():
    """相对位置不变：(R(m) q)^T (R(n) k) 只取决于 m-n"""

def test_invariant_5_no_position_zero_change():
    """位置 0 的旋转矩阵是单位矩阵"""
```

## 关键质量信号

- ✅ Step 1 列的 invariant 都是**可测量的**（不是"应该 work"这种话）
- ✅ Step 2 测试代码**先 RED**（你看到红色失败信息）
- ✅ Step 4 贴的是**完整 verbose 输出**而不是"通过"两个字
- ✅ Step 5 reviewer **真的找到问题**（如果它说"完全没问题"——可能是它在 confidently praising，换个角度问）

## 故障排查

| 输出问题 | 修法 |
|---|---|
| Agent 直接写实现，跳过测试 | 加粗 "**测试先写，且必须先 RED**" |
| Invariant 太抽象（"应该正确"） | 强制 "**每条 invariant 必须能用 ≤ 5 行 pytest 表达**" |
| Reviewer 说"无问题" | 重启 sub-agent 用更狠的 prompt：你的任务是找出至少 2 个潜在 bug。如果你找不到，重读代码。 |
| 测试通过但实际跑出来错 | 多半是测试覆盖不够；要求 reviewer "**这些测试遗漏了哪些边界情况？**" |

## 进阶：故意 break 来验证测试质量

写完测试后，故意改坏实现一行（比如把 cos 换成 sin），跑测试：

- 如果测试**红**了 → 测试质量好
- 如果测试还**绿** → 测试质量差，加更多 invariant

这是 **mutation testing** 的迷你版，研究员该有的本能。

## 一些口诀

- **判据先行**：测试是"什么叫做对" 的代码表达
- **完整输出，不要简称**：让 AI 贴 verbose 输出，不要让它给你"测试通过"四个字
- **不让 AI 评自己**：每个实现必须有独立 reviewer 审过
- **故意翻车**：偶尔故意诱导 AI 出错，验证你的判据是否真的能抓出错误
