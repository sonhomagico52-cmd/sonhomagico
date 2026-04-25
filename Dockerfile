FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY patches ./patches

RUN npm ci --legacy-peer-deps

COPY client ./client
COPY server ./server
COPY shared ./shared
COPY tsconfig.json tsconfig.node.json vite.config.ts components.json ./

RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=6100

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 6100

CMD ["npm", "run", "start"]
