import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { JobStatus } from '../components/JobStatus';
import { LearnMore } from '../components/LearnMore';
import type { CsvMergeParams, JobResult, JobState } from '../types';

const DEFAULTS: CsvMergeParams = {
  csv_path_1: '',
  csv_path_2: '',
  dedup_key: '',
  output_prefix: 'merged',
};

export function CsvMergeWorkflow() {
  const [params, setParams] = useState<CsvMergeParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configured = isWorkflowConfigured(3);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJobState('submitting');
    setError(null);
    try {
      const res = await triggerWorkflow(3, params);
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
          <span className="workflow-card-label">Workflow 3</span>
          <a href="#" className="btn-open-flow btn-open-flow-disabled" onClick={(e) => e.preventDefault()}>Open in Flow ↗</a>
        </div>
        <h1 className="workflow-card-title">Multi-source CSV Merge &amp; Dedup</h1>
        <p className="workflow-card-desc">
          Reads two CSV files from separate URLs, merges them into a single feature stream,
          removes duplicate records based on a key column, normalizes column names, and writes
          one <strong>unified, deduplicated CSV</strong>. Essential for combining vendor exports
          or reconciling data from multiple systems.
        </p>
        <ol className="workflow-steps">
          <li><span className="step-badge">1</span> CsvReader ×2 — read both source files</li>
          <li><span className="step-badge">2</span> FeatureMerger — combine into one stream</li>
          <li><span className="step-badge">3</span> AttributeDuplicateFilter — remove duplicates by key</li>
          <li><span className="step-badge">4</span> AttributeRenamer — normalize column names</li>
          <li><span className="step-badge">5</span> CsvWriter — single unified output</li>
        </ol>
        <LearnMore
          problem="The same entity often lives in two separate system exports — one record per system, with duplicates and slightly different column names. Manual reconciliation in a spreadsheet is slow and error-prone at scale."
          whenToUse="Reconciling CRM and billing exports, combining weekly snapshots from two departments, or merging data collected from two independent sources before loading into a database."
          concepts={[
            { name: 'FeatureMerger', desc: 'combines two separate feature streams into one — the equivalent of a SQL UNION ALL' },
            { name: 'AttributeDuplicateFilter', desc: 'keeps only the first occurrence of each unique key value, discarding later duplicates — first-occurrence wins' },
            { name: 'AttributeRenamer', desc: 'renames columns to a consistent schema, useful when the two source files use different names for the same field' },
          ]}
          inputShape="Two CSVs that share a common key column (e.g. id, email). The schemas do not need to be identical — columns present in only one source are kept as-is. The key column must contain values that uniquely identify each record."
        />
      </section>

      {!configured && (
        <div className="alert alert-warn">
          <strong>Not configured.</strong> Set <code>FLOW_URL_CSV_MERGE</code> (variable) and{' '}
          <code>FLOW_API_KEY</code> (secret) in your GitHub repository settings, then redeploy.
          For local dev, add them to <code>.env.local</code>.
        </div>
      )}

      {jobState !== 'submitted' && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2 className="form-title">Run Workflow</h2>

          <div className="field">
            <label htmlFor="csv_path_1">Source A Path <span className="required">*</span></label>
            <input
              id="csv_path_1"
              name="csv_path_1"
              type="text"
              required
              placeholder="https://example.com/source-a.csv"
              value={params.csv_path_1}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">First CSV source file.</span>
          </div>

          <div className="field">
            <label htmlFor="csv_path_2">Source B Path <span className="required">*</span></label>
            <input
              id="csv_path_2"
              name="csv_path_2"
              type="text"
              required
              placeholder="https://example.com/source-b.csv"
              value={params.csv_path_2}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">Second CSV source file.</span>
          </div>

          <div className="field">
            <label htmlFor="dedup_key">Dedup Key Column <span className="required">*</span></label>
            <input
              id="dedup_key"
              name="dedup_key"
              type="text"
              required
              placeholder="id"
              value={params.dedup_key}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              Rows with the same value in this column are considered duplicates; only the first
              occurrence is kept.
            </span>
          </div>

          <div className="field">
            <label htmlFor="output_prefix">Output Prefix</label>
            <input
              id="output_prefix"
              name="output_prefix"
              type="text"
              placeholder="merged"
              value={params.output_prefix}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              Output file: <code>{params.output_prefix || 'merged'}.csv</code>
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
