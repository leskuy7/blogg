FROM node:20.13-alpine

ARG CACHEBUST=1

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# cache bust
RUN echo "cache bust $(date +%s)"

COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Healthcheck’i DB olmadan sadece “up” kontrolü için kullan
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# wait-for script’i önce çalıştır
ENTRYPOINT ["/wait-for"]
CMD ["node", "index.js"]


# deneme için