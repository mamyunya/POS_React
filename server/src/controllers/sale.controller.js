import { PrismaClient } from '@prisma/client';
import { Parser } from 'json2csv';
import { broadcast } from '../websocket.js';
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
    const { userId } = req.user;
    // 売上本体と、売上の詳細(SaleItem)を同時に登録する
    const sale = await prisma.sale.create({
      data: {
        totalAmount: total_amount,
        customerDetail: customer_detail,
        gender: gender,
        customerType: customer_type,
        userId: userId, // 誰が登録したかを記録するためのuserId

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
    broadcast({ type: 'SALE_UPDATED' });
    res.status(201).json(sale);
  } catch (error) {
    // console.error(error); // デバッグ用にエラー内容を表示
    res.status(500).json({ message: "エラーが発生しました。" });
  }
};


// 売上ステータスを更新する
export const updateSaleStatus = async (req, res) => {
  try {
    const { id } = req.params; // URLからsaleのIDを取得
    const { status } = req.body; // リクエストボディから新しいステータスを取得

    const updatedSale = await prisma.sale.update({
      where: { id: Number(id) },
      data: { status: status }, // statusフィールドを更新
    });
    

    //  変更を全クライアントに通知
    broadcast({ type: 'SALE_UPDATED' });

    res.status(200).json(updatedSale);
  } catch (error) {
    res.status(500).json({ message: "ステータスの更新中にエラーが発生しました。" });
  }
};


// 売上データをCSV形式でエクスポートする
export const exportSalesToCsv = async (req, res) => {
  try {
    const { userId } = req.user;

    // ★ 1. ユーザーの売上履歴に登場する商品を全て取得する
    const allProducts = await prisma.product.findMany({
      where: {
        // ProductのsaleItemsの中に、
        saleItems: {
          some: {
            // saleのuserIdがログインユーザーのものであるものが、1つでも存在する
            sale: {
              userId: userId,
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    // 2. ログインユーザーの全売上データを取得する
    const sales = await prisma.sale.findMany({
      where: { userId: userId },
      include: {
        saleItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
    // 3. 売上データが存在しない場合はエラーメッセージを返す
    if (sales.length === 0) {
      return res.status(404).send('エクスポートする売上データがありません。');
    }

    // 4. CSVのヘッダーを動的に作成
    const productHeaders = allProducts.map(p => `${p.name}_数量`);
    const headers = ['取引ID', '取引日時', '顧客情報', '顧客性別', '顧客タイプ', ...productHeaders, '合計金額'];

    // 5. 各売上を行データに変換
    const rows = sales.map(sale => {
      const row = {
        '取引ID': sale.id,
        '取引日時': new Date(sale.createdAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
        '顧客情報': `${sale.customerDetail}`,
        '顧客性別': `${sale.gender}`,
        '顧客タイプ': `${sale.customerType}`,
      };

      allProducts.forEach(product => {
        const saleItem = sale.saleItems.find(item => item.productId === product.id);
        row[`${product.name}_数量`] = saleItem ? saleItem.quantity : 0;
      });
      
      row['合計金額'] = sale.totalAmount;
      return row;
    });

    // 6. JSONをCSVに変換してダウンロードさせる
    const json2csvParser = new Parser({ fields: headers });
    const csv = json2csvParser.parse(rows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="sales-summary-${new Date().toISOString().slice(0,10)}.csv"`);
    
    res.status(200).send('\ufeff' + csv);

  } catch (error) {
    console.error("CSVエクスポートエラー:", error);
    res.status(500).json({ message: "CSVのエクスポート中にエラーが発生しました。" });
  }
};