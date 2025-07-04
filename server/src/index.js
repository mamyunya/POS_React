import express from 'express';
import cors from 'cors';
import productRoutes from './routes/product.routes.js';
import saleRoutes from './routes/sale.routes.js';

const app = express();
const PORT = 3000;

// ★ 1. 最低限必要な「おまじない」(ミドルウェア)
app.use(cors()); // フロントエンド(違うドメイン)からのアクセスを許可する
app.use(express.json()); // 送られてきたJSONデータを読めるようにする

// ★ 2. URLと担当ファイルを紐づける
app.use('/api', productRoutes); // '/api'で始まるURLはproductRoutesに処理を任せる
app.use('/api', saleRoutes);    // '/api'で始まるURLはsaleRoutesに処理を任せる

// ★ 3. サーバーを起動
app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました。`);
});