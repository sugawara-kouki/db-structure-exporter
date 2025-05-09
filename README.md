This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## これは何
このプロジェクトは、DBの接続情報を入力して、カラムの定義をエクセルで出力するアプリです。
QAなどの実装者ではない方々にサンプルデータを設定してもらうためのフォーマットとして使用したり、テーブル定義を逆引きしたりするために使用します。
後は、なんかいい感じに追加実装していく予定ではあります。

## 使い方

- パッケージ管理で、Bun を使用するので、インストールしておいてください✅️
- `bun install`
- `npm run dev`
- `localhost:3000`にアクセスします
- DB接続に必要な情報を入力します

### 備考
- 現時点では MySQL しかサポートしていないので、今後対応します (多分)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
