import { useState } from "react";
import { useApp } from "../context/AppContext";
import Icon from "../components/ui/Icon";

const SEVERITY = {
  critical: { color: "#f85149", bg: "rgba(248,81,73,0.08)",  border: "rgba(248,81,73,0.25)"  },
  high:     { color: "#d29522", bg: "rgba(210,149,34,0.08)", border: "rgba(210,149,34,0.25)" },
  medium:   { color: "#388bfd", bg: "rgba(56,139,253,0.08)", border: "rgba(56,139,253,0.25)" },
  low:      { color: "#3fb950", bg: "rgba(63,185,80,0.08)",  border: "rgba(63,185,80,0.25)"  },
};

function getSev(s) { return SEVERITY[s?.toLowerCase()] || SEVERITY.low; }

// ── Score Arc ─────────────────────────────────────────────────────────────
function ScoreArc({ score }) {
  const size = 160, r = 60, stroke = 8;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const dash = (score / 100) * arc;
  const color = score >= 80 ? "#3fb950" : score >= 60 ? "#d29522" : "#f85149";
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B+" : score >= 60 ? "B" : score >= 50 ? "C" : "D";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#30363d" strokeWidth={stroke}
          strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
          transform={`rotate(135 ${size/2} ${size/2})`} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(135 ${size/2} ${size/2})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 38, fontWeight: 800, color, fontFamily: "Inter, sans-serif", lineHeight: 1, letterSpacing: "-2px" }}>{score}</span>
        <span style={{ fontSize: 10, color: "#8b949e", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "0.1em", marginTop: 2 }}>{grade} GRADE</span>
      </div>
    </div>
  );
}

