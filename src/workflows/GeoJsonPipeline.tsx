import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { useT, interp } from '../i18n';
import { JobStatus } from '../components/JobStatus';
import { LearnMore } from '../components/LearnMore';
import { WorkflowGraph } from '../components/WorkflowGraph';
import type { GraphNode, GraphEdge } from '../components/WorkflowGraph';
import type { GeoJsonParams, JobResult, JobState } from '../types';

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
  const { t } = useT();
  const wt = t.workflows.geoJson;

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

  const name = params.output_name || 'analysis';

  return (
    <>
      <section className="workflow-card">
        <div className="workflow-card-top">
          <span className="workflow-card-label">{t.common.workflowLabel} 2</span>
          <a href="#" className="btn-open-flow btn-open-flow-disabled" onClick={(e) => e.preventDefault()}>{t.common.openInFlow}</a>
        </div>
        <h1 className="workflow-card-title">{wt.title}</h1>
        <p className="workflow-card-desc" dangerouslySetInnerHTML={{ __html: wt.desc }} />
        <WorkflowGraph
          nodes={GRAPH_NODES}
          edges={GRAPH_EDGES}
          ariaLabel="GeoJSON Pipeline: GeoJsonReader to AreaCalculator, then splits into branch A (HReprojector to GeoJsonWriter) and branch B (AttrAggregator to JsonWriter)"
        />
        <LearnMore
          problem={wt.learnMore.problem}
          whenToUse={wt.learnMore.whenToUse}
          concepts={wt.learnMore.concepts}
          inputShape={wt.learnMore.inputShape}
        />
      </section>

      {!configured && (
        <div className="alert alert-warn">
          <strong>{t.common.notConfiguredTitle}</strong>{' '}
          <span dangerouslySetInnerHTML={{ __html: wt.alert }} />
        </div>
      )}

      {jobState !== 'submitted' && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-title-row">
            <h2 className="form-title">{t.common.runWorkflow}</h2>
            <button type="button" className="btn-example" onClick={handleFillExample}>
              {t.common.fillExample}
            </button>
          </div>

          <div className="field">
            <label htmlFor="geojson_path">{wt.fields.geojsonPath.label} <span className="required">*</span></label>
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
            <span className="field-hint">{wt.fields.geojsonPath.hint}</span>
          </div>

          <div className="field">
            <label htmlFor="category_column">
              {wt.fields.categoryColumn.label} <span className="required">*</span>
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
            <span className="field-hint">{wt.fields.categoryColumn.hint}</span>
          </div>

          <div className="field">
            <label htmlFor="output_name">{wt.fields.outputName.label}</label>
            <input
              id="output_name"
              name="output_name"
              type="text"
              placeholder="analysis"
              value={params.output_name}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span
              className="field-hint"
              dangerouslySetInnerHTML={{ __html: interp(wt.fields.outputName.hint, { name }) }}
            />
          </div>

          {jobState === 'error' && error && (
            <div className="alert alert-error">{error}</div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={jobState === 'submitting' || !configured}
          >
            {jobState === 'submitting' ? <><span className="spinner" /> {t.common.running}</> : t.common.runWorkflow}
          </button>
        </form>
      )}

      {jobState === 'submitted' && job && (
        <JobStatus job={job} onReset={handleReset} />
      )}
    </>
  );
}
