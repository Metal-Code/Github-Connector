// ── File type badge ───────────────────────────────────────────────────────
export function getFileStyle(name) {
  const ext = name.split(".").pop().toLowerCase();
  const map = {
    py:   { color: "#3b82f6", label: "PY" },
    js:   { color: "#f59e0b", label: "JS" },
    jsx:  { color: "#f59e0b", label: "JSX" },
    ts:   { color: "#60a5fa", label: "TS" },
    tsx:  { color: "#60a5fa", label: "TSX" },
    css:  { color: "#ec4899", label: "CSS" },
    html: { color: "#f97316", label: "HTML" },
    json: { color: "#a3e635", label: "JSON" },
    md:   { color: "#94a3b8", label: "MD" },
    yml:  { color: "#c084fc", label: "YML" },
    yaml: { color: "#c084fc", label: "YML" },
    sh:   { color: "#4ade80", label: "SH" },
    go:   { color: "#22d3ee", label: "GO" },
    rs:   { color: "#fb923c", label: "RS" },
    java: { color: "#f87171", label: "JAVA" },
    sql:  { color: "#818cf8", label: "SQL" },
    txt:  { color: "#94a3b8", label: "TXT" },
  };
  return map[ext] || { color: "#8b949e", label: ext.toUpperCase().slice(0, 4) || "FILE" };
}

// ── Severity styles ───────────────────────────────────────────────────────
export function getSeverityStyle(severity) {
  const map = {
    critical: { bg: "rgba(248,81,73,0.1)",  border: "#f85149", text: "#f85149" },
    high:     { bg: "rgba(210,153,34,0.1)", border: "#d29522", text: "#d29522" },
    medium:   { bg: "rgba(0,120,212,0.1)",  border: "#0078D4", text: "#58a6ff" },
    low:      { bg: "rgba(35,134,54,0.1)",  border: "#238636", text: "#3fb950" },
  };
  return map[severity?.toLowerCase()] || map.low;
}

export function getCategoryStyle(cat) {
  const map = {
    security:       { bg: "rgba(248,81,73,0.15)",   text: "#f85149" },
    performance:    { bg: "rgba(210,153,34,0.15)",  text: "#d29522" },
    readability:    { bg: "rgba(35,134,54,0.15)",   text: "#3fb950" },
    best_practice:  { bg: "rgba(88,166,255,0.15)",  text: "#58a6ff" },
    maintainability:{ bg: "rgba(192,132,252,0.15)", text: "#c084fc" },
    style:          { bg: "rgba(148,163,184,0.15)", text: "#94a3b8" },
    bug:            { bg: "rgba(248,81,73,0.15)",   text: "#f85149" },
  };
  return map[cat?.toLowerCase()] || { bg: "rgba(139,148,158,0.15)", text: "#8b949e" };
}

// ── Score Ring (large, for review page) ──────────────────────────────────
export function ScoreRing({ score, size = 200 }) {
  const r = size / 2 - 12, stroke = 8;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? "#238636" : score >= 50 ? "#d29522" : "#f85149";
  const grade = score >= 90 ? "A" : score >= 80 ? "B+" : score >= 70 ? "B-" : score >= 60 ? "C+" : score >= 50 ? "C" : "D";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#30363D" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.28, fontWeight: 700, color, fontFamily: "Inter, sans-serif", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.08, color: "#8b949e", fontFamily: "JetBrains Mono, monospace", letterSpacing: 2 }}>{grade} GRADE</span>
      </div>
    </div>
  );
}

// ── Small Rating Ring ─────────────────────────────────────────────────────
export function RatingRing({ rating, size = 70 }) {
  const score = rating <= 10 ? rating * 10 : rating;
  const r = size / 2 - 6, stroke = 4;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? "#238636" : score >= 50 ? "#d29522" : "#f85149";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#30363D" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.25, fontWeight: 700, color, fontFamily: "JetBrains Mono, monospace", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.12, color: "#8b949e", fontFamily: "JetBrains Mono, monospace" }}>/100</span>
      </div>
    </div>
  );
}