import { createContext } from "./context";
import { monitoredDbName, prometheusUrl } from "./env";
import { monitorQueues, getQueueNames } from "./monitor";
import { setIntervalPromise } from "./utils";

const start = async () => {
  console.log("start...");
  const ctx = await createContext();

  const getNamesIntervalPromise = setIntervalPromise(
    () => getQueueNames(ctx),
    3_000
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
            }{instance="${x.name}",monitored_db_name="${monitoredDbName}"} ${
              x.size
            }`
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
          console.error(`Error: ${err}`);
        }
      });
  }, 1_000);
  await Promise.race([
    await getNamesIntervalPromise.promise,
    await monitorIntervalPromise.promise,
  ]);

  clearInterval(getNamesIntervalPromise.interval);
  clearInterval(monitorIntervalPromise.interval);
  ctx.redis.disconnect();
  console.log("finish...");
};

start().then(
  () => {
    process.exit(0);
  },
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
