FROM node:16.0.0
WORKDIR /app
COPY ./package*.json ./
COPY src ./src
RUN npm install
CMD ["npm", "start"]