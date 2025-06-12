FROM node:20-alpine

# Install dependencies for wait-for script
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with specific flags for production
RUN npm ci --only=production

# Copy application files
COPY . .

# Create improved wait-for script
RUN printf '#!/bin/sh\n\
: "${MYSQLHOST:?need MYSQLHOST}"\n\
: "${MYSQLPORT:?need MYSQLPORT}"\n\
max=30; i=1\n\
while ! nc -z $MYSQLHOST $MYSQLPORT; do\n\
  echo "waiting for mysql $i/$max"; i=$((i+1)); [ $i -gt $max ] && exit 1; sleep 2\n\
done\n\
exec "$@"\n' > /wait-for && chmod +x /wait-for

ENV NODE_ENV=production \
    PORT=8080

# Improved healthcheck configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE ${PORT}

CMD ["sh", "-c", "/wait-for && node index.js"]
