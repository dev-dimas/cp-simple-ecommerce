FROM node:18.16.0

RUN apt-get update && apt-get install -y curl

WORKDIR /app

COPY  . .

RUN npm install

EXPOSE 3000

ENTRYPOINT [ "node", "src/app.js" ]