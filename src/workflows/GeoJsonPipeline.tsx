import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { JobStatus } from '../components/JobStatus';
import type { GeoJsonParams, JobResult, JobState } from '../types';

const DEFAULTS: GeoJsonParams = {
  geojson_url: '',
  target_epsg: '4326',
  category_column: '',
  output_name: 'analysis',
};

const COMMON_PROJECTIONS = [
  { epsg: '4326', label: 'WGS 84 (GPS)' },
  { epsg: '3857', label: 'Web Mercator (Google Maps)' },
  { epsg: '6677', label: 'JGD2011 / Japan Plane IX' },
  { epsg: '2263', label: 'NAD83 / New York' },
];

export function GeoJsonPipelineWorkflow() {
  const [params, setParams] = useState<GeoJsonParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configured = isWorkflowConfigured(2);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJobState('submitting');
    setError(null);
    try {
      const res = await triggerWorkflow(2, params);
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
          Reads a GeoJSON file of polygon features, reprojects to a target coordinate system,
          calculates polygon areas, then aggregates feature counts by a category attribute.
          Outputs an <strong>enriched GeoPackage</strong> (with area per feature) and a{' '}
          <strong>JSON summary</strong> of counts per category.
        </p>
        <ol className="workflow-steps">
          <li><span className="step-badge">1</span> GeoJsonReader — fetch features from URL</li>
          <li><span className="step-badge">2</span> HorizontalReprojector — transform to target CRS</li>
          <li><span className="step-badge">3</span> AreaCalculator — compute polygon areas (m²)</li>
          <li><span className="step-badge">4</span> AttributeAggregator — count features by category</li>
          <li><span className="step-badge">5</span> GeoPackageWriter + JsonWriter — enriched features + count summary</li>
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
              URL to a GeoJSON file containing polygon features.
            </span>
          </div>

          <div className="field">
            <label htmlFor="target_epsg">Target Projection <span className="required">*</span></label>
            <div className="input-with-presets">
              <input
                id="target_epsg"
                name="target_epsg"
                type="text"
                required
                placeholder="4326"
                value={params.target_epsg}
                onChange={handleChange}
                disabled={jobState === 'submitting'}
              />
              <div className="preset-chips">
                {COMMON_PROJECTIONS.map(({ epsg }) => (
                  <button
                    key={epsg}
                    type="button"
                    className={`chip ${params.target_epsg === epsg ? 'chip-active' : ''}`}
                    onClick={() => setParams((p) => ({ ...p, target_epsg: epsg }))}
                    disabled={jobState === 'submitting'}
                  >
                    {epsg}
                  </button>
                ))}
              </div>
            </div>
            <span className="field-hint">
              EPSG code for the output coordinate reference system.{' '}
              {COMMON_PROJECTIONS.find((p) => p.epsg === params.target_epsg)?.label}
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
              placeholder="land_use"
              value={params.category_column}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">
              Features are grouped by this column when aggregating area statistics.
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
              Output files: <code>{params.output_name || 'analysis'}.gpkg</code> and{' '}
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
