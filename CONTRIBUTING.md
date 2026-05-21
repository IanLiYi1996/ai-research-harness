# Contributing

欢迎贡献！这个仓库的目标是**让用 AI 做科研变成一种可学习、可重复、可累积的实践**。

## 我们最想要的贡献（按价值排序）

### 1. Case Studies · 你怎么用的（最有价值）

如果你或你的课题组用了这个 kit，把经验写成一份 case study：

- **路径**：`04-examples/<your-case-name>/`
- **内容**：你的研究方向、用到了 kit 的哪部分、跑完什么产物、踩了什么坑、怎么解决
- **入口**：开 [`case-study` issue](./.github/ISSUE_TEMPLATE/case-study.md) 让我们先讨论再 PR

**好的 case study 长什么样**：
- 至少有一份真实跑通的 spec.yaml 或 paper note
- 写清楚"如果重做一次，我会怎么改"
- 有明确的"适用边界"——不要让别人误用

### 2. 新的 Pipeline Recipes

某个阶段（Discover / Digest / Spec / Build / Evaluate / Publish）你有更好的方案？

- **路径**：`03-pipeline/<stage>/<your-recipe>.md`
- **要求**：
  - 一句话定位（"这个 recipe 解决什么问题"）
  - 至少一份 working code / config 示例
  - 与 kit 现有 recipe 的差异说明（什么时候用你的，什么时候用现有的）

### 3. Prompt 模板

`02-prompts/` 收的不是"花哨的 prompt"，是**经过反复验证的、能稳定产出 X 的模板**。

- 必须有"用过 N 次以上"的实证
- 标注模型版本和适用边界（"在 Claude 4.7 上稳定，GPT-5 上效果差"）
- 不接受"理论上应该 work"的 prompt

### 4. 文档 / 翻译 / 排版改进

- 看到不通顺的句子、过时的引用、错误的数字 → PR welcome
- 翻译到中/英以外的语言 → 单独建子目录 `<lang>/` 放翻译版

### 5. 工具 / Skill 集成

如果你写了让这套 harness 跑得更顺的 helper（比如更好的 `tools.sh`、新的 Claude skill），欢迎贡献。

## 我们暂时不接收的贡献

- ❌ 商业广告、产品推销
- ❌ "我帮你重构了一下" 的纯风格 PR（除非也带功能改进）
- ❌ 绑定特定厂商的 lock-in（HF / OpenAI / Cursor 都欢迎，但不要排他）
- ❌ "AI 自动生成" 的 PR 但作者自己没读过

## 提交流程

1. **先开 issue 讨论**（除非是错别字 / 失效链接这种 trivial 修复）
2. Fork → 改 → push to your fork
3. PR 标题用 imperative：`Add: ...` / `Fix: ...` / `Update: ...`
4. PR 描述里说清楚：**为什么需要这个改动 + 你怎么验证它 work**

## 风格约定

- **中文写作**：技术词保留英文（spec, harness, registry, pipeline）
- **代码风格**：能跑 > 漂亮 > 简洁。先跑通再优化
- **commit 信息**：能用 emoji 但别堆砌；写清楚 *为什么* 不是 *什么*
- **目录命名**：`<number>-<kebab-case>` 比如 `01-quickstart`

## 行为准则

简单——**别让别人觉得不舒服**。具体点：

- 对不同水平的研究者保持耐心（这个仓库有相当一部分受众是硕士新生）
- 批评 idea 不批评人
- 如果有人 PR 了不太好的方案，给具体建议而不是 "这不好" 三个字

## 一些约束（防止仓库变成 lock-in）

- **不要假设 Claude Code 是唯一选项**：`CLAUDE.md` 在文档里要标注"也叫 AGENTS.md / .cursorrules，看你用什么 agent"
- **不要假设 HF 是唯一 registry**：所有"产物 ID"的描述要保留 GitHub / W&B / ModelScope / 本地 manifest 的可能性
- **不要假设大家都用 Linux/Mac**：核心脚本要在 Windows WSL / pure Windows 也能跑（不行就明确写"Windows 用户用 Git Bash"）

## 维护者承诺

- 24-72 小时内回应所有 issue 和 PR
- 不会把 PR 拖一周以上不理
- 重大决策（改目录结构、改命名规范）会在 issue 公开讨论 5-7 天再合并

谢谢你愿意贡献。让我们一起把"用 AI 做科研"做成一门**可教、可学、可累积**的工程实践，而不是个人手艺。
