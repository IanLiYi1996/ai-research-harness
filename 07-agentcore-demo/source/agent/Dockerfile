# AgentCore Runtime requires linux/arm64.
FROM --platform=linux/arm64 python:3.12-slim

WORKDIR /app

# Install uv for fast, reproducible installs.
RUN pip install --no-cache-dir uv

# Install dependencies first for layer caching.
COPY pyproject.toml ./
RUN uv pip install --system --no-cache .

# Copy application code.
COPY agent ./agent

EXPOSE 8080
CMD ["python", "-m", "agent.main"]
