import { useState } from 'react';
import type { JobResult } from '../types';

interface Props {
  job: JobResult;
  onReset: () => void;
}

export function JobStatus({ job, onReset }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(job.jobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="result-card">
      <div className="result-icon">✓</div>
      <h2 className="result-title">Job Submitted</h2>
      <p className="result-desc">
        Your workflow is now running. Use the job ID below to track it in the Re:Earth Flow
        dashboard.
      </p>
      <div className="job-id-row">
        <span className="job-id-label">Job ID</span>
        <code className="job-id">{job.jobId}</code>
        <button className="btn-copy" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <p className="result-meta">
        Submitted at <time>{new Date(job.submittedAt).toLocaleString()}</time>
      </p>
      <button className="btn-secondary" onClick={onReset}>
        Run Again
      </button>
    </div>
  );
}
