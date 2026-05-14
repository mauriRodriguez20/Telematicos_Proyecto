FROM node:18-alpine
WORKDIR /app
COPY shared/package*.json ./
RUN npm install --omit=dev
COPY shared/ ./
EXPOSE 3000
CMD ["npm", "start"]
