import { useState } from 'react';
import { useT } from '../i18n';
import type { JobResult } from '../types';

interface Props {
  job: JobResult;
  onReset: () => void;
}

export function JobStatus({ job, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const { t } = useT();

  async function handleCopy() {
    await navigator.clipboard.writeText(job.jobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="result-card">
      <div className="result-icon">✓</div>
      <h2 className="result-title">{t.jobStatus.title}</h2>
      <p className="result-desc">{t.jobStatus.desc}</p>
      <div className="job-id-row">
        <span className="job-id-label">{t.jobStatus.jobIdLabel}</span>
        <code className="job-id">{job.jobId}</code>
        <button className="btn-copy" onClick={handleCopy}>
          {copied ? t.common.copied : t.common.copy}
        </button>
      </div>
      <p className="result-meta">
        {t.jobStatus.submittedAt}{' '}
        <time>{new Date(job.submittedAt).toLocaleString()}</time>
      </p>
      <button className="btn-secondary" onClick={onReset}>
        {t.common.runAgain}
      </button>
    </div>
  );
}
