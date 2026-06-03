# AgentCore Research Co-pilot — Builder Demo Design

> Spec · 2026-06-03 · AWS Summit Builder booth demo
> Extends the `ai-research-harness` repo with a real, CDK-deployable AgentCore demo.

## 1. Goal & Requirements

Build a **real, runnable demo** for an AWS Summit Builder booth that proves the
`ai-research-harness` "用 harness 做科研" thesis by deploying it onto Amazon
Bedrock AgentCore.

Hard requirements (from the booth brief):

1. **Must use AgentCore.** ✅ Runtime (mandatory) + Memory + Code Interpreter.
2. **Public repo for visitors to fork** (加分项). ✅ GitHub primary + Gitee mirror.
3. **Must not duplicate the industry-zone assets.** ✅ Stays a *research-harness*
   story — explicitly differentiated from the enterprise `data-agent` asset that
   lives in `industry-assets`.
4. **Highlight 2-3 AgentCore services/features**, showing application scenario +
   generality. ✅ Runtime + Memory + Code Interpreter as mainline; Browser /
   Gateway / Observability as pluggable bonus.

### Confirmed decisions

| Topic | Decision |
|---|---|
| Theme | Research harness core (discover → digest → reproduce) + generalization framing |
| Mainline services | Runtime (mandatory) + Memory + Code Interpreter |
| Bonus / pluggable | Browser, Gateway, Observability |
| Skills layer | Strands vended `AgentSkills` plugin loading SKILL.md (repo-local + huggingface/skills) |
| Agent framework | Strands Agents (Python) |
| Deployment | One unified **TypeScript CDK** app deploys full front + back |
| CDK constructs | `@aws-cdk/aws-bedrock-agentcore-alpha` (L2: Runtime, Memory, CodeInterpreterCustom) |
| Browser → agent auth | Browser calls `invoke_agent_runtime` directly (SigV4) via the operator's test account; no backend relay |
| Interaction | CLI `demo.sh` (clone-and-run, source of truth) + static web panel (booth visual) |
| Public repos | GitHub primary + Gitee mirror (GH Action) |

### Reference (patterns only, not to be duplicated)

`aws-gcr-solutions/industry-assets/cross/data-agent` (gitlab.aws.dev) — a
production enterprise "Data Agent" built on the same stack (Strands + AgentCore
Runtime/Memory/CI/Gateway/Identity + Cognito + TS CDK). We reuse its **structural
patterns** (verified L2 CDK constructs, agent file layout, Memory-as-SessionManager
wiring) but keep our demo a distinct research-harness scenario.

## 2. Architecture Overview

A single Strands agent deployed to AgentCore Runtime. The agent runs the repo's
signature 6-step research pipeline; Memory persists insights across sessions,
the AgentSkills plugin supplies procedural knowledge, and Code Interpreter runs
real experiment code in an isolated sandbox. A static web panel and a CLI both
invoke the *same deployed runtime*.

```
┌─────────────────┐         ┌──────────────────────────────────────────────┐
│  Web panel       │         │            AgentCore Runtime (ARM64)          │
│  (S3+CloudFront) │  SigV4  │  ┌────────────────────────────────────────┐  │
│  3 live tiles    │────────▶│  │  Strands Agent (main.py /invocations)  │  │
└─────────────────┘ invoke  │  │  ├─ Memory  (SessionManager)  ──────────┼──┼──▶ AgentCore Memory
        ▲          _runtime  │  │  ├─ AgentSkills plugin (SKILL.md)       │  │
        │                    │  │  ├─ tool: paper  (arXiv fetch)          │  │
┌─────────────────┐         │  │  ├─ tool: reproduce ────────────────────┼──┼──▶ AgentCore Code Interpreter
│  CLI demo.sh     │  SigV4  │  │  └─ (bonus) Browser / Gateway           │  │
│  (local creds)   │────────▶│  └────────────────────────────────────────┘  │
└─────────────────┘         │            Bedrock (Claude) for the model      │
                            └──────────────────────────────────────────────┘
        deployed by ONE TypeScript CDK app (@aws-cdk/aws-bedrock-agentcore-alpha)
```

**Isolation / boundaries:**

