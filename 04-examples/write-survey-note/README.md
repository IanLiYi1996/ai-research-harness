# Example · 写一份 mini survey note

> 端到端示例：用 [templ-2](../../02-prompts/templ-2-write-notes.md) + spec-driven 流程写一份"位置编码方法对比"的 mini survey。

## 目标

聚合 4 篇 paper（RoPE / ALiBi / NoPE / YaRN）的笔记，写一份 1500-2000 字的 mini survey，**带观点、带引用、带表格**。

## How to reproduce

### 1. 准备好笔记

按 [templ-1](../../02-prompts/templ-1-read-paper.md) 先把 4 篇 paper 各读一篇，存到 `papers/`。

### 2. 启动 brainstorming

复制 [templ-2 prompt](../../02-prompts/templ-2-write-notes.md#prompt-模板) 到 Claude Code：

```
我想就 "transformer 位置编码方法对比" 写一份 mini survey。先不要动手。
先一问一答帮我把以下 5 件事确定下来：
...
```

### 3. Brainstorming 输出 spec

Agent 应该一问一答得到 spec：

- 读者：硕士新生（第一年）
- 用途：综述素材 / 引用源
- 核心结论："RoPE 已成事实标准，但 ALiBi 在长上下文外推上仍有优势"
- 骨架：4 节（背景 / 4 方法对比 / 实验对比 / 我的判断）
- 引用占位：每节需要哪些 figure / table

### 4. 生成 writing plan

```
按上面 spec，用 /writing-plans 流程拆成可执行计划。
每节 300-400 字，列出每节核心论点 + 用到的证据。
```

### 5. 分节写

```
按 plan 写第 1 节（背景）。引用真实出处，按 MEMORY.md 里 writing_style 偏好。
```

### 6. Sub-agent reviewer

写完整篇，起独立 sub-agent：

```
你是批判性审稿人。审查这份 mini survey，找：
1. 过度泛化
2. 缺引用的事实陈述
3. 语气不一致
4. "知识点堆砌" 而没有"我从这件事得出 X"的句子
```

## 期望产物

参考 [`notes/2026-MM-DD-position-encoding-mini-survey.md`](./notes/2026-MM-DD-position-encoding-mini-survey.md)（reference output）。

## 关键质量信号

- ✅ Brainstorming 阶段 Agent **真的在问而不是直接动手**
- ✅ 每节末尾有"所以这意味着 X"的判断句
- ✅ 表格对比 4 种方法的 5 个维度
- ✅ Reviewer 至少找出 3 个改进点

## 学到的

跑完这个 example，你应该体会到：

1. **Brainstorming 比直接写质量高 5×**：花 5 分钟问，节省后面 30 分钟改
2. **MEMORY.md 起作用**：你的 writing_style 偏好自动注入
3. **Reviewer 比自评狠**：你以为写得很好的段落，reviewer 揪出 3 处过度泛化

## 一个反例：直接打"帮我写一份位置编码综述"

试一次不用 templ-2，直接打"帮我写位置编码综述"，对比输出：

- 没结构、没核心结论、没观点
- 引用大概率是编的
- "其实"、"显而易见" 满天飞
- 你 3 个月后看不懂

**对比之下你就知道为什么 templ-2 值得**。
