/** @type {import('next').NextConfig} */
const nextConfig = {
  // APIによって処理される大きなリクエストを許可する
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
  // APIルートのタイムアウトを長めに設定（データベース接続に時間がかかる場合があるため）
  experimental: {
    serverComponentsExternalPackages: ['mysql2', 'pg', 'mssql'],
  },
};

module.exports = nextConfig;