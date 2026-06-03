---
name: experiment-spec
description: Use before running an experiment to write a spec.yaml first. Enforces hypothesis, metric, invariant, and registry IDs before any code is written.
---

# Experiment Spec Workflow

Before writing any experiment code:

1. Write `spec.yaml` containing: `hypothesis`, `metric`, `invariant`, `registry_ids`.
2. Write the invariant test first (it should fail — RED).
3. Write the minimal implementation to make it pass (GREEN).
4. Keep all config / hyperparameters in `spec.yaml`, never hidden in cells or CLI flags.
5. After running, have an independent reviewer critique the output for bugs.
6. On failure, write a REFLECT note: why it failed + what to change next.
