import { useState } from "react";

const API_BASE = "https://github-connector-i05a.onrender.com";

function SeverityBadge({ severity }) {
  const map = {
    critical: { bg: "#FCEBEB", color: "#A32D2D", label: "Critical" },
    high:     { bg: "#FAEEDA", color: "#854F0B", label: "High" },
    medium:   { bg: "#E6F1FB", color: "#185FA5", label: "Medium" },
    low:      { bg: "#EAF3DE", color: "#3B6D11", label: "Low" },
  };
  const s = map[severity?.toLowerCase()] || map.low;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, padding: "2px 8px",
      borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.04em"
    }}>{s.label}</span>
  );
}

function CategoryBadge({ category }) {
  const map = {
    security:      { bg: "#FCEBEB", color: "#A32D2D" },
    performance:   { bg: "#FAEEDA", color: "#854F0B" },
    readability:   { bg: "#E1F5EE", color: "#0F6E56" },
    best_practice: { bg: "#EEEDFE", color: "#534AB7" },
  };
  const s = map[category?.toLowerCase()] || { bg: "#F1EFE8", color: "#5F5E5A" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, padding: "2px 8px",
      borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.04em"
    }}>{category?.replace("_", " ")}</span>
  );
}

function RatingRing({ rating }) {
  const r = 36, stroke = 5;
  const circ = 2 * Math.PI * r;
  const dash = (rating / 10) * circ;
  const color = rating >= 7 ? "#1D9E75" : rating >= 4 ? "#BA7517" : "#E24B4A";
  return (
    <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
      <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="45" cy="45" r={r} fill="none" stroke="#E5E5E5" strokeWidth={stroke} />
        <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{rating}</span>
        <span style={{ fontSize: 10, color: "#888", marginTop: 1 }}>/10</span>
      </div>
    </div>
  );
}

