## MVP1: 基本認証・RSS配信システム

### 1. Verified Subscriber登録システム
- Clerkを活用したユーザー認証機能（ログイン・サインアップ）
- SNSアカウント連携と検証機能
  - X（Twitter）API連携によるフォロワー数取得
  - YouTube API連携によるチャンネル登録者数取得
  - 連携トークンの安全な管理
- フォロワー合計数算出・表示API
- シンプルなユーザーダッシュボード
  - アカウント情報管理
  - 連携SNS一覧表示
  - 基本統計表示

### 2. RSSフィード生成システム
#### 2.1 コンテンツ変換メカニズム
- 単一の `/feed` エンドポイントでRSS形式のコンテンツを提供
  - 基本パラメータ構造: `/feed?id=123&company=companyId&category=tech&tags=tag1,tag2&format=rss`
  - MVP1では `id` パラメータのみ実際に処理（他は将来のために予約）
  - `format=rss` パラメータによるXML形式でのレスポンス

#### 2.2 パラメータ解析システム
- すべてのクエリパラメータを解析する基本的な機能
- 実装済みパラメータのみを処理し、未実装パラメータは無視
- パラメータ組み合わせの検証機能

#### 2.3 RSS標準への準拠
- RSS 2.0仕様に完全準拠したフィード生成
- メディアエンクロージャー対応

#### 2.4 コンテンツ取得フロー
1. RSSリクエスト受信
2. キャッシュチェック（存在すれば返却）
3. IPFSからのコンテンツメタデータ取得
4. 必要に応じてコンテンツ本文取得
5. RSS XML形式への変換
6. キャッシュへの保存
7. レスポンス返却

#### 2.5 高度なキャッシング戦略
- 多層キャッシング
  - メモリキャッシュ（最速アクセス用）
  - Redisキャッシュ（持続性）
  - CDNエッジキャッシュ（グローバル配信用）
- 条件付きレスポンス
  - ETag/If-None-Matchヘッダー対応
  - 304 Not Modified応答によるトラフィック削減

### 3. 新コンテンツ検出メカニズム（Webhook中心）

#### 3.1 Webhook受信システム
- エンドポイント: `/api/webhook/new-content`
  - アクセス制限（認証トークン要求）
  - リクエスト検証（署名確認）
- ペイロード形式:
```json
{
  "contentCid": "QmRE9CTxAdEHnupjpcujJkmh6jVGPzUAB9W9D1ok7rLmcD",
  "metadataCid": "QmYMWrnwWFwSAL1B9DMueGW5VziiWSwCEuGjykFkkhY3gC",
  "companyId": "user_2vP9TROPKZfiTTnCeD7SOuzeSX0",
  "publishedAt": "2025-04-08T10:47:58.315Z",
  "categories": ["tech", "blockchain"],
  "tags": ["web3", "ipfs", "decentralized"]
}
```

#### 3.2 更新処理フロー
1. Webhook受信・検証
2. メタデータの取得・検証
3. 影響を受けるフィードの特定
   - 全体フィードは常に更新
   - 関連カテゴリ/タグのフィードを特定
   - 特定企業のフィードを特定
1. 対象フィードのキャッシュ無効化または更新

#### 3.3 フォールバックメカニズム（Webhook失敗時）
- 定期的なインデックスファイルポーリング（15分間隔）
- 最終更新日時の比較による差分検出
- 差分に基づくキャッシュ更新トリガー

## MVP2: フィルタリングと拡張機能

### 1. 高度なフィルタリング機能

#### 1.1 単一URLクエリパラメータアプローチ
- 基本URL: `/feed`
- 複合フィルタリングパラメータ:
  ```
  /feed?company=companyId&category=tech&tags=blockchain,web3
  ```
- パラメータ仕様:
  - `company`: 単一企業ID（複数指定不可）
  - `category`: 単一カテゴリ（複数指定不可）
  - `tags`: カンマ区切りの複数タグ（OR条件）
  - `sort`: ソート順（`recent`, `popular`）
  - `limit`: 記事数制限（デフォルト: 50, 最大: 100）

#### 1.2 フィルタリングロジック
1. クエリパラメータ解析
2. フィルターキーの生成（正規化されたパラメータから）
3. キャッシュチェック
4. キャッシュミス時:
   - IPFSからコンテンツインデックス取得
   - フィルター条件に基づく絞り込み
     - 企業フィルター（完全一致）
     - カテゴリフィルター（完全一致）
     - タグフィルター（いずれかが一致）
   - フィルター結果の順序付け
   - RSS形式への変換
   - キャッシュへの保存
