export type Step =
  | { title: string; body: string }
  | { title: string; bodyBefore: string; bodyAfter: string; varHint: string };

export interface WorkflowLearnMore {
  problem: string;
  whenToUse: string;
  concepts: { name: string; desc: string }[];
  inputShape: string;
}

export interface WorkflowT {
  title: string;
  desc: string;
  steps?: string[];
  learnMore: WorkflowLearnMore;
  fields: Record<string, { label: string; hint: string }>;
  alert: string;
  minAreaThat?: string;
  minAreaThatSuffix?: string;
}

export interface Translations {
  header: {
    title: string;
    badge: string;
    setupBtn: string;
  };
  footer: string;
  tabs: Record<number, string>;
  common: {
    runWorkflow: string;
    running: string;
    fillExample: string;
    openInFlow: string;
    runAgain: string;
    copy: string;
    copied: string;
    workflowLabel: string;
    notConfiguredTitle: string;
  };
  workflows: {
    csvQuality: WorkflowT;
    geoJson: WorkflowT;
    csvMerge: WorkflowT;
    colSelect: WorkflowT;
    csvSplit: WorkflowT;
    csvToJson: WorkflowT;
    spatialFilter: WorkflowT;
  };
  learnMore: {
    toggle: string;
    problemHeading: string;
    whenHeading: string;
    conceptsHeading: string;
    inputHeading: string;
  };
  jobStatus: {
    title: string;
    desc: string;
    jobIdLabel: string;
    submittedAt: string;
  };
  setupGuide: {
    title: string;
    intro: string;
    steps: Step[];
    localTitle: string;
    localDesc: string;
    localDevHint: string;
    localVarHint: string;
    localApiKeyHint: string;
  };
}

