import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { JobStatus } from '../components/JobStatus';
import { LearnMore } from '../components/LearnMore';
import type { CsvToJsonParams, JobResult, JobState } from '../types';

const DEFAULTS: CsvToJsonParams = {
  csv_path: '',
  output_name: 'output',
};

export function CsvToJsonWorkflow() {
  const [params, setParams] = useState<CsvToJsonParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configured = isWorkflowConfigured(6);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJobState('submitting');
    setError(null);
    try {
      const res = await triggerWorkflow(6, params);
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
          <span className="workflow-card-label">Workflow 6</span>
          <a href="#" className="btn-open-flow btn-open-flow-disabled" onClick={(e) => e.preventDefault()}>Open in Flow ↗</a>
        </div>
        <h1 className="workflow-card-title">CSV to JSON</h1>
        <p className="workflow-card-desc">
          Converts a CSV table into a <strong>JSON array of objects</strong> — one object per row,
          keys from the header. The go-to handoff when feeding spreadsheet data into a web
          application, API, or any system that expects JSON.
        </p>
        <ol className="workflow-steps">
          <li><span className="step-badge">1</span> CsvReader — fetch CSV from URL</li>
          <li><span className="step-badge">2</span> JsonWriter — write rows as JSON array</li>
        </ol>
        <LearnMore
          problem="Spreadsheet data is ubiquitous but most web applications, APIs, and no-code tools expect JSON. Manual copy-paste or Excel export is error-prone and does not scale."
          whenToUse="Feeding tabular data into a JavaScript front-end, preparing a dataset for a REST API, or converting a report for consumption by a tool that only reads JSON."
          concepts={[
            { name: 'CsvReader', desc: 'parses the header row as attribute keys and each data row as a feature — the simplest source action in Flow' },
            { name: 'JsonWriter', desc: 'emits features as a JSON array of objects, one object per row; this two-node pipeline is the most minimal workflow in Flow' },
          ]}
          inputShape="Any CSV with a header row. Every column becomes a JSON key; every row becomes an object. Numeric strings are kept as strings — Flow does not coerce types during CSV parsing."
        />
      </section>

      {!configured && (
        <div className="alert alert-warn">
          <strong>Not configured.</strong> Set <code>FLOW_URL_CSV_JSON</code> (variable) and{' '}
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
              Output file: <code>{params.output_name || 'output'}.json</code>
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
