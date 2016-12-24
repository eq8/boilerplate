FROM node:4.6.0

EXPOSE 8080

WORKDIR /src

COPY webpack.config.js /src/webpack.config.js
COPY package.json /src/package.json
RUN ["npm", "install"]
RUN ["mkdir", "-p", "/src/public/assets"]

COPY lib /src/lib
COPY defaults.json /src/defaults.json
COPY index.js /src/index.js

CMD ["node", "index.js"]
