export default function GlowCard({ children, glow = "primary" }) {
  const glowMap = {
    primary: "hover:shadow-[0_0_25px_rgba(164,31,19,0.25)]",
    secondary: "hover:shadow-[0_0_25px_rgba(224,219,216,0.25)]",
    accent: "hover:shadow-[0_0_25px_rgba(143,122,110,0.25)]",
  };

  return (
    <div
      className={`
        rounded-xl border border-border
        bg-surface text-text
        shadow-soft
        transition

        hover:-translate-y-1
        ${glowMap[glow]}
      `}
    >
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}