# Changelog

> All notable changes to this project · 重要变更记录。
> 时间戳采用 ISO 8601。

---

## [Unreleased]

—

## [v1.2.0] · 2026-05-26

### Added · 新增
- **`05-docs/07-glossary.md`** · 20 个术语的详细版（deck 13 个 + 扩展 7 个：三阶段演化 / 5 科学性属性 / L1-L3 成熟度 / 4 件套 / 6 阶段 pipeline / progressive disclosure / resumable execution）
- README · README 顶部加 4 个 badge（License / Use this template / Slides / Changelog）
- README · 一图总览底下加 ETCLOVG 七层分类图
- README · References 段加 TMLR survey（Junjie Li et al. 2026）作为学术第 1 引用
- `06-slides/slides.html` · 第 3 页 Glossary（13 个核心术语 2-column 卡片）

### Changed · 调整
- `06-slides/slides.html` · cover 日期 `2026-05-21 · 75 min` → `2026-05-28`，去掉所有 talk-duration 标记（agenda / demo intro / act kickers / break / Q&A）
- `06-slides/diagrams/fig-etclovg.svg` · L 块标题从 "Lifecycle & Orchestration ★" 缩成 "Lifecycle ★" 防溢出，删掉底部冗余的 EMPIRICAL FINDINGS 段（每个盒子右下角已有 N=xx）
- `05-docs/06-faq.md` · 顶部加 glossary 链接

---

## [v1.1.0] · 2026-05-25

### Added · 新增
- **deck 加 2 页学术背书** · binding-constraint thesis（3 个跨独立团队硬数据）+ ETCLOVG 七层分类
- 9 张 SVG 流程/架构图：fig-pipeline / fig-architecture / fig-six-patterns / fig-maturity / fig-harness-analogy / fig-registry-bus / fig-experiment-flow / fig-science / fig-etclovg

---

## [v1.0.0] · 2026-05-22

### Added · 新增
- 首版 release · 6 个目录的完整 starter kit：
  - `01-quickstart/` · CLAUDE.md / MEMORY.md / templates / tools.sh 4 件套
  - `02-prompts/` · 3 组 prompt 模板（读论文 / 写笔记 / 跑实验）
  - `03-pipeline/` · 6 阶段 pipeline recipes
  - `04-examples/` · 完整 working examples
  - `05-docs/` · 6 篇概念文档（what-is-harness / six-patterns / three-maturity / pipeline / spec-driven / faq + references）
  - `06-slides/` · 完整 38 页 HTML deck（academic-paper 主题）
- 双语 README · 中文 + 英文
- 设置为 GitHub Template Repository
- MIT License + CONTRIBUTING.md + Issue / PR templates
