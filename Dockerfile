FROM node:24-alpine AS base
RUN npm install -g pnpm@11.28.4
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG RELEASE_TAG
ARG COMMIT_SHA
ENV RELEASE_TAG=$RELEASE_TAG COMMIT_SHA=$COMMIT_SHA
RUN pnpm run build

# Stage 3: Production image
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
