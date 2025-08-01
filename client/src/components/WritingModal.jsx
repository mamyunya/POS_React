import React, { useState, useEffect } from 'react';
import './WritingModal.css';

function WritingModal({ cart, products, API_BASE_URL, onClose, onPurchaseComplete, token }) {
  // ★ 1. Stateの定義
  const [totalAmount, setTotalAmount] = useState(0);
  const [customerDetail, setCustomerDetail] = useState(''); // 服装・整理番号など
  const [gender, setGender] = useState(''); // 性別
  const [customerType, setCustomerType] = useState(''); // 顧客種別

  // 合計金額を計算する
  useEffect(() => {
    const total = Object.entries(cart).reduce((sum, [productId, quantity]) => {
      const product = products.find(p => p.id === Number(productId));
      return sum + (product ? product.price * quantity : 0);
    }, 0);
    setTotalAmount(total);
  }, [cart, products]);

  // APIへデータを送信する関数
  const handleSubmit = async () => {

    const cartForApi = Object.fromEntries(
    Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p.id === Number(productId));
      return [
        productId,
        {
          quantity: quantity,
          price: product ? product.price : 0, // 売上時点での価格
        }
      ];
    })
  );

    // 送信するデータ（ペイロード）を作成
    const payload = {
      cart: cartForApi,
      customer_detail: customerDetail,
      gender: gender,
      customer_type: customerType,
      total_amount: totalAmount,
    };

    console.log('APIに送信するデータ:', payload);

    try {
      // fetchを使ってバックエンドAPIにPOSTリクエストを送信
      const response = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('登録が完了しました。');
        onPurchaseComplete(); //  親コンポーネントに完了を通知
      } else {
        // サーバーからのエラーレスポンスを処理
        const errorData = await response.json();
        alert(`登録に失敗しました: ${errorData.message || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('API送信中にエラーが発生しました:', error);
      alert('通信エラーが発生しました。');
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <h2>顧客情報入力</h2>
        <p>合計金額: ¥{totalAmount.toLocaleString()}</p>

        <div className="form-group">
          <label htmlFor="customerDetail">顧客情報 (服装、整理番号など):</label>
          <input
            id="customerDetail"
            type="text"
            placeholder="例: 赤いTシャツの男性、整理番号5番"
            value={customerDetail}
            onChange={(e) => setCustomerDetail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>性別:</label>
          <div className="radio-group">
            <label><input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={(e) => setGender(e.target.value)} /> 男性</label>
            <label><input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={(e) => setGender(e.target.value)} /> 女性</label>
            <label><input type="radio" name="gender" value="other" checked={gender === 'other'} onChange={(e) => setGender(e.target.value)} /> その他</label>
          </div>
        </div>

        <div className="form-group">
          <label>顧客種別:</label>
          <div className="radio-group">
            <label><input type="radio" name="customerType" value="student" checked={customerType === 'student'} onChange={(e) => setCustomerType(e.target.value)} /> 生徒</label>
            <label><input type="radio" name="customerType" value="teacher" checked={customerType === 'teacher'} onChange={(e) => setCustomerType(e.target.value)} /> 教職員</label>
            <label><input type="radio" name="customerType" value="general" checked={customerType === 'general'} onChange={(e) => setCustomerType(e.target.value)} /> 一般</label>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-close" onClick={onClose}>閉じる</button>
          <button
            className="btn-confirm"
            onClick={handleSubmit}
            //disabled={!customerDetail || !gender || !customerType} // 全て入力されるまで非活性
          >
            確定
          </button>
        </div>
      </div>
    </div>
  );
}

export default WritingModal;