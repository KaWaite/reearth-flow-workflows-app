import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { JobStatus } from '../components/JobStatus';
import type { GeoJsonParams, JobResult, JobState } from '../types';

const DEFAULTS: GeoJsonParams = {
  geojson_url: '',
  category_column: '',
  output_name: 'analysis',
};

export function GeoJsonPipelineWorkflow() {
  const [params, setParams] = useState<GeoJsonParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configured = isWorkflowConfigured(2);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJobState('submitting');
    setError(null);
    try {
      // target_epsg is always 4326 — GeoJSON spec + Cesium both require WGS84
      const res = await triggerWorkflow(2, { ...params, target_epsg: '4326' });
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
        <div className="workflow-card-label">Workflow 2</div>
        <h1 className="workflow-card-title">GeoJSON Spatial Analysis Pipeline</h1>
        <p className="workflow-card-desc">
          Reads a GeoJSON file of polygon features in a metric CRS, calculates polygon areas,
          then splits: one branch reprojects to WGS84 and writes an{' '}
          <strong>enriched GeoJSON</strong> ready for Cesium; the other aggregates feature counts
          by category and writes a <strong>JSON summary</strong>.
        </p>
        <ol className="workflow-steps">
          <li><span className="step-badge">1</span> GeoJsonReader — fetch features from URL</li>
          <li><span className="step-badge">2</span> AreaCalculator — compute polygon areas in m² (requires metric source CRS)</li>
          <li><span className="step-badge">3a</span> HorizontalReprojector (→ EPSG:4326) → GeoJsonWriter — Cesium-ready output</li>
          <li><span className="step-badge">3b</span> AttributeAggregator → JsonWriter — count features by category</li>
        </ol>
      </section>

      {!configured && (
        <div className="alert alert-warn">
          <strong>Not configured.</strong> Set <code>FLOW_TRIGGER_URL_2</code> (variable) and{' '}
          <code>FLOW_API_KEY</code> (secret) in your GitHub repository settings, then redeploy.
          For local dev, add them to <code>.env.local</code>.
        </div>
      )}

      {jobState !== 'submitted' && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2 className="form-title">Run Workflow</h2>

          <div className="field">
            <label htmlFor="geojson_url">GeoJSON URL <span className="required">*</span></label>
            <input
              id="geojson_url"
              name="geojson_url"
              type="url"
              required
              placeholder="https://example.com/features.geojson"
              value={params.geojson_url}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              URL to a GeoJSON file with polygon features in a metric CRS (e.g. EPSG:2154, 3857).
              The workflow reprojects to WGS84 (EPSG:4326) for the Cesium output.
            </span>
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
              placeholder="category"
              value={params.category_column}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              Features are grouped by this attribute when counting. Must exist on every feature.
            </span>
          </div>

          <div className="field">
            <label htmlFor="output_name">Output Name</label>
            <input
              id="output_name"
              name="output_name"
              type="text"
              placeholder="analysis"
              value={params.output_name}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              Output files: <code>{params.output_name || 'analysis'}.geojson</code> and{' '}
              <code>{params.output_name || 'analysis'}_stats.json</code>
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
