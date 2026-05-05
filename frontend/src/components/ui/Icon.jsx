/**
 * Material Symbols Outlined icon component
 * Usage: <Icon name="terminal" size={20} color="#0078D4" filled />
 */
export default function Icon({ name, size = 20, color, filled = false, style = {} }) {
  return (
    <span
      className={filled ? "material-symbols-filled" : "material-symbols-outlined"}
      style={{
        fontSize: size,
        color: color,
        lineHeight: 1,
        userSelect: "none",
        ...style
      }}
    >
      {name}
    </span>
  );
}