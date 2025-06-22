FROM node:20-alpine

WORKDIR /app

# 1) wait-for scriptini oluştur
RUN apk add --no-cache netcat-openbsd \
 && echo '#!/bin/sh\nwhile ! nc -z ${DB_HOST:-switchback.proxy.rlwy.net} ${DB_PORT:-55611}; do\n  echo "Waiting for MySQL at ${DB_HOST:-switchback.proxy.rlwy.net}:${DB_PORT:-55611}..."\n  sleep 2\ndone\necho "MySQL is ready!"\nexec "$@"' > /wait-for \
 && chmod +x /wait-for

# 2) Application dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# 3) Source copy
COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# 4) Basit healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# 5) entrypoint ile önce DB’ye beklet, sonra başlat
ENTRYPOINT ["/wait-for"]
CMD ["node", "index.js"]