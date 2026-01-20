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
    color: "from-blue-500 to-cyan-400",
  },
  {
    title: "Instant Logs",
    desc: "Access pod logs without kubectl commands.",
    icon: FileText,
    color: "from-purple-500 to-pink-400",
  },
  {
    title: "Metrics & Charts",
    desc: "Visualize CPU and memory usage clearly.",
    icon: BarChart3,
    color: "from-green-500 to-emerald-400",
  },
  {
    title: "AI Explanations",
    desc: "Understand failures using natural language.",
    icon: Sparkles,
    color: "from-orange-500 to-yellow-400",
  },
];

export default function FeatureSlider() {
  const sliderRef = useRef(null);

  return (
    <div className="overflow-hidden">
      <motion.div
        ref={sliderRef}
        className="
          flex gap-6
          cursor-grab active:cursor-grabbing
        "
        /* Desktop auto animation */
        animate={{
          x: window.innerWidth >= 768 ? ["0%", "-50%"] : 0,
        }}
        transition={{
          repeat: window.innerWidth >= 768 ? Infinity : 0,
          duration: 25,
          ease: "linear",
        }}
        /* Mobile swipe */
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
                bg-white dark:bg-[#0f172a]
                border border-gray-200 dark:border-gray-800
                shadow-lg
                relative overflow-hidden
              "
            >
              {/* GLOW */}
              <div
                className={`
                  absolute -top-8 -right-8
                  w-28 h-28
                  bg-gradient-to-br ${f.color}
                  opacity-20 blur-2xl
                `}
              />

              {/* ICON */}
              <div
                className={`
                  w-12 h-12 mb-4 rounded-xl
                  bg-gradient-to-br ${f.color}
                  flex items-center justify-center
                  text-white
                `}
              >
                <Icon size={22} />
              </div>

              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {f.desc}
              </p>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
