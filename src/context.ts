import { Redis } from "ioredis";
import { redisURl } from "./env";

export interface Context {
  redis: Redis;
}

export const createContext: () => Promise<Context> = async () => {
  console.log(redisURl);
  const redis = new Redis(redisURl);
  return { redis };
};
