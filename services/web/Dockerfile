# dependencies
FROM node:alpine AS deps

RUN apk update && apk upgrade
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --update --no-cache curl libc6-compat \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /usr/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

#################### development ####################
## dev
FROM node:alpine AS dev

RUN apk update && apk upgrade
RUN apk add --update --no-cache --virtual .build-deps curl libc6-compat \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /usr/app

COPY --from=deps /usr/app/node_modules ./node_modules
COPY --from=deps /usr/app/package.json /usr/app/pnpm-lock.yaml ./
COPY . .

RUN apk del .build-deps

RUN addgroup -g 1001 -S nextjs
RUN adduser -S nextjs -u 1001

CMD ["pnpm", "dev"]

#################### production ##################
## builder
FROM node:alpine AS builder

RUN apk update && apk upgrade
RUN apk add --update --no-cache curl libc6-compat \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /usr/app

COPY --from=deps /usr/app/node_modules ./node_modules
COPY . .

RUN pnpm build

## prod
# FROM nginx:alpine AS prod

# WORKDIR /usr/share/nginx/html

# COPY --from=builder /usr/app/dist .
# COPY --from=builder /usr/app/next-routes.conf /usr/share/nginx/next-routes.conf


# CMD [ "nginx", "-g", "daemon off;" ]

FROM node:alpine AS prod

RUN apk update && apk upgrade
RUN apk add --update --no-cache --virtual .build-deps curl libc6-compat \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /usr/app

COPY --from=builder /usr/app/package.json /usr/app/pnpm-lock.yaml ./
COPY --from=builder /usr/app/.next /usr/app/.next

# ENV NODE_ENV=production

RUN pnpm install --frozen-lockfile --production --ignore-scripts

RUN addgroup -g 1001 -S nextjs
RUN adduser -S nextjs -u 1001

RUN chown -R nextjs:nextjs /usr/app/.next

RUN apk del .build-deps

USER nextjs

CMD [ "pnpm", "start" ]
