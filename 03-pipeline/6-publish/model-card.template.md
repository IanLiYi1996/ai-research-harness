---
language: en  # or zh, multilingual
license: <e.g. apache-2.0, cc-by-nc-4.0>
base_model: <registry-id of base model, e.g. meta-llama/Llama-3-8B>
datasets:
  - <registry-id 1>
  - <registry-id 2>
tags:
  - <e.g. fine-tuned, lora, gsm8k>
  - <e.g. domain-specific>
metrics:
  - <metric name>
pipeline_tag: <e.g. text-generation>
---

# <Your Model Name>

<one-line description>

## Model Details

- **Developed by**: <your name / lab>
- **Model type**: <e.g. fine-tuned LLM / LoRA adapter>
- **Language(s)**: <e.g. English, Chinese>
- **License**: <e.g. apache-2.0>
- **Finetuned from**: [base_model](<link>)

## Intended Use

### Direct Use

<what this model is designed to do>

### Out-of-Scope Use

<what this model should NOT be used for>

## How to Use

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("<your-username>/<model-id>")
tokenizer = AutoTokenizer.from_pretrained("<your-username>/<model-id>")

inputs = tokenizer("Hello", return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=50)
print(tokenizer.decode(outputs[0]))
```

## Training

### Training Data

- **Source**: [<dataset-id>](<dataset-url>)
- **Size**: <num samples>
- **Preprocessing**: <one-line description>

### Training Procedure

参考完整 spec：[spec.yaml](https://github.com/<your-repo>/spec.yaml)

- **Method**: <e.g. LoRA / QLoRA / full fine-tune / DPO>
- **Hyperparameters**:
  - learning_rate: <e.g. 2e-4>
  - batch_size: <e.g. 8>
  - epochs: <e.g. 3>
  - lora_rank: <e.g. 16>
- **Compute**: <e.g. 1× A100-80GB, 12 hours>
- **Framework**: <e.g. axolotl 0.4.x>

## Evaluation

### L1 · Standard Benchmarks

| Benchmark | This Model | Baseline | Δ |
|---|---|---|---|
| MMLU | XX.X | XX.X | +X.X |
| HellaSwag | XX.X | XX.X | +X.X |
| GSM8K | XX.X | XX.X | +X.X |

### L2 · Invariant Tests

✅ All N invariants pass (see [tests/test_invariants.py](<link>))

### L3 · Qualitative Review

- Reviewer: <which sub-agent / human>
- Sample size: <N>
- Findings: <list>

## Limitations

- <known limitation 1>
- <known limitation 2>

## Citation

```bibtex
@misc{<your-citekey>,
  title={<Title>},
  author={<Authors>},
  year={2026},
  url={<arxiv link>}
}
```
