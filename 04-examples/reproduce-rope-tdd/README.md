# Example · 用 TDD-first 流程复现 RoPE

> 端到端示例：用 [templ-3](../../02-prompts/templ-3-run-experiment.md) 复现 RoPE forward pass，**先写测试，再写实现，再用 reviewer 揪 bug**。

## 目标

10 行内可验证的小算法——RoPE rotary positional encoding——的 from-scratch 实现，附 5 条 invariant 测试。

## 为什么选 RoPE

- 数学性质明确（5 条 invariant 容易写）
- 实现 < 30 行
- 故意诱导 AI 出错很容易（角度方向反 / 维度配错）
- 是大模型的真核心组件，理解它有实际价值

## How to reproduce

### 1. 准备实验目录

```bash
cd my-research
./tools.sh experiment rope-from-scratch
# 创建 experiments/rope-from-scratch/{spec.yaml, tests/test_invariants.py}
```

### 2. 让 Agent 写 5 条 invariant

```
请按 templ-3 的流程：先列出 RoPE 必须满足的 5 条数学 invariant。
每条要可以转化为可执行 pytest（避免 "看起来合理" 这种描述）。
```

### 3. 让 Agent 写 pytest 测试

测试**先 RED**（因为还没实现）。

参考期望测试：[`tests/test_invariants.py`](./tests/test_invariants.py)

### 4. 让 Agent 写实现

```
现在写 RoPE forward 实现，保存到 src/rope.py。
```

参考期望实现：[`src/rope.py`](./src/rope.py)

### 5. 跑测试，贴完整输出

```bash
cd experiments/rope-from-scratch
pytest tests/test_invariants.py -v
```

让 Agent 把完整 verbose 输出贴回会话——**不要让它说"测试通过"四个字**。

### 6. 故意诱导翻车（关键演示）

跟 Agent 说：

> "为了简化，cos/sin 计算可以用近似——比如在 base=10000 的情况下省略某个因子"

Agent 大概率会写错（角度方向反 / 维度配错）。但**它自己会说"测试通过！"**。

**这就是 Self-Evaluation Bias 的活样本**——把这一刻指出来给观众看。

### 7. Sub-agent reviewer 揪错

```
启动一个 sub-agent reviewer，用以下 prompt：

你是批判性审稿人。审查 src/rope.py 这段实现，验证它是否数学正确。
具体检查：
1. 旋转矩阵的方向（是逆时针还是顺时针）
2. 维度配对（dim/2 配对方式）
3. 数值稳定性
4. 与 RoFormer paper Equation 13 是否一致

输出至少 2 个潜在 bug。如果你说"完全没问题"，请重读代码——你可能漏了什么。
```

Reviewer 应该揪出问题。修复后重跑测试，**真的通过**。

## 期望产物

- `experiments/rope-from-scratch/`
  - `spec.yaml` —— 含 5 条 invariant + GPU 预算估计
  - `tests/test_invariants.py` —— 5 条 pytest，全部 GREEN
  - `src/rope.py` —— ~30 行 forward 实现
  - `REFLECT.md` —— 失败教训记录（包括"故意诱导翻车"那次）

## 学到的

跑完这个 example，你应该体会到：

1. **TDD 改变思维**：先写"什么叫做对" 再实现，比"先实现再补测试"质量高 5×
2. **Self-Evaluation Bias 是真的**：AI 会自信地说"通过"——你不能信
3. **Reviewer agent 是必须的**：一个独立 agent 揪出来的问题，原 agent 永远揪不出
4. **judging criteria 才是研究员的稀缺力**：能写出 5 条好 invariant 的人，比能写 RoPE 实现的人值钱

## 进阶练习

- 把 RoPE 改成 ALiBi，重复整个流程
- 用 mutation testing 验证你的 invariant 质量（故意 break 实现一行，看测试是否抓到）
- 把这套流程写成 cookiecutter 模板，下次新算法直接套
