FROM node:22-alpine
WORKDIR /app
COPY package.json server.mjs ./
COPY lib ./lib
ENV NODE_ENV=production DATA_DIR=/data PORT=3100
VOLUME /data
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 3100
CMD ["node", "server.mjs"]
