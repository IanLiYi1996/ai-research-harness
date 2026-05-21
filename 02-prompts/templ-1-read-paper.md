# templ-1 · 读论文（替代 "总结这篇 paper"）

## 背景

**烂 prompt 长什么样**：

> "帮我总结这篇 paper：[arxiv link]"

**输出会是**：abstract 的复述 + 几句空话，没有方法细节、没有数字、没有"复现成本"判断。

**好 prompt 应该做的**：把 paper 变成**6 段结构化笔记**，且包含"如果我要复现，最小可行版本是什么"——这一条逼 AI 不停留在 abstract 层。

## Prompt 模板

```
请按以下结构总结 [arXiv:XXXX.XXXXX] 这篇论文：

1. 一句话定位：它在做什么、与最相关的 1-2 项前序工作的差异
2. 关键 insight：1-3 条，每条 ≤ 30 字
3. 方法核心：用 1 张架构图说明 + 不超过 200 字
4. 实验 takeaway：3 个最关键数字（带引用页码或 table 编号）
5. 局限：作者自己承认的 + 我应该追问的
6. 如果我要复现，最小可行版本是什么（base model / dataset / 关键超参 / 必须满足的 invariant / 估计 GPU 小时）

# 额外要求
- Linked Artifacts：列出 paper 链接的所有 model / dataset / code / demo（含 registry ID 如 huggingface.co/xxx）
- 输出按 templates/paper-note.md 的结构
- 保存为 papers/YYYY-<short-slug>.md，图片放 papers/YYYY-<short-slug>/
```

## 使用示例

**输入**：

```
请按以下结构总结 arXiv:2104.09864 这篇论文（RoFormer / RoPE）：
... (上面的完整模板)
```

**期望输出**（关键质量信号）：

- ✅ "一句话定位" 提到 RoPE 与之前 absolute / relative position encoding 的差异
- ✅ "关键 insight" 包含旋转矩阵的核心数学性质
- ✅ "实验 takeaway" 给出至少 3 个具体数字带页码
- ✅ "复现 MVP" 给出可执行的最小代码框架
- ✅ Linked Artifacts 列出 GitHub repo 和 HF model（如果有）

## 期望输出参考

参考 `04-examples/read-rope-paper/papers/2026-rope-encoding.md`。

## 故障排查

| 输出问题 | 修法 |
|---|---|
| 第 4 段没有具体数字 | 强调 "**带引用页码或 table 编号**"；如果还不行，让 AI 用 arxiv-mcp 重新读全文 |
| 第 6 段太抽象 | 明确说 "给我可以直接 copy-paste 的代码框架，不要伪代码" |
| 编造的 paper 名字（hallucination） | 这是 Discover 阶段没用对工具——必须先用 paper_search / arxiv-mcp 拿真实元数据 |
| 没有按命名规则保存 | CLAUDE.md 里命名规则没写清；回去补 |

## 进阶用法

读完一组 paper（5-10 篇）做 mini survey 时，先用这个模板单独读每篇，再用 [templ-2](./templ-2-write-notes.md) 整合。