export const en: Translations = {
  header: {
    title: "Re:Earth Flow",
    badge: "Pipeline Explorer",
    setupBtn: "How to set up",
  },
  footer: "Explore ETL pipelines built with Re:Earth Flow",
  tabs: {
    1: "CSV Quality",
    2: "GeoJSON Pipeline",
    3: "CSV Merge",
    4: "Col Selector",
    5: "CSV Split",
    6: "CSV → JSON",
    7: "Size Filter",
  },
  common: {
    runWorkflow: "Run Workflow",
    running: "Running…",
    fillExample: "Fill example",
    openInFlow: "Open in Re:Earth Flow ↗",
    runAgain: "Run Again",
    copy: "Copy",
    copied: "✓ Copied",
    workflowLabel: "Workflow",
    notConfiguredTitle: "Not configured.",
  },
  learnMore: {
    toggle: "Learn more about this pipeline",
    problemHeading: "The problem it solves",
    whenHeading: "When to use it",
    conceptsHeading: "Key Re:Earth Flow concepts",
    inputHeading: "Input expectations",
  },
  jobStatus: {
    title: "Job Submitted",
    desc: "Your workflow is now running. Use the job ID below to track it in the Re:Earth Flow dashboard.",
    jobIdLabel: "Job ID",
    submittedAt: "Submitted at",
  },
  workflows: {
    csvQuality: {
      title: "CSV Data Quality Pipeline",
      desc: "Reads a CSV from a URL, splits rows into <strong>valid</strong> and <strong>rejected</strong> based on a required key column, enriches valid rows with a processed timestamp, and writes two output files: a clean CSV and a rejection log.",
      learnMore: {
        problem:
          "Raw data almost always arrives dirty — missing IDs, blank required fields, inconsistent formatting. Loading it straight into a database or passing it downstream propagates those errors silently.",
        whenToUse:
          "Validating vendor or form exports before ingestion. Any time you need a clean output file and a separate rejection log as two distinct deliverables.",
        concepts: [
          {
            name: "FeatureFilter",
            desc: "routes rows to named output ports using a FlowExpr condition — rows where the key column is non-null go to valid, the rest to unfiltered",
          },
          {
            name: "AttributeManager",
            desc: "adds, modifies, or removes columns — here it stamps a processed_at value on every valid row",
          },
          {
            name: "CsvWriter",
            desc: "writes a feature stream to a CSV file; used twice to produce the clean output and rejection log independently",
          },
        ],
        inputShape:
          "Any CSV with a header row. Designate one column as the required key — rows where it is null or empty are routed to the rejection log. All other columns pass through unchanged.",
      },
      fields: {
        csvPath: {
          label: "CSV Path",
          hint: "URL or path to the input CSV file.",
        },
        keyColumn: {
          label: "Key Column",
          hint: "Rows where this column is null or empty are rejected.",
        },
        outputPrefix: {
          label: "Output Prefix",
          hint: "Output files: <code>{prefix}_clean.csv</code> and <code>{prefix}_rejected.csv</code>",
        },
      },
      alert:
        "Set <code>FLOW_URL_CSV_QUALITY</code> (variable) and <code>FLOW_API_KEY</code> (secret) in your GitHub repository settings, then redeploy. For local dev, add them to <code>.env.local</code>.",
    },
    geoJson: {
      title: "GeoJSON Spatial Analysis Pipeline",
      desc: "Reads a GeoJSON file of polygon features in a metric CRS, calculates polygon areas, then splits: one branch reprojects to WGS84 and writes an <strong>enriched GeoJSON</strong> ready for Cesium; the other aggregates feature counts by category and writes a <strong>JSON summary</strong>.",
      learnMore: {
        problem:
          "GIS exports use many different coordinate reference systems. Web maps (Cesium, Mapbox, Leaflet) all require WGS84 (EPSG:4326), but area calculations need a metric CRS — you can't have both in one pass without a reprojection step.",
        whenToUse:
          "Preparing polygon layers for web visualization while also generating feature-count statistics. A common pattern when publishing city or land-use data to a web map.",
        concepts: [
          {
            name: "AreaCalculator",
            desc: "computes polygon area in m² from the geometry — requires a metric projected CRS; WGS84 input will produce incorrect results",
          },
          {
            name: "HorizontalReprojector",
            desc: "transforms coordinates from one CRS to another; here converts to EPSG:4326 for the Cesium-ready output",
          },
          {
            name: "AttributeAggregator",
            desc: "groups features by a column and computes aggregate values — here counts features per category for the stats output",
          },
        ],
        inputShape:
          "GeoJSON with polygon features in a metric projected CRS (e.g. EPSG:2154, EPSG:3857, EPSG:6668). WGS84 input will produce incorrect area values. Each feature must have the category column you specify.",
      },
      fields: {
        geojsonPath: {
          label: "GeoJSON Path",
          hint: "URL to a GeoJSON file with polygon features in a metric CRS (e.g. EPSG:2154, 3857). The workflow reprojects to WGS84 (EPSG:4326) for the Cesium output.",
        },
        categoryColumn: {
          label: "Category Column",
          hint: "Features are grouped by this attribute when counting. Must exist on every feature.",
        },
        outputName: {
          label: "Output Name",
          hint: "Output files: <code>{name}.geojson</code> and <code>{name}_stats.json</code>",
        },
      },
      alert:
        "Set <code>FLOW_URL_GEOJSON</code> (variable) and <code>FLOW_API_KEY</code> (secret) in your GitHub repository settings, then redeploy. For local dev, add them to <code>.env.local</code>.",
    },
    csvMerge: {
      title: "Multi-source CSV Merge & Dedup",
      desc: "Reads two CSV files from separate URLs, merges them into a single feature stream, removes duplicate records based on a key column, normalizes column names, and writes one <strong>unified, deduplicated CSV</strong>. Essential for combining vendor exports or reconciling data from multiple systems.",
      steps: [
        "CsvReader ×2 — read both source files",
        "FeatureMerger — combine into one stream",
        "AttributeDuplicateFilter — remove duplicates by key",
        "AttributeRenamer — normalize column names",
        "CsvWriter — single unified output",
      ],
      learnMore: {
        problem:
          "The same entity often lives in two separate system exports — one record per system, with duplicates and slightly different column names. Manual reconciliation in a spreadsheet is slow and error-prone at scale.",
        whenToUse:
          "Reconciling CRM and billing exports, combining weekly snapshots from two departments, or merging data collected from two independent sources before loading into a database.",
        concepts: [
          {
            name: "FeatureMerger",
            desc: "combines two separate feature streams into one — the equivalent of a SQL UNION ALL",
          },
          {
            name: "AttributeDuplicateFilter",
            desc: "keeps only the first occurrence of each unique key value, discarding later duplicates — first-occurrence wins",
          },
          {
            name: "AttributeRenamer",
            desc: "renames columns to a consistent schema, useful when the two source files use different names for the same field",
          },
        ],
        inputShape:
          "Two CSVs that share a common key column (e.g. id, email). The schemas do not need to be identical — columns present in only one source are kept as-is. The key column must contain values that uniquely identify each record.",
      },
      fields: {
        csvPath1: { label: "Source A Path", hint: "First CSV source file." },
        csvPath2: { label: "Source B Path", hint: "Second CSV source file." },
        dedupKey: {
          label: "Dedup Key Column",
          hint: "Rows with the same value in this column are considered duplicates; only the first occurrence is kept.",
        },
        outputPrefix: {
          label: "Output Prefix",
          hint: "Output file: <code>{prefix}.csv</code>",
        },
      },
      alert:
        "Set <code>FLOW_URL_CSV_MERGE</code> (variable) and <code>FLOW_API_KEY</code> (secret) in your GitHub repository settings, then redeploy. For local dev, add them to <code>.env.local</code>.",
    },
    colSelect: {
      title: "Column Selector / PII Scrubber",
      desc: "Reads a CSV and removes the specified columns before writing the output. Use it to strip <strong>PII</strong> (email, phone, SSN), reduce file size, or prepare data for a specific consumer that only needs a subset of fields.",
      steps: [
        "CsvReader — fetch CSV from URL",
        "AttributeManager — remove specified columns",
        "CsvWriter — write trimmed output",
      ],
      learnMore: {
        problem:
          "Datasets often contain columns that should never leave the building — PII like email and phone numbers, internal cost fields, or system metadata. Sharing a full export by mistake creates compliance and trust risks.",
        whenToUse:
          "Preparing a dataset for external sharing, complying with data minimization requirements (GDPR, HIPAA), or reducing file size before handing off to an analytics tool that only needs a subset of fields.",
        concepts: [
          {
            name: "AttributeManager",
            desc: "adds, renames, or removes columns; in remove mode it drops the named columns and passes everything else through untouched",
          },
        ],
        inputShape:
          "Any CSV with a header row. List the exact column names to drop — spelling and case must match the header exactly. All other columns are kept as-is.",
      },
      fields: {
        csvPath: {
          label: "CSV Path",
          hint: "URL or path to the input CSV file.",
        },
        columnsToRemove: {
          label: "Columns to Remove",
          hint: "Comma-separated column names to drop. All other columns are kept as-is.",
        },
        outputName: {
          label: "Output Name",
          hint: "Output file: <code>{name}.csv</code>",
        },
      },
      alert:
        "Set <code>FLOW_URL_COL_SELECT</code> (variable) and <code>FLOW_API_KEY</code> (secret) in your GitHub repository settings, then redeploy. For local dev, add them to <code>.env.local</code>.",
    },
    csvSplit: {
      title: "Split Dataset by Category",
      desc: "Routes rows from a single CSV into <strong>separate output files</strong> based on the value of a category column — one file per category. Useful for splitting sales data by region, records by year, or any dataset segmented by a known attribute.",
      learnMore: {
        problem:
          "A single combined export needs to be split into separate files for different consumers — regional teams each want their own slice, or a downstream system expects one file per category.",
        whenToUse:
          "Splitting a master sales file by territory, segmenting event logs by severity level, or partitioning a dataset for per-team delivery without manual filtering in a spreadsheet.",
        concepts: [
          {
            name: "FeatureFilter",
            desc: "routes rows to named output ports based on a FlowExpr condition; each port maps to a separate CsvWriter — the category values and port count are fixed at workflow build time",
          },
        ],
        inputShape:
          "A CSV with a column whose values match the categories configured in the workflow. Rows that do not match any configured category are routed to a catch-all output. The category column must be consistent — misspellings or unexpected values go to the catch-all.",
      },
      fields: {
        csvPath: {
          label: "CSV Path",
          hint: "URL or path to the input CSV file.",
        },
        categoryColumn: {
          label: "Category Column",
          hint: "Column whose values determine which output file each row goes to. The set of categories is defined in the workflow — rows not matching any category go to a catch-all file.",
        },
        valueA: {
          label: "Value A",
          hint: "Rows where the category column equals this value go to output A.",
        },
        valueB: {
          label: "Value B",
          hint: "Rows where the category column equals this value go to output B.",
        }
      },
      alert:
        "Set <code>FLOW_URL_CSV_SPLIT</code> (variable) and <code>FLOW_API_KEY</code> (secret) in your GitHub repository settings, then redeploy. For local dev, add them to <code>.env.local</code>.",
    },
    csvToJson: {
      title: "CSV to JSON",
      desc: "Converts a CSV table into a <strong>JSON array of objects</strong> — one object per row, keys from the header. The go-to handoff when feeding spreadsheet data into a web application, API, or any system that expects JSON.",
      steps: [
        "CsvReader — fetch CSV from URL",
        "JsonWriter — write rows as JSON array",
      ],
      learnMore: {
        problem:
          "Spreadsheet data is ubiquitous but most web applications, APIs, and no-code tools expect JSON. Manual copy-paste or Excel export is error-prone and does not scale.",
        whenToUse:
          "Feeding tabular data into a JavaScript front-end, preparing a dataset for a REST API, or converting a report for consumption by a tool that only reads JSON.",
        concepts: [
          {
            name: "CsvReader",
            desc: "parses the header row as attribute keys and each data row as a feature — the simplest source action in Re:Earth Flow",
          },
          {
            name: "JsonWriter",
            desc: "emits features as a JSON array of objects, one object per row; this two-node pipeline is the most minimal workflow in Re:Earth Flow",
          },
        ],
        inputShape:
          "Any CSV with a header row. Every column becomes a JSON key; every row becomes an object. Numeric strings are kept as strings — Flow does not coerce types during CSV parsing.",
      },
      fields: {
        csvPath: {
          label: "CSV Path",
          hint: "URL or path to the input CSV file.",
        },
        outputName: {
          label: "Output Name",
          hint: "Output file: <code>{name}.json</code>",
        },
      },
      alert:
        "Set <code>FLOW_URL_CSV_JSON</code> (variable) and <code>FLOW_API_KEY</code> (secret) in your GitHub repository settings, then redeploy. For local dev, add them to <code>.env.local</code>.",
    },
    spatialFilter: {
      title: "Spatial Size Filter",
      desc: "Calculates the area of each polygon feature and keeps only those <strong>above a minimum size threshold</strong>. Useful for removing small slivers, noise polygons, or features below a meaningful size for your use case.",
      learnMore: {
        problem:
          "Real-world spatial datasets contain noise — tiny slivers from digitization errors, boundary fragments, or polygons too small to be meaningful at your analysis scale. They inflate feature counts and skew area statistics.",
        whenToUse:
          "Cleaning cadastral or land-use data before a spatial join, removing polygon artifacts before visualization at a fixed zoom level, or ensuring a minimum parcel size before statistical analysis.",
        concepts: [
          {
            name: "AreaCalculator",
            desc: "computes polygon area from the geometry and appends it as an attribute — no pre-computed area column needed, but the source CRS must be metric",
          },
          {
            name: "FeatureFilter",
            desc: 'evaluates a FlowExpr condition per feature — here it checks the computed area attribute against the threshold you provide at trigger time via env["min_area_m2"]',
          },
        ],
        inputShape:
          "GeoJSON with polygon or multipolygon features in a metric projected CRS (e.g. EPSG:2154, EPSG:3857). WGS84 input will produce incorrect area values. No pre-computed area attribute is required.",
      },
      fields: {
        geojsonPath: {
          label: "GeoJSON Path",
          hint: "URL to a GeoJSON file with polygon features in a metric CRS (e.g. EPSG:2154, 3857).",
        },
        minArea: {
          label: "Minimum Area (m²)",
          hint: "Features with area below this value are discarded.",
        },
        outputName: {
          label: "Output Name",
          hint: "Output file: <code>{name}.geojson</code>",
        },
      },
      minAreaThat: "That's",
      minAreaThatSuffix: ".",
      alert:
        "Set <code>FLOW_URL_SPATIAL_FILTER</code> (variable) and <code>FLOW_API_KEY</code> (secret) in your GitHub repository settings, then redeploy. For local dev, add them to <code>.env.local</code>.",
    },
  },
  setupGuide: {
    title: "How to set up a workflow",
    intro:
      "Each workflow on this site maps to a deployed Re:Earth Flow project. Follow these steps once per workflow to wire it up.",
    steps: [
      {
        title: "Open the shared workflow in Flow",
        body: "Click the <em>Open in Re:Earth Flow</em> button on the workflow card. This opens a read-only copy of the workflow in the Re:Earth Flow editor.",
      },
      {
        title: "Fork it to your workspace",
        body: "Use <em>File → Duplicate</em> (or the equivalent fork action) to copy the workflow into your own workspace. You can edit nodes and parameters freely from here.",
      },
      {
        title: "Create a deployment",
        body: "From the workflow editor, open the <em>Deployments</em> panel and click <em>New deployment</em>. Give it a name and publish it. A deployment is an immutable snapshot — re-deploy any time you change the workflow.",
      },
      {
        title: "Copy the trigger URL",
        body: "Open the deployment and go to the <em>Trigger</em> tab. Copy the full trigger endpoint URL — it looks like <code>https://api.flow.reearth.io/api/v1/projects/…/deployments/…/trigger</code>.",
      },
      {
        title: "Add the trigger URL to GitHub",
        bodyBefore:
          "In your repository go to <em>Settings → Secrets and variables → Actions → Variables</em> and add:",
        bodyAfter:
          "If <code>FLOW_API_KEY</code> is not yet set, add it under <em>Secrets</em> (not Variables — it’s a credential).",
        varHint: "= <trigger URL>",
      },
      {
        title: "Redeploy the site",
        body: "Push any commit to <code>main</code>, or go to <em>Actions → Deploy to GitHub Pages → Run workflow</em> to trigger a manual deploy. The new variable is baked in at build time.",
      },
    ],
    localTitle: "Local development",
    localDesc:
      "Add the following to your <code>.env.local</code> file (never commit this file):",
    localDevHint:
      "Then run <code>npm run dev</code>. The Vite dev server proxies Re:Earth Flow API requests automatically to avoid CORS.",
    localVarHint: "= <trigger URL>",
    localApiKeyHint: "= <api key>",
  },
};
