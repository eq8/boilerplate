FROM node:4.6.0

ENV DB_HOST mysql
ENV DB_PORT 3306
ENV DB_USER root

WORKDIR /src

COPY ./package.json /src
RUN npm install

COPY ./wait-for-it.sh /src
COPY ./defaults.json /src

COPY ./migrations /src/migrations
COPY ./index.js /src

CMD ./wait-for-it.sh ${DB_HOST}:${DB_PORT} --timeout=0 -- node index.js --dbHost ${DB_HOST} --dbPort ${DB_PORT} --dbUser ${DB_USER}
