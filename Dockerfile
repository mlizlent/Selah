FROM node:20 AS builder
WORKDIR /app

ARG VITE_COMPANION_API_URL

COPY package.json package-lock.json ./
COPY frontend ./frontend
COPY backend ./backend

ENV VITE_COMPANION_API_URL=${VITE_COMPANION_API_URL}

RUN npm install
RUN npm run build

FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/frontend ./frontend
COPY --from=builder /app/backend ./backend

ENV PORT=10000

EXPOSE 10000

CMD ["npm", "start"]
