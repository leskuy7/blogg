FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production

RUN npm run migrate

EXPOSE 3000

CMD ["npm", "start"]
