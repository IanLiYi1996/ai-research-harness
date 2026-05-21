---
language:
  - <e.g. en>
license: <e.g. cc-by-4.0>
size_categories:
  - <e.g. 100K<n<1M>
task_categories:
  - <e.g. text-generation>
tags:
  - <e.g. instruction-tuning>
---

# <Your Dataset Name>

<one-line description>

## Dataset Description

- **Curated by**: <your name / lab>
- **Language(s)**: <e.g. English>
- **License**: <e.g. cc-by-4.0>
- **Total samples**: <N>

### Dataset Sources

- **Repository**: [<dataset-url>](<dataset-url>)
- **Source data**: <where it was scraped / collected from>

## Uses

### Direct Use

<what this dataset is designed for>

### Out-of-Scope Use

<what NOT to use it for>

## Dataset Structure

### Data Fields

```json
{
  "id": "string",
  "input": "string",
  "output": "string",
  "metadata": {
    "source": "string",
    "quality_score": "float"
  }
}
```

### Data Splits

| Split | Samples |
|---|---|
| train | <N> |
| validation | <N> |
| test | <N> |

## Dataset Creation

### Source Data

- **Origin**: <where the raw data came from>
- **Collection method**: <e.g. web scraping / human-annotated / synthetic>
- **Time period**: <when collected>

### Preprocessing

1. <step 1>
2. <step 2>
3. <step 3>

完整 pipeline：[link to script](<link>)

## Personal and Sensitive Information

- **PII removed**: <yes / no / partial>
- **Method**: <e.g. nemo-curator PII redaction>

## Bias, Risks, and Limitations

### Known Biases

- <bias 1>: <description>
- <bias 2>: <description>

### Limitations

- <limitation 1>
- <limitation 2>

## Citation

```bibtex
@misc{<your-citekey>,
  title={<Dataset Name>},
  author={<Authors>},
  year={2026},
  url={<dataset-url>}
}
```
