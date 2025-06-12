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
max_attempts=30\n\
attempt=1\n\
echo "Waiting for MySQL..."\n\
while [ $attempt -le $max_attempts ]; do\n\
    if nc -z -w5 ${MYSQLHOST} ${MYSQLPORT}; then\n\
        echo "MySQL is ready!"\n\
        exec "$@"\n\
        exit 0\n\
    fi\n\
    attempt=$((attempt + 1))\n\
    echo "Attempt $attempt/$max_attempts: MySQL is not ready yet..."\n\
    sleep 2\n\
done\n\
echo "Could not connect to MySQL after $max_attempts attempts"\n\
exit 1' > /wait-for && chmod +x /wait-for

# Environment variables
ENV NODE_ENV=production \
    PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start with wait-for script
CMD ["/bin/sh", "-c", "/wait-for node deploy-startup.js"]
