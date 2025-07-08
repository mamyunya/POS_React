import React, { useState } from 'react';
import './Auth.css';

const API_BASE_URL = 'http://localhost:3000/api';

function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true); // ログインモードか登録モードか
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = { username, password };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'エラーが発生しました。');
      }

      if (isLogin) {
        // ログイン成功時、親コンポーネントにトークンを渡す
        onLoginSuccess(data.token);
      } else {
        // 登録成功時
        alert('ユーザー登録が完了しました。ログインしてください。');
        setIsLogin(true); // ログインフォームに切り替え
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{isLogin ? 'ログイン' : '新規登録'}</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="username">ユーザー名</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? '処理中...' : (isLogin ? 'ログイン' : '登録')}
        </button>
        <p className="toggle-form">
          {isLogin ? 'アカウントをお持ちでないですか？' : '既にアカウントをお持ちですか？'}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? '新規登録へ' : 'ログインへ'}
          </button>
        </p>
      </form>
    </div>
  );
}

export default Auth;