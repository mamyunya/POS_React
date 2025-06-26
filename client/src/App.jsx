import { useState } from 'react';
import './App.css';
import NavigationBar from './components/NavigationBar';
import PaymentModal from './components/PaymentModal';
import WritingModal from './components/WritingModal';

// サンプルの商品データ
const mockProducts = [
  { id: 1, name: 'aa', price: 100 },
  { id: 2, name: 'as', price: 12345 },
  { id: 3, name: 'bb', price: 250 },
  { id: 4, name: 'cc', price: 800 },
];

function App() {
  // 選択中のタブを管理するState
  const [activeTab, setActiveTab] = useState('purchase');
  // カートの中身を管理するState
  const [cart, setCart] = useState({});
  //支払い画面表示を管理するstate
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  //情報入力画面を管理するstate
  const [isWritingOpen, setIsWritingOpen] = useState(false);


  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    // タブが変更されたときに、必要であれば追加のロジック（例: カートを空にする、別の状態をリセットするなど）
    // console.log(`タブが ${tabName} に変更されました`); // デバッグ用にログを出力
  };

  // 商品をカートに追加する関数
  const handleAddToCart = (productId) => {
    setCart((prevCart) => ({
      ...prevCart,
      [productId]: (prevCart[productId] || 0) + 1,
    }));
  };

  // カートから商品を減らす（戻す）関数
  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => {
      const newQuantity = (prevCart[productId] || 0) - 1;
      // 個数が0未満にならないようにする
      if (newQuantity <= 0) {
        // 個数が0になったらカートから商品を削除する
        const { [productId]: _, ...restCart } = prevCart;
        return restCart;
      }
      return {
        ...prevCart,
        [productId]: newQuantity,
      };
    });
  };
  
  // 購入処理を行う関数
  const handlePurchaseClick = () => {
    if (Object.keys(cart).length === 0) {
      alert('カートに商品がありません。');
      return;
    }
    setIsPaymentOpen(true); // 購入ボタンが押されたらお支払い画面を開く
  };
    

    // 購入完了時の処理を追加
  const handlePurchaseComplete = () => {
    setCart({}); // カートを空にする
    setIsWritingOpen(false); // モーダルを閉じる
  };


  //   // 購入内容の確認（実際にはここでAPIを呼び出し、売上を記録する）
  //   console.log('購入データ:', cart);
  //   console.log('合計金額:', totalAmount);
    
  //   alert(`合計金額は ¥${totalAmount.toLocaleString()} です。\n購入処理を実行します。（コンソールを確認してください）`);
    
  //   // カートを空にする
  //   setCart({});
  // };

  const handleClosePayment = () => {
    setIsPaymentOpen(false); // お支払い画面を閉じる
  };

  const handleOpenWriting = () => {
    setIsWritingOpen(true);//情報入力画面を開く
  };

  const handleCloseWriting = () => {
    setIsWritingOpen(false);//情報入力画面を閉じる
  }

  return (
    <div className="container">

      <NavigationBar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="content">
        {activeTab === 'purchase' && (
          <div>
            <h2>商品一覧</h2>
            <div className="product-list">
              {mockProducts.map((product) => (
                <div key={product.id} className="product-item">
                  <span className="product-name">
                    {product.name} (¥{product.price.toLocaleString()})
                  </span>
                  <div className="product-controls">
                    <div className="quantity-display">{cart[product.id] || 0}</div>
                    <button className="btn-add" onClick={() => handleAddToCart(product.id)}>
                      追加
                    </button>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveFromCart(product.id)}
                      disabled={!cart[product.id]} // カートにない場合は非活性化
                    >
                      戻す
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-purchase" onClick={handlePurchaseClick}>購入</button>
          </div>
        )}

        {/* 売上履歴画面（今回はプレースホルダー） */}
        {activeTab === 'history' && (
          <div>
            <h2>売上履歴</h2>
            <p>ここに売上履歴が表示されます。</p>
          </div>
        )}

        {/* 商品登録画面（今回はプレースホルダー） */}
        {activeTab === 'register' && (
          <div>
            <h2>商品登録</h2>
            <p>ここに商品登録フォームが表示されます。</p>
          </div>
        )}

        {isPaymentOpen && <PaymentModal cart={cart} products={mockProducts} onClose={handleClosePayment} onOpen={handleOpenWriting}/>}
        {isWritingOpen && <WritingModal cart={cart} products={mockProducts} onClose={handleCloseWriting} onPurchaseComplete={handlePurchaseComplete}/>}
      </main>
    </div>
  );
}

export default App;