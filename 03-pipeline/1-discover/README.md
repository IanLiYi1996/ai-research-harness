# Stage 1 · Discover · 找该读什么

> **核心问题**：每天 200+ 篇 arXiv，怎么不漏关键工作。
>
> **关键转变**：从 "拉" 变成 "推"——环境主动给你工作。

## 工具栈

| 工具 | 作用 | 用法 |
|---|---|---|
| `hf-mcp.paper_search` | HF Daily Papers + 标签 / 主题 | 抓今天 HF 推荐 |
| `arxiv-mcp.semantic_search` | arXiv 全文语义搜索 | 找特定 idea 的相关 paper |
| `arxiv-mcp.watch_topic` + `check_alerts` | 后台订阅 | 你定义关注主题，新论文 alert |
| `arxiv-mcp.citation_graph` | 引用上下游 | 顺着关键 paper 找前序/后续 |

## 最小动作（本周内能做）

### 1. 订阅 1 个 watch_topic

```
请用 arxiv-mcp 的 watch_topic 订阅：
- topic: "<your research focus, e.g., long-context LLM>"
- 频率：每日
- alert 输出到 inbox/topic-<slug>.md
```

### 2. 每天 5 分钟看 inbox/

把 alert 当成"早上的报纸"——5 分钟扫一遍标题，标记今天值得深读的 1-2 篇。

## 升级动作（一个月）

### Cron + auto-digest

写一个每周一上午跑的 cron，让 Agent：

1. 抓上一周所有 alert
2. 按主题分组
3. 选 1-2 篇 deep dive（高 upvote + 与你 research_focus 强相关）
4. 用 [templ-1](../../02-prompts/templ-1-read-paper.md) 自动消化
5. 输出本周 digest 到 `weekly/YYYY-WXX.md`

## 关键纪律

- **关注主题别多**：3-5 个 topic 已经处理不过来，不要订 20 个
- **alert 不读也不要堆**：超过一周没读完的 alert 该清理就清理；inbox 不是档案馆
- **关注 + 反关注**：定期 review 哪些 topic 的 alert 你 90% 都跳过——该取消订阅
