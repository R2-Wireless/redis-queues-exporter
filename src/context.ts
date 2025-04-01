import { Redis } from "ioredis";
import { redisURl } from "./env";
import { logger } from "./utils/logger";

export interface Context {
  redis: Redis;
}

export const createContext: () => Promise<Context> = async () => {
  logger.info(`Starting service with Redis URL: [${redisURl}]`);
  const redis = new Redis(redisURl);
  return { redis };
};
