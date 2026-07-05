FROM node:24-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"

RUN apt-get update && \
  apt-get install -y --no-install-recommends tzdata ca-certificates && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* && \
  npm install -g corepack@latest && \
  corepack enable

ENV TZ=Asia/Tokyo

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile && \
  pnpm store prune

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
