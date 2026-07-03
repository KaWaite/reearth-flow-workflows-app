import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { JobStatus } from '../components/JobStatus';
import { LearnMore } from '../components/LearnMore';
import { WorkflowGraph } from '../components/WorkflowGraph';
import type { GraphNode, GraphEdge } from '../components/WorkflowGraph';

const GRAPH_NODES: GraphNode[] = [
  { id: 'reader',  label: 'GeoJsonReader',       col: 0, row: 0, type: 'source' },
  { id: 'area',    label: 'AreaCalculator',       col: 1, row: 0, type: 'processor' },
  { id: 'reproj',  label: 'HReprojector', sublabel: '→ EPSG:4326', col: 2, row: 0, type: 'processor' },
  { id: 'geojson', label: 'GeoJsonWriter',        col: 3, row: 0, type: 'sink' },
  { id: 'agg',     label: 'AttrAggregator',       col: 2, row: 1, type: 'processor' },
  { id: 'json',    label: 'JsonWriter',            col: 3, row: 1, type: 'sink' },
];
const GRAPH_EDGES: GraphEdge[] = [
  { from: 'reader', to: 'area' },
  { from: 'area',   to: 'reproj', label: 'branch A' },
  { from: 'area',   to: 'agg',    label: 'branch B' },
  { from: 'reproj', to: 'geojson' },
  { from: 'agg',    to: 'json' },
];
import type { GeoJsonParams, JobResult, JobState } from '../types';

const DEFAULTS: GeoJsonParams = {
  geojson_path: '',
  category_column: '',
  output_name: 'analysis',
};

const EXAMPLE: GeoJsonParams = {
  geojson_path: 'https://api.flow.reearth.io/assets/01kwgt3yfvgwkq9nh0jzc3f8tq.geojson',
  category_column: 'category',
  output_name: 'output',
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

  function handleFillExample() {
    setParams(EXAMPLE);
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
          <span className="workflow-card-label">Workflow 2</span>
          <a href="#" className="btn-open-flow btn-open-flow-disabled" onClick={(e) => e.preventDefault()}>Open in Flow ↗</a>
        </div>
        <h1 className="workflow-card-title">GeoJSON Spatial Analysis Pipeline</h1>
        <p className="workflow-card-desc">
          Reads a GeoJSON file of polygon features in a metric CRS, calculates polygon areas,
          then splits: one branch reprojects to WGS84 and writes an{' '}
          <strong>enriched GeoJSON</strong> ready for Cesium; the other aggregates feature counts
          by category and writes a <strong>JSON summary</strong>.
        </p>
        <WorkflowGraph
          nodes={GRAPH_NODES}
          edges={GRAPH_EDGES}
          ariaLabel="GeoJSON Pipeline: GeoJsonReader to AreaCalculator, then splits into branch A (HReprojector to GeoJsonWriter) and branch B (AttrAggregator to JsonWriter)"
        />
        <LearnMore
          problem="GIS exports use many different coordinate reference systems. Web maps (Cesium, Mapbox, Leaflet) all require WGS84 (EPSG:4326), but area calculations need a metric CRS — you can't have both in one pass without a reprojection step."
          whenToUse="Preparing polygon layers for web visualization while also generating feature-count statistics. A common pattern when publishing city or land-use data to a web map."
          concepts={[
            { name: 'AreaCalculator', desc: 'computes polygon area in m² from the geometry — requires a metric projected CRS; WGS84 input will produce incorrect results' },
            { name: 'HorizontalReprojector', desc: 'transforms coordinates from one CRS to another; here converts to EPSG:4326 for the Cesium-ready output' },
            { name: 'AttributeAggregator', desc: 'groups features by a column and computes aggregate values — here counts features per category for the stats output' },
          ]}
          inputShape="GeoJSON with polygon features in a metric projected CRS (e.g. EPSG:2154, EPSG:3857, EPSG:6668). WGS84 input will produce incorrect area values. Each feature must have the category column you specify."
        />
      </section>

      {!configured && (
        <div className="alert alert-warn">
          <strong>Not configured.</strong> Set <code>FLOW_URL_GEOJSON</code> (variable) and{' '}
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
            <label htmlFor="geojson_path">GeoJSON Path <span className="required">*</span></label>
            <input
              id="geojson_path"
              name="geojson_path"
              type="text"
              required
              placeholder="https://example.com/features.geojson"
              value={params.geojson_path}
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
