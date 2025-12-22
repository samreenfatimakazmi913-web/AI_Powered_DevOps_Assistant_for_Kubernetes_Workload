import { useEffect } from "react";

export default function CursorGlow() {
  useEffect(() => {
    const cursor = document.createElement("div");
    cursor.className =
      "pointer-events-none fixed top-0 left-0 w-6 h-6 rounded-full " +
      "bg-blue-500/30 blur-xl z-[9999] transition-transform duration-150";
    document.body.appendChild(cursor);

    const move = (e) => {
      cursor.style.transform = `translate(${e.clientX - 12}px, ${
        e.clientY - 12
      }px)`;
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
      document.body.removeChild(cursor);
    };
  }, []);

  return null;
}
