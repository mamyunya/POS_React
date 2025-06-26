import React, { useState, useEffect } from 'react';
import './PaymentModal.css'; // スタイル用CSS

function PaymentModal({ cart, products, onClose ,onOpen}) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [change, setChange] = useState(0);

  // 合計金額を計算する
  useEffect(() => {
    const total = Object.entries(cart).reduce((sum, [productId, quantity]) => {
      const product = products.find(p => p.id === Number(productId));
      return sum + (product ? product.price * quantity : 0);
    }, 0);
    setTotalAmount(total);
  }, [cart, products]);

  // 支払い金額が変更されたときの処理
  const handlePaymentChange = (event) => {
    const value = event.target.value.replace(/[^0-9]/g, ''); // 数字のみ入力可能
    setPaymentAmount(value);
  };

  // 計算ボタンが押されたときの処理
  const handleCalculateChange = () => {
    const paid = parseInt(paymentAmount, 10) || 0;
    setChange(paid - totalAmount);
  };

  
  const ConfirmButton=()=>{
    onOpen();
    onClose();
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <h2>支払い</h2>
        <p>合計金額: ¥{totalAmount.toLocaleString()}</p>

        <div className="payment-input">
          <label htmlFor="payment">支払金額:</label>
          <input
            type="text"
            id="payment"
            placeholder="数字のみ入力 (例: 1000)"
            value={paymentAmount}
            onChange={handlePaymentChange}
          />
        </div>

        <button className="btn-calculate" onClick={handleCalculateChange}>
          計算
        </button>

        {change >= 0 && <p className="change-display">お釣り: ¥{change.toLocaleString()}</p>}
        {change < 0 && <p className="change-display error">不足: ¥{Math.abs(change).toLocaleString()}</p>}

        <div className="modal-actions">
          <button className="btn-close" onClick={onClose}>閉じる</button>
          {change >= 0 && totalAmount > 0 && (
            <button className="btn-confirm" onClick={ConfirmButton}>確定</button> 
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;