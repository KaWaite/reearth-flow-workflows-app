import { useEffect } from 'react';
import { useT } from '../i18n';

interface Props {
  varName: string;
  onClose: () => void;
}

export function SetupGuide({ varName, onClose }: Props) {
  const { t } = useT();
  const sg = t.setupGuide;

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
          <h2 className="modal-title">{sg.title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-intro">{sg.intro}</p>

          <ol className="setup-steps">
            {sg.steps.map((step, i) => (
              <li key={i} className="setup-step">
                <span className="setup-step-num">{i + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  {'body' in step ? (
                    <p dangerouslySetInnerHTML={{ __html: step.body }} />
                  ) : (
                    <>
                      <p dangerouslySetInnerHTML={{ __html: step.bodyBefore }} />
                      <div className="setup-code-row">
                        <span className="setup-var">{varName}</span>
                        <span className="setup-var-hint">{step.varHint}</span>
                      </div>
                      <p dangerouslySetInnerHTML={{ __html: step.bodyAfter }} />
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="setup-divider" />

          <h3 className="setup-sub">{sg.localTitle}</h3>
          <p className="setup-local-desc" dangerouslySetInnerHTML={{ __html: sg.localDesc }} />
          <div className="setup-env-block">
            <div><span className="setup-var">VITE_{varName}</span>{sg.localVarHint}</div>
            <div><span className="setup-var">VITE_FLOW_API_KEY</span>{sg.localApiKeyHint}</div>
          </div>
          <p className="setup-local-desc" dangerouslySetInnerHTML={{ __html: sg.localDevHint }} />
        </div>
      </div>
    </div>
  );
}
