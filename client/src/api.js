const API_BASE_URL = '/api';
/**
 * 認証トークン付きでAPIを呼び出す共通関数
 * @param {string} endpoint - /api/以降のエンドポイント (例: '/products')
 * @param {string} responseType - 期待するレスポンスの形式 ('json', 'blob', 'text')
 * @param {object} options - fetchに渡すオプション (method, bodyなど)
 * @param {function} handleLogout - ログアウト処理を行う関数
 * @returns {Promise<any>} - fetchからのレスポンスのJSONデータ
 * 
 */
export const apiFetch = async (endpoint, options = {}, handleLogout,responseType = 'json') => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // トークンが存在すれば、Authorizationヘッダーを追加
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // レスポンスがNGだった場合の処理
  if (!response.ok) {
    // ★ 401 (Unauthorized) または 403 (Forbidden) の場合は、セッション切れと判断
    if ((response.status === 401 || response.status === 403) && handleLogout) {
      console.log('セッションが切れました。ログアウトします。');
      handleLogout(); // ログアウト処理を呼び出す
      throw new Error('セッションが切れました。');
    }

    // その他のサーバーエラー
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '不明なエラーが発生しました。');
  }

  // レスポンスボディがない場合も考慮
  switch (responseType) {
    case 'blob':
      return response.blob();
    case 'text':
      return response.text();
    default: // 'json'
      // content-typeヘッダーがあるか確認
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json();
      }
      return null; // JSONでない場合はnullを返すなど
  }
};