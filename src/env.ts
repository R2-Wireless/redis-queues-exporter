export const prometheusUrl =
  process.env.PROMETHEUS_URL ?? "http://localhost:9091/metrics/job";

export const redisURl = process.env.REDIS_URL ?? "redis://localhost:6379/0";

export const monitoredDbName =
  process.env.MONITORED_DB_NAME ?? "server";
