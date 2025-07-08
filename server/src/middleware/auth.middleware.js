import jwt from 'jsonwebtoken';
const JWT_SECRET = 'your-super-secret-key';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"の形式

  if (token == null) return res.sendStatus(401); // トークンがない

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // トークンが無効
    req.user = user; // リクエストオブジェクトにユーザー情報を格納
    next(); // 次の処理へ
  });
};