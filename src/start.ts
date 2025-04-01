import { createContext } from "./context";
import { monitoredDbName, prometheusUrl } from "./env";
import { monitorQueues, getQueueNames } from "./monitor";
import { setIntervalPromise } from "./utils";
import { logger } from "./utils/logger";

const TIMEOUT_MINUTES = 5 * 60 * 1000;
const TIMEOUT_SEC = 10_000;

const start = async () => {
  logger.info("Starting redis queues exporter service...");
  const ctx = await createContext();

  const getNamesIntervalPromise = setIntervalPromise(
    () => getQueueNames(ctx),
    TIMEOUT_MINUTES
  );
  const monitorIntervalPromise = setIntervalPromise(async () => {
    const queueSizes = await monitorQueues(ctx);
    fetch(`${prometheusUrl}/redis_queues`, {
      method: "POST",
      body: `${queueSizes
        .map(
          (x) =>
            `redis_queues${
              monitoredDbName !== undefined ? `_${monitoredDbName}` : ""
            }{instance="${x.name}"${
              monitoredDbName !== undefined
                ? `,monitored_db_name="${monitoredDbName}"`
                : ""
            }} ${x.size}`
        )
        .join("\n")}
`,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.text())
      .then((err) => {
        if (err.length > 0) {
          logger.error(`Error: ${err}`);
        }
      });
  }, TIMEOUT_SEC);
  await Promise.race([
    await getNamesIntervalPromise.promise,
    await monitorIntervalPromise.promise,
  ]);

  clearInterval(getNamesIntervalPromise.interval);
  clearInterval(monitorIntervalPromise.interval);
  ctx.redis.disconnect();
  logger.info("Stopping redis queues exporter service...");
};

start().then(
  () => {
    process.exit(0);
  },
  (err) => {
    logger.error(
      `Failed to start redis queues exporter service with error:  ${err}`
    );
    process.exit(1);
  }
);
