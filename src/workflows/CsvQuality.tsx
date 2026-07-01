import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { JobStatus } from '../components/JobStatus';
import type { CsvQualityParams, JobResult, JobState } from '../types';

const DEFAULTS: CsvQualityParams = {
  csv_url: '',
  key_column: '',
  output_prefix: 'output',
};

const EXAMPLE: CsvQualityParams = {
  csv_url: 'https://api.flow.reearth.io/assets/01kwdqhya38b2g4r2ywfksy1gn.csv',
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
        <div className="workflow-card-label">Workflow 1</div>
        <h1 className="workflow-card-title">CSV Data Quality Pipeline</h1>
        <p className="workflow-card-desc">
          Reads a CSV from a URL, splits rows into <strong>valid</strong> and{' '}
          <strong>rejected</strong> based on a required key column, enriches valid rows with a
          processed timestamp, and writes two output files: a clean CSV and a rejection log.
        </p>
        <ol className="workflow-steps">
          <li><span className="step-badge">1</span> CsvReader — fetch CSV from URL</li>
          <li><span className="step-badge">2</span> FeatureFilter — route non-null key column → <code>valid</code>; rest → <code>unfiltered</code></li>
          <li><span className="step-badge">3</span> AttributeManager — add <code>processed_at</code> to valid rows</li>
          <li><span className="step-badge">4</span> CsvWriter ×2 — clean output + rejection log</li>
        </ol>
      </section>

      {!configured && (
        <div className="alert alert-warn">
          <strong>Not configured.</strong> Set <code>FLOW_TRIGGER_URL_1</code> (variable) and{' '}
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
            <label htmlFor="csv_url">CSV URL <span className="required">*</span></label>
            <input
              id="csv_url"
              name="csv_url"
              type="url"
              required
              placeholder="https://example.com/data.csv"
              value={params.csv_url}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">Publicly accessible URL to the input CSV file.</span>
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
