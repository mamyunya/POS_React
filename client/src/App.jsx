import { useState, useEffect, useCallback} from 'react';
import './App.css';
import NavigationBar from './components/NavigationBar';
import PaymentModal from './components/PaymentModal';
import WritingModal from './components/WritingModal';
import Auth from './components/Auth';

// ★ バックエンドAPIのベースURLを定数として定義
const API_BASE_URL = '/api';
const WEB_SOCKET_URL = `ws://${window.location.host}`;



function App() {
  // トークンを管理するState 初期値はlocalStorageから取得したトークン
  const [token, setToken] = useState(localStorage.getItem('token'));
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

  //　売上履歴を管理するStateを追加
  const [sales, setSales] = useState([]);


  // ログイン成功時の処理
  const handleLoginSuccess = (receivedToken) => {
    localStorage.setItem('token', receivedToken); // トークンをlocalStorageに保存
    setToken(receivedToken);
  };

  // ログアウト処理
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  
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


  // 売上履歴を取得する関数を追加
  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/sales`);
      if (!response.ok) {
        throw new Error('売上履歴の取得に失敗しました。');
      }
      const data = await response.json();
      setSales(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);


  // WebSocketに接続し、サーバーからの通知を待つ (将来のため)
  useEffect(() => {
    // ログイ ンしていなければ（トークンがなければ）接続しない
    if (!token) return;

    //  接続URLにトークンを付与する
    const ws = new WebSocket(`${WEB_SOCKET_URL}?token=${token}`);

    // 接続成功時の処理
    ws.onopen = () => {
      console.log('WebSocketサーバーに接続しました。');
    };

    // サーバーからメッセージを受信したときの処理
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('サーバーからの通知:', message);

      // 受け取ったメッセージのタイプに応じて、データを再取得
      if (message.type === 'PRODUCT_UPDATED') {
        fetchProducts();
      } else if (message.type === 'SALE_UPDATED') {
        // 現在開いているタブが履歴画面なら再取得
        if (activeTab === 'history') {
          fetchSales();
        }
      }
    };

    // 接続が閉じたときの処理
    ws.onclose = () => {
      console.log('WebSocketサーバーから切断しました。');
    };
    
    // エラー発生時の処理
    ws.onerror = (error) => {
      console.error('WebSocketエラー:', error);
    };

    // コンポーネントがアンマウントされるときに接続を閉じる（クリーンアップ）
    return () => {
      if(ws) {
        ws.close();
      }
    };
    // 依存配列にactiveTabを追加して、タブの状態をonmessage内で参照できるようにする
  }, [fetchProducts, fetchSales, activeTab]);


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
          'Authorization': `Bearer ${token}`
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
      //fetchProducts(); // 商品リストを再取得（WebSocketがあるので不要な場合も）

    } catch (err) {
      alert(err.message);
    }
  };


  const handleStatusChange = async (saleId, newStatus) => {
    // 画面を即時反映させる「Optimistic UI Update」
    setSales(currentSales =>
      currentSales.map(sale =>
        sale.id === saleId ? { ...sale, status: newStatus } : sale
      )
    );

    try {
      const response = await fetch(`${API_BASE_URL}/sales/${saleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error('ステータスの更新に失敗しました。');
      }
      // WebSocket経由で更新されるので、ここではfetchSales()を呼ばなくても良い
    } catch (err) {
      alert(err.message);
      // エラーが起きたら元の状態に戻す
      fetchSales(); 
    }
  };



  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'history') {
      fetchSales(); // 売上履歴タブに戻ったら売上履歴を再取得
    }else{
      fetchProducts(); // 商品一覧タブに戻ったら商品リストを再取得
    }
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


  // 売上履歴を描画するための関数
  const renderSalesHistory = () => {
    if (isLoading) return <div>読み込み中...</div>;
    if (error) return <div className="error-message">エラー: {error}</div>;
    if (sales.length === 0) return <div>売上履歴はまだありません。</div>;
    let totalAmount = 0; // 合計金額を計算するための変数

    return (
      <div className="sales-history">
        <div className="table-container">
          <table className="sales-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>取引日時</th>
                <th>顧客情報</th>
                <th>購入商品</th>
                <th>合計金額</th>
                <th>ステータス</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                totalAmount += sale.totalAmount, // 合計金額を加算
                <tr key={sale.id}>
                  <td data-label="ID">{sale.id}</td>
                  <td data-label="取引日時">{new Date(sale.createdAt).toLocaleString('ja-JP')}</td>
                  <td data-label="顧客情報">{`${sale.customerDetail} (${sale.gender}/${sale.customerType})`}</td>
                  <td data-label="購入商品">
                    <ul className="sale-items-list-in-table">
                      {sale.saleItems.map((item) => (
                        <li key={item.id}>
                          {item.product.name} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td data-label="合計金額">¥{sale.totalAmount.toLocaleString()}</td>
                  <td data-label="ステータス">
                    <div className="status-buttons">
                      <button
                        onClick={() => handleStatusChange(sale.id, 'NON_COMMIT')}
                        className={sale.status === 'NON_COMMIT' ? 'active' : ''}
                      >
                        調理前
                      </button>
                      <button
                        onClick={() => handleStatusChange(sale.id, 'IN_PROGRESS')}
                        className={sale.status === 'IN_PROGRESS' ? 'active' : ''}
                      >
                        調理中
                      </button>
                      <button
                        onClick={() => handleStatusChange(sale.id, 'SERVED')}
                        className={sale.status === 'SERVED' ? 'active' : ''}
                      >
                        提供済み
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          合計：{totalAmount} 円
        </div>
        <div className="sales-history-header">
          <button onClick={handleExportCsv} className="btn-export">
            CSVエクスポート
          </button>
        </div>
      </div>
    );
  };


 const handleExportCsv = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sales/export`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('CSVのエクスポートに失敗しました。');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-history-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    alert(err.message);
  }
};


   // ログイン状態に応じて表示を切り替える
  if (!token) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }



  return (
    <div className="container">
      <NavigationBar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="app-header">
        <button onClick={handleLogout} className="btn-logout">ログアウト</button>
      </div>
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
              {renderSalesHistory()}
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
        {isWritingOpen && <WritingModal cart={cart} products={products} API_BASE_URL={API_BASE_URL} onClose={handleCloseWriting} onPurchaseComplete={handlePurchaseComplete} token={token}/>}
      </main>
    </div>
  );
}

export default App;