- `tools/` — pure functions, one purpose each (fetch paper, run reproduction).
  Testable without AgentCore.
- `skills/` — declarative SKILL.md packages, no code coupling to the agent.
- `agent_loader.py` — the only place that wires Memory + CI + skills onto a
  Strands `Agent`. Swap inputs here to retarget domains.
- `main.py` — thin HTTP shell (`/invocations` SSE, `/ping`). No business logic.
- CDK stacks — each stack owns one concern (agent runtime, web hosting, identity).

## 3. Repo Layout

```
07-agentcore-demo/
├── README.md                         # 双语 · one `cdk deploy` → full stack; arch diagram
├── source/
│   ├── agent/                        # Python / Strands
│   │   ├── main.py                   # FastAPI /invocations (SSE) + /ping
│   │   ├── agent_loader.py           # builds Agent: Memory SessionManager + CI tool + AgentSkills
│   │   ├── tools/
│   │   │   ├── paper.py              # fetch arXiv metadata + abstract
│   │   │   └── reproduce.py          # run minimal experiment in Code Interpreter
│   │   ├── skills/                   # repo-local SKILL.md packages
│   │   │   ├── paper-reading/SKILL.md
│   │   │   └── experiment-spec/SKILL.md
│   │   ├── prompts/system.md         # 6-step pipeline contract
│   │   ├── Dockerfile                # ARM64
│   │   └── pyproject.toml
│   ├── infrastructure/               # TypeScript CDK — the WHOLE stack
│   │   ├── bin/app.ts
│   │   ├── lib/
│   │   │   ├── agent-stack.ts        # Runtime + Memory + CodeInterpreterCustom + IAM role
│   │   │   ├── web-stack.ts          # S3 + CloudFront (static panel) + config.json injection
│   │   │   └── identity-stack.ts     # Cognito Identity Pool + scoped IAM role
│   │   ├── cdk.json
│   │   └── package.json
│   └── web/                          # static SPA, browser-direct invoke_agent_runtime
│       ├── index.html                # 3 live tiles: Pipeline / Memory / Sandbox
│       ├── app.js                    # @aws-sdk/client-bedrock-agentcore + Cognito creds; consumes SSE
│       └── config.json               # injected at deploy: runtimeArn, region, identityPoolId
└── scripts/
    ├── demo.sh                       # CLI booth driver (local creds) — the clone target
    └── seed.sh                       # pre-seed Memory with 2-3 papers
```

## 4. Components

### 4.1 Agent (`source/agent/`)

- **`main.py`** — FastAPI app exposing `POST /invocations` (returns
  `text/event-stream` SSE) and `GET /ping` (`{"status":"healthy"}`). Parses the
  request, resolves `session_id`/`actor_id`, delegates to `agent_loader`,
  streams Strands events out as SSE. Mirrors the proven `data-agent` shell.
- **`agent_loader.py`** — the single wiring point. Builds a Strands `Agent` with:
  - **Memory** via `AgentCoreMemorySessionManager`
    (`bedrock_agentcore.memory.integrations.strands`), configured with the
    `MEMORY_ID` env var and a `RetrievalConfig` (SEMANTIC + SUMMARIZATION).
  - **Code Interpreter** tool bound to `CODE_INTERPRETER_ID` env var.
  - **AgentSkills** plugin: `AgentSkills(skills=[<repo-local dirs>, <HF https URLs>])`.
  - Bedrock model (Claude).
- **`tools/paper.py`** — fetches arXiv metadata + abstract (HTTP). Optionally
  Browser-backed when the bonus toggle is on.
- **`tools/reproduce.py`** — sends a minimal experiment script to the Code
  Interpreter sandbox, captures stdout + any produced plot, returns structured
  result (numbers + image ref).
- **`skills/`** — repo-local SKILL.md packages repackaging the existing
  `01-quickstart/CLAUDE.md` workflows (paper-reading, experiment-spec) into the
  agentskills.io format.
- **`prompts/system.md`** — the agent's contract: the 6-step pipeline, naming
  conventions, "判据先行 / 不要自评" critical rules from the repo's CLAUDE.md.

### 4.2 Skills layer (Strands AgentSkills + huggingface/skills)

