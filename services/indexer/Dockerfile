FROM node:6.9.2-alpine

ENV INDEX_HOST elasticsearch
ENV INDEX_PORT 9200

WORKDIR /src

COPY package.json /src/package.json
RUN ["npm", "install"]

COPY defaults.json /src/defaults.json
COPY index.js /src/index.js

CMD ["node", "index.js"]
