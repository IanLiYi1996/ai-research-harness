# 6 · FAQ · 常见问题

## 入门

### Q: 我连 Claude Code 都没装，从哪开始？

A: 不一定要 Claude Code。这个 kit 的概念跟工具无关：

- **Claude Code** 用 `CLAUDE.md`
- **Cursor** 用 `.cursorrules`
- **OpenAI Codex** 用 `AGENTS.md`
- **Continue / Cline / aider** 多数都支持自己的项目规则文件

把 [`01-quickstart/CLAUDE.md`](../01-quickstart/CLAUDE.md) 复制改名即可，95% 内容不用改。

### Q: 我没有 Claude / GPT 订阅怎么办？

A: 本地模型也行：

- Ollama + Llama 3.x / Qwen 2.5
- LM Studio + 任意 GGUF 模型
- vLLM / sglang 自托管

**但**：本地模型对 long-context + tool calling 支持普遍弱，所以 quickstart 里的"读论文工作流"可能要简化。

### Q: 学这个会不会过时？

A: **基础概念不会**。

Harness 本身有一个特性：**模型升级时做减法**——更强的模型让某些 harness 部件变得多余，但**整体框架仍在**。

Anthropic 的 Justin Young (2025-11) 写的 V1 用了 5 个文件；半年后 Prithvi (2026-03) 写的 V2 删掉了 2 个、加了 1 个。Pattern 变了，**核心理念没变**。

### Q: 这套对硕士毕业论文最有用的是哪段？

A: 看你阶段：

- **第一年**：Discover + Digest（建私人 wiki）→ [`01-quickstart`](../01-quickstart/) + [`02-prompts`](../02-prompts/)
- **第二年**：Spec + Build（开始做实验）→ [`03-pipeline/3-spec/`](../03-pipeline/3-spec/) + [`03-pipeline/4-build/`](../03-pipeline/4-build/)
- **毕业前**：Evaluate + Publish（交付四件套）→ [`03-pipeline/5-evaluate/`](../03-pipeline/5-evaluate/) + [`03-pipeline/6-publish/`](../03-pipeline/6-publish/)

## 工程问题

### Q: 我课题组没人用 AI 怎么办？

A: 个人先用，把产出（结构化笔记、可复现 spec.yaml、四件套发布）展示给导师。**自下而上**。

不要试图去说服全组改流程——成本太高。先用自己 work 出来 ROI，再扩散。

### Q: AI 写论文的学术伦理？

A: **区分"AI 写"和"AI 协助"**。

- ❌ "AI 写整篇 paper，我挂名" — 不可接受
- ✅ "我提出 idea / 设计实验 / 解读结果，AI 帮我整理文字" — 多数会议接受

关键是 **transparency** + **跟导师沟通**。许多顶会现在要求声明 AI 用法（NeurIPS / ACL / ICML 都有相关 policy）。

### Q: 实验代码涉密怎么办？

A: 看你的"密"指什么：

- **数据涉密**：用本地模型（Ollama）+ 禁联网模式。Claude Code 有 hook 系统可以拦截敏感数据。
- **算法涉密**：抽象化 spec.yaml，把 "method: <our-secret-thing>" 放在私有引用。
- **结果涉密**：发布阶段晚一点——四件套可以等到论文发表后再 push。

### Q: spec.yaml 是不是过度工程？

A: 看场景：

- ✅ 跨学期 / 跨人合作的项目 → 强烈建议
- ✅ 你想 6 个月后还能复现今天的实验 → 强烈建议
- ⚠️ 单人单次实验 / 一周内能跑完 → 可省略，但写成习惯了反而不慢

经验法则：**实验时间 > 1 周 = 必须 spec-driven**。

### Q: 6 阶段都做完成本太高怎么办？

A: **不要一次做完全**。每阶段都有"最小动作"——本周内能动手的版本：

