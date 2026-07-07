import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow, getShareUrl } from '../lib/api';
import { useT, interp } from '../i18n';
import { JobStatus } from '../components/JobStatus';
import { LearnMore } from '../components/LearnMore';
import { WorkflowGraph } from '../components/WorkflowGraph';
import type { GraphNode, GraphEdge } from '../components/WorkflowGraph';
import type { SpatialFilterParams, JobResult, JobState } from '../types';

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

const DEFAULTS: SpatialFilterParams = {
  geojson_path: '',
  min_area_m2: '',
  output_name: 'filtered',
};

const EXAMPLE: SpatialFilterParams = {
  geojson_path: 'https://api.flow.reearth.io/assets/01kwxfff6x89y13tt3vx7e15t8.geojson',
  min_area_m2: '1000',
  output_name: 'filtered',
};

export function SpatialFilterWorkflow() {
  const [params, setParams] = useState<SpatialFilterParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useT();
  const wt = t.workflows.spatialFilter;

  const configured = isWorkflowConfigured(7);
  const shareUrl = getShareUrl(7);

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

  function handleFillExample() {
    setParams(EXAMPLE);
  }

  const areaNum = parseFloat(params.min_area_m2);
  const areaLabel = !isNaN(areaNum) && areaNum > 0
    ? areaNum >= 10_000
      ? `${(areaNum / 10_000).toLocaleString()} ha`
      : `${areaNum.toLocaleString()} m²`
    : null;

  const name = params.output_name || 'filtered';

  return (
    <>
      <section className="workflow-card">
        <div className="workflow-card-top">
          <span className="workflow-card-label">{t.common.workflowLabel} 7</span>
          {shareUrl
            ? <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn-open-flow">{t.common.openInFlow}</a>
            : <a href="#" className="btn-open-flow btn-open-flow-disabled" onClick={(e) => e.preventDefault()}>{t.common.openInFlow}</a>
          }
        </div>
        <h1 className="workflow-card-title">{wt.title}</h1>
        <p className="workflow-card-desc" dangerouslySetInnerHTML={{ __html: wt.desc }} />
        <WorkflowGraph
          nodes={GRAPH_NODES}
          edges={GRAPH_EDGES}
          ariaLabel="Spatial Filter workflow: GeoJsonReader to AreaCalculator to FeatureFilter, which passes features meeting the minimum area to GeoJsonWriter and discards the rest"
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
              placeholder="https://example.com/polygons.geojson"
              value={params.geojson_path}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">{wt.fields.geojsonPath.hint}</span>
          </div>

          <div className="field">
            <label htmlFor="min_area_m2">
              {wt.fields.minArea.label} <span className="required">*</span>
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
              {wt.fields.minArea.hint}
              {areaLabel && <> {wt.minAreaThat} <strong>{areaLabel}</strong>{wt.minAreaThatSuffix}</>}
            </span>
          </div>

          <div className="field">
            <label htmlFor="output_name">{wt.fields.outputName.label}</label>
            <input
              id="output_name"
              name="output_name"
              type="text"
              placeholder="filtered"
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
