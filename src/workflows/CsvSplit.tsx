import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { JobStatus } from '../components/JobStatus';
import { LearnMore } from '../components/LearnMore';
import { WorkflowGraph } from '../components/WorkflowGraph';
import type { GraphNode, GraphEdge } from '../components/WorkflowGraph';

const GRAPH_NODES: GraphNode[] = [
  { id: 'reader',  label: 'CsvReader',     col: 0, row: 1, type: 'source' },
  { id: 'filter',  label: 'FeatureFilter', col: 1, row: 1, type: 'filter' },
  { id: 'writerA', label: 'CsvWriter', sublabel: 'category A', col: 2, row: 0, type: 'sink' },
  { id: 'writerB', label: 'CsvWriter', sublabel: 'category B', col: 2, row: 1, type: 'sink' },
  { id: 'writerC', label: 'CsvWriter', sublabel: 'catch-all',  col: 2, row: 2, type: 'sink' },
];
const GRAPH_EDGES: GraphEdge[] = [
  { from: 'reader',  to: 'filter' },
  { from: 'filter',  to: 'writerA', label: 'cat A' },
  { from: 'filter',  to: 'writerB', label: 'cat B' },
  { from: 'filter',  to: 'writerC', label: 'other' },
];
import type { CsvSplitParams, JobResult, JobState } from '../types';

const DEFAULTS: CsvSplitParams = {
  csv_path: '',
  category_column: '',
  output_prefix: 'split',
};

export function CsvSplitWorkflow() {
  const [params, setParams] = useState<CsvSplitParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configured = isWorkflowConfigured(5);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJobState('submitting');
    setError(null);
    try {
      const res = await triggerWorkflow(5, params);
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

  return (
    <>
      <section className="workflow-card">
        <div className="workflow-card-top">
          <span className="workflow-card-label">Workflow 5</span>
          <a href="#" className="btn-open-flow btn-open-flow-disabled" onClick={(e) => e.preventDefault()}>Open in Flow ↗</a>
        </div>
        <h1 className="workflow-card-title">Split Dataset by Category</h1>
        <p className="workflow-card-desc">
          Routes rows from a single CSV into <strong>separate output files</strong> based on the
          value of a category column — one file per category. Useful for splitting sales data by
          region, records by year, or any dataset segmented by a known attribute.
        </p>
        <WorkflowGraph
          nodes={GRAPH_NODES}
          edges={GRAPH_EDGES}
          ariaLabel="CSV Split workflow: CsvReader feeds FeatureFilter which fans out to separate CsvWriter nodes for category A, category B, and a catch-all"
        />
        <LearnMore
          problem="A single combined export needs to be split into separate files for different consumers — regional teams each want their own slice, or a downstream system expects one file per category."
          whenToUse="Splitting a master sales file by territory, segmenting event logs by severity level, or partitioning a dataset for per-team delivery without manual filtering in a spreadsheet."
          concepts={[
            { name: 'FeatureFilter', desc: 'routes rows to named output ports based on a FlowExpr condition; each port maps to a separate CsvWriter — the category values and port count are fixed at workflow build time' },
          ]}
          inputShape="A CSV with a column whose values match the categories configured in the workflow. Rows that do not match any configured category are routed to a catch-all output. The category column must be consistent — misspellings or unexpected values go to the catch-all."
        />
      </section>

      {!configured && (
        <div className="alert alert-warn">
          <strong>Not configured.</strong> Set <code>FLOW_URL_CSV_SPLIT</code> (variable) and{' '}
          <code>FLOW_API_KEY</code> (secret) in your GitHub repository settings, then redeploy.
          For local dev, add them to <code>.env.local</code>.
        </div>
      )}

      {jobState !== 'submitted' && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2 className="form-title">Run Workflow</h2>

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
            <label htmlFor="category_column">
              Category Column <span className="required">*</span>
            </label>
            <input
              id="category_column"
              name="category_column"
              type="text"
              required
              placeholder="region"
              value={params.category_column}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              Column whose values determine which output file each row goes to. The set of
              categories is defined in the workflow — rows not matching any category go to a
              catch-all file.
            </span>
          </div>

          <div className="field">
            <label htmlFor="output_prefix">Output Prefix</label>
            <input
              id="output_prefix"
              name="output_prefix"
              type="text"
              placeholder="split"
              value={params.output_prefix}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              Output files: <code>{params.output_prefix || 'split'}_&lt;category&gt;.csv</code>
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
