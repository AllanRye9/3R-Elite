FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm install
COPY . .
RUN npm run build
RUN cd server && npx prisma generate
EXPOSE 5000
CMD ["npm", "start"]
