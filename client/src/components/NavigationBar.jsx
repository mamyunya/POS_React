import React from 'react';
import './NavigationBar.css'; // 必要に応じてスタイルを適用

function NavigationBar({ activeTab, onTabChange }) {
  return (
    <nav className="tabs">
      <button
        className={activeTab === 'purchase' ? 'tab-active' : ''}
        onClick={() => onTabChange('purchase')}
      >
        購入画面
      </button>
      <button
        className={activeTab === 'history' ? 'tab-active' : ''}
        onClick={() => onTabChange('history')}
      >
        売上履歴
      </button>
      <button
        className={activeTab === 'register' ? 'tab-active' : ''}
        onClick={() => onTabChange('register')}
      >
        商品登録
      </button>
    </nav>
  );
}

export default NavigationBar;