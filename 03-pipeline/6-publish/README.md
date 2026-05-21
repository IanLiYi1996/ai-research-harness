# Stage 6 · Publish · 让别人能复现

> **核心问题**：研究产物的"可被发现性"和"可被复用性"。
>
> **范式变化**：研究的"完成"不再是 paper accept，而是**四件套都能被人 git clone**。

## 四件套

研究产物从"论文 + 一坨 colab"升级为：

```
⟨ paper · model · dataset · demo ⟩
```

每件用稳定 ID 互相引用，形成 audit trail。

| 件 | 用什么 registry |
|---|---|
| paper | arXiv（首选） / OpenReview / 自家组主页 |
| model | HF Hub / GitHub Releases / 自家 / ModelScope |
| dataset | HF Datasets / 自家 / DVC |
| demo | HF Space / Streamlit Community / 自托管 |

**关键**：不绑死任何一个 registry，但**每件必须有稳定 ID**。

## 各件的最低要求

### Paper

- arXiv URL（首选——稳定、有 timestamp）
- 或 OpenReview / DOI

### Model

- model card 必须写：
  - `base_model`: 哪个基模型微调来的
  - `datasets`: 用了哪些（registry IDs）
  - `training_config`: 关键超参（或链接到 spec.yaml）
  - `eval_results`: L1 + L2 + L3 三层结果
  - `intended_use` + `limitations`

### Dataset

- dataset card 必须写：
  - `source`: 数据来源（含许可证）
  - `preprocessing`: 怎么处理的
  - `known_biases`: 已知偏差
  - `recommended_splits`: 训练 / 验证 / 测试切分

### Demo

- 一份 reproducible `app.py`（Gradio / Streamlit）
- 含完整 `requirements.txt`
- 输入 / 输出格式明确（不要让用户自己猜）

## 发布检查清单

```markdown
- [ ] arXiv 已上传 / OpenReview 已提交
- [ ] HF Model 已 push（或 GitHub release tag）
- [ ] Model card 三段都填了：超参 / 数据 / eval
- [ ] HF Dataset 已 push
- [ ] Dataset card 含 license + bias 段
- [ ] HF Space demo 能在公网正常跑（亲自打开测一次）
- [ ] 四件套互相 link（paper 引 model ID，model 引 dataset ID，demo 引 model ID）
- [ ] spec.yaml 的 stage_6_publish 字段填完
- [ ] IMPROVEMENT.md 加了本次实验的教训
```

## 时间尺度

⚠️ paper 写作本身**不会因为 AI 变成 2 小时**——一篇 ML paper 即使有 AI 帮，也要 **1-2 周** draft + 反复修改。

但 harness 改变的是：
- **draft 加速 ~2×**（spec-driven 写作）
- **复现链完整**：一次发布，永久能 git clone 跑通

## 模板

### Model card

[`model-card.template.md`](./model-card.template.md)

### Dataset card

[`dataset-card.template.md`](./dataset-card.template.md)

### Demo app.py

[`app.py.template`](./app.py.template) （Gradio 最小可跑示例）

## 关键纪律

- **不要发"半成品"**：四件套缺任一件，等齐了再发
- **card 不是文档，是 metadata**：每个字段都有机器可读的语义
- **互相引用**：paper 引 model ID，model 引 dataset ID——形成网状 audit trail
- **维护责任**：发布后 model 仍然要响应 issue（不维护就明确标 deprecated）

## 长期视角

师弟师妹现在练这件事——你的硕士成果就不只是一篇毕业论文，而是带 **model + dataset + demo** 的真实工程交付，**找工作时含金量天差地别**。
