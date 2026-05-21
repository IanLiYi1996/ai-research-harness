# 06 · Slides · 完整分享 deck

> 75 分钟 35 页 HTML 演讲稿，含中文逐字稿（speaker notes）、SVG 流程图、5 主题切换。

## 怎么用

```bash
# 直接浏览器打开
open slides.html
# 或
firefox slides.html
xdg-open slides.html
```

## 键盘操作

- `← →` · `Space` · `PgUp/PgDn` 翻页
- `S` 进入演讲者视图（弹窗：当前页 / 下一页 / 逐字稿 / 计时器）
- `T` 切主题（academic-paper / swiss-grid / minimal-white / blueprint / rose-pine 循环）
- `F` 全屏
- `O` 总览（缩略图）
- `R` 重置计时器（演讲者模式内）
- `Esc` 关闭弹窗

## 内容结构

| 段 | 页 | 主题 |
|---|---|---|
| 1 | 1-3 | Cover + Agenda + Hook (3 道自查) |
| 2 | 4-7 | 什么是 Harness + 病根 + 架构 + 6 模式 |
| 3 | 8-9 | 3 层成熟度 + 3 组 prompt 模板 |
| 4 | 10-21 | AI Pipeline 6 阶段 + Registry + 流程对比 + 科学性 + spec.yaml |
| 5 | 22-29 | 三幕 demo（读论文 / 写笔记 / 跑实验） |
| 6 | 30-35 | 最小动作清单 + 4 件套 + Takeaway + 参考资料 |

## 8 张图

`diagrams/` 下 8 张 SVG，academic 工程蓝风格：

- `fig-harness-analogy.svg` — LLM 单干 vs LLM in harness
- `fig-architecture.svg` — Claude Code 5 层架构
- `fig-six-patterns.svg` — 6 大设计模式
- `fig-maturity.svg` — 3 层成熟度阶梯
- `fig-pipeline.svg` — 6 阶段流水线 + REFLECT 闭环
- `fig-registry-bus.svg` — Artifact Registry 总线
- `fig-experiment-flow.svg` — 散点 vs 管线流程对比
- `fig-science.svg` — 5 个科学性属性

每张 SVG 独立可编辑——直接改文件就改图。

## 给同行用

如果你想用这份 deck 做自己的分享：

1. 复制整个 `06-slides/` 到你的环境
2. 改 `slides.html` 第 24 行的署名 `<Your Name>`
3. 按 `T` 切主题挑你喜欢的
4. 用演讲者视图（按 `S`）准备逐字稿——每页 `<aside class="notes">` 有 150-300 字提词

## 风格 / 工具

- HTML PPT 工具：[lewislulu/html-ppt-skill](https://github.com/lewislulu/html-ppt-skill)
- 字体：Latin Modern Roman / Georgia serif
- 图：纯 SVG（无外部依赖）
- 离线工作：除了首次加载 Google Fonts，全程不需要网络

## 内容来源

slides 内容综合自：
- 4 篇 Anthropic / OpenAI harness 工程博客
- AWS AIDLC pitch deck（Phase 1/2/3 evolution model）
- 实践经验（用 Claude Code 做研究的真实工作流）

详细引用见 [`05-docs/references.md`](../05-docs/references.md)。
