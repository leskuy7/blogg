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

# Create wait-for script
RUN echo '#!/bin/sh\n\
while ! nc -z ${DB_HOST:-switchback.proxy.rlwy.net} ${DB_PORT:-55611}; do\n\
  echo "Waiting for MySQL at ${DB_HOST:-switchback.proxy.rlwy.net}:${DB_PORT:-55611}..."\n\
  sleep 2\n\
done\n\
echo "MySQL is ready!"\n\
exec "$@"' > /wait-for && chmod +x /wait-for

ENV NODE_ENV=production \
    DB_HOST=switchback.proxy.rlwy.net \
    DB_PORT=55611

EXPOSE 3000

# Use wait-for script before starting the application
CMD ["/bin/sh", "-c", "/wait-for && npm run migrate && npm start"]
