# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat git
WORKDIR /app

# Copy package files for dependency installation
COPY package.json yarn.lock* ./

# Install all dependencies (needed for build)
RUN yarn install --frozen-lockfile

# Stage 2: Build the application
FROM node:20-alpine AS builder
RUN apk add --no-cache git
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_GH_CLIENT_ID

# Build the application
RUN yarn build

# Stage 3: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone output (Next.js automatically includes minimal dependencies)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use node to run the standalone server (more efficient than npm)
CMD ["node", "server.js"]