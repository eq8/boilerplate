FROM node:6.10.2-alpine

WORKDIR /src

COPY package.json /src/package.json
RUN ["npm", "install"]

COPY index.js /src/index.js
COPY defaults.json /src/defaults.json
COPY nodes /src/nodes

CMD node index.js
