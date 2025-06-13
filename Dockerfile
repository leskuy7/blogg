FROM node:20.11.1-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Simple health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Direct node command
CMD node deploy-startup.js
