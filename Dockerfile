FROM node:10-jessie

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install
ENV PORT 3000
EXPOSE 3000
CMD [ "node", "src/app.ts" ]
