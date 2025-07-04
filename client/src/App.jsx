import { useState, useEffect, useCallback} from 'react';
import './App.css';
import NavigationBar from './components/NavigationBar';
import PaymentModal from './components/PaymentModal';
import WritingModal from './components/WritingModal';

// ★ バックエンドAPIのベースURLを定数として定義
const API_BASE_URL = 'http://localhost:3000/api';

// // サンプルの商品データ
// const mockProducts = [
//   { id: 1, name: 'aa', price: 100 },
//   { id: 2, name: 'as', price: 12345 },
//   { id: 3, name: 'bb', price: 250 },
//   { id: 4, name: 'cc', price: 800 },
// ];

// const salesRecode = [
//   { id: 1, created_at: '2025-04-05-12:00:00', aa: 0, as: 0,bb: 1, cc:2, customer_detail: "white", gender: "female", customer_type: "student"}
// ];

function App() {
  // 選択中のタブを管理するState
  const [activeTab, setActiveTab] = useState('purchase');
  // カートの中身を管理するState
  const [cart, setCart] = useState({});
  //支払い画面表示を管理するstate
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  //情報入力画面を管理するstate
  const [isWritingOpen, setIsWritingOpen] = useState(false);

  // APIから取得した商品リスト、ローディング状態、エラーを管理するStateを追加
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 新規登録する商品の名前と価格を管理するStateを追加
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  
  const fetchProducts = useCallback(async () =>{
    setIsLoading(true); // データ取得開始
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error('データの取得に失敗しました。');
      }
      const data = await response.json();
      setProducts(data); // 取得したデータでStateを更新
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false); // データ取得完了（成功・失敗問わず）
    }
  }, []); // useCallbackの依存配列は空


  //ページが読み込まれた最初だけ実行
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // // WebSocketに接続し、サーバーからの通知を待つ (将来のため)
  // useEffect(() => {
  //   const ws = new WebSocket('ws://localhost:3000');
  //   ws.onopen = () => console.log('WebSocketに接続しました。');
  //   ws.onmessage = (event) => {
  //     const message = JSON.parse(event.data);
  //     if (message.type === 'PRODUCT_UPDATED') {
  //       console.log('商品が更新されました。リストを再取得します。');
  //       fetchProducts(); // 商品更新の通知が来たら、同じ関数を呼び出す
  //     }
  //   };
  //   ws.onclose = () => console.log('WebSocketから切断しました。');

  //   // クリーンアップ関数
  //   return () => {
  //     ws.close();
  //   };
  // }, [fetchProducts]);


  // 新しい商品を登録するためのAPIを呼び出す関数を追加
  const handleRegisterProduct = async (event) => {
    event.preventDefault(); // フォームのデフォルト送信を防ぐ

    // バリデーション
    if (!newProductName || !newProductPrice) {
      alert('商品名と価格の両方を入力してください。');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProductName,
          price: Number(newProductPrice),
        }),
      });

      if (!response.ok) {
        throw new Error('商品登録に失敗しました。');
      }

      alert('商品を登録しました！');
      setNewProductName(''); // 入力フォームをクリア
      setNewProductPrice('');
      // fetchProducts(); // 商品リストを再取得（WebSocketがあるので不要な場合も）

    } catch (err) {
      alert(err.message);
    }
  };


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

  //購入画面の描画
  const renderProductList = () => {
    if (isLoading) {
      return <div>読み込み中...</div>;
    }
    if (error) {
      return <div className="error-message">エラー: {error}</div>;
    }
    return (
      <div className="product-list">
        {/* mockProductsの代わりに、APIから取得したproducts stateをmapする */}
        {products.map((product) => (
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
                disabled={!cart[product.id]}
              >
                戻す
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };


  //  商品登録タブの中身を描画する関数
  const renderRegisterProduct = () => {
    return (
      <div>
        {/* 新規登録フォーム */}
        <form onSubmit={handleRegisterProduct} className="register-form">
          <h3>新規商品登録</h3>
          <div className="form-group">
            <label htmlFor="productName">商品名:</label>
            <input
              type="text"
              id="productName"
              placeholder="豆100g"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="productPrice">価格 (円):</label>
            <input
              type="number"
              id="productPrice"
              placeholder="例: 1500"
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-purchase">この内容で登録</button>
        </form>

        {/* 現在の商品リスト */}
        <div className="current-products">
          <h3>現在の商品リスト</h3>
            {renderRegisterProductList()}
        </div>
      </div>
    );
  };


  const renderRegisterProductList = () =>{
    return(
      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-item">
          <span className="product-name-regist">
            {product.name} (¥{product.price.toLocaleString()})
          </span>
        </div>
        ))}
      </div>
    );
  };


  return (
    <div className="container">

      <NavigationBar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="content">
        {activeTab === 'purchase' && (
          <div>
            <h2>商品一覧</h2>
            {/* 商品リスト表示部分を関数で呼び出す */}
              {renderProductList()} 
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
              {renderRegisterProduct()}
          </div>
        )}

        {isPaymentOpen && <PaymentModal cart={cart} products={products} onClose={handleClosePayment} onOpen={handleOpenWriting}/>}
        {isWritingOpen && <WritingModal cart={cart} products={products} onClose={handleCloseWriting} onPurchaseComplete={handlePurchaseComplete}/>}
      </main>
    </div>
  );
}

export default App;