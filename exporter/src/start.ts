import { createContext } from "./context";
import { monitorQueues, getQueueNames } from "./monitor";
import { setIntervalPromise } from "./utils";

const start = async () => {
  console.log("start...");
  const ctx = await createContext();
  const getNamesIntervalPromise = setIntervalPromise(
    () => getQueueNames(ctx),
    3_000
  );
  const monitorIntervalPromise = setIntervalPromise(
    () => monitorQueues(ctx),
    1_000
  );
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
