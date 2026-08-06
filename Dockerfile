FROM node:20 AS builder
WORKDIR /app

COPY package.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
COPY server.ts ./
COPY src ./src
COPY posts.json ./

RUN npm install
RUN npm run build

FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5178

RUN npm install -g tsx

COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/posts.json ./

EXPOSE 5178

CMD ["tsx", "server.ts"]
