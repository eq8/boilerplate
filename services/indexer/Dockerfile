FROM node:6.9.2

ENV INDEX_HOST elasticsearch
ENV INDEX_PORT 9200

WORKDIR /src

COPY package.json /src/package.json
RUN ["npm", "install"]

COPY ./wait-for-it.sh /src
COPY defaults.json /src/defaults.json
COPY index.js /src/index.js

CMD ./wait-for-it.sh ${INDEX_HOST}:${INDEX_PORT} --timeout=0 -- node index.js --indexHost ${ES_HOST} --indexPort ${INDEX_PORT} --dbUser ${DB_USER}
