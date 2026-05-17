FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

EXPOSE 4000

CMD ["sh", "-c", "npm install && npm run dev"]
