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

const ALL_QUEUE_NAMES_REDIS_KEY = "all_queue_names";

export const getQueueNames = async (ctx: Context) => {
  const startTime = Date.now();
  const queueNames = await getAllQueues(ctx);
  logger.info(`Queue names: ${queueNames}`);
  logger.info(
    `Finish get all queue names, duration: ${Date.now() - startTime} ms`
  );
  await ctx.redis.set(ALL_QUEUE_NAMES_REDIS_KEY, JSON.stringify(queueNames));
};

export const monitorQueues: (
  ctx: Context
) => Promise<{ name: string; size: number }[]> = async (ctx) => {
  const startTime = Date.now();
  logger.info(`Starting monitor queues`);
  const redisQueueNames = await ctx.redis.get(ALL_QUEUE_NAMES_REDIS_KEY);
  const queueNames: string[] = redisQueueNames
    ? JSON.parse(redisQueueNames)
    : [];
  const pipeline = ctx.redis.multi();
  queueNames.forEach((name) => pipeline.llen(name as RedisKey));
  const sizes = await pipeline.exec();

  logger.info(
    `Finished monitor queues. duration: ${Date.now() - startTime} ms`
  );
  return queueNames.map((queueName, index) => {
    const [err, size] = sizes?.[index] ?? [];
    let name = queueName;
    try {
      name = parseQueueName(JSON.parse(queueName));
    } catch {
      logger.warn(`Using unparsed name for ${queueName}`);
    }
    return {
      name,
      size: err ? -1 : Number(size),
    };
  });
};
