import { useEffect } from 'react';

interface Props {
  varName: string;
  onClose: () => void;
}

export function SetupGuide({ varName, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">How to set up a workflow</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-intro">
            Each workflow on this site maps to a deployed Re:Earth Flow project. Follow these steps
            once per workflow to wire it up.
          </p>

          <ol className="setup-steps">
            <li className="setup-step">
              <span className="setup-step-num">1</span>
              <div>
                <strong>Open the shared workflow in Flow</strong>
                <p>Click the <em>Open in Flow</em> button on the workflow card. This opens a read-only
                copy of the workflow in the Re:Earth Flow editor.</p>
              </div>
            </li>

            <li className="setup-step">
              <span className="setup-step-num">2</span>
              <div>
                <strong>Fork it to your workspace</strong>
                <p>Use <em>File → Duplicate</em> (or the equivalent fork action) to copy the workflow
                into your own workspace. You can edit nodes and parameters freely from here.</p>
              </div>
            </li>

            <li className="setup-step">
              <span className="setup-step-num">3</span>
              <div>
                <strong>Create a deployment</strong>
                <p>From the workflow editor, open the <em>Deployments</em> panel and click
                <em> New deployment</em>. Give it a name and publish it. A deployment is an
                immutable snapshot — re-deploy any time you change the workflow.</p>
              </div>
            </li>

            <li className="setup-step">
              <span className="setup-step-num">4</span>
              <div>
                <strong>Copy the trigger URL</strong>
                <p>Open the deployment and go to the <em>Trigger</em> tab. Copy the full trigger
                endpoint URL — it looks like
                <code> https://api.flow.reearth.io/api/v1/projects/…/deployments/…/trigger</code>.</p>
              </div>
            </li>

            <li className="setup-step">
              <span className="setup-step-num">5</span>
              <div>
                <strong>Add the trigger URL to GitHub</strong>
                <p>In your repository go to <em>Settings → Secrets and variables → Actions →
                Variables</em> and add:</p>
                <div className="setup-code-row">
                  <span className="setup-var">{varName}</span>
                  <span className="setup-var-hint">= &lt;trigger URL&gt;</span>
                </div>
                <p>If <code>FLOW_API_KEY</code> is not yet set, add it under <em>Secrets</em>
                (not Variables — it's a credential).</p>
              </div>
            </li>

            <li className="setup-step">
              <span className="setup-step-num">6</span>
              <div>
                <strong>Redeploy the site</strong>
                <p>Push any commit to <code>main</code>, or go to <em>Actions → Deploy to GitHub
                Pages → Run workflow</em> to trigger a manual deploy. The new variable is baked in
                at build time.</p>
              </div>
            </li>
          </ol>

          <div className="setup-divider" />

          <h3 className="setup-sub">Local development</h3>
          <p className="setup-local-desc">
            Add the following to your <code>.env.local</code> file (never commit this file):
          </p>
          <div className="setup-env-block">
            <div><span className="setup-var">VITE_{varName}</span>=&lt;trigger URL&gt;</div>
            <div><span className="setup-var">VITE_FLOW_API_KEY</span>=&lt;api key&gt;</div>
          </div>
          <p className="setup-local-desc">Then run <code>npm run dev</code>. The Vite dev server
          proxies Flow API requests automatically to avoid CORS.</p>
        </div>
      </div>
    </div>
  );
}
