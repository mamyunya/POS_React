import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'your-super-secret-key'; // ★ 本番では.envファイルに移動すべき秘密鍵

// ユーザー登録
export const register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'ユーザー名とパスワードは必須です。' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });
    res.status(201).json({ message: 'ユーザー登録が完了しました。', userId: user.id });
  } catch (error) {
    res.status(400).json({ message: 'このユーザー名は既に使用されています。' });
  }
};

// ログイン
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: '認証情報が正しくありません。' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '認証情報が正しくありません。' });
    }
    // ★ JWTを生成
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'ログイン中にエラーが発生しました。' });
  }
};