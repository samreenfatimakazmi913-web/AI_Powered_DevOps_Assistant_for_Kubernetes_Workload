export function Card({ variant = "default", className = "", children, ...props }) {
  const base = `
    p-4 rounded-xl border
    transition
  `;

  const variants = {
    default: "bg-surface border-border text-text shadow-soft",
    elevated: "bg-surface border-border text-text shadow-medium",
    outline: "bg-transparent border-border text-text",
  };

  return (
    <div {...props} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}