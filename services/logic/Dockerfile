FROM node:4.6.0

ENV QUEUE_HOST beanstalkd
ENV VCS_HOST vcs
ENV VCS_PORT 8080

WORKDIR /src

COPY package.json /src/
RUN ["npm", "install"]

COPY index.js /src/
COPY defaults.json /src/
COPY config.json /root/.node-red/.config.json
COPY nodes /src/nodes

CMD node index.js --listenHost ${QUEUE_HOST} --clientHost ${VCS_HOST} --clientPort ${VCS_PORT}
