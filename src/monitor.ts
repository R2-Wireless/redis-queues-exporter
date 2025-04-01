/* eslint-disable no-await-in-loop */
import { RedisKey } from "ioredis";
import { Context } from "./context";
import { logger } from "./utils/logger";

const parseQueueName = (item: any): string => {
  if (item === null) {
    return "";
  }
  if (Array.isArray(item)) {
    return item.map((i) => parseQueueName(i)).join("_");
  }
  if (typeof item === "object") {
    return Object.entries(item)
      .map(([k, v]) => (v === null ? "" : `${k}_${v}`))
      .filter(Boolean)
      .join("_");
  }
  return item;
};

const getAllQueues: (ctx: Context) => Promise<string[]> = async (ctx) => {
  let cursor = "0";
  const queueNames: string[] = [];
  do {
    const [cursorRes, keys] = await ctx.redis.scan(cursor, "COUNT", 1000);
    if (keys.length > 0) {
      const pipeline = ctx.redis.multi();
      keys.forEach((key) => pipeline.type(key));
      const types = await pipeline.exec();

      keys.forEach((key, index) => {
        const [err, type] = types?.[index] ?? [];
        if (!err && type === "list") {
          queueNames.push(key);
        }
      });
    }
    cursor = cursorRes;
  } while (cursor !== "0");
  return queueNames;
};

export const getQueueNames = async (ctx: Context) => {
  const startTime = Date.now();
  const queueNames = await getAllQueues(ctx);
  logger.info(queueNames);
  logger.info(
    `Finish get all queue names, that took ${Date.now() - startTime} ms`
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
  const pipeline = ctx.redis.multi();
  queueNames.forEach((name) => pipeline.llen(name as RedisKey));
  const sizes = await pipeline.exec();

  return queueNames.map((queueName, index) => {
    const [err, size] = sizes?.[index] ?? [];
    let name = queueName;
    try {
      name = parseQueueName(JSON.parse(queueName));
    } catch {
      logger.info(`Using unparsed name for ${queueName}`);
    }
    return {
      name,
      size: err ? -1 : Number(size),
    };
  });
};
