FROM node:22-slim AS runner

RUN apt-get update && \
  apt-get install -y --no-install-recommends tzdata ca-certificates && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Tokyo

WORKDIR /app

COPY package.json yarn.lock ./

RUN corepack enable && \
  yarn install --frozen-lockfile && \
  yarn cache clean

COPY src/ src/
COPY tsconfig.json .

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

ENV NODE_ENV=production
ENV LOG_DIR=/data/logs/
ENV CONFIG_PATH=/data/config.json
ENV NOTIFIED_PATH=/data/notified.json
ENV COOKIE_CACHE_PATH=/data/twitter-cookies.json

VOLUME [ "/data" ]

ENTRYPOINT ["/app/entrypoint.sh"]
