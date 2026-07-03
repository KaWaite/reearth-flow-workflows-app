import type { Translations } from './en';

export const ja: Translations = {
  header: {
    title: 'Flow Trigger',
    badge: 'Re:Earth Flow',
    setupBtn: 'セットアップ方法',
  },
  footer: 'Re:Earth Flow 学習用 · 課題',
  tabs: {
    1: 'CSV品質チェック',
    2: 'GeoJSONパイプライン',
    3: 'CSVマージ',
    4: '列選択',
    5: 'CSV分割',
    6: 'CSV → JSON',
    7: 'サイズフィルタ',
  },
  common: {
    runWorkflow: 'ワークフローを実行',
    running: '実行中…',
    fillExample: 'サンプルを入力',
    openInFlow: 'Flowで開く ↗',
    runAgain: '再実行',
    copy: 'コピー',
    copied: '✓ コピー済み',
    workflowLabel: 'ワークフロー',
  },
  learnMore: {
    toggle: 'このパイプラインについて詳しく',
    problemHeading: '解決する課題',
    whenHeading: '使用するタイミング',
    conceptsHeading: 'Flowの主要コンセプト',
    inputHeading: '入力データの要件',
  },
  jobStatus: {
    title: 'ジョブを送信しました',
    desc: 'ワークフローが実行中です。以下のジョブIDをRe:Earth Flowダッシュボードでの確認にご使用ください。',
    jobIdLabel: 'ジョブID',
    submittedAt: '送信日時',
  },
  setupGuide: {
    title: 'ワークフローのセットアップ方法',
    intro: 'このサイトの各ワークフローは、デプロイされたRe:Earth Flowプロジェクトに対応しています。各ワークフローを使えるようにするには、以下の手順を一度実施してください。',
    steps: [
      {
        title: 'Flowで共有ワークフローを開く',
        body: 'ワークフローカードの<em>Flowで開く</em>ボタンをクリックします。Re:Earth Flowエディタで読み取り専用のワークフローが開きます。',
      },
      {
        title: 'ワークスペースにフォークする',
        body: '<em>ファイル → 複製</em>（または同等のフォーク操作）を使って、ワークフローを自分のワークスペースにコピーします。ここからノードとパラメータを自由に編集できます。',
      },
      {
        title: 'デプロイメントを作成する',
        body: 'ワークフローエディタで<em>デプロイメント</em>パネルを開き、<em>新規デプロイメント</em>をクリックします。名前を付けて公開します。デプロイメントは不変のスナップショットです — ワークフローを変更するたびに再デプロイしてください。',
      },
      {
        title: 'トリガーURLをコピーする',
        body: 'デプロイメントを開いて<em>トリガー</em>タブに移動します。完全なトリガーエンドポイントURLをコピーします — <code>https://api.flow.reearth.io/api/v1/projects/…/deployments/…/trigger</code> のような形式です。',
      },
      {
        title: 'トリガーURLをGitHubに追加する',
        bodyBefore: 'リポジトリの<em>Settings → Secrets and variables → Actions → Variables</em>に移動して、以下の変数を追加します。',
        bodyAfter: '<code>FLOW_API_KEY</code>がまだ設定されていない場合は、<em>Secrets</em>（Variables ではなく — 認証情報のため）に追加してください。',
        varHint: '= <トリガーURL>',
      },
      {
        title: 'サイトを再デプロイする',
        body: '<code>main</code>ブランチにコミットをプッシュするか、<em>Actions → Deploy to GitHub Pages → Run workflow</em>でマニュアルデプロイを実行します。新しい変数はビルド時に組み込まれます。',
      },
    ],
    localTitle: 'ローカル開発',
    localDesc: '以下を<code>.env.local</code>ファイルに追加してください（このファイルはコミットしないでください）：',
    localDevHint: 'その後、<code>npm run dev</code>を実行します。ViteデブサーバーはCORSを回避するためにFlow APIリクエストを自動的にプロキシします。',
    localVarHint: '= <トリガーURL>',
    localApiKeyHint: '= <APIキー>',
  },
};
