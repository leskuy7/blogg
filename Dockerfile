FROM node:20.11.1-alpine

# Install dependencies for health check
RUN apk add --no-cache netcat-openbsd wget

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with specific flags for production
RUN npm ci --only=production

# Copy application files
COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# More frequent health checks during startup
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["node", "deploy-startup.js"]
