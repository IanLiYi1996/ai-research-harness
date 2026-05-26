# Changelog

> All notable changes to this project · 重要变更记录。
> 时间戳采用 ISO 8601。

---

## [Unreleased]

—

## [v1.4.0] · 2026-05-26

### Added · 新增 · 引入第二份 2026-05 同月综述（Ning et al. *Code as Agent Harness*）
- `05-docs/references.md` · 学术综述段重组为 A (ETCLOVG · Li) + B (Code-as-Substrate · Ning) 两个视角，并给两者一个对比表
- `05-docs/05-spec-driven.md` · 顶部加"学术背书 · Code as Substrate 视角" 段——用 Ning 的 4 个角色（reasoning / action / environment / verification）给 SDD 的 single-source-of-truth 提供更深的理论支持
- `05-docs/07-glossary.md` · 加术语 **#21 · Code as Substrate · 代码即基底**（含 4 个角色表 + 跟 SDD/ETCLOVG 的关系），互参索引把 Ning 列为"学术综述 B"
- 互参索引同时加 [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) 作为造 harness 教程

## [v1.3.0] · 2026-05-26

### Added · 新增（受 [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) 启发）
- **`04-examples/00-minimal-agent-loop/`** · 30 行 minimal agent loop 示例 + README，剥神秘感
- `05-docs/01-what-is-harness.md` · 加 3 段：
  - "Agency 来自模型，不是 harness" 起源视角
  - **Harness 5-component 公式** (Tools + Knowledge + Observation + Action + Permissions)
  - 反面教材：提示词水管工 / GOFAI 还魂 / 一次性 RAG ≠ harness
- `05-docs/07-glossary.md` · 加术语 #01.5 · 5-component 公式（速记版 vs ETCLOVG 学术版）
- `README.md` · 加 cross-domain 泛化表（实验生物 / 临床 / 工程仿真 / 社科）
- `README.md` · 加 "范围说明 · 本仓库不包含什么" 段
- `README.md` · 加"用 harness vs 造 harness"仓库定位表，链 learn-claude-code

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
