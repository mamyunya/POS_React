FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Viteが使用するポートを公開
EXPOSE 5173

# コンテナ起動時に実行されるデフォルトのコマンドはdocker-compose.ymlで指定