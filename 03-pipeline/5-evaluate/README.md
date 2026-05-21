# Stage 5 · Evaluate · 三层评测

> **核心问题**：模型表面 work 不等于真 work。
>
> **关键洞察**：三层都过 = 真 work；只过 L1 = 表面 work（90% 的 "work" 其实在这一档）。

## 三层评测

### L1 · 标准 benchmark（跨模型可比）

| 工具 | 覆盖 |
|---|---|
| `lm-evaluation-harness` | mmlu / hellaswag / gsm8k / 数十种通用 benchmark |
| `bigcode-evaluation-harness` | HumanEval / MBPP 等代码任务 |
| `nemo-evaluator` | NeMo 框架内置 |

**作用**：跨模型可比，给同行一个共同语言。
**陷阱**：单跑 1 个 benchmark 自我安慰——"看起来比 baseline 高了"。

### L2 · Spec invariant tests（domain-specific）

从 spec.yaml 的 `invariants` 字段派生 pytest：

```python
# tests/test_invariants.py
def test_orthogonality():
    """RoPE invariant 1: R^T R = I"""
    R = build_rope_matrix(theta=0.5)
    assert torch.allclose(R.T @ R, torch.eye(R.shape[0]), atol=1e-5)

def test_periodicity():
    """RoPE invariant 2: R(theta) == R(theta + 2pi)"""
    R1 = build_rope_matrix(theta=0.5)
    R2 = build_rope_matrix(theta=0.5 + 2 * 3.14159)
    assert torch.allclose(R1, R2, atol=1e-4)

# ... 5 条 invariant
```

**作用**：把"什么叫做对" 写成可执行代码，**有明确的 RED 信号**。
**陷阱**：测试覆盖不够，错误的实现也能 GREEN。用 mutation testing 验证（[templ-3](../../02-prompts/templ-3-run-experiment.md)）。

### L3 · Sub-agent reviewer（定性）

复用 [`templ-3`](../../02-prompts/templ-3-run-experiment.md) 末尾的 reviewer prompt：

```
你是一个批判性的审稿人。审查这段实现 + 这些样本输出。

任务：
1. 数学正确性（公式、维度、边界）
2. 边界情况覆盖（empty input / 极大 / 极小 / 越界）
3. 数值稳定性（大数 / 小数 / 梯度爆炸 / NaN）
4. 与 paper / 标准实现的差异

输出：
- 严重问题（必改）：3-5 条
- 改进建议：3-5 条
- 整体评分（1-10）
```

**作用**：抓 L1 / L2 都漏掉的"看起来对但实际不对"。
**关键纪律**：**永远不让生成的 Agent 评自己**——Self-Evaluation Bias 是模型行为，不是 prompt 问题。

## 三层都过才算 work

| 通过情况 | 含义 |
|---|---|
| ✅ L1 + ✅ L2 + ✅ L3 | **真 work**——可发布 |
| ✅ L1 + ✅ L2 + ❌ L3 | 算法对但实现脆弱——修 bug 后再发 |
| ✅ L1 + ❌ L2 | benchmark 高但 invariant 错——可能 leak / overfit |
| ❌ L1 + ✅ L2 + ✅ L3 | 实现对但任务不对——重审 hypothesis |
| ✅ L1 only | **表面 work**——大部分 "突破" 在这档 |

## 时间投入

⚠️ 三层评测要**多花 1-2 天**——这不是节省时间，是**质量投资**。

但这 1-2 天能防止你后面发现"做错了 2 周"的灾难。**便宜的保险**。

## 关键纪律

- **完整输出，不要简称**：让 AI 贴 verbose 输出，不要"测试通过"四个字
- **mutation test 验证 invariant**：故意 break 实现一行，看测试是否抓到——抓不到说明 invariant 太弱
- **Reviewer 必须是独立 agent**：不能用同一个 session 让 AI "再 review 一遍"
- **失败也是 evaluate 的产物**：负结果（X 不 work）和正结果一样有价值，也要记录

## 自动化 hint

```yaml
# spec.yaml
stage_5_eval:
  l1_benchmarks: [mmlu, hellaswag, gsm8k]
  l2_invariants_test: ./tests/test_invariants.py
  l3_reviewer:
    enabled: true
    sample_size: 50      # 给 reviewer 看多少个输出样本
    prompt_template: ./reviewer_prompt.md
```

跑评测时一行命令：

```bash
# pseudocode
./tools.sh evaluate experiments/<slug>
# 自动跑 L1 + L2 + L3，输出到 experiments/<slug>/eval/
```
