FROM node:6.9.2-alpine

ENV DB_HOST mysql
ENV DB_PORT 3306
ENV DB_USER root
ENV DB_NAME eq8
ENV PUBSUB_HOST redis
ENV PUBSUB_PORT 6379

RUN apk add --update bash && rm -rf /var/cache/apk/*

WORKDIR /src

COPY ./package.json /src
RUN npm install

COPY ./wait-for-it.sh /src
COPY ./defaults.json /src

COPY ./migrations /src/migrations
COPY ./index.js /src

CMD ./wait-for-it.sh ${DB_HOST}:${DB_PORT} --timeout=0 -- node index.js --dbHost ${DB_HOST} --dbPort ${DB_PORT} --dbName ${DB_NAME} --dbUser ${DB_USER} --pubsubHost ${PUBSUB_HOST} --pubsubPort ${PUBSUB_PORT}
