import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ★ Docker用の設定を追加
  server: {
    host: true, // ホストを公開してコンテナ外からアクセス可能にする
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
})