FROM node:12-alpine

COPY ./ /usr/src/app

WORKDIR /usr/src/app

RUN npm i
RUN npm run build
RUN npm prune --production

RUN rm -rf src types tsconfig.json tslint.json

CMD ["node", "dist/index.js"]
