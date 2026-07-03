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
  return (
    <details className="learn-more">
      <summary className="learn-more-toggle">Learn more about this pipeline</summary>
      <div className="learn-more-body">
        <div className="learn-more-section">
          <h3 className="learn-more-heading">The problem it solves</h3>
          <p>{problem}</p>
        </div>
        <div className="learn-more-section">
          <h3 className="learn-more-heading">When to use it</h3>
          <p>{whenToUse}</p>
        </div>
        <div className="learn-more-section">
          <h3 className="learn-more-heading">Key Flow concepts</h3>
          <ul className="concept-list">
            {concepts.map((c) => (
              <li key={c.name}>
                <code>{c.name}</code> — {c.desc}
              </li>
            ))}
          </ul>
        </div>
        <div className="learn-more-section">
          <h3 className="learn-more-heading">Input expectations</h3>
          <p>{inputShape}</p>
        </div>
      </div>
    </details>
  );
}
