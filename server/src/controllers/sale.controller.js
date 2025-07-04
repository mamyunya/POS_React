import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 売上履歴を取得する
export const getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: { saleItems: { include: { product: true } } }, // 関連データも一緒に取得
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: "エラーが発生しました。" });
  }
};

// 新しい売上を登録する
export const createSale = async (req, res) => {
  try {
    // フロントから送られてきたデータを取得
    const { cart, customer_detail, gender, customer_type, total_amount } = req.body;
    
    // 売上本体と、売上の詳細(SaleItem)を同時に登録する
    const sale = await prisma.sale.create({
      data: {
        totalAmount: total_amount,
        customerDetail: customer_detail,
        gender: gender,
        customerType: customer_type,
        // 売上の詳細を作成
        saleItems: {
          create: Object.keys(cart).map(productId => ({
            productId: Number(productId),
            quantity: cart[productId].quantity, // フロントのカート構造に合わせる
            priceAtSale: cart[productId].price,  // フロントのカート構造に合わせる
          })),
        },
      },
    });
    res.status(201).json(sale);
  } catch (error) {
    // console.error(error); // デバッグ用にエラー内容を表示
    res.status(500).json({ message: "エラーが発生しました。" });
  }
};