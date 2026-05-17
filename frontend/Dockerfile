FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

EXPOSE 5173

# npm install en cada arranque sincroniza dependencias nuevas sin reconstruir la imagen
CMD ["sh", "-c", "npm install && npm run dev"]
