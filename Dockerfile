FROM node:20-alpine

# Install dependencies for wait-for script
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with specific flags for production
RUN npm ci --only=production --no-optional

# Copy application files
COPY . .

# Environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512" \
    PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Expose the port the app runs on
EXPOSE 8080

# Start the application with proper error handling
CMD ["node", "deploy-startup.js"]
