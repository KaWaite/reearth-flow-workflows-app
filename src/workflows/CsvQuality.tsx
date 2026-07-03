import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { JobStatus } from '../components/JobStatus';
import { LearnMore } from '../components/LearnMore';
import { WorkflowGraph } from '../components/WorkflowGraph';
import type { GraphNode, GraphEdge } from '../components/WorkflowGraph';

const GRAPH_NODES: GraphNode[] = [
  { id: 'reader',   label: 'CsvReader',        col: 0, row: 0, type: 'source' },
  { id: 'filter',   label: 'FeatureFilter',     col: 1, row: 0, type: 'filter' },
  { id: 'attr',     label: 'AttributeManager',  col: 2, row: 0, type: 'processor' },
  { id: 'clean',    label: 'CsvWriter',  sublabel: 'clean',    col: 3, row: 0, type: 'sink' },
  { id: 'rejected', label: 'CsvWriter',  sublabel: 'rejected', col: 2, row: 1, type: 'sink' },
];
const GRAPH_EDGES: GraphEdge[] = [
  { from: 'reader', to: 'filter' },
  { from: 'filter', to: 'attr',     label: 'valid' },
  { from: 'filter', to: 'rejected', label: 'unfiltered' },
  { from: 'attr',   to: 'clean' },
];
import type { CsvQualityParams, JobResult, JobState } from '../types';

const DEFAULTS: CsvQualityParams = {
  csv_path: '',
  key_column: '',
  output_prefix: 'output',
};

const EXAMPLE: CsvQualityParams = {
  csv_path: 'https://api.flow.reearth.io/assets/01kwgt5bs7a2yz0k83h0s0d91d.csv',
  key_column: 'era',
  output_prefix: 'output',
};

export function CsvQualityWorkflow() {
  const [params, setParams] = useState<CsvQualityParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configured = isWorkflowConfigured(1);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJobState('submitting');
    setError(null);
    try {
      const res = await triggerWorkflow(1, params);
      setJob({ jobId: res.jobId, submittedAt: new Date().toISOString() });
      setJobState('submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setJobState('error');
    }
  }

  function handleReset() {
    setJobState('idle');
    setJob(null);
    setError(null);
    setParams(DEFAULTS);
  }

  function handleFillExample() {
    setParams(EXAMPLE);
  }

  return (
    <>
      <section className="workflow-card">
        <div className="workflow-card-top">
          <span className="workflow-card-label">Workflow 1</span>
          <a href="#" className="btn-open-flow btn-open-flow-disabled" onClick={(e) => e.preventDefault()}>Open in Flow ↗</a>
        </div>
        <h1 className="workflow-card-title">CSV Data Quality Pipeline</h1>
        <p className="workflow-card-desc">
          Reads a CSV from a URL, splits rows into <strong>valid</strong> and{' '}
          <strong>rejected</strong> based on a required key column, enriches valid rows with a
          processed timestamp, and writes two output files: a clean CSV and a rejection log.
        </p>
        <WorkflowGraph
          nodes={GRAPH_NODES}
          edges={GRAPH_EDGES}
          ariaLabel="CSV Quality workflow: CsvReader feeds FeatureFilter which routes valid rows through AttributeManager to a clean CsvWriter, and unfiltered rows directly to a rejected CsvWriter"
        />
        <LearnMore
          problem="Raw data almost always arrives dirty — missing IDs, blank required fields, inconsistent formatting. Loading it straight into a database or passing it downstream propagates those errors silently."
          whenToUse="Validating vendor or form exports before ingestion. Any time you need a clean output file and a separate rejection log as two distinct deliverables."
          concepts={[
            { name: 'FeatureFilter', desc: 'routes rows to named output ports using a FlowExpr condition — rows where the key column is non-null go to valid, the rest to unfiltered' },
            { name: 'AttributeManager', desc: 'adds, modifies, or removes columns — here it stamps a processed_at value on every valid row' },
            { name: 'CsvWriter', desc: 'writes a feature stream to a CSV file; used twice to produce the clean output and rejection log independently' },
          ]}
          inputShape="Any CSV with a header row. Designate one column as the required key — rows where it is null or empty are routed to the rejection log. All other columns pass through unchanged."
        />
      </section>

      {!configured && (
        <div className="alert alert-warn">
          <strong>Not configured.</strong> Set <code>FLOW_URL_CSV_QUALITY</code> (variable) and{' '}
          <code>FLOW_API_KEY</code> (secret) in your GitHub repository settings, then redeploy.
          For local dev, add them to <code>.env.local</code>.
        </div>
      )}

      {jobState !== 'submitted' && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-title-row">
            <h2 className="form-title">Run Workflow</h2>
            <button type="button" className="btn-example" onClick={handleFillExample}>
              Fill example
            </button>
          </div>

          <div className="field">
            <label htmlFor="csv_path">CSV Path <span className="required">*</span></label>
            <input
              id="csv_path"
              name="csv_path"
              type="text"
              required
              placeholder="https://example.com/data.csv"
              value={params.csv_path}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">URL or path to the input CSV file.</span>
          </div>

          <div className="field">
            <label htmlFor="key_column">Key Column <span className="required">*</span></label>
            <input
              id="key_column"
              name="key_column"
              type="text"
              required
              placeholder="email"
              value={params.key_column}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">Rows where this column is null or empty are rejected.</span>
          </div>

          <div className="field">
            <label htmlFor="output_prefix">Output Prefix</label>
            <input
              id="output_prefix"
              name="output_prefix"
              type="text"
              placeholder="output"
              value={params.output_prefix}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              Output files: <code>{params.output_prefix || 'output'}_clean.csv</code> and{' '}
              <code>{params.output_prefix || 'output'}_rejected.csv</code>
            </span>
          </div>

          {jobState === 'error' && error && (
            <div className="alert alert-error">{error}</div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={jobState === 'submitting' || !configured}
          >
            {jobState === 'submitting' ? <><span className="spinner" /> Running…</> : 'Run Workflow'}
          </button>
        </form>
      )}

      {jobState === 'submitted' && job && (
        <JobStatus job={job} onReset={handleReset} />
      )}
    </>
  );
}
