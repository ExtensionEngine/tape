FROM node:16.13.0
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY ./ ./

EXPOSE 3000
CMD npm run db:migration:up && npm start
