import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { JobStatus } from '../components/JobStatus';
import { LearnMore } from '../components/LearnMore';
import { WorkflowGraph } from '../components/WorkflowGraph';
import type { GraphNode, GraphEdge } from '../components/WorkflowGraph';

const GRAPH_NODES: GraphNode[] = [
  { id: 'reader',  label: 'GeoJsonReader',  col: 0, row: 0, type: 'source' },
  { id: 'area',    label: 'AreaCalculator', col: 1, row: 0, type: 'processor' },
  { id: 'filter',  label: 'FeatureFilter',  col: 2, row: 0, type: 'filter' },
  { id: 'writer',  label: 'GeoJsonWriter',  col: 3, row: 0, type: 'sink' },
  { id: 'discard', label: 'discarded',      col: 3, row: 1, type: 'discard' },
];
const GRAPH_EDGES: GraphEdge[] = [
  { from: 'reader', to: 'area' },
  { from: 'area',   to: 'filter' },
  { from: 'filter', to: 'writer',  label: '≥ min' },
  { from: 'filter', to: 'discard', label: '< min' },
];
import type { SpatialFilterParams, JobResult, JobState } from '../types';

const DEFAULTS: SpatialFilterParams = {
  geojson_path: '',
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
        <div className="workflow-card-top">
          <span className="workflow-card-label">Workflow 7</span>
          <a href="#" className="btn-open-flow btn-open-flow-disabled" onClick={(e) => e.preventDefault()}>Open in Flow ↗</a>
        </div>
        <h1 className="workflow-card-title">Spatial Size Filter</h1>
        <p className="workflow-card-desc">
          Calculates the area of each polygon feature and keeps only those{' '}
          <strong>above a minimum size threshold</strong>. Useful for removing small slivers,
          noise polygons, or features below a meaningful size for your use case.
        </p>
        <WorkflowGraph
          nodes={GRAPH_NODES}
          edges={GRAPH_EDGES}
          ariaLabel="Spatial Filter workflow: GeoJsonReader to AreaCalculator to FeatureFilter, which passes features meeting the minimum area to GeoJsonWriter and discards the rest"
        />
        <LearnMore
          problem="Real-world spatial datasets contain noise — tiny slivers from digitization errors, boundary fragments, or polygons too small to be meaningful at your analysis scale. They inflate feature counts and skew area statistics."
          whenToUse="Cleaning cadastral or land-use data before a spatial join, removing polygon artifacts before visualization at a fixed zoom level, or ensuring a minimum parcel size before statistical analysis."
          concepts={[
            { name: 'AreaCalculator', desc: 'computes polygon area from the geometry and appends it as an attribute — no pre-computed area column needed, but the source CRS must be metric' },
            { name: 'FeatureFilter', desc: 'evaluates a FlowExpr condition per feature — here it checks the computed area attribute against the threshold you provide at trigger time via env["min_area_m2"]' },
          ]}
          inputShape="GeoJSON with polygon or multipolygon features in a metric projected CRS (e.g. EPSG:2154, EPSG:3857). WGS84 input will produce incorrect area values. No pre-computed area attribute is required."
        />
      </section>

      {!configured && (
        <div className="alert alert-warn">
          <strong>Not configured.</strong> Set <code>FLOW_URL_SPATIAL_FILTER</code> (variable) and{' '}
          <code>FLOW_API_KEY</code> (secret) in your GitHub repository settings, then redeploy.
          For local dev, add them to <code>.env.local</code>.
        </div>
      )}

      {jobState !== 'submitted' && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2 className="form-title">Run Workflow</h2>

          <div className="field">
            <label htmlFor="geojson_path">GeoJSON Path <span className="required">*</span></label>
            <input
              id="geojson_path"
              name="geojson_path"
              type="text"
              required
              placeholder="https://example.com/polygons.geojson"
              value={params.geojson_path}
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
