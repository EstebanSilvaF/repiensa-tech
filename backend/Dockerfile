# =========================
# Build
# =========================
FROM node:22-alpine AS builder

WORKDIR /backend

# Prisma schema debe existir antes de npm ci (postinstall ejecuta prisma generate)
COPY package*.json ./
COPY prisma ./prisma

RUN apk add --no-cache openssl

RUN npm ci

COPY . .

RUN npm run build


# =========================
# Production
# =========================
FROM node:22-alpine

WORKDIR /backend

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma

RUN apk add --no-cache openssl

RUN npm ci --omit=dev

COPY --from=builder /backend/dist ./dist
COPY --from=builder /backend/docs ./docs
COPY scripts ./scripts

EXPOSE 3000

CMD ["npm", "start"]