function FileTree({ files, currentPath, onSelectFile, onSelectFolder, onGoUp, loading }) {
  return (
    <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}>
      {/* Back button shown when inside a folder */}
      {currentPath && (
        <div
          onClick={onGoUp}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 14px", fontSize: 13, cursor: "pointer",
            background: "#F9FAFB", borderBottom: "1px solid #E5E7EB",
            color: "#6366F1", fontWeight: 500,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#EEF2FF"}
          onMouseLeave={e => e.currentTarget.style.background = "#F9FAFB"}
        >
          <span>← Back</span>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#9CA3AF", marginLeft: 4 }}>
            /{currentPath}
          </span>
        </div>
      )}

      {/* Loading spinner inside browser */}
      {loading ? (
        <div style={{ padding: "24px 14px", fontSize: 13, color: "#9CA3AF", textAlign: "center" }}>
          Loading...
        </div>
      ) : (
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {files.length === 0 && (
            <div style={{ padding: "20px 14px", fontSize: 13, color: "#9CA3AF", textAlign: "center" }}>
              Empty folder
            </div>
          )}
          {files.map((f, i) => (
            <div
              key={i}
              onClick={() => f.type === "dir" ? onSelectFolder(f.path) : onSelectFile(f.path)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 14px", fontSize: 13,
                borderBottom: i < files.length - 1 ? "1px solid #F0F0F0" : "none",
                cursor: "pointer", background: "white", transition: "background 0.12s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#F5F7FF"}
              onMouseLeave={e => e.currentTarget.style.background = "white"}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>
                {f.type === "dir" ? "📁" : "📄"}
              </span>
              <span style={{
                color: f.type === "dir" ? "#374151" : "#2563EB",
                fontFamily: "monospace", flex: 1
              }}>
                {f.name}
              </span>
              {f.type === "dir" && (
                <span style={{ color: "#9CA3AF", fontSize: 12 }}>→</span>
              )}
              {f.type === "file" && f.size > 0 && (
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                  {(f.size / 1024).toFixed(1)}KB
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [owner, setOwner]     = useState("");
  const [repo, setRepo]       = useState("");
  const [branch, setBranch]   = useState("main");
  const [context, setContext] = useState("");
  const [filePath, setFilePath] = useState("");

  // File browser
  const [files, setFiles]               = useState([]);
  const [currentPath, setCurrentPath]   = useState("");
  const [pathHistory, setPathHistory]   = useState([]);  // stack for back navigation
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError]     = useState("");
  const [treeLoading, setTreeLoading]     = useState(false);

  // Review
  const [review, setReview]             = useState(null);
  const [fileInfo, setFileInfo]         = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError]     = useState("");

  const [step, setStep] = useState(1);

  // ── Fetch files at a path ─────────────────────────────────────────────────
  async function fetchFiles(path = "", isNav = false) {
    isNav ? setTreeLoading(true) : setBrowseLoading(true);
    setBrowseError("");
    try {
      const res = await fetch(
        `${API_BASE}/review/repo/files?owner=${owner}&repo=${repo}&branch=${branch}&path=${encodeURIComponent(path)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch files");
      setFiles(data.items);
      setCurrentPath(path);
      setStep(2);
    } catch (e) {
      setBrowseError(e.message);
    } finally {
      isNav ? setTreeLoading(false) : setBrowseLoading(false);
    }
  }

  async function handleBrowse() {
    if (!owner || !repo) return;
    setPathHistory([]);
    setFilePath("");
    setReview(null);
    await fetchFiles("", false);
  }

  async function handleSelectFolder(folderPath) {
    setPathHistory(prev => [...prev, currentPath]);
    setFilePath("");
    await fetchFiles(folderPath, true);
  }

  async function handleGoUp() {
    const prev = pathHistory[pathHistory.length - 1] ?? "";
    setPathHistory(h => h.slice(0, -1));
    setFilePath("");
    await fetchFiles(prev, true);
  }

  function handleSelectFile(path) {
    setFilePath(path);
  }

  async function handleReview() {
    if (!filePath) return;
    setReviewLoading(true);
    setReviewError("");
    setReview(null);
    setStep(3);
    try {
      const res = await fetch(`${API_BASE}/review/repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, file_path: filePath, branch, context: context || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Review failed");
      setReview(data.review);
      setFileInfo(data.file);
    } catch (e) {
      setReviewError(e.message);
      setStep(2);
    } finally {
      setReviewLoading(false);
    }
  }

  function reset() {
    setReview(null); setFileInfo(null);
    setFiles([]); setFilePath("");
    setCurrentPath(""); setPathHistory([]);
    setReviewError(""); setBrowseError("");
    setStep(1);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: "40px 20px"
    }}>
      {/* Header */}
      <div style={{ maxWidth: 760, margin: "0 auto 36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
          }}>🔍</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "white", letterSpacing: "-0.5px" }}>
              AI Code Reviewer
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>
              Senior dev feedback on your GitHub files
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Step 1 — Repo Input */}
        <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 600, color: "#111827" }}>
            1. Connect your repository
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>GitHub Username / Org</label>
              <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g. torvalds" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Repository Name</label>
              <input value={repo} onChange={e => setRepo(e.target.value)} placeholder="e.g. linux" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Branch</label>
              <input value={branch} onChange={e => setBranch(e.target.value)} placeholder="main" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Context (optional)</label>
              <input value={context} onChange={e => setContext(e.target.value)} placeholder="What does this file do?" style={inputStyle} />
            </div>
          </div>
          {browseError && (
            <div style={{ background: "#FEF2F2", color: "#B91C1C", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 12 }}>
              {browseError}
            </div>
          )}
          <button onClick={handleBrowse} disabled={!owner || !repo || browseLoading}
            style={btnStyle(!owner || !repo || browseLoading)}>
            {browseLoading ? "Fetching files..." : "Browse Files →"}
          </button>
        </div>

        {/* Step 2 — File Browser */}
        {step >= 2 && !review && (
          <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#111827" }}>
              2. Pick a file to review
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: "#9CA3AF" }}>
              Click folders to navigate inside them · Click a file to select it
            </p>

            <FileTree
              files={files}
              currentPath={currentPath}
              loading={treeLoading}
              onSelectFile={handleSelectFile}
              onSelectFolder={handleSelectFolder}
              onGoUp={handleGoUp}
            />

            {filePath && (
              <div style={{
                marginTop: 14, display: "flex", alignItems: "center",
                gap: 10, background: "#F0F5FF", borderRadius: 10, padding: "10px 14px"
              }}>
                <span style={{ fontSize: 13, fontFamily: "monospace", color: "#2563EB", flex: 1 }}>
                  📄 {filePath}
                </span>
                <button onClick={handleReview} disabled={reviewLoading}
                  style={{ ...btnStyle(reviewLoading), padding: "8px 20px", fontSize: 13, width: "auto" }}>
                  {reviewLoading ? "Reviewing..." : "Review this file →"}
                </button>
              </div>
            )}

            {reviewError && (
              <div style={{ background: "#FEF2F2", color: "#B91C1C", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginTop: 12 }}>
                {reviewError}
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {reviewLoading && (
          <div style={{ background: "white", borderRadius: 16, padding: "40px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.15)", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 6px" }}>Reviewing your code...</p>
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>Fetching file from GitHub and running AI analysis</p>
          </div>
        )}

        {/* Step 3 — Results */}
        {review && !reviewLoading && (
          <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
            {fileInfo && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                background: "#F8FAFC", borderRadius: 8, padding: "8px 12px", marginBottom: 20, fontSize: 12
              }}>
                <span style={{ fontFamily: "monospace", color: "#374151", fontWeight: 500 }}>
                  {fileInfo.owner}/{fileInfo.repo}/{fileInfo.file_path}
                </span>
                <span style={{ color: "#9CA3AF" }}>· {fileInfo.language} · {(fileInfo.size_bytes / 1024).toFixed(1)}KB</span>
                <a href={fileInfo.github_url} target="_blank" rel="noreferrer"
                  style={{ marginLeft: "auto", color: "#6366F1", fontSize: 11, textDecoration: "none", fontWeight: 500 }}>
                  View on GitHub ↗
                </a>
              </div>
            )}

            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 24 }}>
              <RatingRing rating={review.overall_rating} />
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#111827" }}>Overall Assessment</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{review.summary}</p>
              </div>
            </div>

            {review.bugs?.length > 0 && (
              <section style={{ marginBottom: 22 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
                  🐛 Bugs Found
                  <span style={{ background: "#FEE2E2", color: "#B91C1C", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6 }}>
                    {review.bugs.length}
                  </span>
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {review.bugs.map((bug, i) => (
                    <div key={i} style={{ border: "1px solid #FEE2E2", borderRadius: 10, padding: "12px 16px", background: "#FFFAFA" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <SeverityBadge severity={bug.severity} />
                        {bug.line !== "N/A" && <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace" }}>Line {bug.line}</span>}
                      </div>
                      <p style={{ margin: "0 0 6px", fontSize: 13, color: "#111827", fontWeight: 500 }}>{bug.description}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
                        <span style={{ fontWeight: 600, color: "#059669" }}>Fix: </span>{bug.fix}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {review.suggestions?.length > 0 && (
              <section style={{ marginBottom: 22 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#111827" }}>💡 Suggestions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {review.suggestions.map((s, i) => (
                    <div key={i} style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "12px 16px", background: "#FAFAFA" }}>
                      <div style={{ marginBottom: 6 }}><CategoryBadge category={s.category} /></div>
                      <p style={{ margin: "0 0 8px", fontSize: 13, color: "#111827" }}>{s.description}</p>
                      {s.example && (
                        <pre style={{
                          margin: 0, background: "#1E293B", color: "#E2E8F0",
                          borderRadius: 8, padding: "10px 14px", fontSize: 12,
                          overflowX: "auto", lineHeight: 1.6, fontFamily: "monospace"
                        }}>{s.example}</pre>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {review.positives?.length > 0 && (
              <section style={{ marginBottom: 22 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#111827" }}>✅ Done Well</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {review.positives.map((p, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 14px", background: "#F0FDF4",
                      border: "1px solid #BBF7D0", borderRadius: 8, fontSize: 13, color: "#166534"
                    }}>
                      <span style={{ flexShrink: 0 }}>✓</span> {p}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <button onClick={reset} style={{
              background: "none", border: "1px solid #E5E7EB", borderRadius: 8,
              padding: "8px 16px", fontSize: 13, color: "#6B7280", cursor: "pointer", marginTop: 4
            }}>
              ← Review another file
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 12, fontWeight: 500, color: "#6B7280", display: "block", marginBottom: 5 };

const inputStyle = {
  width: "100%", padding: "9px 12px", fontSize: 13,
  border: "1px solid #E5E7EB", borderRadius: 8, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit", color: "#111827", background: "white"
};

const btnStyle = (disabled) => ({
  width: "100%", padding: "10px 16px",
  background: disabled ? "#E5E7EB" : "linear-gradient(135deg, #6366F1, #8B5CF6)",
  color: disabled ? "#9CA3AF" : "white",
  border: "none", borderRadius: 8, fontSize: 14,
  fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
  transition: "opacity 0.15s"
});
