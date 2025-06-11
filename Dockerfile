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

# Create wait-for script with longer timeout and more detailed logs
RUN echo '#!/bin/sh\n\
max_attempts=30\n\
attempt=1\n\
while [ $attempt -le $max_attempts ]; do\n\
  echo "Attempt $attempt/$max_attempts: Connecting to MySQL at ${DB_HOST:-switchback.proxy.rlwy.net}:${DB_PORT:-55611}..."\n\
  if nc -z -w 5 ${DB_HOST:-switchback.proxy.rlwy.net} ${DB_PORT:-55611}; then\n\
    echo "MySQL is ready!"\n\
    exec "$@"\n\
    exit 0\n\
  fi\n\
  attempt=$((attempt + 1))\n\
  echo "Connection failed. Waiting 10 seconds before retrying..."\n\
  sleep 10\n\
done\n\
echo "Failed to connect to MySQL after $max_attempts attempts"\n\
exit 1' > /wait-for && chmod +x /wait-for

ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512" \
    DB_HOST="$MYSQLHOST" \
    DB_PORT="$MYSQLPORT" \
    DB_USER="$MYSQLUSER" \
    DB_PASSWORD="$MYSQLPASSWORD" \
    DB_NAME="$MYSQLDATABASE"

EXPOSE 3000

# Use wait-for script before starting the application with longer timeout
CMD ["/bin/sh", "-c", "/wait-for && npm run migrate && npm start"]
