FROM node:4.6.0

ENV NODE_ENV production
ENV DB_HOST mysql
ENV DB_PORT 3306

WORKDIR /src

COPY ./package.json /src
RUN npm install

COPY ./wait-for-it.sh /src
COPY ./knexfile.js /src
COPY ./defaults.json /src

COPY ./migrations /src/migrations

CMD ./wait-for-it.sh ${DB_HOST}:${DB_PORT} --timeout=0 -- npm run migrate
