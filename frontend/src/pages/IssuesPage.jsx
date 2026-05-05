import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { API_BASE } from "../constants/api";
import Icon from "../components/ui/Icon";

const SEVERITY_COLOR = { critical: "#f85149", high: "#d29522", medium: "#388bfd", low: "#3fb950" };
const STATUS_STYLE = {
  open:        { color: "#f85149", label: "● Open" },
  "in progress":{ color: "#d29522", label: "● In Progress" },
  resolved:    { color: "#3fb950", label: "✓ Resolved" },
};

export default function IssuesPage() {
  const { colors, repoPath, parseRepo } = useApp();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("open");
  const c = colors;

  useEffect(() => {
    if (repoPath) fetchIssues();
  }, [repoPath, stateFilter]);

  async function fetchIssues() {
    const parsed = parseRepo();
    if (!parsed) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/issues/list?owner=${parsed.owner}&repo=${parsed.repo}&state=${stateFilter}`);
      const data = await res.json();
      if (res.ok) setIssues(data.issues || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = issues.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 96px)", overflow: "hidden", padding: "24px 24px 0" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: c.textPrimary, margin: "0 0 6px" }}>Issues Tracker</h1>
          <p style={{ margin: 0, fontSize: 13, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>
            {issues.length} issues detected in{" "}
            <code style={{ backgroundColor: c.border, padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>
              {repoPath || "no repo connected"}
            </code>{" "}repo
          </p>
        </div>
        <button onClick={fetchIssues} style={{
          backgroundColor: c.accent, color: "white", border: "none", borderRadius: 6,
          padding: "10px 20px", fontFamily: "Space Grotesk, sans-serif", fontSize: 11,
          fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Icon name="add" size={16} color="white" /> New Issue
        </button>
      </div>

      {/* Search + filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexShrink: 0 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, border: `1px solid ${c.border}`, borderRadius: 6, padding: "8px 14px", backgroundColor: c.cardBg }}>
          <Icon name="search" size={16} color={c.textMuted} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search all issues (e.g. is:open security)..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: c.textPrimary, fontSize: 13, fontFamily: "Inter, sans-serif" }}
          />
        </div>
        {["open", "all", "closed"].map(s => (
          <button key={s} onClick={() => setStateFilter(s === "all" ? "all" : s)} style={{
            backgroundColor: stateFilter === s || (s === "all" && stateFilter === "all") ? c.accent : c.cardBg,
            color: stateFilter === s || (s === "all" && stateFilter === "all") ? "white" : c.textMuted,
            border: `1px solid ${c.border}`, borderRadius: 6,
            padding: "8px 18px", fontFamily: "Space Grotesk, sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
            textTransform: "uppercase", cursor: "pointer",
          }}>{s.toUpperCase()}</button>
        ))}
      </div>

      {/* Table — scrollable */}
      <div style={{ border: `1px solid ${c.border}`, borderRadius: 8, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", marginBottom: 24 }}>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 200px 120px", backgroundColor: c.cardBg, borderBottom: `1px solid ${c.border}`, padding: "10px 16px", flexShrink: 0 }}>
          {["Issue Description", "Category", "File Path", "Status"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        {/* Scrollable rows */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: c.textMuted, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
              Loading issues...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: c.textMuted, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
              {repoPath ? "No issues found." : "Connect a repository first."}
            </div>
          ) : (
            filtered.map((issue, i) => {
              const sev = issue.labels?.[0]?.toLowerCase() || "medium";
              const sevColor = SEVERITY_COLOR[sev] || "#8b949e";
              const statusKey = issue.state === "open" ? "open" : issue.state === "closed" ? "resolved" : "in progress";
              const statusStyle = STATUS_STYLE[statusKey] || STATUS_STYLE.open;

              return (
                <div key={i}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 160px 200px 120px",
                    padding: "14px 16px",
                    borderBottom: `1px solid ${c.borderSubtle}`,
                    borderLeft: `3px solid ${sevColor}`,
                    transition: "background 0.1s", cursor: "pointer",
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = c.hoverBg}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  {/* Title + meta */}
                  <div>
                    <p style={{ margin: "0 0 5px", fontSize: 13, fontWeight: 500, color: c.textPrimary, lineHeight: 1.4 }}>{issue.title}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: sevColor, border: `1px solid ${sevColor}`, padding: "1px 7px", borderRadius: 4, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        {sev}
                      </span>
                      <span style={{ fontSize: 11, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>
                        #{issue.number} · {new Date(issue.created_at).toLocaleDateString()} by {issue.author}
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: c.textMuted, backgroundColor: c.cardBg, border: `1px solid ${c.border}`, padding: "3px 10px", borderRadius: 6, fontFamily: "Inter, sans-serif" }}>
                      {issue.labels?.[1] || "General"}
                    </span>
                  </div>

                  {/* File path */}
                  <div style={{ display: "flex", alignItems: "center", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: c.textMuted }}>
                    —
                  </div>

                  {/* Status */}
                  <div style={{ display: "flex", alignItems: "center", fontSize: 12, fontWeight: 600, color: statusStyle.color }}>
                    {statusStyle.label}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Row count footer */}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: "8px 16px", borderTop: `1px solid ${c.border}`, backgroundColor: c.cardBg, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: c.textMuted, fontFamily: "JetBrains Mono, monospace" }}>
              Showing {filtered.length} of {issues.length} issues
            </span>
          </div>
        )}
      </div>
    </div>
  );
}