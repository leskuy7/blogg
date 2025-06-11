FROM node:20-alpine

# Install dependencies for wait-for script
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

ENV NODE_ENV=production \
    PORT=8080 \
    DB_HOST="switchback.proxy.rlwy.net" \
    DB_PORT="55611" \
    DB_USER="root" \
    DB_PASSWORD="${MYSQLPASSWORD}" \
    DB_NAME="railway"

EXPOSE 8080

# Health check ekle
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["npm", "start"]
