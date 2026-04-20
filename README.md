<div align="center">

# ⚡ AutoQuest

**Production-grade TypeScript CLI for Discord Quest automation**  
with a live terminal dashboard

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-10%2B-CB3837?style=flat-square&logo=npm&logoColor=white)](https://npmjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

[English](#english) · [Tiếng Việt](#tiếng-việt) · [日本語](#日本語)

</div>

---

## English

### Overview

AutoQuest is a production-grade TypeScript CLI tool that automates Discord Quest workflows with a real-time terminal dashboard. Built for reliability, speed, and full observability.

**Key features:**
- Real-time terminal dashboard with live quest status
- Modular quest runner with pluggable strategy system
- Gateway + REST client integration with Discord API
- Automatic retry logic with configurable backoff
- Environment-based configuration with validation

---

### Requirements

| Tool | Version |
|------|---------|
| Node.js | `>= 22.0.0` |
| npm | `>= 10.0.0` |

---

### Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/ragenguyen/Auto-Quest-Discord.git

# 2. Install dependencies
npm install

# 3. Copy environment config
cp .env.example .env

# 4. Edit .env and add your Discord token
# TOKEN=your_discord_token_here
```

---

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload — development mode |
| `npm run start` | Run compiled output — production mode |
| `npm run typecheck` | Run TypeScript type checker without emit |
| `npm run build` | Compile TypeScript to `dist/` |

---

### Architecture

```
src/
├── core/       # Gateway + REST client integration
├── quest/      # Quest domain, manager, runner, strategies
├── ui/         # Logger, formatter, banner, dashboard
├── config/     # Env parser and app config
└── utils/      # Retry, sleep, assertions, timestamp
```

#### Module details

| Module | Responsibility |
|--------|---------------|
| `src/core` | Manages WebSocket Gateway connection and Discord REST API client |
| `src/quest` | Quest domain models, lifecycle manager, runner engine, and strategy plugins |
| `src/ui` | Terminal dashboard, ASCII banner, structured logger, output formatter |
| `src/config` | `.env` parser, config schema validation, app-wide settings |
| `src/utils` | Shared utilities: retry with backoff, sleep, assertion helpers, timestamps |

---

### Environment Variables

```env
# Required
TOKEN=your_discord_token_here

# Optional
LOG_LEVEL=info          # debug | info | warn | error
RETRY_ATTEMPTS=3        # number of retry attempts
RETRY_DELAY_MS=1000     # base delay between retries (ms)
DASHBOARD_REFRESH=500   # dashboard refresh rate (ms)
```

---

## Tiếng Việt

### Tổng quan

AutoQuest là công cụ CLI TypeScript cấp production dùng để tự động hóa Discord Quest, tích hợp dashboard terminal theo thời gian thực. Được xây dựng hướng đến độ tin cậy, hiệu năng cao và khả năng quan sát toàn diện.

**Tính năng nổi bật:**
- Dashboard terminal thời gian thực hiển thị trạng thái quest
- Hệ thống runner quest module hóa với chiến lược có thể mở rộng
- Tích hợp Gateway + REST client với Discord API
- Logic retry tự động với backoff có thể cấu hình
- Cấu hình dựa trên biến môi trường với kiểm tra hợp lệ

---

### Yêu cầu hệ thống

| Công cụ | Phiên bản |
|---------|-----------|
| Node.js | `>= 22.0.0` |
| npm | `>= 10.0.0` |

---

### Cài đặt

```bash
# 1. Clone repository
git clone https://github.com/ragenguyen/Auto-Quest-Discord.git

# 2. Cài đặt dependencies
npm install

# 3. Sao chép file cấu hình môi trường
cp .env.example .env

# 4. Chỉnh sửa .env và thêm Discord token của bạn
# TOKEN=your_discord_token_here
```

---

### Lệnh chạy

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Khởi động với hot reload — chế độ phát triển |
| `npm run start` | Chạy output đã biên dịch — chế độ production |
| `npm run typecheck` | Kiểm tra kiểu TypeScript không emit file |
| `npm run build` | Biên dịch TypeScript sang thư mục `dist/` |

---

### Kiến trúc dự án

```
src/
├── core/       # Tích hợp Gateway + REST client
├── quest/      # Domain quest, manager, runner, chiến lược
├── ui/         # Logger, formatter, banner, dashboard
├── config/     # Parser môi trường và cấu hình ứng dụng
└── utils/      # Retry, sleep, assertions, timestamp
```

#### Chi tiết từng module

| Module | Trách nhiệm |
|--------|------------|
| `src/core` | Quản lý kết nối WebSocket Gateway và REST API client Discord |
| `src/quest` | Domain model quest, quản lý vòng đời, engine runner và plugin chiến lược |
| `src/ui` | Dashboard terminal, banner ASCII, logger có cấu trúc, formatter output |
| `src/config` | Parser `.env`, kiểm tra schema cấu hình, thiết lập toàn ứng dụng |
| `src/utils` | Tiện ích dùng chung: retry với backoff, sleep, assertion, timestamp |

---

### Biến môi trường

```env
# Bắt buộc
TOKEN=your_discord_token_here

# Tùy chọn
LOG_LEVEL=info          # debug | info | warn | error
RETRY_ATTEMPTS=3        # số lần thử lại
RETRY_DELAY_MS=1000     # thời gian chờ giữa các lần retry (ms)
DASHBOARD_REFRESH=500   # tốc độ làm mới dashboard (ms)
```

---

## 日本語

### 概要

AutoQuestは、リアルタイムのターミナルダッシュボードを備えたプロダクションレベルのTypeScript CLIツールで、Discord Questを自動化します。信頼性・高速性・完全な可観測性を追求して設計されています。

**主な機能:**
- リアルタイムのターミナルダッシュボードによるQuest状態の可視化
- プラグイン型戦略システムを備えたモジュラーQuestランナー
- Discord API との Gateway + REST クライアント統合
- 設定可能なバックオフ付き自動リトライロジック
- バリデーション付き環境変数ベースの設定管理

---

### 動作要件

| ツール | バージョン |
|-------|----------|
| Node.js | `>= 22.0.0` |
| npm | `>= 10.0.0` |

---

### インストール・セットアップ

```bash
# 1. リポジトリをクローン
git clone https://github.com/ragenguyen/Auto-Quest-Discord.git

# 2. 依存パッケージをインストール
npm install

# 3. 環境設定ファイルをコピー
cp .env.example .env

# 4. .env を編集して Discord トークンを設定
# TOKEN=your_discord_token_here
```

---

### スクリプト一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | ホットリロード付きで起動 — 開発モード |
| `npm run start` | ビルド済み出力を実行 — 本番モード |
| `npm run typecheck` | emitなしでTypeScript型チェック |
| `npm run build` | TypeScript を `dist/` にコンパイル |

---

### アーキテクチャ

```
src/
├── core/       # Gateway + RESTクライアント統合層
├── quest/      # Questドメイン、マネージャー、ランナー、戦略
├── ui/         # ロガー、フォーマッター、バナー、ダッシュボード
├── config/     # 環境変数パーサー & アプリ設定
└── utils/      # リトライ、スリープ、アサーション、タイムスタンプ
```

#### モジュール詳細

| モジュール | 役割 |
|-----------|------|
| `src/core` | WebSocket Gatewayとの接続管理、Discord REST APIクライアント |
| `src/quest` | Questドメインモデル、ライフサイクル管理、ランナーエンジン、戦略プラグイン |
| `src/ui` | ターミナルダッシュボード、ASCIIバナー、構造化ロガー、出力フォーマッター |
| `src/config` | `.env`パーサー、設定スキーマ検証、アプリ全体設定 |
| `src/utils` | 共有ユーティリティ：バックオフ付きリトライ、スリープ、アサーション、タイムスタンプ |

---

### 環境変数

```env
# 必須
TOKEN=your_discord_token_here

# 任意
LOG_LEVEL=info          # debug | info | warn | error
RETRY_ATTEMPTS=3        # リトライ回数
RETRY_DELAY_MS=1000     # リトライ間隔 (ms)
DASHBOARD_REFRESH=500   # ダッシュボード更新レート (ms)
```

---

<div align="center">

Made with Nove❤️ · MIT License

</div>
```

---