5. 結果返却（XML Content-Type）

#### 1.3 フィルター依存関係管理
- フィルター関係グラフの維持:
  - 例: `tags=blockchain`は`category=tech`の部分集合
- 関連フィルターの更新伝播
  - 新コンテンツ追加時に影響を受けるフィルターを特定
  - 階層的更新（全体→カテゴリ→タグ→複合）

### 2. ユーザー体験向上
- フィルター設定UIと購読ガイド
- フィードプレビュー機能
- 基本的な使用統計収集

## データモデル詳細

### 1. Subscriberデータモデル（Redis）

```javascript
// キー: subscriber:{userId}
{
  // 基本プロフィール
  userId: String,               // クライアントID (PK)
  name: String,                 // 表示名
  email: String,                // メールアドレス
  status: String,               // 'active', 'pending', 'suspended'
  verificationDate: Timestamp,  // 検証完了日
  lastUpdated: Timestamp,       // 最終更新日
  
  // SNS連携情報
  platforms: {
    twitter: {
      username: String,         // Xのユーザー名
      followersCount: Number,   // フォロワー数
      verifiedAt: Timestamp,    // 検証日時
      accessToken: String,      // アクセストークン（暗号化）
      refreshToken: String,     // リフレッシュトークン（暗号化）
      tokenExpiry: Timestamp    // トークン有効期限
    },
    youtube: {
      channelId: String,        // YouTubeチャンネルID
      subscribersCount: Number, // 登録者数
      verifiedAt: Timestamp,    // 検証日時
      accessToken: String,      // アクセストークン（暗号化）
    },
    instagram: {
      // 同様の構造
    }
  },
  
  // 購読設定（MVP2）
  feedPreferences: {
    companies: [String],        // 興味のある企業ID
    categories: [String],       // 興味のあるカテゴリ
    tags: [String],             // 興味のあるタグ
    customFeeds: [              // カスタムフィード設定
      {
        name: String,           // フィード名
        url: String,            // フィルター適用済みURL
        params: Object          // パラメータオブジェクト
      }
    ]
  },
  
  // 統計情報
  totalFollowers: Number,       // 全プラットフォーム合計フォロワー数
  verifiedBadge: Boolean,       // 検証済みバッジ付与状態
  joinDate: Timestamp,          // 登録日
}
```


```Twitter API
public_metrics	object	Contains details about activity for this user.

"public_metrics": 
{
  "followers_count": 507902,
  "following_count": 1863,
  "tweet_count": 3561,
  "listed_count": 1550
}
```






### 2. RSSフィードキャッシュモデル（Redis）

```javascript
// キー: rss:feed:{filterHash}
{
  filterHash: String,           // フィルターパラメータのハッシュ (PK)
  parameters: {                 // 元のパラメータ
    company: String,
    category: String,
    tags: [String],
    sort: String,
    limit: Number
  },
  content: String,              // XML形式のRSSフィード内容
  itemCount: Number,            // フィードに含まれる記事数
  generatedAt: Timestamp,       // 生成日時
  expiresAt: Timestamp,         // 有効期限
  hitCount: Number,             // 利用カウント（人気度測定用）
  etag: String                  // 変更検出用ハッシュ
}
```

### 3. コンテンツインデックスとメタデータキャッシュ

```javascript
// キー: content:metadata:{contentCid}
{
  contentCid: String,           // コンテンツCID (PK)
  metadataCid: String,          // メタデータCID
  title: String,                // タイトル
  summary: String,              // 概要
  publishedAt: Timestamp,       // 公開日時
  companyId: String,            // 企業ID
  categories: [String],         // カテゴリ配列
  tags: [String],               // タグ配列
  media: [                      // メディア配列
    {
      cid: String,              // メディアCID
      type: String,             // メディアタイプ
      description: String       // 説明
    }
  ],
  cachedAt: Timestamp,          // キャッシュ日時
  expiresAt: Timestamp          // 有効期限
}

// キー: index:categories
{
  // カテゴリインデックス（キャッシュ用）
  categories: {
    "tech": [contentCid1, contentCid2, ...],
    "finance": [contentCid3, contentCid4, ...],
    // 他のカテゴリ
  },
  updatedAt: Timestamp          // 最終更新日時
}

// キー: index:tags
{
  // タグインデックス（キャッシュ用）
  tags: {
    "blockchain": [contentCid1, contentCid3, ...],
    "web3": [contentCid1, contentCid5, ...],
    // 他のタグ
  },
  updatedAt: Timestamp          // 最終更新日時
}

// キー: index:companies
{
  // 企業インデックス（キャッシュ用）
  companies: {
    "companyId1": [contentCid1, contentCid6, ...],
    "companyId2": [contentCid2, contentCid7, ...],
    // 他の企業
  },
  updatedAt: Timestamp          // 最終更新日時
}
```

