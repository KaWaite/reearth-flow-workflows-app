import { useState } from 'react';
import { isWorkflowConfigured, triggerWorkflow } from '../lib/api';
import { useT, interp } from '../i18n';
import { JobStatus } from '../components/JobStatus';
import { LearnMore } from '../components/LearnMore';
import type { CsvMergeParams, JobResult, JobState } from '../types';

const DEFAULTS: CsvMergeParams = {
  csv_path_1: '',
  csv_path_2: '',
  dedup_key: '',
  output_prefix: 'merged',
};

export function CsvMergeWorkflow() {
  const [params, setParams] = useState<CsvMergeParams>(DEFAULTS);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [job, setJob] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useT();
  const wt = t.workflows.csvMerge;

  const configured = isWorkflowConfigured(3);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJobState('submitting');
    setError(null);
    try {
      const res = await triggerWorkflow(3, params);
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

  const prefix = params.output_prefix || 'merged';

  return (
    <>
      <section className="workflow-card">
        <div className="workflow-card-top">
          <span className="workflow-card-label">{t.common.workflowLabel} 3</span>
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
            <label htmlFor="csv_path_1">{wt.fields.csvPath1.label} <span className="required">*</span></label>
            <input
              id="csv_path_1"
              name="csv_path_1"
              type="text"
              required
              placeholder="https://example.com/source-a.csv"
              value={params.csv_path_1}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">{wt.fields.csvPath1.hint}</span>
          </div>

          <div className="field">
            <label htmlFor="csv_path_2">{wt.fields.csvPath2.label} <span className="required">*</span></label>
            <input
              id="csv_path_2"
              name="csv_path_2"
              type="text"
              required
              placeholder="https://example.com/source-b.csv"
              value={params.csv_path_2}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">{wt.fields.csvPath2.hint}</span>
          </div>

          <div className="field">
            <label htmlFor="dedup_key">{wt.fields.dedupKey.label} <span className="required">*</span></label>
            <input
              id="dedup_key"
              name="dedup_key"
              type="text"
              required
              placeholder="id"
              value={params.dedup_key}
              onChange={handleChange}
              disabled={jobState === 'submitting'}
            />
            <span className="field-hint">{wt.fields.dedupKey.hint}</span>
          </div>

          <div className="field">
            <label htmlFor="output_prefix">{wt.fields.outputPrefix.label}</label>
            <input
              id="output_prefix"
              name="output_prefix"
              type="text"
              placeholder="merged"
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
