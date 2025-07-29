import jwt from 'jsonwebtoken';
const JWT_SECRET = 'your-super-secret-key';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // ヘッダーやトークンの形式が不正な場合は401
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.sendStatus(401);
    }

    const token = authHeader.split(' ')[1];

    // jwt.verifyをPromiseでラップして、awaitで完了を待つ
    const user = await new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          // エラーがあればPromiseをreject
          return reject(err);
        }
        // 成功すればデコードされた情報をresolve
        resolve(decoded);
      });
    });

    // リクエストにユーザー情報を格納
    req.user = user;

    // 次の処理へ
    next();

  } catch (error) {
    // tryブロック内で発生したエラー（トークン期限切れなど）はここでキャッチ
    return res.sendStatus(403); // Forbidden
  }
};