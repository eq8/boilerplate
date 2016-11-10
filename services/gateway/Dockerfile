FROM node:4.6.0

EXPOSE 8080

WORKDIR /src

COPY webpack.config.js /src/
COPY package.json /src/
RUN ["npm", "install"]

COPY defaults.json /src/
COPY index.js /src/

COPY public /src/
COPY lib /src/

CMD ["node", "index.js"]
