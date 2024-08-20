FROM node:18-alpine
COPY /src/azure-blob .
RUN ls
RUN yarn install

CMD ["node", "index.js"]
EXPOSE 3000