# MEMORY · 跨会话记忆索引

> 这是 Agent 每次新对话自动加载的"记忆地图"。
> **保持这个文件 ≤ 200 行**——它是索引，不是百科。
> 每条记忆是一个独立 `.md` 文件，放在 `memory/` 下。

## 使用方法

每条 entry 一行：`- [Title](path/to/file.md) — one-line hook (≤150 chars)`

Agent 读这个索引时根据 hook 决定哪条记忆值得展开读。

## 当前记忆条目

- [User Profile](memory/user_profile.md) — 我是谁，在做什么研究，AI 应该怎么称呼我
- [Writing Style](memory/writing_style.md) — 我的写作风格偏好（语言、术语、引用风格）
- [Research Focus](memory/research_focus.md) — 当前主要研究方向和已经走过的路线
- [Tooling Preferences](memory/tooling_preferences.md) — 我偏好的工具 / 框架 / 库（避免每次重复说）

<!-- 怎么加新条目：
1. 在 memory/ 下建一个 .md 文件，前面加 frontmatter（参考已有模板）
2. 在这个文件加一行 entry
3. Agent 下次会话时会自动看到
-->

## 不要加的内容

- ❌ 当前对话的临时上下文（用 conversation 处理）
- ❌ 项目代码 / 文档（Agent 直接读源码）
- ❌ Git 历史信息（git log / blame 是真理）
- ❌ 已经在 CLAUDE.md 里的内容

## 一些经验法则

- **memory 不是越多越好**：每加一条都是 Agent 的上下文负担
- **过期就删**：如果某条信息已经过时（比如"我在做 X 课题"已经结题），及时删
- **保密信息别进 memory**：API key / 密码 / 个人隐私 — Agent 可能在某些场景把它们打印出来
