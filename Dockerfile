FROM node:10-alpine
WORKDIR /api
COPY package.json /api
RUN npm install
COPY . /api
EXPOSE 3000

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD /wait && npm start

