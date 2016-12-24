FROM node:4.6.0

EXPOSE 8080

WORKDIR /src

COPY package.json /src/package.json
RUN ["npm", "install"]

COPY public /src/public
COPY defaults.json /src/defaults.json
COPY index.js /src/index.js

CMD ["node", "index.js"]
