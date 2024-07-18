FROM oven/bun:1.1.10-slim

WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN bun install --production
COPY . .

ENV NODE_ENV production

CMD [ "bun", "start" ]
