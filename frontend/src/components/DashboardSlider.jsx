import React, { useState, useEffect } from "react";

const slides = [
  {
    title: "Workloads overview",
    desc: "View pods, deployments and jobs in one place",
    img: "/dashboard.png",
  },
  {
    title: "Node health",
    desc: "Monitor node status and capacity clearly",
    img: "/dashboard-preview.png",
  },
  {
    title: "Logs inspection",
    desc: "Inspect logs without kubectl",
    img: "/bg.png",
  },
];

export default function DashboardSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto">

      {/* IMAGE */}
      <div className="overflow-hidden rounded-xl border border-[#7f7f7f]">
        <img
          src={slides[index].img}
          alt={slides[index].title}
          className="w-full transition-all duration-700 ease-in-out"
        />
      </div>

      {/* TEXT */}
      <div className="mt-6 text-center space-y-1">
        <h3 className="text-lg font-semibold">{slides[index].title}</h3>
        <p className="text-[#7f7f7f] text-sm">{slides[index].desc}</p>
      </div>

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition ${
              index === i ? "bg-[#8B0000]" : "bg-[#7f7f7f]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