- The Strands vended `AgentSkills` plugin injects available-skill metadata into
  the system prompt and exposes a `skills` tool the agent calls to **activate** a
  skill on demand (progressive disclosure). Active-skill state persists in
  `agent.state` (per session).
- **Two skill tiers:**
  1. **Repo-local** — our harness patterns as portable skills (shows visitors
     *our* method).
  2. **External HF** — `huggingface/skills` referenced via raw `https://` SKILL.md
     URLs (e.g. `huggingface-papers`, `huggingface-datasets`,
     `train-sentence-transformers`). Proves zero-modification reuse of the
     community skill ecosystem.
- In harness vocabulary: **Skills = the procedural-knowledge layer** ("how-to"),
  complementing Memory's "what-we-learned". This is also what makes the
  generalization story concrete: swap the skill set → retarget the domain.

### 4.3 Web panel (`source/web/`)

- Static SPA on S3 + CloudFront. Read-only theater — **no business logic**, so if
  it breaks the CLI still demos.
- Uses `@aws-sdk/client-bedrock-agentcore` with credentials from a Cognito
  Identity Pool (operator's test account); signs `InvokeAgentRuntime` with SigV4
  and consumes the SSE stream directly in the browser.
- **Three live tiles** driven by SSE events:
  - **Pipeline** — the 6 steps lighting up, plus `🧩 activated skill: …`.
  - **Memory** — retrieved records + similarity scores on recall.
  - **Sandbox** — Code Interpreter stdout + rendered plot.
- `config.json` (runtimeArn, region, identityPoolId) is injected at deploy time by
  the web stack.

### 4.4 CLI (`scripts/`)

- **`demo.sh`** — the clone target and source of truth. Thin wrapper over
  `invoke_agent_runtime` (boto3/AWS CLI with local creds), `--session-id` and
  streaming. Pretty colored step output for the booth.
- **`seed.sh`** — pre-seeds Memory with 2-3 papers before the booth opens so
  recall has content.

### 4.5 Infrastructure (`source/infrastructure/`, TypeScript CDK)

- **`agent-stack.ts`** — uses `@aws-cdk/aws-bedrock-agentcore-alpha`:
  - `agentcore.Memory` (`expirationDuration: Duration.days(30)`).
  - `agentcore.CodeInterpreterCustom` (`usingPublicNetwork()`, own execution role).
  - `agentcore.Runtime` with
    `AgentRuntimeArtifact.fromAsset(..., {platform: LINUX_ARM64, file: 'agent/Dockerfile'})`,
    an IAM execution role (ECR, CloudWatch Logs, X-Ray, Bedrock invoke, Memory
    `*Event*`, `*CodeInterpreter*`), and env vars (`MEMORY_ID`,
    `CODE_INTERPRETER_ID`, skill source list, toggles).
- **`identity-stack.ts`** — Cognito Identity Pool + IAM role scoped to
  `bedrock-agentcore:InvokeAgentRuntime` on the single runtime ARN (no Memory/CI
  write from browser). Demo-only; documented as such.
- **`web-stack.ts`** — S3 bucket + CloudFront distribution; deploys `web/` and
  writes `config.json` from stack outputs.
- One `cdk deploy --all` provisions everything; `cdk destroy --all` tears it down.

## 5. Demo Flow (the dual climax, ~2.5 min)

**Pre-seed** (once, before booth opens): `./scripts/seed.sh` runs the agent on
2-3 papers so Memory has content.

**Live arc**, driven by `demo.sh` (web panel mirrors via SSE):

1. **Discover + Digest** — visitor gives an arXiv ID. Agent fetches metadata
   (arxiv tool; Browser as bonus toggle), fills the `paper-note.md` template,
   stores the key insight to Memory. Pipeline tile lights up step by step.
2. **🎬 Climax 1 — Memory recall.** Operator starts a **fresh session**
   (`--session-id <new>`). Visitor asks "what have we studied on long-context?".
   The agent answers *from memory* — names papers + prior conclusions it never saw
   in this session. Memory tile shows retrieved records + similarity scores.
   *Kills pain point 🔁.*
3. **🎬 Climax 2 — Skills + reproduce.** Visitor: "reproduce the core claim." The
   agent **activates a relevant HF skill** (e.g. `huggingface-papers` /
   `train-sentence-transformers`) via the `skills` tool, writes a minimal
   experiment, runs it in **Code Interpreter**, and returns *actual numbers + a
   plot*. Sandbox tile streams stdout and renders the plot.
   Punchline: *"agent 不是口说复现成功，是真在隔离沙箱里跑出了数字。"* *Kills 🤡 + 🎲.*
4. **Persist** — the new result is written back to Memory → the next visitor's
   session benefits. The loop closes.

## 6. Service → pain-point mapping (booth pitch)

| Layer | AgentCore / Strands | Repo pain point | Booth moment |
|---|---|---|---|
| Deploy | **Runtime** (mandatory) | — | serverless ARM64 microVM, `invoke_agent_runtime` |
| Memory | **Memory** via Strands SessionManager | 🔁 每次重讲背景 | fresh session recalls prior papers |
| Skills | **AgentSkills** + huggingface/skills | 🎲 无可重复工作流 | `🧩 activated skill: …` |
| Verify | **Code Interpreter** | 🤡 口说完美跑起来错 | reproduce → real numbers + plot |
| Bonus | Browser / Gateway / Observability | 🧪 no audit trail | toggle on request; traces show every call |

## 7. Deployment & Reproducibility (加分项)

```bash
cd 07-agentcore-demo/source/infrastructure
npm i && npx cdk deploy --all   # builds ARM64 image→ECR; provisions Runtime+Memory+CI
                                # +Cognito+S3/CloudFront; injects web/config.json; uploads web
# outputs: CloudFront URL (web panel) + Runtime ARN (CLI)
./scripts/seed.sh               # pre-seed Memory
./scripts/demo.sh               # run the booth demo
npx cdk destroy --all           # teardown (cost hygiene)
```

- **Public repos:** GitHub primary + Gitee mirror via a `mirror.yml` GitHub Action
  on every push (fast clone for the CN Summit audience).
- **Prerequisites doc:** AWS account with AgentCore-available region, Bedrock model
  access (Claude), Node + CDK, Docker (ARM64 build), Python + uv.
- **Cost guardrails:** Memory expiry 30d; `stop_runtime_session` after demo;
  `cdk destroy --all` to fully tear down.

## 8. Generalization framing (the "通用包装")

README closes with a table showing the **same Runtime + Memory + CI + Skills
skeleton** retargets to any domain by swapping only `tools/` + `skills/` +
`prompts/system.md` — reusing the repo's existing generalization table (finance /
bio / clinical / engineering / social-econ). This is the concrete proof of
AgentCore's generality the booth brief asks for, achieved with **zero new code**.

