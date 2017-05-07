FROM node:6.9.2

ENV CACHE_HOST redis
ENV CACHE_PORT 6379

WORKDIR /src

COPY package.json /src/package.json
RUN ["npm", "install"]

COPY ./wait-for-it.sh /src
COPY defaults.json /src/defaults.json
COPY index.js /src/index.js

CMD ./wait-for-it.sh ${CACHE_HOST}:${CACHE_PORT} --timeout=0 -- node index.js --cacheHost ${CACHE_HOST} --cachePort ${CACHE_PORT}
