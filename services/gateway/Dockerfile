FROM node:4.6.0

EXPOSE 8080

WORKDIR /src

COPY package.json /src/
RUN ["npm", "install"]

COPY defaults.json /src/
COPY webpack.config.js /src/
COPY server.js /src/

COPY public /src/
COPY lib /src/

CMD ["npm", "start"]
