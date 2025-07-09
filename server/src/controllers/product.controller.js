import { PrismaClient } from '@prisma/client';
import { broadcast } from '../websocket.js';
const prisma = new PrismaClient();


// 商品リストを取得する
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "エラーが発生しました。" });
  }
};

// 新しい商品を登録する
export const createProduct = async (req, res) => {
  try {
    const { name, price } = req.body; // フロントから送られてきたデータを取得
    const newProduct = await prisma.product.create({
      data: {
        name: name,
        price: Number(price),
      },
    });
    broadcast({ type: 'PRODUCT_UPDATED' }); //  通知を送信
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "エラーが発生しました。" });
  }
};