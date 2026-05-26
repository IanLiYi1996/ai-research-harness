"""
Minimal Agent Loop · ~30 lines
==============================

剥掉所有 harness 装饰，只保留 agent 的核心：

    while not done:
        ask LLM what to do
        if it wants to use a tool: run the tool, append result
        if it wants to stop: stop

这就是 Claude Code / Cursor / Codex 内核做的事——围绕这个循环再加
memory / skills / sub-agent / permissions / observability ...

跑起来：
    pip install anthropic
    export ANTHROPIC_API_KEY=sk-...
    python code.py "今天 /tmp 里有几个文件？"
"""

import os
import subprocess
import sys

import anthropic

MODEL = "claude-opus-4-7"

TOOLS = [
    {
        "name": "bash",
        "description": "Run a shell command. Returns stdout (truncated to 2KB).",
        "input_schema": {
            "type": "object",
            "properties": {"cmd": {"type": "string"}},
            "required": ["cmd"],
        },
    }
]


def run_bash(cmd: str) -> str:
    """The only tool. One tool + one loop = one agent."""
    out = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
    return (out.stdout + out.stderr)[:2048]


def agent_loop(task: str) -> None:
    client = anthropic.Anthropic()
    messages = [{"role": "user", "content": task}]

    while True:
        resp = client.messages.create(
            model=MODEL,
            max_tokens=2048,
            system="You are a research assistant. Use bash to inspect the user's environment when needed.",
            tools=TOOLS,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": resp.content})

        if resp.stop_reason != "tool_use":
            for block in resp.content:
                if block.type == "text":
                    print(block.text)
            return

        tool_results = []
        for block in resp.content:
            if block.type == "tool_use" and block.name == "bash":
                output = run_bash(block.input["cmd"])
                print(f"\n$ {block.input['cmd']}\n{output}\n")
                tool_results.append(
                    {"type": "tool_result", "tool_use_id": block.id, "content": output}
                )
        messages.append({"role": "user", "content": tool_results})


if __name__ == "__main__":
    task = " ".join(sys.argv[1:]) or "Count the files in /tmp."
    agent_loop(task)
