FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

FROM base AS deps
COPY package*.json ./
# prisma CLI is needed at runtime to run `prisma migrate deploy`
RUN npm ci --only=production

FROM base AS builder
COPY package*.json ./
# Provide a placeholder DATABASE_URL so that the @prisma/client postinstall
# hook (which runs `prisma generate`) and the explicit generate step below
# can validate the schema format without a real database connection.
# The actual DATABASE_URL is injected at container runtime by the host/orchestrator.
ARG DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
ENV DATABASE_URL=${DATABASE_URL}
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 5000
ENTRYPOINT ["./docker-entrypoint.sh"]
