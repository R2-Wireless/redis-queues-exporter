export const prometheusUrl =
  process.env.PROMETHEUS_URL ?? "http://localhost:9091/metrics/job";

export const redisURl = process.env.REDIS_URL ?? "redis://localhost:6379/0";

export const prometheusJobName =
  process.env.PROMETHEUS_JOB_NAME ?? "redis_queues";
