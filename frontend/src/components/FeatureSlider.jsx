import { motion } from "framer-motion";
import { useRef } from "react";
import {
  Boxes,
  FileText,
  BarChart3,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "Live Kubernetes View",
    desc: "See pods, nodes, and namespaces in real time.",
    icon: Boxes,
  },
  {
    title: "Instant Logs",
    desc: "Access pod logs without kubectl commands.",
    icon: FileText,
  },
  {
    title: "Metrics & Charts",
    desc: "Visualize CPU and memory usage clearly.",
    icon: BarChart3,
  },
  {
    title: "AI Explanations",
    desc: "Understand failures using natural language.",
    icon: Sparkles,
  },
];

export default function FeatureSlider() {
  const sliderRef = useRef(null);

  return (
    <div className="overflow-hidden">
      <motion.div
        ref={sliderRef}
        className="flex gap-6 cursor-grab active:cursor-grabbing"
        animate={{
          x: window.innerWidth >= 768 ? ["0%", "-50%"] : 0,
        }}
        transition={{
          repeat: window.innerWidth >= 768 ? Infinity : 0,
          duration: 25,
          ease: "linear",
        }}
        drag={window.innerWidth < 768 ? "x" : false}
        dragConstraints={{ left: -600, right: 0 }}
      >
        {[...features, ...features].map((f, i) => {
          const Icon = f.icon;

          return (
            <div
              key={i}
              className="
                min-w-[280px]
                p-6 rounded-2xl
                bg-surface
                border border-border
                shadow-soft
                relative overflow-hidden
                transition hover:shadow-medium
              "
            >
              {/* SUBTLE GLOW */}
              <div
                className="
                  absolute -top-8 -right-8
                  w-28 h-28
                  bg-primary
                  opacity-10 blur-2xl
                "
              />

              {/* ICON */}
              <div
                className="
                  w-12 h-12 mb-4 rounded-xl
                  bg-primary
                  flex items-center justify-center
                  text-white
                "
              >
                <Icon size={22} />
              </div>

              <h3 className="font-semibold mb-2 text-text">
                {f.title}
              </h3>

              <p className="text-sm text-muted">
                {f.desc}
              </p>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}