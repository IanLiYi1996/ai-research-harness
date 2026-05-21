# DDD · 4 Documents · 自治判断的 4 大支柱

> 来源：AWS AIDLC（[awslabs/aidlc-workflows](https://github.com/awslabs/aidlc-workflows)）
>
> AIDLC 提出：每个项目维护 4 个文档，回答自主 Agent 必须解决的 4 个问题。

## 4 个问题

| 文档 | 问题 | 谁负责 | 何时读 / 写 |
|---|---|---|---|
| [PRODUCT.md](./PRODUCT.md.template) | "Should we do this?" | PM / 课题负责人 | 立项时写；EVALUATE / THINK 阶段读 |
| [TECH.md](./TECH.md.template) | "Can we do this?" | 工程负责人 / 学生 | 架构决策时写；BUILD / REVIEW / TEST 阶段读 |
| [IMPROVEMENT.md](./IMPROVEMENT.md.template) | "Have we tried this?" | 全员（实验后写） | EVALUATE / REVIEW 阶段读；REFLECT 阶段写 |
| [PROJECT.md](./PROJECT.md.template) | "Should we do it now?" | 当前 sprint 负责人 | 每周更新；EVALUATE / PLAN / DELIVER 阶段读 |

## 适用场景

- ✅ 跨学期长期项目（一年以上）
- ✅ 跨人合作（≥ 3 人）
- ✅ 你想训练 Agent **自主做决策** 而不是事事问你
- ❌ 单人短期实验（< 1 个月）—— 直接 spec.yaml 就够

## 一些纪律

- **文档不能跨边界**：PRODUCT 不能写技术细节，TECH 不能写战略选择。**single-ownership**
- **写 IMPROVEMENT 是义务**：每次实验失败 / 成功的教训必须沉淀到这里
- **PROJECT 每周更新**：过期的 PROJECT 比没有还糟（误导）

## 进阶

如果你的课题组想完整落地 AIDLC，建议：

1. 先在一个新项目试点（不要在已有项目里改）
2. 维持文档先 1-2 个月，再加 Autonomous Pipeline 自动化
3. 引入 Pipeline Validator 检查文档完整性

参考：reference 里的 AIDLC pitch deck 第 11-13 页。
