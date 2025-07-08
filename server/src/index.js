import express from 'express';
import cors from 'cors';
import productRoutes from './routes/product.routes.js';
import saleRoutes from './routes/sale.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = 3000;


app.use(cors()); // フロントエンド(違うドメイン)からのアクセスを許可する
app.use(express.json()); // 送られてきたJSONデータを読めるようにする

//URLと担当ファイルを紐づける
app.use('/api/auth', authRoutes); // '/api/auth'で始まるURLはauthRoutesに処理を任せる
app.use('/api', productRoutes); // '/api'で始まるURLはproductRoutesに処理を任せる
app.use('/api', saleRoutes);    // '/api'で始まるURLはsaleRoutesに処理を任せる

// サーバーを起動
app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました。`);
});