import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { useT, interp } from '../i18n';
import { JobStatus } from '../components/JobStatus';
import { LearnMore } from '../components/LearnMore';
import type { ColumnSelectorParams, JobResult, JobState } from '../types';

const DEFAULTS: ColumnSelectorParams = {
  csv_path: '',
  columns_to_remove: '',
  output_name: 'output',
};

export function ColumnSelectorWorkflow() {
  const [params, setParams] = useState<ColumnSelectorParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useT();
  const wt = t.workflows.colSelect;

  const configured = isWorkflowConfigured(4);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJobState('submitting');
    setError(null);
    try {
      const res = await triggerWorkflow(4, params);
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

  const name = params.output_name || 'output';

  return (
    <>
      <section className="workflow-card">
        <div className="workflow-card-top">
          <span className="workflow-card-label">{t.common.workflowLabel} 4</span>
          <a href="#" className="btn-open-flow btn-open-flow-disabled" onClick={(e) => e.preventDefault()}>{t.common.openInFlow}</a>
        </div>
        <h1 className="workflow-card-title">{wt.title}</h1>
        <p className="workflow-card-desc" dangerouslySetInnerHTML={{ __html: wt.desc }} />
        <ol className="workflow-steps">
          {(wt.steps ?? []).map((step, i) => (
            <li key={i}><span className="step-badge">{i + 1}</span> {step}</li>
          ))}
        </ol>
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
          <h2 className="form-title">{t.common.runWorkflow}</h2>

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
            <label htmlFor="columns_to_remove">
              {wt.fields.columnsToRemove.label} <span className="required">*</span>
            </label>
            <input
              id="columns_to_remove"
              name="columns_to_remove"
              type="text"
              required
              placeholder="email, phone, ssn"
              value={params.columns_to_remove}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">{wt.fields.columnsToRemove.hint}</span>
          </div>

          <div className="field">
            <label htmlFor="output_name">{wt.fields.outputName.label}</label>
            <input
              id="output_name"
              name="output_name"
              type="text"
              placeholder="output"
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
