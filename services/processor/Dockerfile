FROM node:4.6.0

WORKDIR /src

COPY package.json /src/
RUN ["npm", "install"]

COPY index.js /src/
CMD ["node", "index.js"]
