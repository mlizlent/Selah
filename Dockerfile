FROM node:20 AS builder
WORKDIR /app

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_COMPANION_API_URL
ARG VITE_ADMIN_EMAIL_SHIELD

COPY package.json tsconfig.app.json tsconfig.node.json tsconfig.json vite.config.ts postcss.config.js tailwind.config.js index.html ./
COPY server.ts ./
COPY src ./src
COPY posts.json ./

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY} \
    VITE_COMPANION_API_URL=${VITE_COMPANION_API_URL} \
    VITE_ADMIN_EMAIL_SHIELD=${VITE_ADMIN_EMAIL_SHIELD}

RUN npm install
RUN npm run build

FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/posts.json ./
COPY --from=builder /app/tsconfig.json ./

ENV PORT=10000

EXPOSE 10000

CMD ["npm", "start"]
