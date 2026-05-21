# Stage 2 · Digest · 把论文变成知识

> **核心问题**：读完之后 30 分钟产出可复用笔记，而不是"看过就忘"。
>
> **关键纪律**：每篇笔记必须记录 **linked artifacts 的稳定 ID**——这是后面 reproducibility 的钩子。

## 工具栈

| 工具 | 作用 |
|---|---|
| `huggingface-papers` skill | 拿 HF 论文页 markdown（含社区讨论 + 链接的 model/dataset/space） |
| `arxiv-mcp.read_paper` | 拿全文 PDF |
| `hub_repo_details` | 反查 paper 是否有官方 model / dataset |
| [`templ-1`](../../02-prompts/templ-1-read-paper.md) | 6 段结构化 prompt |

## 流程

### 1. 用 templ-1 模板读一篇

```bash
# 在你的研究项目根
./tools.sh paper rope-encoding
# 创建 papers/2026-rope-encoding.md（基于 paper-note 模板）

# 然后让 Agent 按 templ-1 prompt 填充内容
```

### 2. 强制记录 linked artifacts

每篇笔记必须填的两个字段：

```markdown
## Linked Artifacts

- **Models**: <registry-id like `meta-llama/Llama-3-8B`, or `null`>
- **Datasets**: <registry-id, or `null`>
- **Code**: <github URL or `null`>
- **Demo**: <HF Space URL or `null`>
```

**这一步只多花 30 秒**，但是后面所有 reproducibility 的钩子。

### 3. 保存图

```
papers/
├── 2026-rope-encoding.md
└── 2026-rope-encoding/        ← 同名子目录
    ├── fig1-architecture.png
    ├── fig2-results.png
    └── ...
```

## 升级动作

### Re-read 已经读过的 paper

每隔 1-2 个月，用 `tools.sh search <keyword>` 把所有相关笔记拉出来，让 AI 帮你做 mini meta-analysis：

```
搜索 papers/ 下所有标签 #rope #position-encoding 的笔记。
按时间排序，找：
1. 共同的 insight（哪些点重复出现）
2. 矛盾的结论（不同 paper 给出不同方向）
3. 还没人做的 gap

输出一份 mini survey。
```

这就是私人 wiki 在做综述时的杀手级用法。

## 关键纪律

- **不要省 linked artifacts**：哪怕只是 GitHub URL，也比 `null` 强 100 倍
- **不要省 "我从这件事得出 X"**：每篇笔记必须有一句你的判断，不是知识点堆砌
- **图片必须本地化**：远端 URL 会失效；下载到 `papers/<slug>/` 下
- **结构一致 > 内容完美**：模板每个字段都要填，没有就写 `null`
