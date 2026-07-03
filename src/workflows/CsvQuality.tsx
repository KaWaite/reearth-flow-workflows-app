import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { useT, interp } from '../i18n';
import { JobStatus } from '../components/JobStatus';
import { LearnMore } from '../components/LearnMore';
import { WorkflowGraph } from '../components/WorkflowGraph';
import type { GraphNode, GraphEdge } from '../components/WorkflowGraph';
import type { CsvQualityParams, JobResult, JobState } from '../types';

const GRAPH_NODES: GraphNode[] = [
  { id: 'reader',   label: 'CsvReader',        col: 0, row: 0, type: 'source' },
  { id: 'filter',   label: 'FeatureFilter',     col: 1, row: 0, type: 'filter' },
  { id: 'attr',     label: 'AttributeManager',  col: 2, row: 0, type: 'processor' },
  { id: 'clean',    label: 'CsvWriter',  sublabel: 'clean',    col: 3, row: 0, type: 'sink' },
  { id: 'rejected', label: 'CsvWriter',  sublabel: 'rejected', col: 2, row: 1, type: 'sink' },
];
const GRAPH_EDGES: GraphEdge[] = [
  { from: 'reader', to: 'filter' },
  { from: 'filter', to: 'attr',     label: 'valid' },
  { from: 'filter', to: 'rejected', label: 'unfiltered' },
  { from: 'attr',   to: 'clean' },
];

const DEFAULTS: CsvQualityParams = {
  csv_path: '',
  key_column: '',
  output_prefix: 'output',
};

const EXAMPLE: CsvQualityParams = {
  csv_path: 'https://api.flow.reearth.io/assets/01kwgt5bs7a2yz0k83h0s0d91d.csv',
  key_column: 'era',
  output_prefix: 'output',
};

export function CsvQualityWorkflow() {
  const [params, setParams] = useState<CsvQualityParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useT();
  const wt = t.workflows.csvQuality;

  const configured = isWorkflowConfigured(1);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJobState('submitting');
    setError(null);
    try {
      const res = await triggerWorkflow(1, params);
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

  const prefix = params.output_prefix || 'output';

  return (
    <>
      <section className="workflow-card">
        <div className="workflow-card-top">
          <span className="workflow-card-label">{t.common.workflowLabel} 1</span>
          <a href="#" className="btn-open-flow btn-open-flow-disabled" onClick={(e) => e.preventDefault()}>{t.common.openInFlow}</a>
        </div>
        <h1 className="workflow-card-title">{wt.title}</h1>
        <p className="workflow-card-desc" dangerouslySetInnerHTML={{ __html: wt.desc }} />
        <WorkflowGraph
          nodes={GRAPH_NODES}
          edges={GRAPH_EDGES}
          ariaLabel="CSV Quality workflow: CsvReader feeds FeatureFilter which routes valid rows through AttributeManager to a clean CsvWriter, and unfiltered rows directly to a rejected CsvWriter"
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
            <label htmlFor="csv_path">{wt.fields.csvPath.label} <span className="required">*</span></label>
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
            <span className="field-hint">{wt.fields.csvPath.hint}</span>
          </div>

          <div className="field">
            <label htmlFor="key_column">{wt.fields.keyColumn.label} <span className="required">*</span></label>
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
            <span className="field-hint">{wt.fields.keyColumn.hint}</span>
          </div>

          <div className="field">
            <label htmlFor="output_prefix">{wt.fields.outputPrefix.label}</label>
            <input
              id="output_prefix"
              name="output_prefix"
              type="text"
              placeholder="output"
              value={params.output_prefix}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span
              className="field-hint"
              dangerouslySetInnerHTML={{ __html: interp(wt.fields.outputPrefix.hint, { prefix }) }}
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
