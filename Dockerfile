# ========================================================
# AcademicLevel Enterprise Platform - Multi-Stage Container
# ========================================================

FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public
COPY --from=builder /app/data-store.json ./data-store.json

EXPOSE 3000

VOLUME ["/app/server/data"]

CMD ["node", "server/server.js"]
