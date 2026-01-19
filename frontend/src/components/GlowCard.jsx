export default function GlowCard({ children, glow = "primary" }) {
  const map = {
    primary: "glow-primary",
    secondary: "glow-secondary",
    accent: "glow-accent",
  };

  return (
    <div className={`card ${map[glow]}`}>
      <div className="p-6 transition hover:-translate-y-1 hover:shadow-xl">
        {children}
      </div>
    </div>
  );
}