// ── Code Block ────────────────────────────────────────────────────────────
function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  const labelColor = label === "Problematic Code" || label === "Before" ? "#ffa198"
    : label === "Suggested Fix" || label === "After" ? "#7ee787"
    : "#8b949e";

  return (
    <div style={{ borderRadius: 6, overflow: "hidden", border: "1px solid #30363d", backgroundColor: "#0d1117" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", backgroundColor: "#161b22", borderBottom: "1px solid #30363d" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="code" size={13} color={labelColor} />
          <span style={{ fontSize: 10, fontWeight: 600, color: labelColor, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}>{label || "CODE"}</span>
        </div>
        <button onClick={copy} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#3fb950" : "#484f58", display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontFamily: "JetBrains Mono, monospace", padding: "2px 6px", borderRadius: 4 }}>
          <Icon name={copied ? "check" : "content_copy"} size={12} color={copied ? "#3fb950" : "#484f58"} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre style={{ margin: 0, padding: "14px 16px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#e6edf3", overflowX: "auto", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {code}
      </pre>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function ReviewPage() {
  const { colors, review, fileInfo, setPage } = useApp();
  const [expandedSuggestions, setExpandedSuggestions] = useState({ 0: true });
  const c = colors;

  if (!review) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 96px)", backgroundColor: c.bg }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: c.textMuted, fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>No review data. Go back and select a file.</p>
        <button onClick={() => setPage("browser")} style={{ marginTop: 16, backgroundColor: c.cardBg, color: c.textPrimary, border: `1px solid ${c.border}`, borderRadius: 6, padding: "10px 20px", cursor: "pointer", fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          ← Back
        </button>
      </div>
    </div>
  );

  const score       = review.total_score ?? 0;
  const summary     = review.summary ?? "";
  const codeIssues  = review.code_issues ?? [];
  const suggestions = review.suggestions ?? [];
  const positives   = review.positives ?? [];
  const metrics     = review.metrics ?? {};

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 96px)", backgroundColor: c.bg, overflow: "hidden" }}>

      {/* ── Stats bar ── */}
      <div style={{ backgroundColor: c.headerBg, borderBottom: `1px solid ${c.border}`, padding: "0 24px", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {[
            { label: "HEALTH",      value: `${score}%`,       color: score >= 80 ? "#3fb950" : score >= 60 ? "#d29522" : "#f85149" },
            { label: "BUGS",        value: String(metrics.total_bugs ?? codeIssues.length).padStart(2,"0"),        color: "#f85149" },
            { label: "CRITICAL",    value: String(metrics.critical_count ?? 0).padStart(2,"0"),                    color: "#f85149" },
            { label: "HIGH",        value: String(metrics.high_count ?? 0).padStart(2,"0"),                        color: "#d29522" },
            { label: "SUGGESTIONS", value: String(metrics.suggestions_count ?? suggestions.length).padStart(2,"0"), color: c.textPrimary },
          ].map((stat, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <div style={{ width: 1, height: 18, backgroundColor: c.border, margin: "0 16px" }} />}
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>{stat.label}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: stat.color, fontFamily: "Inter, sans-serif", lineHeight: 1 }}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {fileInfo && (
            <a href={fileInfo.github_url} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 5, color: "#388bfd", fontSize: 12, textDecoration: "none", fontFamily: "JetBrains Mono, monospace" }}>
              <Icon name="open_in_new" size={13} color="#388bfd" />
              View on GitHub
            </a>
          )}
          <button onClick={() => setPage("browser")} style={{ background: "none", border: `1px solid ${c.border}`, borderRadius: 6, padding: "5px 12px", cursor: "pointer", color: c.textMuted, fontSize: 10, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
            <Icon name="arrow_back" size={13} color={c.textMuted} /> Back
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left panel ── */}
        <div style={{ width: 272, flexShrink: 0, borderRight: `1px solid ${c.border}`, overflowY: "auto", backgroundColor: c.bg }}>

          {/* Score */}
          <div style={{ padding: "24px 20px", borderBottom: `1px solid ${c.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <ScoreArc score={score} />
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: c.textPrimary, fontFamily: "Inter, sans-serif" }}>Review Summary</p>
              {fileInfo && <p style={{ margin: 0, fontSize: 10, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>{fileInfo.file_path}</p>}
            </div>
          </div>

          {/* Summary */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${c.border}` }}>
            <p style={{ margin: 0, fontSize: 12, color: c.textMuted, fontStyle: "italic", lineHeight: 1.8, fontFamily: "Inter, sans-serif", borderLeft: `2px solid ${c.border}`, paddingLeft: 10 }}>
              "{summary}"
            </p>
          </div>

          {/* Bug breakdown */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${c.border}` }}>
            <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Bug Breakdown</p>
            {[
              { label: "Critical", count: metrics.critical_count ?? 0, color: "#f85149" },
              { label: "High",     count: metrics.high_count ?? 0,     color: "#d29522" },
              { label: "Medium",   count: metrics.medium_count ?? 0,   color: "#388bfd" },
              { label: "Low",      count: metrics.low_count ?? 0,      color: "#3fb950" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: item.count > 0 ? item.color : c.border, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: c.textMuted, fontFamily: "Inter, sans-serif" }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: item.count > 0 ? item.color : c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>
                  {String(item.count).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>

          {/* Strengths */}
          {positives.length > 0 && (
            <div style={{ padding: "16px 20px" }}>
              <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Strengths</p>
              {positives.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                  <Icon name="check" size={13} color="#3fb950" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.6, fontFamily: "Inter, sans-serif" }}>{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <div style={{ flex: 1, overflowY: "auto", backgroundColor: c.bg }}>

          {/* Code Issues */}
          {codeIssues.length > 0 && (
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${c.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="bug_report" size={15} color={c.textMuted} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Code Issues</span>
                </div>
                <span style={{ fontSize: 11, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>{codeIssues.length} detected</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {codeIssues.map((issue, i) => {
                  const s = getSev(issue.severity);
                  return (
                    <div key={i} style={{ borderRadius: 8, border: `1px solid ${c.border}`, borderLeft: `3px solid ${s.color}`, backgroundColor: c.cardBg, overflow: "hidden" }}>
                      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${c.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: s.color }} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: s.color, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                              {issue.severity}
                            </span>
                          </div>
                          <span style={{ fontSize: 10, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>·</span>
                          <span style={{ fontSize: 10, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            {issue.category?.replace(/_/g, " ")}
                          </span>
                        </div>
                        {issue.line > 0 && (
                          <span style={{ fontSize: 10, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>line {issue.line}</span>
                        )}
                      </div>
                      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                        <p style={{ margin: 0, fontSize: 13, color: c.textPrimary, lineHeight: 1.6, fontFamily: "Inter, sans-serif" }}>
                          {issue.description}
                        </p>
                        {issue.error_code_line && issue.error_code_line !== "N/A" && (
                          <CodeBlock code={issue.error_code_line} label="Problematic Code" />
                        )}
                        {issue.fix_code && issue.fix_code !== "No fix provided." && (
                          <CodeBlock code={issue.fix_code} label="Suggested Fix" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Icon name="auto_fix_high" size={15} color={c.textMuted} />
                <span style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Refactoring Suggestions</span>
              </div>

              {suggestions.map((s, i) => {
                const isOpen = expandedSuggestions[i];
                return (
                  <div key={i} style={{ border: `1px solid ${c.border}`, borderRadius: 8, marginBottom: 8, overflow: "hidden", backgroundColor: c.cardBg }}>
                    <div onClick={() => setExpandedSuggestions(p => ({ ...p, [i]: !p[i] }))}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = c.hoverBg}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <span style={{ fontSize: 10, fontWeight: 700, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
                        {s.category?.replace(/_/g, " ")}
                      </span>
                      <span style={{ flex: 1, fontSize: 13, color: c.textMuted, fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>{s.description}</span>
                      <Icon name={isOpen ? "expand_less" : "expand_more"} size={16} color={c.textMuted} />
                    </div>
                    {isOpen && (s.before || s.after) && (
                      <div style={{ borderTop: `1px solid ${c.border}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, backgroundColor: c.bg }}>
                        {s.before && <CodeBlock code={s.before} label="Before" />}
                        {s.after  && <CodeBlock code={s.after}  label="After"  />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {codeIssues.length === 0 && suggestions.length === 0 && (
            <div style={{ padding: 60, textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#3fb950", margin: "0 0 8px", fontFamily: "Inter, sans-serif" }}>No issues found</p>
              <p style={{ fontSize: 13, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>Score: {score}/100</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}