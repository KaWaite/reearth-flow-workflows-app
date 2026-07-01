import { useState } from 'react';
import { triggerWorkflow, isMisconfigured } from './lib/api';
import type { JobResult, JobState, TriggerParams } from './types';
import './App.css';

const DEFAULTS: TriggerParams = {
  csv_url: '',
  key_column: '',
  output_prefix: 'output',
};

export default function App() {
  const [params, setParams] = useState<TriggerParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const misconfigured = isMisconfigured();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJobState('submitting');
    setError(null);
    setJob(null);
    try {
      const res = await triggerWorkflow(params);
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

  async function handleCopy() {
    if (!job) return;
    await navigator.clipboard.writeText(job.jobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="header-icon">⚙</span>
            <span className="header-title">Flow Trigger</span>
          </div>
          <span className="header-badge">Re:Earth Flow</span>
        </div>
      </header>

      <main className="main">
        <section className="workflow-card">
          <div className="workflow-card-label">Workflow · Option 1</div>
          <h1 className="workflow-card-title">CSV Data Quality Pipeline</h1>
          <p className="workflow-card-desc">
            Reads a CSV from a URL, splits rows into <strong>valid</strong> and{' '}
            <strong>rejected</strong> based on a required key column, enriches valid rows with a
            processed timestamp, and writes two output files: a clean CSV and a rejection log.
          </p>
          <ol className="workflow-steps">
            <li><span className="step-badge">1</span> CsvReader — fetch CSV from URL</li>
            <li><span className="step-badge">2</span> AttributeFilter — split on non-null key column</li>
            <li><span className="step-badge">3</span> AttributeCreator — add <code>processed_at</code> to valid rows</li>
            <li><span className="step-badge">4</span> CsvWriter ×2 — clean output + rejection log</li>
          </ol>
        </section>

        {misconfigured && (
          <div className="alert alert-warn">
            <strong>Not configured.</strong> Build-time env vars are missing. Deploy via GitHub
            Actions with <code>FLOW_TRIGGER_URL</code> and <code>FLOW_API_KEY</code> secrets set, or
            create a <code>.env.local</code> file for local development.
          </div>
        )}

        {jobState !== 'submitted' && (
          <form className="form-card" onSubmit={handleSubmit}>
            <h2 className="form-title">Run Workflow</h2>

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
                Prefix for output filenames: <code>{params.output_prefix || 'output'}_clean.csv</code> and{' '}
                <code>{params.output_prefix || 'output'}_rejected.csv</code>.
              </span>
            </div>

            {jobState === 'error' && error && (
              <div className="alert alert-error">{error}</div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={jobState === 'submitting' || misconfigured}
            >
              {jobState === 'submitting' ? (
                <><span className="spinner" /> Running…</>
              ) : (
                'Run Workflow'
              )}
            </button>
          </form>
        )}

        {jobState === 'submitted' && job && (
          <div className="result-card">
            <div className="result-icon">✓</div>
            <h2 className="result-title">Job Submitted</h2>
            <p className="result-desc">
              Your workflow is now running. Use the job ID below to track it in the Re:Earth Flow
              dashboard.
            </p>
            <div className="job-id-row">
              <span className="job-id-label">Job ID</span>
              <code className="job-id">{job.jobId}</code>
              <button className="btn-copy" onClick={handleCopy}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="result-meta">
              Submitted at <time>{new Date(job.submittedAt).toLocaleString()}</time>
            </p>
            <button className="btn-secondary" onClick={handleReset}>
              Run Again
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        Built for Re:Earth Flow · homework assignment
      </footer>
    </div>
  );
}
