# redis-queues-exporter ![Docker Image Version](https://img.shields.io/docker/v/r2wireless/redis-queues-exporter)

Monitoring redis queues and export metrics to promethues pushgetway.

## Environment Variables

- REDIS_URL: redis url to monitor, e.g. "redis://localhost:6379/0"
- PROMETHEUS_URL: where to export metrics, e.g. "http://localhost:9091/metrics/job"
- MONITORED_DB_NAME: name of redis db to monitor, e.g. "server/client100"
