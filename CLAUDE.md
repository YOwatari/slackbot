# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cloudflare Workers 上で動く Slack Bot (`jpi`)。`slack-cloudflare-workers` を使った OAuth 対応の Slack App として実装されており、KV ストアに OAuth installation / state を保持する。

主なコマンド:
- `!jpi {keyword}` — Google Custom Search で画像をランダム返信 (元 msg への thread reply + 初回 broadcast)
- `!chat {prompt}` / `@jpi {prompt}` — Cloudflare Workers AI (`@cf/qwen/qwen3-30b-a3b-fp8`) でチャット応答。tool 呼び出し対応 (画像検索 / 抽選 / メッセージ削除)
- bot が既に発言したスレッド内では `!chat` prefix なしの平文発言にも応答

自然言語の指示 (例: `@jpi 猫の画像探して` / `@jpi カレーかラーメンか選んで` / `@jpi この URL のメッセージ消して`) は AI が tool を選んで実行する。

## Commands

| Action | Command |
|--------|---------|
| ローカル開発サーバ起動 | `npm run dev` (= `wrangler dev src/index.ts`) |
| デプロイ | `npm run deploy` |
| ライブログ閲覧 | `npm run tail` |
| テスト全体 | `npm test` |
| 単一テスト | `npx jest src/slack/__tests__/chat.test.ts` (ファイル指定) / `npx jest -t "parseSlackMessageUrl"` (名前指定) |
| Lint (Prettier) | `npm run lint:prettier` |
| 自動整形 | `npm run fix:prettier` |

Makefile の `make deploy / dev / tail / test / lint / fix` でも同等のことができる。Node は `>=18.3` (`.node-version` は `v20.5.0`)。

ローカル実行には `.dev.vars.example` を `.dev.vars` にコピーして、Slack / Google のシークレットを埋める必要がある。Workers AI は binding 経由なので API key 不要。

## Architecture

### Entry Point (`src/index.ts`)

- `export default { fetch }` という Cloudflare Workers 形式のハンドラ。
- 単一の `SlackOAuthApp` インスタンスをリクエスト毎に組み立てて、各機能モジュールを登録し、`app.run(request, ctx)` に委譲する。
- `Env` 型は `SlackOAuthAndOIDCEnv & GoogleImageEnv` の交差型 + KV/R2/AI バインディングで構成。新しい外部サービスを足す時はここの型を拡張する。
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

- `NoBotMessage(payload)`: bot 自身や `subtype` 付きメッセージを無視 (無限ループ防止)。**新規ハンドラでは必ず使う**。型 predicate (`payload is GenericMessageEvent`) として narrowing にも使える。
- `DirectMention(context, payload)`: 先頭が `<@bot_id>` で始まるメッセージか判定。chat handler では `@jpi <prompt>` 形式の入口判定に使う。

### Chat handler & tools (`src/slack/chat.ts` + `src/ai/`)

chat handler は `app.message(/.*/, ...)` で全 message を受けて、内部で 3 つの入口を判定する: (1) `!chat <prompt>` prefix、(2) `@jpi <prompt>` mention、(3) bot が既に発言済みのスレッド内の平文継続。発火したら `LlamaChat.chatWithTools` を呼んで AI に応答させる。

tool calling は **自前ループ** で実装。`@cloudflare/ai-utils` の `runWithTools` は Llama 4 Scout の wrap 形式 tool_calls (`{ id, type, function: { name, arguments } }`) を読めないため。送信時は wrap 形式、受信時は wrap/flat 両対応で parse。tool が呼ばれた turn は AI の最終 commentary を skip して tool 戻り値をそのまま reply にする (空文字なら投稿スキップ = 副作用済みの tool の場合)。

応答方針:
- bot がこのスレッドに初めて投稿する (= `payload.thread_ts` 無し) → `reply_broadcast: true` で channel にも broadcast
- スレッド継続 (= `payload.thread_ts` 有り) → broadcast せず thread 内に閉じる
- `thread_ts` は常に `payload.thread_ts ?? payload.ts` (元メッセージ自体をスレッド親にする)

tool 一覧:
- `choose_random` (`src/ai/tools.ts`): カンマ区切り string を split してランダム 1 件返す。副作用なし、戻り値が AI 応答になる
- `search_image` (chat.ts 内 `buildSearchImageTool`): `buildJpiImageUrl` 経由で画像 URL を作って blocks 投稿。副作用、戻り値は空文字
- `delete_message` (chat.ts 内 `buildDeleteMessageTool`): `parseSlackMessageUrl` で URL → `{channel, ts}` を取って `context.client.chat.delete` を呼ぶ。副作用、戻り値は空文字

### External Service Wrappers

- `src/google/image_search.ts` — `GoogleImageSearch` クラス。`ameblo.jp` / `ameba.jp` / `fc2.com` を hostname ベースで除外する block list を内蔵 (`pbs.twimg.com` は許可)。
- `src/ai/completions.ts` — `LlamaChat` クラス。Cloudflare Workers AI の `@cf/qwen/qwen3-30b-a3b-fp8` を叩く。`env.AI` (binding) を受け取り、`completions(prompt)` / `chat(messages)` で text 応答、`chatWithTools(messages, tools)` で tool calling 対応の自前ループ。

Google は `xxxEnv` 型を export し `index.ts` の `Env` 交差型に組み込む。Workers AI は wrangler.toml の `[ai] binding = "AI"` 経由で `env.AI` が直接生える。

### Views (`src/slack/views/`)

`jsx-slack` で Block Kit を JSX として書く。`tsconfig.json` で `jsxImportSource: "jsx-slack"` が指定されているので、React は不要。`JSXSlack(<Component />)` で Block Kit JSON にシリアライズして `context.say({ blocks })` に渡す。

### Tests

`src/**/__tests__/*.test.ts` を ts-jest で実行。`chat.ts` の純粋関数 (`buildChatMessages` / `parseSlackMessageUrl` / `CHAT_APOLOGY`)、`/jpi/img` エンドポイント (`handleJpiImage`)、HMAC sign/verify ユーティリティ、URL builder、tools registry などの単体テストを揃えている。Slack message handler 本体の統合テストはまだ無いので、ハンドラ内部のロジックは可能なら純粋関数として切り出してテスト可能にする方針。

## Deployment Notes

- `wrangler.toml` の KV namespace ID (`SLACK_INSTALLATIONS`, `SLACK_OAUTH_STATES`) は本番固定。テスト用には `preview_id` を使う。
- `manifest.yml` は Slack App の Manifest。`bot_events: message.channels` のみサブスクライブしており、追加のイベント (e.g. `app_mention`) を扱いたい場合はここを更新して Slack 側の App 設定を変更する必要がある。
- 本番 URL は `https://slackbot.yowatari.workers.dev`。OAuth / Events / Interactivity の request URL は全てこのドメイン。
