import { useT } from '../i18n';

interface Concept {
  name: string;
  desc: string;
}

interface Props {
  problem: string;
  whenToUse: string;
  concepts: Concept[];
  inputShape: string;
}

export function LearnMore({ problem, whenToUse, concepts, inputShape }: Props) {
  const { t } = useT();
  const lm = t.learnMore;

  return (
    <details className="learn-more">
      <summary className="learn-more-toggle">{lm.toggle}</summary>
      <div className="learn-more-body">
        <div className="learn-more-section">
          <h3 className="learn-more-heading">{lm.problemHeading}</h3>
          <p>{problem}</p>
        </div>
        <div className="learn-more-section">
          <h3 className="learn-more-heading">{lm.whenHeading}</h3>
          <p>{whenToUse}</p>
        </div>
        <div className="learn-more-section">
          <h3 className="learn-more-heading">{lm.conceptsHeading}</h3>
          <ul className="concept-list">
            {concepts.map((c) => (
              <li key={c.name}>
                <code>{c.name}</code> — {c.desc}
              </li>
            ))}
          </ul>
        </div>
        <div className="learn-more-section">
          <h3 className="learn-more-heading">{lm.inputHeading}</h3>
          <p>{inputShape}</p>
        </div>
      </div>
    </details>
  );
}
