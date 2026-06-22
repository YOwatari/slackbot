# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cloudflare Workers 上で動く Slack Bot (`jpi`)。`slack-cloudflare-workers` を使った OAuth 対応の Slack App として実装されており、KV ストアに OAuth installation / state を保持する。

主なコマンド:
- `!jpi {keyword}` — Google Custom Search で画像をランダム返信
- `!chat {prompt}` — OpenAI (gpt-4o-mini) で応答
- `@jpi 選んで {item1} {item2} ...` — リストからランダム選択
- `@jpi 消して {message URL}` — 指定メッセージを削除
- `@jpi ping` — `pong` を返す疎通確認

## Commands

| Action | Command |
|--------|---------|
| ローカル開発サーバ起動 | `npm run dev` (= `wrangler dev src/index.ts`) |
| デプロイ | `npm run deploy` |
| ライブログ閲覧 | `npm run tail` |
| テスト全体 | `npm test` |
| 単一テスト | `npx jest src/slack/__tests__/keshite.test.ts` (ファイル指定) / `npx jest -t "return channel and ts"` (名前指定) |
| Lint (Prettier) | `npm run lint:prettier` |
| 自動整形 | `npm run fix:prettier` |

Makefile の `make deploy / dev / tail / test / lint / fix` でも同等のことができる。Node は `>=18.3` (`.node-version` は `v20.5.0`)。

ローカル実行には `.dev.vars.example` を `.dev.vars` にコピーして、Slack / Google / OpenAI のシークレットを埋める必要がある。

## Architecture

### Entry Point (`src/index.ts`)

- `export default { fetch }` という Cloudflare Workers 形式のハンドラ。
- 単一の `SlackOAuthApp` インスタンスをリクエスト毎に組み立てて、各機能モジュールを登録し、`app.run(request, ctx)` に委譲する。
- `Env` 型は `SlackOAuthAndOIDCEnv & GoogleImageEnv & OpenAIEnv` の交差型 + KV namespace バインディングで構成。新しい外部サービスを足す時はここの型を拡張する。
- 全機能登録の末尾に `app.event("message", async({}) => {})` の空ハンドラがある。これはマッチしなかった `message` イベントをサイレントに ack するためのフォールバックなので消さないこと。

### Feature Modules (`src/slack/*.ts`)

各機能は `(app, deps?) => void` 形式のファクトリ関数として独立しており、`app.message(pattern, handler)` で正規表現に対するメッセージリスナーを登録する。テンプレ:

```ts
export function feature(app: SlackApp<any> | SlackOAuthApp<any>) {
  const pattern = /.../
  app.message(pattern, async ({ context, payload }) => {
    if (NoBotMessage(payload) && DirectMention(context, payload)) {
      // ...
    }
  })
}
```

- `NoBotMessage(payload)`: bot 自身や `subtype` 付きメッセージを無視 (無限ループ防止)。**新規ハンドラでは必ず使う**。
- `DirectMention(context, payload)`: 先頭が `<@bot_id>` で始まるメッセージか判定。メンションコマンド (`@jpi 選んで` 等) では必須。`!jpi` / `!chat` のような prefix コマンドでは使わない。

### External Service Wrappers

- `src/google/image_search.ts` — `GoogleImageSearch` クラス。`ameblo.jp` / `ameba.jp` / `fc2.com` を hostname ベースで除外する block list を内蔵 (`pbs.twimg.com` は許可)。
- `src/openai/completions.ts` — `OpenAI` クラス。モデルは `gpt-4o-mini` 固定、system prompt とパラメータ (`temperature`, `max_tokens` 等) はハードコード。

それぞれ `xxxEnv` 型を export しており、`index.ts` の `Env` 交差型に組み込む形で環境変数を受け渡す。

### Views (`src/slack/views/`)

`jsx-slack` で Block Kit を JSX として書く。`tsconfig.json` で `jsxImportSource: "jsx-slack"` が指定されているので、React は不要。`JSXSlack(<Component />)` で Block Kit JSON にシリアライズして `context.say({ blocks })` に渡す。

### Tests

`src/**/__tests__/*.test.ts` を ts-jest で実行。`keshite.ts` の URL パーサに加え、`/jpi/img` エンドポイント (`handleJpiImage`)、HMAC sign/verify ユーティリティ、URL builder などの単体テストを揃えている。Slack message handler 本体の統合テストはまだ無いので、ハンドラ内部のロジックは可能なら純粋関数として切り出してテスト可能にする方針。

## Deployment Notes

- `wrangler.toml` の KV namespace ID (`SLACK_INSTALLATIONS`, `SLACK_OAUTH_STATES`) は本番固定。テスト用には `preview_id` を使う。
- `manifest.yml` は Slack App の Manifest。`bot_events: message.channels` のみサブスクライブしており、追加のイベント (e.g. `app_mention`) を扱いたい場合はここを更新して Slack 側の App 設定を変更する必要がある。
- 本番 URL は `https://slackbot.yowatari.workers.dev`。OAuth / Events / Interactivity の request URL は全てこのドメイン。
