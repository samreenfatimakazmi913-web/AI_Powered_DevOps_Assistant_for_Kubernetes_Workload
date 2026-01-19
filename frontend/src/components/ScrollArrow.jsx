import React, { useEffect, useState } from "react";

export default function ScrollArrow() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="
        fixed bottom-6 right-6 z-50
        w-11 h-11 rounded-full
        bg-[#8B0000] text-white
        flex items-center justify-center
        shadow-lg
        hover:shadow-xl hover:scale-105
        transition-all duration-300
      "
    >
      ↑
    </button>
  );
}
