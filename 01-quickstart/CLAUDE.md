# CLAUDE.md

> 这是给 AI Agent（Claude Code / Cursor / Codex）的项目规则书。
> Agent 进入项目时会自动读这个文件，因此**它是你和 Agent 的契约**。
>
> Cursor 用户：把这个文件改名为 `.cursorrules`
> Codex 用户：改名为 `AGENTS.md`
> 内容套路一致。

## What This Is

A research project on **<your topic>**.

<!-- 一句话说清这是什么。例子：
A research project on long-context efficiency in LLMs. Markdown notes
organized into folders, tracked by a shell CLI.
-->

## Tech / Tools

- AI agent: Claude Code（或 your tool）
- Notes: Markdown
- Versioning: git
- Dependencies: <list your stack — e.g. PyTorch / JAX / Hugging Face / wandb>

## Naming Conventions

| Folder | Pattern | Example |
|---|---|---|
| `papers/` | `YYYY-short-title.md` | `2026-rope-encoding.md` |
| `papers/<slug>/` | figure subfolder | `papers/2026-rope-encoding/fig1.png` |
| `notes/` | `YYYY-MM-DD-title.md` | `2026-04-12-experiment-baseline.md` |
| `experiments/` | `<slug>/` (含 spec.yaml) | `experiments/rope-ablation/` |
| `weekly/` | `YYYY-WXX.md` | `2026-W17.md` |

**重要**：所有文件创建必须遵循上面的 pattern。Agent 看到这个表就会自动按规则命名。

## Paper Reading Workflow

读一篇 paper 时，按 6 步：

1. **Fetch metadata**: 拿到 arXiv ID, title, authors, abstract
2. **Deduplicate**: 检查 `papers/` 下是否已经存在
3. **Read**: 用 `templates/paper-note.md` 的结构填充：
   - 一句话定位
   - 关键 insight (1-3 条)
   - 方法核心 (≤ 200 字)
   - 实验 takeaway (3 个关键数字)
   - 局限（作者承认的 + 我应该追问的）
   - 如果要复现，最小可行版本是什么
4. **Download figures**: 保存到 `papers/<slug>/` 子目录
5. **Link artifacts**: 如果该 paper 有官方 model / dataset，**记录其 registry ID**（HF Hub / GitHub / W&B / 内部）
6. **Update index**: `bash tools.sh index`

## Experiment Workflow

新实验前，**不要立刻写代码**：

1. 在 `experiments/<slug>/` 建子目录
2. 先写 `spec.yaml`（参考 `templates/experiment-spec.yaml`）—— 包含 hypothesis、metric、invariant、registry IDs
3. 先写 invariant 测试（pytest），让测试 RED
4. 再写实现，让测试 GREEN
5. 跑实验时把 config / hyperparam 全部写在 `spec.yaml`，**不要藏在 cell / 命令行**
6. 跑完起一个 sub-agent reviewer 审查输出（"批判性审查这个实验，找潜在 bug"）
7. 失败也要写 `experiments/<slug>/REFLECT.md`：失败原因 + 下次怎么改

## Writing Workflow

写笔记 / 综述前，**不要直接动手**：

1. 用 `superpowers:brainstorming`（或等价 prompt）确定：谁读 / 用途 / 核心结论 / 骨架 / 引用占位
2. 用 `superpowers:writing-plans` 把 spec 转成可执行计划
3. 按计划分节写
4. 写完起 sub-agent reviewer 审稿（"批判性审查，找过度泛化、缺引用、语气不一致"）

## Critical Rules

- **不要让 AI 评自己**：所有产物（代码、笔记、论文段落）写完后必须用独立 sub-agent reviewer 审一遍
- **判据先行**：每个新功能 / 实验，先写测试 / invariant，再写实现
- **稳定 ID**：所有产物（model checkpoint、dataset、paper）必须有 registry ID，不依赖文件路径
- **不要省 spec**：3 千字以下笔记可以直接写，3 千字以上必须 spec-driven

## Memory

跨会话记忆见 `MEMORY.md` 和 `memory/` 目录。每次新会话 Agent 自动注入相关条目。

## Index Refresh

```bash
bash tools.sh index   # 重新生成各文件夹 README 索引
bash tools.sh search <keyword>   # 全仓库搜索
```
