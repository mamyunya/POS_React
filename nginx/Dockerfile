# ---  Reactアプリをビルドする ---
FROM node:lts-alpine AS client-builder
WORKDIR /usr/src/app
# clientディレクトリのpackage.jsonをコピー
COPY ./client/package*.json ./
RUN npm install
# clientディレクトリの全ファイルをコピー
COPY ./client/ ./
RUN npm run build


# ---  Nginxサーバーを設定する ---
FROM nginx:alpine
# 前のステージでビルドした静的ファイルを、Nginxの公開ディレクトリにコピー
COPY --from=client-builder /usr/src/app/dist /usr/share/nginx/html
# Nginxの設定ファイルをコピー
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf