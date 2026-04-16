# Oracle Explorer (Database Dictionary Search Tool)

高速かつセキュアな、フロントエンド完結型のデータベース検索・辞書ツールです。
200を超える大規模なテーブル構造でも、サーバーサイドの実装や外部ライブラリを一切使わず、ブラウザのローカル処理能力のみを用いて爆速で全文検索（Full-text search）を行います。

## 特徴
1. **完全ローカル動作 (No External Dependencies)**  
   一切のインターネットアクセスを必要としません。外部APIやライブラリ(React, Vue等)を使用せず、Vanilla JS と CSS のみで作られているため、機密性の高い社内ネットワークでの運用に最適です。
   
2. **ブラウザ内完結のビルダー搭載 (`builder.html`)**  
   DB設計ファイル (HTML) を `tables` フォルダに配置し、このビルダーを通すだけで、Pythonやその他ビルドツールを使わずに、ブラウザ上で全HTMLファイルをパースして自動的に検索インデックス (`data.txt`) を生成します。

3. **リアルタイム・フルテキスト検索**  
   テーブルの物理名(Physical), 論理名(Logical), 項目(Field), 備考(Remark) など、検索対象のスコープを柔軟に絞り込みながら、瞬時にマッチするテーブルとフィールドの一覧を表示し、該当キーワードをハイライト表示します。

## デプロイ方法 (IIS)
`index.html` 内の「使い方・デプロイ」タブに、IISサーバーを活用した社内サーバーデプロイガイドが詳しく記載されています。

1. フォルダ一式を `C:\inetpub\wwwroot\db-explorer` 等に配置します。
2. IISマネージャーからWebサイトとして追加します。
3. `MIME Types` に `.txt` (`text/plain`) が許可されていることを確認して完了です。

## 使用技術
- HTML5, Vanilla JavaScript, CSS3
- CSS Variables (Dark/Light テーマ切り替え対応)
- FileReader API / DOMParser (データ変換用)

## ライセンス・開発
Antigravity / PHAN HAI により専用設計されています。
