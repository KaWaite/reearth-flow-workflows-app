import type { Translations } from "./en";

export const ja: Translations = {
  header: {
    title: "Re:Earth Flow",
    badge: "パイプラインエクスプローラー",
    setupBtn: "セットアップ方法",
  },
  footer: "Re:Earth Flowで学ぶETLパイプライン",
  tabs: {
    1: "CSV品質チェック",
    2: "GeoJSONパイプライン",
    3: "CSVマージ",
    4: "列選択",
    5: "CSV分割",
    6: "CSV → JSON",
    7: "サイズフィルタ",
  },
  common: {
    runWorkflow: "ワークフローを実行",
    running: "実行中…",
    fillExample: "サンプルを入力",
    openInFlow: "Re:Earth Flowで開く ↗",
    runAgain: "再実行",
    copy: "コピー",
    copied: "✓ コピー済み",
    workflowLabel: "ワークフロー",
    notConfiguredTitle: "未設定",
  },
  learnMore: {
    toggle: "このパイプラインについて詳しく",
    problemHeading: "解決する課題",
    whenHeading: "使用するタイミング",
    conceptsHeading: "Re:Earth Flowの主要コンセプト",
    inputHeading: "入力データの要件",
  },
  jobStatus: {
    title: "ジョブを送信しました",
    desc: "ワークフローが実行中です。以下のジョブIDをRe:Earth Flowダッシュボードでの確認にご使用ください。",
    jobIdLabel: "ジョブID",
    submittedAt: "送信日時",
  },
  setupGuide: {
    title: "ワークフローのセットアップ方法",
    intro:
      "このサイトの各ワークフローは、デプロイされたRe:Earth Flowプロジェクトに対応しています。各ワークフローを使えるようにするには、以下の手順を一度実施してください。",
    steps: [
      {
        title: "Re:Earth Flowで共有ワークフローを開く",
        body: "ワークフローカードの<em>Re:Earth Flowで開く</em>ボタンをクリックします。Re:Earth Flowエディタで読み取り専用のワークフローが開きます。",
      },
      {
        title: "ワークスペースにフォークする",
        body: "<em>ファイル → 複製</em>（または同等のフォーク操作）を使って、ワークフローを自分のワークスペースにコピーします。ここからノードとパラメータを自由に編集できます。",
      },
      {
        title: "デプロイメントを作成する",
        body: "ワークフローエディタで<em>デプロイメント</em>パネルを開き、<em>新規デプロイメント</em>をクリックします。名前を付けて公開します。デプロイメントは不変のスナップショットです — ワークフローを変更するたびに再デプロイしてください。",
      },
      {
        title: "トリガーURLをコピーする",
        body: "デプロイメントを開いて<em>トリガー</em>タブに移動します。完全なトリガーエンドポイントURLをコピーします — <code>https://api.flow.reearth.io/api/v1/projects/…/deployments/…/trigger</code> のような形式です。",
      },
      {
        title: "トリガーURLをGitHubに追加する",
        bodyBefore:
          "リポジトリの<em>Settings → Secrets and variables → Actions → Variables</em>に移動して、以下の変数を追加します。",
        bodyAfter:
          "<code>FLOW_API_KEY</code>がまだ設定されていない場合は、<em>Secrets</em>（Variables ではなく — 認証情報のため）に追加してください。",
        varHint: "= <トリガーURL>",
      },
      {
        title: "サイトを再デプロイする",
        body: "<code>main</code>ブランチにコミットをプッシュするか、<em>Actions → Deploy to GitHub Pages → Run workflow</em>でマニュアルデプロイを実行します。新しい変数はビルド時に組み込まれます。",
      },
    ],
    localTitle: "ローカル開発",
    localDesc:
      "以下を<code>.env.local</code>ファイルに追加してください（このファイルはコミットしないでください）：",
    localDevHint:
      "その後、<code>npm run dev</code>を実行します。ViteデブサーバーはCORSを回避するためにRe:Earth Flow APIリクエストを自動的にプロキシします。",
    localVarHint: "= <トリガーURL>",
    localApiKeyHint: "= <APIキー>",
  },
  workflows: {
    csvQuality: {
      title: "CSVデータ品質パイプライン",
      desc: "URLからCSVを読み込み、必須キー列に基づいて行を<strong>有効</strong>と<strong>除外</strong>に振り分けます。有効な行に処理日時スタンプを付与し、クリーンなCSVと除外ログの2ファイルを出力します。",
      learnMore: {
        problem:
          "生データはほぼ必ずノイズを含んでいます — IDの欠落、必須項目の空白、フォーマットの不統一など。そのまま流し込むと、エラーがサイレントに下流へ伝播します。",
        whenToUse:
          "データ取り込み前のベンダー出力やフォーム結果の検証。クリーン出力と除外ログを別々のファイルとして納品する必要がある場面全般。",
        concepts: [
          {
            name: "FeatureFilter",
            desc: "FlowExpr条件に基づいて行を名前付き出力ポートにルーティングします — キー列が非nullの行はvalidへ、それ以外はunfilteredへ",
          },
          {
            name: "AttributeManager",
            desc: "列の追加・変更・削除を行います — ここでは有効な全行にprocessed_atの値を付与します",
          },
          {
            name: "CsvWriter",
            desc: "フィーチャストリームをCSVファイルに書き出します。クリーン出力と除外ログをそれぞれ独立して生成するために2回使用します",
          },
        ],
        inputShape:
          "ヘッダー行を持つ任意のCSV。必須キーとして1列を指定します — nullまたは空白の行は除外ログへ振り分けられます。それ以外の列はすべてそのまま通過します。",
      },
      fields: {
        csvPath: { label: "CSVパス", hint: "入力CSVファイルのURLまたはパス。" },
        keyColumn: {
          label: "キー列",
          hint: "この列がnullまたは空白の行は除外されます。",
        },
        outputPrefix: {
          label: "出力プレフィックス",
          hint: "出力ファイル： <code>{prefix}_clean.csv</code> と <code>{prefix}_rejected.csv</code>",
        },
      },
      alert:
        "<code>FLOW_URL_CSV_QUALITY</code>（変数）と<code>FLOW_API_KEY</code>（シークレット）をGitHubリポジトリのSettings（Settings → Secrets and variables → Actions）に追加してから、再デプロイしてください。ローカル開発の場合は<code>.env.local</code>に追加してください。",
    },
    geoJson: {
      title: "GeoJSON空間分析パイプライン",
      desc: "メートル系CRSのGeoJSONポリゴンを読み込み、面積を計算した後2つに分岐します。一方はWGS84に再投影してCesium対応の<strong>エンリッチGeoJSON</strong>を出力し、もう一方はカテゴリ別フィーチャ数を集計して<strong>JSONサマリー</strong>を生成します。",
      learnMore: {
        problem:
          "GIS出力はさまざまな座標参照系を使用します。WebマップはすべてWGS84（EPSG:4326）を必要としますが、面積計算にはメートル系CRSが必要です — 再投影ステップなしに両方を1回のパスで実現することはできません。",
        whenToUse:
          "ポリゴンレイヤーのWeb可視化用データ準備とフィーチャ数統計の同時生成。都市データや土地利用データをWebマップに公開する際の典型的なパターンです。",
        concepts: [
          {
            name: "AreaCalculator",
            desc: "ジオメトリからm²単位のポリゴン面積を計算します — メートル系の投影CRSが必要です。WGS84を入力すると誤った結果になります",
          },
          {
            name: "HorizontalReprojector",
            desc: "ある座標系から別の座標系へ座標を変換します。ここではCesium対応出力のためにEPSG:4326へ変換します",
          },
          {
            name: "AttributeAggregator",
            desc: "列でフィーチャをグループ化して集計値を計算します — ここでは統計出力のためにカテゴリ別フィーチャ数を集計します",
          },
        ],
        inputShape:
          "メートル系投影CRS（例：EPSG:2154、EPSG:3857、EPSG:6668）のポリゴンフィーチャを含むGeoJSON。WGS84を入力すると面積値が不正確になります。各フィーチャには指定したカテゴリ列が必要です。",
      },
      fields: {
        geojsonPath: {
          label: "GeoJSONパス",
          hint: "メートル系CRS（例：EPSG:2154、3857）のポリゴンフィーチャを持つGeoJSONファイルのURL。ワークフローはCesium出力のためにWGS84（EPSG:4326）に再投影します。",
        },
        categoryColumn: {
          label: "カテゴリ列",
          hint: "集計時にこの属性でフィーチャをグループ化します。全フィーチャに存在する列である必要があります。",
        },
        outputName: {
          label: "出力名",
          hint: "出力ファイル： <code>{name}.geojson</code> と <code>{name}_stats.json</code>",
        },
      },
      alert:
        "<code>FLOW_URL_GEOJSON</code>（変数）と<code>FLOW_API_KEY</code>（シークレット）をGitHubリポジトリのSettings（Settings → Secrets and variables → Actions）に追加してから、再デプロイしてください。ローカル開発の場合は<code>.env.local</code>に追加してください。",
    },
    csvMerge: {
      title: "マルチソースCSVマージ・重複排除",
      desc: "2つのCSVを別々のURLから読み込み、1つのフィーチャストリームにマージします。キー列に基づいて重複レコードを排除し、列名を正規化して<strong>統合・重複排除済みのCSV</strong>を1ファイル出力します。ベンダー出力の結合や複数システムのデータ突合に不可欠です。",
      steps: [
        "CsvReader ×2 — 両方のソースファイルを読み込む",
        "FeatureMerger — 1つのストリームに結合",
        "AttributeDuplicateFilter — キーで重複を削除",
        "AttributeRenamer — 列名を正規化",
        "CsvWriter — 統合出力を1ファイルに書き出し",
      ],
      learnMore: {
        problem:
          "同じエンティティが2つの別々のシステム出力に存在することは多く — システムごとに1レコードずつ、重複と微妙に異なる列名が混在します。スプレッドシートでの手作業による突合は時間がかかり、規模が大きくなるとエラーが発生しやすくなります。",
        whenToUse:
          "CRMと請求システムの出力の突合、2部署からの週次スナップショットの結合、またはデータベース取り込み前に2つの独立ソースからのデータを統合する場合。",
        concepts: [
          {
            name: "FeatureMerger",
            desc: "2つの別々のフィーチャストリームを1つに結合します — SQL UNION ALLに相当します",
          },
          {
            name: "AttributeDuplicateFilter",
            desc: "各ユニークキー値の最初の出現のみを保持し、後続の重複を破棄します — 先着優先です",
          },
          {
            name: "AttributeRenamer",
            desc: "列を一貫したスキーマに名前変更します。2つのソースファイルが同じフィールドに異なる名前を使用している場合に便利です",
          },
        ],
        inputShape:
          "共通のキー列（例：id、email）を持つ2つのCSV。スキーマは同一である必要はありません — 一方のソースにのみ存在する列はそのまま保持されます。キー列は各レコードを一意に識別する値を含む必要があります。",
      },
      fields: {
        csvPath1: {
          label: "ソースAのパス",
          hint: "1つ目のCSVソースファイル。",
        },
        csvPath2: {
          label: "ソースBのパス",
          hint: "2つ目のCSVソースファイル。",
        },
        dedupKey: {
          label: "重複排除キー列",
          hint: "この列に同じ値を持つ行は重複とみなされます。最初の出現のみが保持されます。",
        },
        outputPrefix: {
          label: "出力プレフィックス",
          hint: "出力ファイル： <code>{prefix}.csv</code>",
        },
      },
      alert:
        "<code>FLOW_URL_CSV_MERGE</code>（変数）と<code>FLOW_API_KEY</code>（シークレット）をGitHubリポジトリのSettings（Settings → Secrets and variables → Actions）に追加してから、再デプロイしてください。ローカル開発の場合は<code>.env.local</code>に追加してください。",
    },
    colSelect: {
      title: "列選択 / 個人情報スクラバー",
      desc: "CSVを読み込み、指定した列を除外して出力します。<strong>個人情報（PII）</strong>（メール、電話番号、マイナンバー等）の削除、ファイルサイズの削減、または特定フィールドのみを必要とするシステムへのデータ準備に使用します。",
      steps: [
        "CsvReader — URLからCSVを取得",
        "AttributeManager — 指定した列を削除",
        "CsvWriter — 削減済み出力を書き出し",
      ],
      learnMore: {
        problem:
          "データセットには社外に出してはいけない列が含まれることがよくあります — メールアドレスや電話番号などの個人情報、内部コスト項目、システムメタデータなど。誤って完全なエクスポートを共有すると、コンプライアンスと信頼性に問題が生じます。",
        whenToUse:
          "外部共有用のデータセット準備、データ最小化要件（GDPR、HIPAA）への対応、または一部のフィールドしか必要としない分析ツールへの引き渡し前のファイルサイズ削減。",
        concepts: [
          {
            name: "AttributeManager",
            desc: "列の追加、名前変更、削除を行います。削除モードでは指定した列を除外し、他のすべての列はそのまま通過します",
          },
        ],
        inputShape:
          "ヘッダー行を持つ任意のCSV。削除する列名を正確にリストアップします — スペルと大文字小文字はヘッダーと完全に一致する必要があります。それ以外の列はすべてそのまま保持されます。",
      },
      fields: {
        csvPath: { label: "CSVパス", hint: "入力CSVファイルのURLまたはパス。" },
        columnsToRemove: {
          label: "削除する列",
          hint: "削除する列名をカンマ区切りで入力します。それ以外の列はすべてそのまま保持されます。",
        },
        outputName: {
          label: "出力名",
          hint: "出力ファイル： <code>{name}.csv</code>",
        },
      },
      alert:
        "<code>FLOW_URL_COL_SELECT</code>（変数）と<code>FLOW_API_KEY</code>（シークレット）をGitHubリポジトリのSettings（Settings → Secrets and variables → Actions）に追加してから、再デプロイしてください。ローカル開発の場合は<code>.env.local</code>に追加してください。",
    },
    csvSplit: {
      title: "カテゴリ別データセット分割",
      desc: "単一のCSVの行をカテゴリ列の値に基づいて<strong>個別の出力ファイル</strong>にルーティングします — カテゴリごとに1ファイル。地域別の売上データ分割、年別レコード分割、既知の属性でセグメント化されたデータセット全般に使用します。",
      learnMore: {
        problem:
          "単一の統合エクスポートを異なる受信者向けに別ファイルに分割する必要がある場合 — 各地域チームが自分の分割データを必要とする場合や、下流システムがカテゴリごとに1ファイルを期待する場合。",
        whenToUse:
          "マスター売上ファイルのテリトリー別分割、重要度レベル別のイベントログのセグメント化、またはスプレッドシートでの手動フィルタリングなしにチーム別配信するためのデータセット分割。",
        concepts: [
          {
            name: "FeatureFilter",
            desc: "FlowExpr条件に基づいて行を名前付き出力ポートにルーティングします。各ポートは個別のCsvWriterに対応します — カテゴリ値とポート数はワークフロービルド時に固定されます",
          },
        ],
        inputShape:
          "ワークフローで設定されたカテゴリに一致する値を持つ列を含むCSV。設定されたカテゴリに一致しない行はキャッチオール出力にルーティングされます。カテゴリ列は一貫している必要があります — スペルミスや予期しない値はキャッチオールへ。",
      },
      fields: {
        csvPath: { label: "CSVパス", hint: "入力CSVファイルのURLまたはパス。" },
        categoryColumn: {
          label: "カテゴリ列",
          hint: "行の出力先ファイルを決定する値を持つ列。カテゴリのセットはワークフローで定義されます — どのカテゴリにも一致しない行はキャッチオールファイルへ。",
        },
        outputPrefix: {
          label: "出力プレフィックス",
          hint: "出力ファイル： <code>{prefix}_&lt;カテゴリ&gt;.csv</code>",
        },
      },
      alert:
        "<code>FLOW_URL_CSV_SPLIT</code>（変数）と<code>FLOW_API_KEY</code>（シークレット）をGitHubリポジトリのSettings（Settings → Secrets and variables → Actions）に追加してから、再デプロイしてください。ローカル開発の場合は<code>.env.local</code>に追加してください。",
    },
    csvToJson: {
      title: "CSV → JSON 変換",
      desc: "CSVテーブルを<strong>JSONオブジェクト配列</strong>に変換します — 1行につき1オブジェクト、キーはヘッダーから取得。スプレッドシートデータをWebアプリケーション、API、またはJSONを期待するシステムに受け渡す際の定番手段です。",
      steps: [
        "CsvReader — URLからCSVを取得",
        "JsonWriter — 行をJSON配列として書き出し",
      ],
      learnMore: {
        problem:
          "スプレッドシートデータは至る所にありますが、ほとんどのWebアプリケーション、API、ノーコードツールはJSONを期待します。手動のコピー&ペーストやExcelエクスポートはエラーが発生しやすく、スケールしません。",
        whenToUse:
          "JavaScriptフロントエンドへの表形式データの供給、REST API用データセットの準備、またはJSONのみを読み取るツール向けのレポート変換。",
        concepts: [
          {
            name: "CsvReader",
            desc: "ヘッダー行を属性キーとして、各データ行をフィーチャとしてパースします — Re:Earth Flowで最もシンプルなソースアクションです",
          },
          {
            name: "JsonWriter",
            desc: "フィーチャをJSONオブジェクト配列として出力します（1行につき1オブジェクト）。この2ノードパイプラインはRe:Earth Flowで最もミニマルなワークフローです",
          },
        ],
        inputShape:
          "ヘッダー行を持つ任意のCSV。すべての列がJSONキーに、すべての行がオブジェクトになります。数値文字列は文字列のまま保持されます — FlowはCSVパース時に型変換を行いません。",
      },
      fields: {
        csvPath: { label: "CSVパス", hint: "入力CSVファイルのURLまたはパス。" },
        outputName: {
          label: "出力名",
          hint: "出力ファイル： <code>{name}.json</code>",
        },
      },
      alert:
        "<code>FLOW_URL_CSV_JSON</code>（変数）と<code>FLOW_API_KEY</code>（シークレット）をGitHubリポジトリのSettings（Settings → Secrets and variables → Actions）に追加してから、再デプロイしてください。ローカル開発の場合は<code>.env.local</code>に追加してください。",
    },
    spatialFilter: {
      title: "空間サイズフィルタ",
      desc: "各ポリゴンフィーチャの面積を計算し、<strong>最小サイズ閾値を超えるもの</strong>のみを保持します。小さなスリバー、ノイズポリゴン、またはユースケースにとって意味のないサイズのフィーチャを除去するのに便利です。",
      learnMore: {
        problem:
          "実世界の空間データセットにはノイズが含まれています — デジタイズエラーによる微細なスリバー、境界断片、または分析スケールで意味を持たないほど小さなポリゴン。これらはフィーチャ数を水増しし、面積統計を歪めます。",
        whenToUse:
          "空間結合前の地籍・土地利用データのクリーニング、固定ズームレベルでの可視化前のポリゴンアーティファクト除去、または統計分析前の最小区画サイズの保証。",
        concepts: [
          {
            name: "AreaCalculator",
            desc: "ジオメトリからポリゴン面積を計算して属性として追加します — 事前計算された面積列は不要ですが、ソースCRSはメートル系である必要があります",
          },
          {
            name: "FeatureFilter",
            desc: 'フィーチャごとにFlowExpr条件を評価します — ここでは計算された面積属性をenv["min_area_m2"]で指定した閾値と比較します',
          },
        ],
        inputShape:
          "メートル系投影CRS（例：EPSG:2154、EPSG:3857）のポリゴンまたはマルチポリゴンフィーチャを含むGeoJSON。WGS84を入力すると面積値が不正確になります。事前計算された面積属性は不要です。",
      },
      fields: {
        geojsonPath: {
          label: "GeoJSONパス",
          hint: "メートル系CRS（例：EPSG:2154、3857）のポリゴンフィーチャを持つGeoJSONファイルのURL。",
        },
        minArea: {
          label: "最小面積（m²）",
          hint: "この値を下回る面積のフィーチャは破棄されます。",
        },
        outputName: {
          label: "出力名",
          hint: "出力ファイル： <code>{name}.geojson</code>",
        },
      },
      minAreaThat: "これは",
      minAreaThatSuffix: "に相当します。",
      alert:
        "<code>FLOW_URL_SPATIAL_FILTER</code>（変数）と<code>FLOW_API_KEY</code>（シークレット）をGitHubリポジトリのSettings（Settings → Secrets and variables → Actions）に追加してから、再デプロイしてください。ローカル開発の場合は<code>.env.local</code>に追加してください。",
    },
  },
};
