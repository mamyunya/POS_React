import { WebSocketServer } from 'ws';

const clients = new Set(); // 接続中の全クライアントを管理

let wss;

// WebSocketサーバーを初期化・セットアップする関数
export const setupWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('WebSocketクライアントが接続しました。');
    clients.add(ws);

    ws.on('close', () => {
      console.log('WebSocketクライアントが切断しました。');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocketエラー:', error);
    });
  });
};

// 接続している全てのクライアントにメッセージを送信する関数
export const broadcast = (data) => {
  if (!wss) return;

  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
};