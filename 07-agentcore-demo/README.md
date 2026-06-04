# AgentCore Research Co-pilot · Builder Demo

A real, CDK-deployable demo that runs the `ai-research-harness` pipeline on
Amazon Bedrock AgentCore. Showcases **Runtime + Memory + Code Interpreter**, plus
a Strands **skills** layer (repo-local + huggingface/skills).

## What it shows

| Layer | Service | Pain point it kills |
|---|---|---|
| Deploy | AgentCore Runtime | serverless ARM64 microVM |
| Memory | AgentCore Memory | 🔁 re-explaining context every session |
| Skills | Strands AgentSkills + huggingface/skills | 🎲 no repeatable workflow |
| Verify | AgentCore Code Interpreter | 🤡 "looks perfect", runs broken |

## Deploy (one command)

```bash
cd source/infrastructure
npm install
npx cdk deploy --all          # builds ARM64 image → ECR; provisions everything
# outputs: ResearchCopilotWeb.WebUrl, ResearchCopilotAgent.RuntimeArn
```

## Run the booth demo

```bash
export RUNTIME_ARN=<RuntimeArn output>
./scripts/seed.sh             # pre-seed Memory
./scripts/demo.sh "read arXiv 2104.09864 and store the key insight" booth-1
```

Open the `WebUrl` for the live 3-tile panel.

## Teardown

```bash
cd source/infrastructure && npx cdk destroy --all
```

## Prerequisites

- AWS account in an AgentCore-available region
- Bedrock model access (Claude) enabled
- Node 20+, AWS CDK v2, Docker (ARM64 build), Python 3.12 + uv

## Generalization

Swap `source/agent/agent/tools/`, `source/agent/agent/skills/`, and
`prompts/system.md` and the same Runtime + Memory + CI + Skills skeleton becomes a
finance / bio / ops agent — no infra changes. See the root README's
generalization table.
