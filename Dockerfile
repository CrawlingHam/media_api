# Build stage
FROM node:23-alpine AS builder

WORKDIR /app
COPY . .

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

RUN pnpm build:only

# Production stage
FROM node:23-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy only the built artifacts and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create health check file
RUN echo "healthy" > /app/health

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]

