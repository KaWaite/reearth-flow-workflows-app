const COL = 148;
const ROW = 68;
const NW = 124;
const NH = 40;
const PAD = 16;

const STYLES = {
  source:    { fill: '#1f3358', stroke: '#58a6ff', text: '#58a6ff' },
  processor: { fill: '#1c2128', stroke: '#30363d', text: '#8b949e' },
  filter:    { fill: '#2d2208', stroke: '#d29922', text: '#d29922' },
  sink:      { fill: '#1a3a26', stroke: '#3fb950', text: '#3fb950' },
  discard:   { fill: '#161b22', stroke: '#30363d', text: '#6e7681' },
} as const;

export interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  col: number;
  row: number;
  type: keyof typeof STYLES;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  ariaLabel: string;
}

function cx(col: number) { return PAD + col * COL + NW / 2; }
function cy(row: number) { return PAD + row * ROW + NH / 2; }

function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  const sx = x1 + NW / 2;
  const tx = x2 - NW / 2;
  if (y1 === y2) return `M ${sx} ${y1} L ${tx} ${y2}`;
  const bend = Math.abs(tx - sx) * 0.45;
  return `M ${sx} ${y1} C ${sx + bend} ${y1} ${tx - bend} ${y2} ${tx} ${y2}`;
}

export function WorkflowGraph({ nodes, edges, ariaLabel }: Props) {
  const maxCol = Math.max(...nodes.map((n) => n.col));
  const maxRow = Math.max(...nodes.map((n) => n.row));
  const W = PAD + maxCol * COL + NW + PAD;
  const H = PAD + maxRow * ROW + NH + PAD;

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="workflow-graph-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        aria-label={ariaLabel}
        role="img"
        style={{ maxWidth: '100%' }}
      >
        <defs>
          <marker id="arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill="#6e7681" />
          </marker>
        </defs>

        {edges.map((e) => {
          const s = nodeMap[e.from];
          const t = nodeMap[e.to];
          if (!s || !t) return null;
          const x1 = cx(s.col), y1 = cy(s.row);
          const x2 = cx(t.col), y2 = cy(t.row);
          const d = edgePath(x1, y1, x2, y2);
          const mx = (x1 + NW / 2 + x2 - NW / 2) / 2;
          const my = (y1 + y2) / 2 - 6;
          return (
            <g key={`${e.from}-${e.to}`}>
              <path
                d={d}
                fill="none"
                stroke="#6e7681"
                strokeWidth="1.5"
                markerEnd="url(#arrow)"
              />
              {e.label && (
                <text
                  x={mx}
                  y={my}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6e7681"
                  fontFamily="'SF Mono', 'Fira Code', monospace"
                >
                  {e.label}
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((n) => {
          const s = STYLES[n.type];
          const nx = PAD + n.col * COL;
          const ny = PAD + n.row * ROW;
          const isDashed = n.type === 'discard';
          return (
            <g key={n.id}>
              <rect
                x={nx} y={ny}
                width={NW} height={NH}
                rx={6} ry={6}
                fill={s.fill}
                stroke={s.stroke}
                strokeWidth="1.5"
                strokeDasharray={isDashed ? '4 3' : undefined}
              />
              <text
                x={nx + NW / 2}
                y={ny + NH / 2 - (n.sublabel ? 6 : 0)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="600"
                fill={s.text}
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                {n.label}
              </text>
              {n.sublabel && (
                <text
                  x={nx + NW / 2}
                  y={ny + NH / 2 + 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fill={s.text}
                  opacity={0.7}
                  fontFamily="'SF Mono', 'Fira Code', monospace"
                >
                  {n.sublabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
