import { Context, createContext } from "./context";
import {RedisKey} from "ioredis";
import { setIntervalPromise } from "./utils";

const getAllQueues: (ctx: Context) => Promise<String[]> = async (ctx) => {
  let cursor = "0";
  const queueNames: String[] = [];
  do {
    const res = await ctx.redis.scan(cursor, "COUNT", 100);
    cursor = res[0];
    const keys = res[1];
    for (let i = 0; i < keys.length; i+=1) {
      const type = await ctx.redis.type(keys[i]);
      if (type === 'list') {
        queueNames.push(keys[i]);
      }
    }
  } while (cursor !== "0");
  return queueNames;
};

const monitorQueues = async (ctx: Context) => {
  const startTime = Date.now();
  const queueNames = await getAllQueues(ctx);
  console.log(queueNames);
  console.log(`Finish get all queue names, that took ${Date.now() - startTime}ms`);

  await Promise.all(queueNames.map(async (queueName) => {
    const queueSize = await ctx.redis.llen(queueName as RedisKey);
    console.log(`Queue ${queueName}, with size of ${queueSize}`);
  }));
}

const start = async () => {
  console.log("start...");
  const ctx = await createContext();
  const intervalPromise = setIntervalPromise(
    () => monitorQueues(ctx),
    1_000
  );
  await intervalPromise.promise;

  clearInterval(intervalPromise.interval);
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
