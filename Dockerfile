FROM node:20.11.1

ARG CACHEBUST=1

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# cache bust
RUN echo "cache bust $(date +%s)"

COPY . .

# wait-for scriptini oluştur
RUN echo '#!/bin/sh\nwhile ! nc -z ${DB_HOST:-switchback.proxy.rlwy.net} ${DB_PORT:-55611}; do\n  echo "Waiting for MySQL at ${DB_HOST:-switchback.proxy.rlwy.net}:${DB_PORT:-55611}..."\n  sleep 2\ndone\necho "MySQL is ready!"\nexec "$@"' > /wait-for && chmod +x /wait-for

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Healthcheck’i DB olmadan sadece “up” kontrolü için kullan
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# wait-for script’i önce çalıştır
ENTRYPOINT ["/wait-for"]
CMD ["node", "index.js"]