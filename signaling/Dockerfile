FROM node:latest

RUN npm install pm2 -g

COPY . /app

WORKDIR /app

CMD ["pm2-runtime", "start", "app.js"]