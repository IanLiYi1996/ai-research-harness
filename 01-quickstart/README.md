# 01 · Quickstart · 30 分钟跑通

这一目录是**最小可行 harness 4 件套**，让你 30 分钟内从 L1（打字机）跳到 L2（协作者）。

## 4 件套是什么

| 文件 | 作用 | 你要做的 |
|---|---|---|
| `CLAUDE.md` | 项目规则书 + 命名约定 + 工作流 | 复制到根，按你课题改 |
| `MEMORY.md` + `memory/` | 跨会话记忆，每次新对话自动注入 | 复制 + 把 `.template` 文件改成自己的内容 |
| `templates/*.md` | 论文笔记 / 实验 spec / 周报模板 | 复制，按需用 |
| `tools.sh` | 建笔记 / 索引 / 搜索的 shell helper | 复制 + `chmod +x` |

> **Claude Code 用 `CLAUDE.md`，Cursor 用 `.cursorrules`，OpenAI Codex 用 `AGENTS.md`** — 文件名可以换，内容套路一样。

## 30 分钟流程

### Step 1 · 把 4 件套搬到你的项目根（5 min）

```bash
# 假设你已经 clone 了这个仓库到 my-research/
cd my-research

# 把 4 件套移到根
cp 01-quickstart/CLAUDE.md ./
cp 01-quickstart/MEMORY.md ./
cp -r 01-quickstart/memory ./
cp -r 01-quickstart/templates ./
cp 01-quickstart/tools.sh ./
chmod +x tools.sh

# 验证
ls -la
# 应该看到：CLAUDE.md  MEMORY.md  memory/  templates/  tools.sh
```

### Step 2 · 改 CLAUDE.md 适配你的课题（10 min）

打开 `CLAUDE.md`，至少改这三段：

1. **What This Is**：一句话说清你的项目（"这是关于 X 的研究项目"）
2. **Naming Conventions**：你想要的文件命名规则
3. **关键工作流**：你日常做的 1-2 件事流程化（读论文 / 跑实验 / 写周报）

不要追求一次写全。先写最常做的那件事，跑起来再补。

### Step 3 · 把 memory/*.template 填成你自己的（10 min）

`memory/` 目录下每个 `.template` 文件都是一个记忆条目。改名去掉 `.template` 后缀就生效：

```bash
# 例如
mv memory/user_profile.md.template memory/user_profile.md
mv memory/writing_style.md.template memory/writing_style.md
mv memory/research_focus.md.template memory/research_focus.md
```

然后用编辑器打开每个文件，把 `<placeholder>` 换成你的真实内容。

**MEMORY.md 是索引** — 它列出 `memory/` 下哪些文件值得每次新会话自动加载。**保持这个索引文件 ≤ 200 行**。

### Step 4 · 启动 AI agent，跑第一个工作流（5 min）

```bash
claude  # 或 cursor / codex / 你用的任何 agent
```

试一句：

> 按 CLAUDE.md 里的 paper reading workflow，
> 帮我读 [arxiv ID 或 paper 标题]，
> 输出按 templates/paper-note.md 的结构。

如果 Agent 自动按 `papers/YYYY-<slug>.md` 命名 + 按模板填内容 + 自动注入了你 MEMORY 里的偏好（比如"用中文 + 保留英文术语"），**恭喜，你已经在 L2 了**。

## 验证你成功的 4 个信号

| 信号 | 含义 |
|---|---|
| ✅ Agent 一进入项目自动读了 CLAUDE.md | "仓库即世界" 模式起作用了 |
| ✅ 不用每次说"我喜欢中文+保留英文术语" | MEMORY 在工作 |
| ✅ Agent 输出文件按你定义的命名规则保存 | 机械化约束起作用了 |
| ✅ 你删了某个产物，Agent 不会重建错位置 | 命名规则 = 物理约束 |

## 常见问题

**Q: 我用 Cursor，没有 Claude Code？**
A: 把 `CLAUDE.md` 改名为 `.cursorrules`，95% 的内容不用改。Codex 用户用 `AGENTS.md`。

**Q: MEMORY.md 是给 AI 的还是给我自己看的？**
A: 都是。它一份内容服务两种用途——你自己的"项目自传"，以及 AI 每次开会话的背景。

**Q: 4 件套全都是必须的吗？**
A: `CLAUDE.md` 是必须的，其他 3 件可以渐进加。但**MEMORY.md 是从 L1 到 L2 最关键的一步**，强烈建议第一周就上。

**Q: 这套用于团队怎么扩展？**
A: 看 [`03-pipeline/3-spec/ddd/`](../03-pipeline/3-spec/ddd/) ——AIDLC 的 4 文档体系（PRODUCT/TECH/PROJECT/IMPROVEMENT）就是为团队设计的。

## 下一步

- 想看具体 prompt 怎么用？→ [`02-prompts/`](../02-prompts/)
- 想看完整工作流（不止 4 件套）？→ [`03-pipeline/`](../03-pipeline/)
- 想看真实跑通的 example？→ [`04-examples/`](../04-examples/)
