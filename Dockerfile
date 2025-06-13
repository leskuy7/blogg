FROM node:20.11.1-alpine

# Install dependencies for wait-for script
RUN apk add --no-cache netcat-openbsd wget

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with specific flags for production
RUN npm ci --only=production

# Copy application files
COPY . .

# Create wait-for script - pure MYSQL* variables, no fallbacks
RUN printf '#!/bin/sh\n\
if [ -z "$MYSQLHOST" ] || [ -z "$MYSQLPORT" ]; then\n\
    echo "Error: MYSQLHOST and MYSQLPORT environment variables must be set"\n\
    exit 1\n\
fi\n\
\n\
echo "Waiting for MySQL at $MYSQLHOST:$MYSQLPORT..."\n\
i=1\n\
max=30\n\
while ! nc -z "$MYSQLHOST" "$MYSQLPORT"; do\n\
    echo "[$i/$max] Waiting for MySQL at $MYSQLHOST:$MYSQLPORT..."\n\
    i=$((i+1))\n\
    if [ $i -gt $max ]; then\n\
        echo "Error: MySQL connection timeout after $max attempts"\n\
        exit 1\n\
    fi\n\
    sleep 2\n\
done\n\
echo "MySQL is ready!"\n\
exec "$@"\n' > /wait-for && chmod +x /wait-for

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# More frequent health checks during startup
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["sh", "-c", "/wait-for && node deploy-startup.js"]
