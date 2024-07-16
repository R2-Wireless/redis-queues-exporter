import { RedisKey } from "ioredis";
import { Context } from "./context";

const getAllQueues: (ctx: Context) => Promise<String[]> = async (ctx) => {
  let cursor = "0";
  const queueNames: String[] = [];
  do {
    const res = await ctx.redis.scan(cursor, "COUNT", 100);
    cursor = res[0];
    const keys = res[1];
    for (let i = 0; i < keys.length; i += 1) {
      const type = await ctx.redis.type(keys[i]);
      if (type === "list") {
        queueNames.push(keys[i]);
      }
    }
  } while (cursor !== "0");
  return queueNames;
};

export const getQueueNames = async (ctx: Context) => {
  const startTime = Date.now();
  const queueNames = await getAllQueues(ctx);
  console.log(queueNames);
  console.log(
    `Finish get all queue names, that took ${Date.now() - startTime}ms`
  );
  await ctx.redis.set("all_queue_names", JSON.stringify(queueNames), "EX", 5);
};

export const monitorQueues = async (ctx: Context) => {
  const redisQueueNames = await ctx.redis.get("all_queue_names");
  const queueNames: String[] = redisQueueNames
    ? JSON.parse(redisQueueNames)
    : [];
  await Promise.all(
    queueNames.map(async (queueName) => {
      const queueSize = await ctx.redis.llen(queueName as RedisKey);
      console.log(`Queue ${queueName}, with size of ${queueSize}`);
    })
  );
};
