# High Failure Rate Runbook

## Overview
This runbook is triggered when the failure rate of a scrape target exceeds 50% in a 5-minute sliding window.

---

## Symptoms
- `failure_rate` > 0.5 in detector logs
- `Success: false` in majority of recent metrics entries
- Repeated `connection refused` or `timeout` errors in scrape results
- Anomaly warning in sre-bot detector logs

---

## Possible Causes
1. **Network issues** — DNS resolution failure, firewall rules blocking traffic, or network partitioning
2. **Service crash** — target service is down due to OOMKill, panic, or unhandled exception
3. **Misconfiguration** — wrong scrape target URL, incorrect port, or changed endpoint path
4. **Dependency failure** — target service is healthy but a downstream dependency (database, cache) is failing
5. **Resource exhaustion** — target pod is throttled due to CPU or memory limits being hit
6. **Deployment rollout** — a recent deployment introduced a breaking change

---

## Investigation Steps
1. Check the scrape target URL is correct and reachable:
```bash
   curl -v <SCRAPE_TARGET>
```
2. Check pod status in Kubernetes:
```bash
   kubectl get pods -n <namespace>
   kubectl describe pod <pod-name> -n <namespace>
```
3. Check pod logs for errors:
```bash
   kubectl logs <pod-name> -n <namespace> --tail=100
```
4. Check recent deployments:
```bash
   kubectl rollout history deployment/<deployment-name>
```
5. Check resource usage:
```bash
   kubectl top pods -n <namespace>
```
6. Query ClickHouse for error patterns:
```sql
   SELECT error, count(*) FROM metrics
   WHERE scraped_at >= now() - INTERVAL 15 MINUTE
   GROUP BY error
   ORDER BY count(*) DESC
```

---

## Remediation Steps
1. **If misconfiguration** — update the `SCRAPE_TARGET` environment variable and restart the collector
2. **If service crash** — restart the pod:
```bash
   kubectl rollout restart deployment/<deployment-name>
```
3. **If OOMKilled** — increase memory limits in the deployment manifest and reapply
4. **If bad deployment** — rollback to previous version:
```bash
   kubectl rollout undo deployment/<deployment-name>
```
5. **If dependency failure** — identify the failing dependency and follow its specific runbook
6. **If network issue** — check DNS and network policies:
```bash
   kubectl exec -it <pod-name> -- nslookup <dependency-hostname>
```

---

## Escalation
Escalate to a senior engineer if:
- Failure rate remains above 50% for more than 15 minutes after remediation
- The root cause cannot be identified within 30 minutes
- Multiple services are affected simultaneously
- Data loss is suspected

---

## Related Runbooks
- Dependency Failure Runbook
- OOMKill Runbook
- Network Policy Runbook