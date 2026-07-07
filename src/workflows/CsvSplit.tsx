import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow, getShareUrl } from '../lib/api';
import { useT, interp } from '../i18n';
import { JobStatus } from '../components/JobStatus';
import { LearnMore } from '../components/LearnMore';
import { WorkflowGraph } from '../components/WorkflowGraph';
import type { GraphNode, GraphEdge } from '../components/WorkflowGraph';
import type { CsvSplitParams, JobResult, JobState } from '../types';

const GRAPH_NODES: GraphNode[] = [
  { id: 'reader',  label: 'CsvReader',     col: 0, row: 1, type: 'source' },
  { id: 'filter',  label: 'FeatureFilter', col: 1, row: 1, type: 'filter' },
  { id: 'writerA', label: 'CsvWriter', sublabel: 'category A', col: 2, row: 0, type: 'sink' },
  { id: 'writerB', label: 'CsvWriter', sublabel: 'category B', col: 2, row: 1, type: 'sink' },
  { id: 'writerC', label: 'CsvWriter', sublabel: 'catch-all',  col: 2, row: 2, type: 'sink' },
];
const GRAPH_EDGES: GraphEdge[] = [
  { from: 'reader',  to: 'filter' },
  { from: 'filter',  to: 'writerA', label: 'cat A' },
  { from: 'filter',  to: 'writerB', label: 'cat B' },
  { from: 'filter',  to: 'writerC', label: 'other' },
];

const DEFAULTS: CsvSplitParams = {
  csv_path: '',
  category_column: '',
  value_a: '',
  value_b: '',
  output_prefix: 'split',
};

const EXAMPLE: CsvSplitParams = {
  csv_path: 'https://api.flow.reearth.io/assets/01kwxfey4a01tk6x2h7wkpxkw4.csv',
  category_column: 'Year',
  value_a: '2019',
  value_b: '2020',
  output_prefix: 'split',
};

export function CsvSplitWorkflow() {
  const [params, setParams] = useState<CsvSplitParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useT();
  const wt = t.workflows.csvSplit;

  const configured = isWorkflowConfigured(5);
  const shareUrl = getShareUrl(5);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJobState('submitting');
    setError(null);
    try {
      const res = await triggerWorkflow(5, params);
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

  const prefix = params.output_prefix || 'split';
  const valueA = params.value_a || 'A';
  const valueB = params.value_b || 'B';

  return (
    <>
      <section className="workflow-card">
        <div className="workflow-card-top">
          <span className="workflow-card-label">{t.common.workflowLabel} 5</span>
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
          ariaLabel="CSV Split workflow: CsvReader feeds FeatureFilter which fans out to separate CsvWriter nodes for category A, category B, and a catch-all"
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
            <label htmlFor="category_column">
              {wt.fields.categoryColumn.label} <span className="required">*</span>
            </label>
            <input
              id="category_column"
              name="category_column"
              type="text"
              required
              placeholder="region"
              value={params.category_column}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">{wt.fields.categoryColumn.hint}</span>
          </div>

          <div className="field">
            <label htmlFor="value_a">{wt.fields.valueA.label} <span className="required">*</span></label>
            <input
              id="value_a"
              name="value_a"
              type="text"
              required
              placeholder="2019"
              value={params.value_a}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">{wt.fields.valueA.hint}</span>
          </div>

          <div className="field">
            <label htmlFor="value_b">{wt.fields.valueB.label} <span className="required">*</span></label>
            <input
              id="value_b"
              name="value_b"
              type="text"
              required
              placeholder="2020"
              value={params.value_b}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">{wt.fields.valueB.hint}</span>
          </div>

          <div className="field">
            <label htmlFor="output_prefix">{wt.fields.outputPrefix.label}</label>
            <input
              id="output_prefix"
              name="output_prefix"
              type="text"
              placeholder="split"
              value={params.output_prefix}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span
              className="field-hint"
              dangerouslySetInnerHTML={{ __html: interp(wt.fields.outputPrefix.hint, { prefix, valueA, valueB }) }}
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
