FROM node:6.9.2-alpine

WORKDIR /src

COPY package.json /src/
RUN ["npm", "install"]

COPY index.js /src/
COPY defaults.json /src/
COPY config.json /root/.node-red/.config.json
COPY nodes /src/nodes

CMD node index.js
