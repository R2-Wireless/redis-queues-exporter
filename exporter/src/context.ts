import { Redis } from "ioredis";

export interface Context {
  redis: Redis;
}

export const createContext: () => Promise<Context> = async () => {
  const redis = new Redis(process.env.REDIS_URL!);
  return { redis };
};
