# sre-bot

> The smart SRE agent that watches your infrastructure, diagnoses incidents, and helps your team resolve them before users notice.

[![CI/CD](https://github.com/kavishbaghel/sre-bot/actions/workflows/ci.yaml/badge.svg)](https://github.com/kavishbaghel/sre-bot/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.26-blue)](https://golang.org)
[![Python Version](https://img.shields.io/badge/Python-3.13-blue)](https://python.org)

---

## What is sre-bot?

It is not another monitoring dashboard. It is the agent that sits on top of your existing observability stack and tells you what is wrong and what to do about it.

### Who is it for?

- **SRE and DevOps teams** who want to reduce mean time to resolution (MTTR) without buying expensive enterprise tooling
- **Small engineering teams** who cannot afford a dedicated SRE function but need production reliability
- **Platform engineers** who want to build AI-powered operations tooling on top of a proven open source foundation

## Demo

When sre-bot detects an anomaly, this is what your on-call engineer sees instead of a raw alert:

```
WARNING  ANOMALY DETECTED: failure rate is 1.0

INFO     Root Cause Analysis
         ─────────────────────────────────────────
         Root cause:    Network connectivity issue
         Confidence:    80%

         The repeated "connection refused" errors on
         http://payment-svc:9090/metrics indicate the
         payment service is unreachable. This matches
         the pattern for a pod crash or network policy
         misconfiguration.

         Recommended actions:
         1. Check pod status: kubectl get pods -n payments
         2. Review recent deployments: kubectl rollout history deployment/payment-svc
         3. Verify network policies are not blocking traffic
         4. If OOMKilled: increase memory limits and redeploy

         Escalate if failure rate remains above 50%
         for more than 15 minutes after remediation.
```

---

### Technology choices

| Technology | Why |
|---|---|
| Go | Industry standard for infrastructure tooling — fast, low memory, single binary |
| Python | Best ecosystem for ML, LLM orchestration, and data processing |
| Kafka | Decouples ingestion from storage — survives database downtime, supports multiple consumers |
| ClickHouse | Columnar time-series database — sub-second queries over millions of metric rows |
| Ollama | Run LLMs locally — no API keys, no data leaving your infrastructure |
| Kubernetes + Helm | Single `helm install` deploys the entire platform |

---

## Quick start

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Go | 1.21+ | [go.dev](https://go.dev/dl/) |
| Python | 3.11+ | [python.org](https://python.org) |
| Docker | 20.10+ | [docker.com](https://docker.com) |
| kubectl | 1.22+ | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) |
| Kind | 0.20+ | [kind.sigs.k8s.io](https://kind.sigs.k8s.io) |
| Helm | 3.0+ | [helm.sh](https://helm.sh) |
| Ollama | latest | [ollama.com](https://ollama.com) |

### 1. Clone the repo

```bash
git clone https://github.com/kavishbaghel/sre-bot.git
cd sre-bot
```

### 2. Pull the LLM model

```bash
ollama pull llama3.2:3b
ollama serve
```

### 3. Start infrastructure

```bash
docker-compose up -d
```

This starts Kafka, Zookeeper, and ClickHouse locally.

### 4. Create the Kafka topic

```bash
docker exec kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --create --topic metrics \
  --partitions 1 --replication-factor 1
```

### 5. Start the services

Open four terminals:

```bash
# Terminal 1 — collector
cd collector && go run .

# Terminal 2 — aggregator
cd aggregator && python3 main.py

# Terminal 3 — detector
cd detector && python3 main.py

# Terminal 4 — agent
cd agent && python3 main.py
```

### 6. Trigger a scrape and watch the agent respond

```bash
curl http://localhost:8080/metrics
```

Within 30 seconds you will see the detector and agent output in their respective terminals.

### Deploy on Kubernetes

```bash
# Create a local Kind cluster
kind create cluster --name sre-bot

# Deploy with Helm
helm install sre-bot ./helm/sre-bot

# Verify
kubectl get pods
```

---

## Configuration

All services are configured via environment variables. When deploying with Helm, set these in `helm/sre-bot/values.yaml`.

| Variable | Service | Default | Description |
|---|---|---|---|
| `SCRAPE_TARGET` | collector | `http://localhost:9090/metrics` | Prometheus endpoint to scrape |
| `LISTEN_PORT` | collector | `8080` | Port the collector HTTP server listens on |
| `KAFKA_BROKER` | collector, aggregator | `localhost:9092` | Kafka broker address |
| `KAFKA_TOPIC` | collector, aggregator | `metrics` | Kafka topic name |
| `CLICKHOUSE_HOST` | aggregator, detector, agent | `localhost` | ClickHouse host |
| `OLLAMA_HOST` | agent | `http://localhost:11434` | Ollama API host |
| `OLLAMA_MODEL` | agent | `llama3.2:3b` | LLM model to use |

### Pointing at your own Prometheus

```bash
SCRAPE_TARGET=http://your-prometheus:9090/metrics go run ./collector
```

### Using a different LLM

Any model available in Ollama works. Larger models give better analysis:

```bash
ollama pull llama3.1:8b
OLLAMA_MODEL=llama3.1:8b python3 agent/main.py
```


## Contributing

sre-bot is open source and welcomes contributions. Whether you are fixing a bug, adding a runbook, or building a new integration — all contributions are valued.

### Getting started

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Open a pull request with a clear description of what you changed and why

### Good first issues

- Add a new runbook to `agent/runbooks/`
- Add a new anomaly detection rule to `detector/analyzer.py`
- Improve the agent prompt in `agent/agent.py`
- Write tests for the Go collector

### Reporting bugs

Open a [GitHub Issue](https://github.com/kavishbaghel/sre-bot/issues) with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Output from the relevant service terminal

### Code style

- Go: run `gofmt` before committing
- Python: run `black` before committing
- Commits: use [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, `chore:`

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">Built with care by <a href="https://github.com/kavishbaghel">kavishbaghel</a> and contributors</p>