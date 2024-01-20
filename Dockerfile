FROM node:18.16.1

WORKDIR /usr/src/app

ADD . .

RUN npm install

EXPOSE 3107

# development setup
ENTRYPOINT ["sh", "-c", "npm run setup && npm run dev" ]

# production setup
# CMD npm run migrate:up
# ENTRYPOINT [ "npm", "start" ]