| 阶段 | 本周最小动作 |
|---|---|
| Discover | 订阅 1 个 watch_topic |
| Digest | 用 templ-1 写 5 篇笔记 |
| Spec | 下个 idea 不写代码，先写 spec.md |
| Build | 用 axolotl YAML 跑一次 LoRA |
| Evaluate | 跑一次 lm-eval-harness |
| Publish | push 1 个 model 或 dataset |

**挑一段闭环跑通，比 6 段都做半套更有价值**。

### Q: Registry 我用不到 HF Hub 怎么办？

A: 完全 OK——Registry 是抽象概念，不绑定 HF。

| 你的场景 | 替代 |
|---|---|
| CV / 通用 ML | GitHub Releases · 自有 S3 + manifest.json |
| 实验中间产物 | W&B Artifacts · MLflow |
| 国内合规 | ModelScope |
| 课题组内部 | DVC · Git LFS |

关键是**"凡是产物，必须有稳定 ID"** 这个纪律，不是 Registry 选哪家。

## 概念辨析

### Q: harness 和 agent 有啥区别？

A: 详见 [01 · 什么是 Harness](./01-what-is-harness.md) 末尾的对照表：

- LLM = 模型
- Agent = LLM + 工具 + 多轮
- Harness = Agent 的运行框架

**harness 是给 agent 用的基础设施**。

### Q: spec-driven 和 RAG 有啥关系？

A: 不太相关。

- **RAG** 解决的是"模型不知道什么" 的问题（外部知识检索）
- **Spec-driven** 解决的是"实验是什么 / 怎么跑 / 怎么 audit" 的问题（开发流程）

两者可以结合：spec.yaml 里可以引用 RAG 知识库的 ID。

### Q: TDD 在研究里真的能用吗？

A: 可以，但**不是所有研究 component 都需要**。

- ✅ 关键算法（loss 函数 / attention / position encoding）→ 必须 TDD
- ✅ 数据预处理 pipeline → 必须 TDD
- ⚠️ 整个训练 loop → 不可能写 invariant
- ⚠️ 探索性 prototype → spec-driven > TDD

经验：**核心 component 必须 TDD；周边代码不强求**。

### Q: 这套适合工业研究吗？

A: 适合，且**比学术研究更适合**——工业研究通常：

- 项目时间长（6 个月起）
- 团队人数多（≥ 3 人）
- 需要 audit trail（合规需求）
- 需要可复现（产品化必须）

DDD + SDD + TDD 三件套对工业 R&D 团队是 win-win。

## 进阶

### Q: 怎么从 L2 跳到 L3？

A: 看 [03 · 3 层成熟度](./03-three-maturity-levels.md) 里的"升级路径"。简短说：

1. 先把 4 件套用熟（一两个月）
2. 写出领域专属的 pipeline recipes
3. 引入 sub-agent reviewer 作为常态
4. 让 spec.yaml 真的能驱动整个实验

**通常 6-12 个月达到 L3**。

### Q: 我能不能自动化整个 pipeline？

A: 可以，但**不要一次到位**。AIDLC Phase 3 是"Autonomous Pipeline"，但他们也是从 Phase 2 慢慢演化的。

建议：

1. 先把每阶段手动跑通（你点按钮，AI 执行）
2. 然后自动化一段（比如 Discover → Digest 自动）
3. 再自动化更多段
4. 最后才考虑端到端自治

**人类一直在 steer，只是 steer 的频率从 "每分钟" 降到 "每天"**。

### Q: 这跟 LangChain / LlamaIndex / AutoGPT 啥关系？

A:
- **LangChain / LlamaIndex** 是 agent 实现库，跟 harness 是不同层次
- **AutoGPT** 是早期 autonomous agent 实验，可以看作 L3 的早期形态
- **harness** 是更抽象的概念——任何让 LLM 在工程系统里 work 的基础设施都算 harness

简单说：你可以用 LangChain 来 *实现* 一个 harness，但 harness 的概念高于具体框架。

## 没找到答案？

- 看 [References](./references.md) 的 4 篇核心博客
- 提个 [issue](../.github/ISSUE_TEMPLATE/) 让我们补上
