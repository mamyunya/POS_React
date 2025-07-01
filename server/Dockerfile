# pos-system/server/Dockerfile

# ベースとなるNode.jsイメージを指定
FROM node:24-slim

#OpenSSLの追加
RUN apt-get update -y \
&& apt-get install -y openssl

# 作業ディレクトリを作成・設定
WORKDIR /usr/src/app

# 依存関係ファイルをコピーして、先にインストールする
# (ソースコードの変更時に毎回npm installが走るのを防ぐため)
COPY package*.json ./

#先にprismaをコピーする
COPY prisma ./prisma/

RUN npm install

# Prisma Clientを生成
RUN npm exec prisma generate

# ソースコードをコピー
COPY . .

# サーバーが使用するポートを公開
EXPOSE 3000

# コンテナ起動時に実行されるデフォルトのコマンドはdocker-compose.ymlで指定