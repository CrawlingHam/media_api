ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS build

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build:only

FROM node:${NODE_VERSION} AS final

ARG MAINTAINER
ARG PORT=8000

ENV NODE_ENV=production

# Add metadata
LABEL description="NestJS Firebase API server"
LABEL maintainer=${MAINTAINER}
LABEL version="1.0.0"

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/dist ./dist

USER appuser

EXPOSE ${PORT}

CMD ["node", "dist/main"]