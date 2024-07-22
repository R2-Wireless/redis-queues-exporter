# redis-queues-exporter ![Docker Image Version](https://img.shields.io/docker/v/r2wireless/redis-queues-exporter)

Monitoring redis queues and export metrics to promethues pushgetway.

## Environment Variables

| Variable          | Description                 | e.g.                                |
| ----------------- | --------------------------- | ----------------------------------- |
| REDIS_URL         | Redis url to monitor        | "redis://localhost:6379/0"          |
| PROMETHEUS_URL    | Where to export metrics     | "http://localhost:9091/metrics/job" |
| MONITORED_DB_NAME | Name of redis db to monitor | "server/client100"                  |