### 4. フィード使用統計モデル

```javascript
// キー: stats:feed:{period}
{
  // 日次/週次/月次フィード統計
  topFeeds: [
    {
      filterHash: String,       // フィルターハッシュ
      parameters: Object,       // フィルターパラメータ
      hitCount: Number,         // アクセス数
      uniqueUsers: Number       // ユニークユーザー数
    }
  ],
  topCompanies: [
    {
      companyId: String,        // 企業ID
      companyName: String,      // 企業名
      hitCount: Number          // アクセス数
    }
  ],
  topCategories: [
    {
      category: String,         // カテゴリ名
      hitCount: Number          // アクセス数
    }
  ],
  topTags: [
    {
      tag: String,              // タグ名
      hitCount: Number          // アクセス数
    }
  ],
  period: String,               // 対象期間（YYYY-MM-DD, YYYY-WW, YYYY-MM）
  totalHits: Number,            // 総アクセス数
  uniqueUsers: Number,          // ユニークユーザー数
  updatedAt: Timestamp          // 最終更新日時
}
```


PRWIRE-SUB 技術スタック構成
コアプラットフォーム
1. Next.js

役割: フロントエンドとバックエンドを統合したフレームワーク
主な機能:

サーバーサイドレンダリング (SSR) によるパフォーマンス最適化
API Routes でサーバーレスバックエンド機能の提供
ページルーティングとナビゲーション
RSS フィード生成 API エンドポイントの実装


使用目的: ユーザーダッシュボード、認証フロー、API エンドポイントを単一アプリケーションで構築

2. TypeScript

役割: 静的型付け言語
主な機能:

型安全性の確保による開発効率向上
データモデルの厳格な定義
コード品質と保守性の向上


使用目的: Subscriber モデル、RSS フィードパラメータ、IPFS メタデータなどの複雑なデータ構造を型安全に管理

デプロイメント・インフラ
3. Vercel

役割: ホスティングとデプロイメントプラットフォーム
主な機能:

Next.js アプリケーションのシームレスなデプロイ
サーバーレス関数のホスティング
グローバル CDN によるコンテンツ配信
環境変数管理と CI/CD パイプライン


使用目的: MVP1 および MVP2 のホスティング、スケーラブルな API 提供、高速キャッシング

データストレージ・キャッシュ
4. Redis

役割: インメモリデータストア、キャッシュシステム
主な機能:

Subscriber データモデルの保存
RSS フィードキャッシュ
コンテンツメタデータキャッシュ
分析データの収集と集計


使用構造:

subscriber:{userId} - ユーザープロフィールとSNS連携情報
rss:feed:{filterHash} - 生成済みRSSフィードキャッシュ
content:metadata:{contentCid} - コンテンツメタデータキャッシュ
analytics:release:{releaseId} - 閲覧統計データ



外部サービス連携
5. Pinata API (IPFS)

役割: 分散型ストレージシステムとのインターフェース
主な機能:

コンテンツメタデータの取得
コンテンツ本文の取得
メディアファイルの取得


使用目的: 分散型で永続的なコンテンツストレージアクセス

6. Clerk

役割: 認証サービス
主な機能:

ユーザー認証（サインアップ/ログイン）
OAuth 連携（SNS アカウント検証用）
セッション管理


使用目的: Verified Subscriber 登録システムの認証基盤

7. SNS API連携

X (Twitter) API: フォロワー数取得と検証
YouTube API: チャンネル登録者数取得と検証
使用目的: ユーザーの影響力指標収集と検証

パッケージ管理・ビルドツール
8. NPM/Yarn

役割: パッケージ管理ツール
主な依存関係候補:

redis - Redis クライアント
axios - HTTPリクエスト
swr - データフェッチングと状態管理
react-hook-form - フォーム処理
xml-js - RSS XML 生成
crypto-js - トークン暗号化
react-query - サーバー状態管理
tailwindcss - スタイリング