## 9. Testing Strategy

- **Unit (no cloud):** `tools/paper.py` and `tools/reproduce.py` are pure
  functions — test with mocked HTTP / mocked CI client. Skill packages validated
  by loading via `AgentSkills(strict=True)`.
- **CDK:** `cdk synth` snapshot test on each stack; assert the runtime artifact
  targets ARM64 and the browser IAM role is scoped to the single runtime ARN.
- **Integration (deployed):** a smoke script invokes the runtime with a known
  arXiv ID, asserts a non-empty note; a second invoke in a new session asserts a
  Memory recall hit; a reproduce request asserts numeric output from the sandbox.
- **Booth dry-run:** full `seed.sh` → `demo.sh` rehearsal against a real deploy.

## 10. Out of Scope (YAGNI)

- Multi-agent orchestration (repo explicitly scopes this out; keeps the demo
  forkable in <30 min).
- Persistent chat history DB, portal app, group-based ACLs, chat-gateway
  (Slack/Feishu) — all present in `data-agent`, all unnecessary for a booth demo.
- Production hardening of the browser credential path (it is intentionally a
  test-account, demo-only Cognito role).

## 11. Open Items (resolve during implementation)

- Pin exact version of `@aws-cdk/aws-bedrock-agentcore-alpha` and confirm the CI /
  Browser construct APIs against that version.
- Choose the 2-3 seed papers (prefer ones with a cheap, deterministic reproducible
  claim — e.g. a RoPE / long-context micro-experiment already in `04-examples/`).
- Pick the specific huggingface/skills to feature on stage.
