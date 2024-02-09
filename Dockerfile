FROM node:20
WORKDIR /app
ADD . /app
RUN yarn
RUN yarn build
CMD yarn start