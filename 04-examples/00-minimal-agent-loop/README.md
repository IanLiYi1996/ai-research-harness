# 00 · Minimal Agent Loop · 30 行剥神秘感

> 第一次看 agent 神秘吗？这个 example 把所有 harness 装饰剥掉——只剩 30 行核心循环。
>
> 看完你会有一个判断：**loop 属于 agent，机制（memory / skills / permissions ...）属于 harness**。

---

## 核心模式（pseudo-code）

```python
def agent_loop(messages):
    while True:
        response = llm.create(messages, tools=TOOLS)
        messages.append(response)

        if response.stop_reason != "tool_use":
            return  # 模型决定停了

        for tool_call in response.tool_calls:
            output = TOOL_HANDLERS[tool_call.name](**tool_call.input)
            messages.append(tool_result(output))
```

**就这些**。Claude Code / Cursor / Codex 的内核都是这个循环——区别只在外面那层 harness。

> 这是从 [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) 学来的视角，强烈推荐去看他们的 20 章拆解。

---

## 跑起来

```bash
pip install anthropic
export ANTHROPIC_API_KEY=sk-...

python code.py "今天 /tmp 里有几个文件？"
python code.py "git log 最近 3 条 commit 是什么"
python code.py "数一下当前目录下 .py 文件总行数"
```

每次跑你能看到模型自己决定执行什么 `bash` 命令。如果命令不对，它会读输出再换一个。

---

## Loop 属于 agent，机制属于 harness

| 你正在看的代码 | 类别 |
|---|---|
| `while True` 循环 | agent loop |
| `stop_reason == "tool_use"` 判断 | agent loop |
| `tool_use_id` 映射 | agent loop |
| **以下都是 harness 机制——本 example<u>都没加</u>**：| |
| `CLAUDE.md` 自动注入 | harness · context |
| `MEMORY.md` 跨会话身份 | harness · context |
| 子 agent 隔离上下文 | harness · lifecycle |
| Permission 拦截危险命令 | harness · governance |
| 工具调用 trace / cost 监控 | harness · observability |
| Skill 按需加载 | harness · context |

**核心论断** · 30 行写出 agent 核心；后面 1000 行都是 harness。

---

## 安全提醒

这个 example 让 agent **直接执行 shell**，没有 permission gate。

跑之前确保：
- 不在生产环境
- 不在有秘密文件的目录
- 你看完代码，确认它不会做危险事

正经用要加 permission 模式（参考 [shareAI-lab s03 Permission](https://github.com/shareAI-lab/learn-claude-code/blob/main/s03_permission/)）。

---

## 下一步

- [01-what-is-harness](../../05-docs/01-what-is-harness.md) · 看 5-component 公式 + Agency 起源
- [03-three-maturity-levels](../../05-docs/03-three-maturity-levels.md) · 你会发现这个 example 是 L1
- [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) · 想从 0 造完整 harness 看 20 章
