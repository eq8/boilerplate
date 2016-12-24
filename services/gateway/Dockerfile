FROM node:4.6.0

EXPOSE 8080

WORKDIR /src

COPY package.json /src/
RUN ["npm", "install"]

COPY defaults.json /src/
COPY index.js /src/

CMD ["node", "index.js"]
