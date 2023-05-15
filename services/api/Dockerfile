# dependencies
FROM node:alpine AS deps

RUN apk update && apk upgrade
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache curl libc6-compat \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /usr/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

#################### development ####################
## dev server
FROM node:alpine AS dev

RUN apk update && apk upgrade
RUN apk add --no-cache --virtual .build-deps curl libc6-compat \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /usr/app

COPY --from=deps /usr/app/node_modules ./node_modules
COPY --from=deps /usr/app/package.json /usr/app/pnpm-lock.yaml ./
COPY . .

RUN apk del .build-deps

VOLUME /usr/app/data

CMD ["pnpm", "dev"]

#################### production ##################
## builder
FROM node:alpine AS builder

RUN apk update && apk upgrade
RUN apk add --no-cache curl libc6-compat \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /usr/app

COPY --from=deps /usr/app/node_modules ./node_modules
COPY . .

RUN pnpm build

## prod server
FROM node:alpine AS prod

RUN apk update && apk upgrade
RUN apk add --no-cache --virtual .build-deps curl libc6-compat \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /usr/app

COPY --from=builder /usr/app/dist /usr/app/package.json /usr/app/pnpm-lock.yaml ./

ENV NODE_ENV=production

RUN pnpm install --frozen-lockfile --production --ignore-scripts

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

RUN mkdir -p data/logs && chown -R nodejs:nodejs data

RUN apk del .build-deps

VOLUME /usr/app/data

COPY . .

USER nodejs

CMD [ "node", "main.js" ]