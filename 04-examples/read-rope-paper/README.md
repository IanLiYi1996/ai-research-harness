# Example · 读 RoFormer / RoPE 论文

> 端到端示例：用 [templ-1](../../02-prompts/templ-1-read-paper.md) 读 RoFormer 论文。

## 目标

把 RoFormer (arXiv:2104.09864) 这篇论文变成结构化笔记，含：
- 一句话定位
- 关键 insight
- 方法核心 + 关键图
- 实验 takeaway 数字
- 局限
- 复现 MVP

## How to reproduce

### 1. 准备项目

```bash
# 假设你已经 clone 了主仓库到 my-research/
cd my-research
cp -r 01-quickstart/{CLAUDE.md,MEMORY.md,memory,templates,tools.sh} ./
chmod +x tools.sh
```

### 2. 用 tools.sh 起 paper 笔记骨架

```bash
./tools.sh paper rope-encoding
# 创建 papers/2026-rope-encoding.md（基于 paper-note 模板）
```

### 3. 让 Agent 按 templ-1 填充

把 [templ-1 prompt](../../02-prompts/templ-1-read-paper.md#prompt-模板) 复制到 Claude Code，把占位换成 `arXiv:2104.09864`。

### 4. 期望产物

- `papers/2026-rope-encoding.md` — 6 段结构化笔记
- `papers/2026-rope-encoding/` — 含 figure 1-3 的子目录
- 笔记里 **Linked Artifacts** 段填了 RoFormer 官方 repo 和 model（如果有）

## 期望产物示例

参考 [`papers/2026-rope-encoding.md`](./papers/2026-rope-encoding.md)（这是已经跑过的 reference 输出）。

## 关键质量信号

- ✅ 第 4 段每个数字都有 page / table 引用
- ✅ 第 6 段 "复现 MVP" 给了可执行代码框架
- ✅ Linked Artifacts 段里 model + code 都有 URL（不是 null）

## 学到的

跑完这个 example，你应该体会到：

1. **CLAUDE.md 起作用**：Agent 自动按 `papers/YYYY-<slug>.md` 命名
2. **templ-1 起作用**：输出 6 段结构化，不是 abstract 复述
3. **MEMORY.md 起作用**：如果你的 writing_style 写了"中文 + 保留英文术语"，输出会按这个风格

## 试试看：扩展任务

读完 RoPE，让 Agent 自动找 3 篇相关 paper（可以用 arxiv-mcp 的 citation_graph）：

```
基于刚才读的 RoFormer paper（papers/2026-rope-encoding.md），
用 arxiv-mcp 找 3 篇与它最相关的 follow-up 工作，按 templ-1 各读一篇。
保存到 papers/ 下，命名按规则。
```

跑完应该有 4 篇笔记，互相 cross-reference。**这就是私人 wiki 的种子**。
