import { useApp } from "../context/AppContext";
import { API_BASE } from "../constants/api";
import { useState } from "react";
import { getFileStyle } from "../components/ui/index.jsx";

export default function BrowserPage() {
  const { colors, repoPath, branch, files, setFiles, currentPath, setCurrentPath, pathHistory, setPathHistory, filePath, setFilePath, setPage, setReview, setFileInfo, parseRepo } = useApp();
  const [treeLoading, setTreeLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const c = colors;

  const breadcrumbs = currentPath ? currentPath.split("/") : [];

  async function fetchFiles(path = "") {
    const parsed = parseRepo();
    if (!parsed) return;
    setTreeLoading(true);
    try {
      const res = await fetch(`${API_BASE}/review/repo/files?owner=${parsed.owner}&repo=${parsed.repo}&branch=${branch}&path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setFiles(data.items);
      setCurrentPath(path);
    } catch (e) { console.error(e); }
    finally { setTreeLoading(false); }
  }

  async function handleSelectFolder(folderPath) {
    setPathHistory(p => [...p, currentPath]);
    setFilePath("");
    await fetchFiles(folderPath);
  }

  async function handleGoUp() {
    const prev = pathHistory[pathHistory.length - 1] ?? "";
    setPathHistory(h => h.slice(0, -1));
    setFilePath("");
    await fetchFiles(prev);
  }

  async function handleReview() {
    const parsed = parseRepo();
    if (!parsed || !filePath) return;
    setReviewLoading(true);
    setReviewError("");
    try {
      const res = await fetch(`${API_BASE}/review/repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: parsed.owner, repo: parsed.repo, file_path: filePath, branch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Review failed");
      // New schema: data.review contains total_score, code_issues, suggestions, positives, metrics
      setReview(data.review);
      setFileInfo(data.file);
      setPage("review");
    } catch (e) {
      setReviewError(e.message);
    } finally {
      setReviewLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 96px)" }}>

      {/* Breadcrumb bar */}
      <div style={{ backgroundColor: c.headerBg, borderBottom: `1px solid ${c.border}`, padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: c.textMuted }}>
          <span onClick={() => setPage("connect")} style={{ color: c.accent, cursor: "pointer" }}>{repoPath}</span>
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              <span style={{ margin: "0 4px", color: c.textMuted }}>›</span>
              <span style={{ color: i === breadcrumbs.length - 1 ? c.textPrimary : c.textMuted, fontWeight: i === breadcrumbs.length - 1 ? 600 : 400 }}>{crumb}</span>
            </span>
          ))}
        </div>
        {filePath && (
          <button onClick={handleReview} disabled={reviewLoading} style={{
            backgroundColor: reviewLoading ? "#21262d" : "#238636", color: "white",
            border: "none", borderRadius: 6, padding: "6px 16px",
            fontFamily: "Space Grotesk, sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.05em", textTransform: "uppercase",
            cursor: reviewLoading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            🔍 {reviewLoading ? "Reviewing..." : "Review this file"}
          </button>
        )}
      </div>

      {/* File tree */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {currentPath && (
          <div onClick={handleGoUp}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", cursor: "pointer", borderBottom: `1px solid ${c.borderSubtle}`, color: c.accent, fontSize: 12, fontFamily: "JetBrains Mono, monospace", backgroundColor: c.cardBg }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = c.hoverBg}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = c.cardBg}
          >
            ← back
          </div>
        )}

        {treeLoading ? (
          <div style={{ padding: 32, textAlign: "center", color: c.textMuted, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>Loading...</div>
        ) : (
          files.map((f, i) => {
            const style = f.type === "file" ? getFileStyle(f.name) : null;
            const isSelected = filePath === f.path;
            return (
              <div key={i}
                onClick={() => f.type === "dir" ? handleSelectFolder(f.path) : setFilePath(f.path)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", cursor: "pointer", borderBottom: `1px solid ${c.borderSubtle}`, backgroundColor: isSelected ? "rgba(0,120,212,0.1)" : "transparent", borderLeft: isSelected ? `2px solid ${c.accent}` : "2px solid transparent", transition: "background 0.1s" }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = c.hoverBg; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {f.type === "dir" ? (
                  <span style={{ fontSize: 15 }}>📁</span>
                ) : (
                  <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: style.color, backgroundColor: `${style.color}22`, padding: "1px 4px", borderRadius: 3, minWidth: 28, textAlign: "center" }}>{style.label}</span>
                )}
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: isSelected ? "#58a6ff" : c.textPrimary, flex: 1 }}>{f.name}</span>
                {f.type === "dir" && <span style={{ color: c.textMuted, fontSize: 12 }}>›</span>}
                {f.type === "file" && f.size > 0 && <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: c.textMuted }}>{(f.size / 1024).toFixed(1)} KB</span>}
                {isSelected && <span style={{ fontSize: 10, fontWeight: 700, color: c.accent, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.05em" }}>SELECTED</span>}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom code preview / selected file bar */}
      <div style={{ height: 80, borderTop: `1px solid ${c.border}`, backgroundColor: c.cardBgDeep, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: c.textMuted }}>
          {filePath ? `📄 ${filePath}` : "Select a file to review"}
        </div>
        {reviewError && (
          <div style={{ background: "rgba(248,81,73,0.1)", border: "1px solid #f85149", borderRadius: 6, padding: "6px 12px", fontSize: 12, color: "#f85149", fontFamily: "JetBrains Mono, monospace" }}>
            ✕ {reviewError}
          </div>
        )}
      </div>
    </div>
  );
}