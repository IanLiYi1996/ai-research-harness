# 4 · AI 研究 Pipeline · 6 阶段总览

> 把"用 AI 做研究"从抽象口号落到具体阶段。

![pipeline](../06-slides/diagrams/fig-pipeline.svg)

## 6 个阶段

| 阶段 | 核心问题 | 时间尺度 |
|---|---|---|
| ① Discover | 找该读什么 | 日常 |
| ② Digest | 把论文变成知识 | 小时级 |
| ③ Spec | 想法 → 假设 | 天级 |
| ④ Build | 数据 + 模型 + 训练 | **周-月级** |
| ⑤ Evaluate | 三层评测 | 天级 |
| ⑥ Publish | 让别人能复现 | 周级 |

详细见 [`03-pipeline/`](../03-pipeline/) 各阶段 README。

## 时间尺度的诚实

⚠️ 研究 pipeline 的时间尺度天然在**周-月级**，单点加速比意义不大。

很多文章吹"AI 让研究 10× 快"——这是**误导**。真实情况：

| 阶段 | AI 之前 | AI + Harness | 真实变化 |
|---|---|---|---|
| Discover | 读不完 | 推送 + auto digest | **覆盖率：0 → 1** |
| Digest 单篇 | 45-90 min | 10-15 min | 4-6× |
| Spec | 脑子里转 1-3 天 | brainstorm 半天 | 前期阻力下降 |
| Build (单 component) | 4-8 hr | 1-2 hr | 4× |
| Build (**真实实验**) | 周-月 | 周-月 | **不变** |
| Evaluate | 跑 1 个 benchmark 自慰 | 多花 1-2 天三层评测 | 质量阶跃 |
| Publish (draft) | 2-4 周 | 1-2 周 | ~2× |

### 关键认知

> **真实实验本身不会变快**——训练就是要烧那么多 GPU 小时。
>
> Harness 改变的是 **"实验能不能算数"**：可重复 / 可证伪 / 可审计 / 可累积 / 可比较。

详见 [05 · Spec-Driven](./05-spec-driven.md) 和 [04 · Pipeline](./04-pipeline-overview.md) 中的"5 个科学性属性"。

## 输入 = 输出

研究 pipeline 的一个深层观察：

```
① Discover 的输入（你读到的 paper）
    ↓
是别人 ⑥ Publish 的输出
    ↓
你 ⑥ Publish 的产物
    ↓
是另一个研究者的 ① Discover 的输入
```

**研究的输入和输出是同一类对象**——靠稳定 ID 互相引用形成网状。

这就是为什么 [`03-pipeline/6-publish/`](../03-pipeline/6-publish/) 强调四件套（paper × model × dataset × demo）—— 每一件都必须能成为下一个研究者的 Discover 输入。

## Artifact Registry · 把 6 阶段串起来

把 pipeline 6 阶段连接的"总线"是 **Artifact Registry**——任何能给产物提供"稳定 ID + 元数据 + 跨阶段引用"的系统。

| 你的场景 | 推荐 Registry |
|---|---|
| NLP / 大模型 | Hugging Face Hub |
| CV / 通用 ML | GitHub Releases · 自有 S3 |
| 实验追踪 · 中间产物 | W&B Artifacts · MLflow |
| 国内合规 / 中文社区 | ModelScope |
| 课题组内部 | DVC · 内部 manifest.json |

**关键不是用哪个 Registry**——而是**"凡是产物，必须有稳定 ID"** 这个纪律。

## 5 个科学性属性

新流程相比旧的"散点式实验"，让科研方法论的 5 个基本属性从"自觉"变成"机械化保证"：

| 属性 | 由哪个 harness 部件保证 |
|---|---|
| ① 可重复 (Reproducible) | spec.yaml 锁定 base_model / dataset / hyperparam 的 registry ID |
| ② 可证伪 (Falsifiable) | TDD invariant 把"什么叫做对" 写成可执行代码 |
| ③ 可审计 (Auditable) | DDD 文档 + wandb run + reviewer log |
| ④ 可累积 (Compounding) | REFLECT 把失败原因写回 DDD，下次自动避坑 |
| ⑤ 可比较 (Comparable) | 三层评测 + 标准 metric |

> **"AI 加速科研" 的真正意义不是跑得快——是让 5 个属性从"自觉"变成"机械化保证"。**

## 不要全做完才上手

每个阶段都有"最小动作"——本周内能动手的版本。**先挑一段闭环跑通，再扩展**。

| 阶段 | 本周最小动作 | 一个月升级 |
|---|---|---|
| Discover | 订阅 1 个 watch_topic | cron 跑 auto-digest |
| Digest | 用 templ-1 写 5 篇笔记 | 每篇都补 registry IDs |
| Spec | 下个 idea 不写代码，先写 spec.md | spec.yaml 串起 build/eval/publish |
| Build | 用 axolotl YAML 跑一次 LoRA | 所有超参进 config，全程 wandb |
| Evaluate | 下次实验跑 lm-eval-harness | 三层评测全做 |
| Publish | push 1 个 model 或 dataset | 硕士论文交付四件套 |

## 推荐阅读

- 实操：[`03-pipeline/`](../03-pipeline/) 各阶段 README + recipe
- 理论：[05 · Spec-Driven](./05-spec-driven.md)
- 更早期工作：[06 · FAQ](./06-faq.md)
