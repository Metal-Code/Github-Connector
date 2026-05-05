import { useApp } from "../../context/AppContext";
import Icon from "../ui/Icon";

const SIDEBAR_ITEMS = [
  { icon: "folder",       label: "Explorer",   filled: true,  pages: ["connect","browser","review","error"], target: "connect" },
  { icon: "psychology",   label: "Reviewer",   filled: false, pages: ["review"],   target: "review" },
  { icon: "account_tree", label: "Git",        filled: false, pages: ["commits"],  target: "commits" },
  { icon: "rule",         label: "Diagnostics",filled: false, pages: ["issues"],   target: "issues" },
  { icon: "extension",    label: "Extensions", filled: false, pages: [],           target: null },
];

export default function Sidebar() {
  const { colors, page, setPage } = useApp();

  return (
    <aside style={{
      position: "fixed", left: 0, top: 48, bottom: 24,
      width: 64, backgroundColor: colors.sidebarBg,
      borderRight: `1px solid ${colors.border}`,
      display: "flex", flexDirection: "column",
      alignItems: "center", paddingTop: 16, gap: 2, zIndex: 40,
    }}>
      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: colors.textMuted, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>WS</span>

      {SIDEBAR_ITEMS.map((item, i) => {
        const active = item.pages.includes(page);
        return (
          <button key={i} title={item.label}
            onClick={() => item.target && setPage(item.target)}
            style={{
              width: "100%", padding: "10px 0",
              background: active ? "rgba(0,120,212,0.1)" : "none",
              border: "none",
              borderLeft: active ? "2px solid #0078D4" : "2px solid transparent",
              cursor: item.target ? "pointer" : "default",
              color: active ? "#0078D4" : colors.textMuted,
              transition: "all 0.15s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}
            onMouseEnter={e => { if (!active && item.target) e.currentTarget.style.backgroundColor = "#21262d"; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <Icon name={item.icon} size={22} color={active ? "#0078D4" : colors.textMuted} filled={active && item.filled} />
            <span style={{ fontSize: 8, fontFamily: "JetBrains Mono, monospace", letterSpacing: 0.5, color: active ? "#0078D4" : colors.textMuted }}>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}