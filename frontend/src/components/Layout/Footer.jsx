import { useApp } from "../../context/AppContext";

export default function Footer() {
  const { colors } = useApp();
  return (
    <footer style={{
      position: "fixed", bottom: 0, left: 0, right: 0, height: 24,
      backgroundColor: colors.headerBg,
      borderTop: `1px solid ${colors.border}`,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 12px", zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#238636", display: "inline-block" }} />
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#238636" }}>
          System Ready
        </span>
      </div>
      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: colors.textMuted }}>
        UTF-8
      </span>
    </footer>
  );
}