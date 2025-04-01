FROM oven/bun:1.1.10-slim

WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .

ENV NODE_ENV production
ENV LOG_LEVEL=info
CMD [ "bun", "start" ]
