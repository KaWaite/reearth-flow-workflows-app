import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { JobStatus } from '../components/JobStatus';
import type { SpatialFilterParams, JobResult, JobState } from '../types';

const DEFAULTS: SpatialFilterParams = {
  geojson_url: '',
  min_area_m2: '',
  output_name: 'filtered',
};

export function SpatialFilterWorkflow() {
  const [params, setParams] = useState<SpatialFilterParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configured = isWorkflowConfigured(7);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJobState('submitting');
    setError(null);
    try {
      const res = await triggerWorkflow(7, params);
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

  const areaNum = parseFloat(params.min_area_m2);
  const areaLabel = !isNaN(areaNum) && areaNum > 0
    ? areaNum >= 10_000
      ? `${(areaNum / 10_000).toLocaleString()} ha`
      : `${areaNum.toLocaleString()} m²`
    : null;

  return (
    <>
      <section className="workflow-card">
        <div className="workflow-card-label">Workflow 7</div>
        <h1 className="workflow-card-title">Spatial Size Filter</h1>
        <p className="workflow-card-desc">
          Calculates the area of each polygon feature and keeps only those{' '}
          <strong>above a minimum size threshold</strong>. Useful for removing small slivers,
          noise polygons, or features below a meaningful size for your use case.
        </p>
        <ol className="workflow-steps">
          <li><span className="step-badge">1</span> GeoJsonReader — fetch features from URL</li>
          <li><span className="step-badge">2</span> AreaCalculator — compute area in m² (requires metric source CRS)</li>
          <li><span className="step-badge">3</span> FeatureFilter — keep features where area ≥ threshold</li>
          <li><span className="step-badge">4</span> GeoJsonWriter — write kept features</li>
        </ol>
      </section>

      {!configured && (
        <div className="alert alert-warn">
          <strong>Not configured.</strong> Set <code>FLOW_TRIGGER_URL_7</code> (variable) and{' '}
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
              placeholder="https://example.com/polygons.geojson"
              value={params.geojson_url}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              URL to a GeoJSON file with polygon features in a metric CRS (e.g. EPSG:2154, 3857).
            </span>
          </div>

          <div className="field">
            <label htmlFor="min_area_m2">
              Minimum Area (m²) <span className="required">*</span>
            </label>
            <input
              id="min_area_m2"
              name="min_area_m2"
              type="number"
              required
              min="0"
              step="any"
              placeholder="10000"
              value={params.min_area_m2}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              Features with area below this value are discarded.
              {areaLabel && <> That's <strong>{areaLabel}</strong>.</>}
            </span>
          </div>

          <div className="field">
            <label htmlFor="output_name">Output Name</label>
            <input
              id="output_name"
              name="output_name"
              type="text"
              placeholder="filtered"
              value={params.output_name}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              Output file: <code>{params.output_name || 'filtered'}.geojson</code>
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
