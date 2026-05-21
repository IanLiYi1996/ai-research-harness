# REFLECT · rope-from-scratch

> 这份 reflect 是这个 example 的 "**特别说明**"——记录 templ-3 的 demo 中故意设计的"翻车"环节。

## 跑这个 example 的两阶段

### Phase 1 · 第一次跑（故意翻车）

按 README Step 6 的故意诱导，你跟 Agent 说：

> "为了简化，cos/sin 计算可以用近似——比如在 base=10000 的情况下省略某个因子"

**Agent 大概率会写错**：
- 把 `inv_freq = 1.0 / (base ** (...))` 写成 `inv_freq = 1.0 / (... * 10)`
- 或者把 `repeat_interleave` 漏掉，直接 cat
- 或者旋转方向反了（sin 前面少一个负号）

但**Agent 自评时会说"测试通过！"**——这是因为：
1. 它跑了一个简化版 sanity check（不是完整 5 条 invariant）
2. 或者它根本没真的跑测试，只是"想象" 了一下
3. 或者测试本身覆盖不够，错的实现刚好能通过

**这就是 Self-Evaluation Bias 的活样本**。

### Phase 2 · Reviewer 揪错

按 Step 7 起 sub-agent reviewer，用强 prompt：

> "你是批判性审稿人。审查 src/rope.py 这段实现，验证它是否数学正确。
> 具体检查：
> 1. 旋转矩阵的方向（是逆时针还是顺时针）
> 2. 维度配对（dim/2 配对方式）
> 3. 数值稳定性
> 4. 与 RoFormer paper Equation 13 是否一致
>
> 输出至少 2 个潜在 bug。如果你说"完全没问题"，请重读代码——你可能漏了什么。"

Reviewer 应该能揪出 Phase 1 的错。

## 教训（写回 IMPROVEMENT.md）

**核心教训**：
- ❌ 不要让生成的 Agent 评自己
- ❌ 不要相信"测试通过"的口头报告，要看 verbose 输出
- ❌ 不要为了简化"省略某个因子"——任何省略都要有数学论证

**正面教训**：
- ✅ TDD 让"什么叫做对" 变成代码，**翻车也能被抓住**
- ✅ Reviewer agent 用强 prompt（"你必须找出至少 N 个问题"）效果好

**适用边界**：
- 这个流程适合 **10-50 行的小算法**
- 大型实验不适用（不可能为整个训练 loop 写 invariant）
- 但**最关键的 component（loss 函数 / attention / position encoding）必须 TDD**

## Status

- [x] Phase 1 故意翻车演示（demo 用）
- [x] Phase 2 reviewer 揪错（demo 用）
- [x] 最终实现通过 5/5 invariant
- [x] 教训写回 03-pipeline/3-spec/ddd/IMPROVEMENT.md.template 作为示例

## 下次相关实验前要读的

- 任何"复现 paper 中算法" 的实验，先读这份 REFLECT
- 任何"用 AI 写 numerical kernel" 的任务，先读这份 REFLECT
- 任何"AI 自评 GREEN" 的瞬间，先停一下问自己：要不要起 reviewer
