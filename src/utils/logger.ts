import pino from "pino";
import pinoCaller from "pino-caller";

const isDev = (process.env.NODE_ENV?.toLowerCase() ?? "") !== "production";
const logLevel = process.env.LOG_LEVEL || "info";

export const logger = pinoCaller(
  pino({
    level: logLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
      bindings() {
        return {};
      },
    },
    transport: isDev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  }),
  { relativeTo: process.cwd() }
);
