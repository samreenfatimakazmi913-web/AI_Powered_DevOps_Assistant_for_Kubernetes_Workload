import { useEffect, useState } from "react";

export default function CursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    document.body.style.cursor = "none";

    return () => {
      window.removeEventListener("mousemove", move);
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{
        left: pos.x - 6,
        top: pos.y - 6,
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: "rgba(168,85,247,0.9)",
        boxShadow: "0 0 20px rgba(168,85,247,0.6)",
      }}
    />
  );
}
