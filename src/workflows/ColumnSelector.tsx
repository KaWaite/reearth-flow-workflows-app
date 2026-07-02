import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { JobStatus } from '../components/JobStatus';
import type { ColumnSelectorParams, JobResult, JobState } from '../types';

const DEFAULTS: ColumnSelectorParams = {
  csv_url: '',
  columns_to_remove: '',
  output_name: 'output',
};

export function ColumnSelectorWorkflow() {
  const [params, setParams] = useState<ColumnSelectorParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configured = isWorkflowConfigured(4);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJobState('submitting');
    setError(null);
    try {
      const res = await triggerWorkflow(4, params);
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
        <div className="workflow-card-label">Workflow 4</div>
        <h1 className="workflow-card-title">Column Selector / PII Scrubber</h1>
        <p className="workflow-card-desc">
          Reads a CSV and removes the specified columns before writing the output. Use it to strip{' '}
          <strong>PII</strong> (email, phone, SSN), reduce file size, or prepare data for a
          specific consumer that only needs a subset of fields.
        </p>
        <ol className="workflow-steps">
          <li><span className="step-badge">1</span> CsvReader — fetch CSV from URL</li>
          <li><span className="step-badge">2</span> AttributeManager — remove specified columns</li>
          <li><span className="step-badge">3</span> CsvWriter — write trimmed output</li>
        </ol>
      </section>

      {!configured && (
        <div className="alert alert-warn">
          <strong>Not configured.</strong> Set <code>FLOW_TRIGGER_URL_4</code> (variable) and{' '}
          <code>FLOW_API_KEY</code> (secret) in your GitHub repository settings, then redeploy.
          For local dev, add them to <code>.env.local</code>.
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
            <label htmlFor="columns_to_remove">
              Columns to Remove <span className="required">*</span>
            </label>
            <input
              id="columns_to_remove"
              name="columns_to_remove"
              type="text"
              required
              placeholder="email, phone, ssn"
              value={params.columns_to_remove}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              Comma-separated column names to drop. All other columns are kept as-is.
            </span>
          </div>

          <div className="field">
            <label htmlFor="output_name">Output Name</label>
            <input
              id="output_name"
              name="output_name"
              type="text"
              placeholder="output"
              value={params.output_name}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              Output file: <code>{params.output_name || 'output'}.csv</code>
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
