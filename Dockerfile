FROM node:20.11.1-alpine

WORKDIR /app

# Install system dependencies (including build tools for native modules)
RUN apk add --no-cache netcat-openbsd wget python3 build-base

# Verify node path (for debugging)
RUN which node

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev # Only production dependencies on Alpine

# Copy application files
COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Simple health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Explicit node command via sh -c for better logging and execution
CMD ["sh", "-c", "node deploy-startup.js"]
