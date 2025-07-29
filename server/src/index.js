import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupWebSocket } from './websocket.js';
import productRoutes from './routes/product.routes.js';
import saleRoutes from './routes/sale.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = 3000;

// ExpressアプリからHTTPサーバーを作成
const server = createServer(app);
// 作成したHTTPサーバーにWebSocketをセットアップ
setupWebSocket(server);

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

// ルーティング
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);

// ★ 正しく統合された 'server' を起動する
server.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました。`);
});