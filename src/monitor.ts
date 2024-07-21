/* eslint-disable no-await-in-loop */
import { RedisKey } from "ioredis";
import { Context } from "./context";

const getAllQueues: (ctx: Context) => Promise<string[]> = async (ctx) => {
  let cursor = "0";
  const queueNames: string[] = [];
  do {
    const res = await ctx.redis.scan(cursor, "COUNT", 100);
    const [cursorRes, keys] = res;
    for (let i = 0; i < keys.length; i += 1) {
      const type = await ctx.redis.type(keys[i]);
      if (type === "list") {
        queueNames.push(keys[i]);
      }
    }
    cursor = cursorRes;
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

export const monitorQueues: (
  ctx: Context
) => Promise<{ name: string; size: number }[]> = async (ctx) => {
  const redisQueueNames = await ctx.redis.get("all_queue_names");
  const queueNames: string[] = redisQueueNames
    ? JSON.parse(redisQueueNames)
    : [];
  const queueSizes = await Promise.all(
    queueNames.map(async (queueName) => {
      const queueSize = await ctx.redis.llen(queueName as RedisKey);
      console.log(`Queue ${queueName}, with size of ${queueSize}`);
      return {
        name: JSON.parse(queueName).join("_"),
        size: queueSize,
      };
    })
  );
  return queueSizes;
};