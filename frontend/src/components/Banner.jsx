import { useApp } from "../context/AppContext";
import Icon from "./ui/Icon";

export default function Banner() {
  const { colors, bannerVisible, setBannerVisible } = useApp();
  if (!bannerVisible) return null;
  return (
    <div style={{
      backgroundColor: colors.cardBg,
      borderBottom: `1px solid ${colors.border}`,
      padding: "8px 24px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="info" size={16} color="#0078D4" />
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: colors.textMuted }}>
          GitHub Login Coming Soon — repos must be <strong style={{ color: colors.textPrimary }}>public</strong> until then
        </span>
      </div>
      <button onClick={() => setBannerVisible(false)}
        style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted, padding: 2, display: "flex", alignItems: "center" }}
        onMouseEnter={e => e.currentTarget.style.color = colors.textPrimary}
        onMouseLeave={e => e.currentTarget.style.color = colors.textMuted}
      >
        <Icon name="close" size={16} color="inherit" />
      </button>
    </div>
  );
}