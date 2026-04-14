export default function LogViewer({ logs }) {
  if (!logs) return null;

  const getColor = (line) => {
    const lower = line.toLowerCase();

    if (lower.includes("error") || lower.includes("failed")) {
      return "text-red-400";
    }
    if (lower.includes("warn") || lower.includes("timeout")) {
      return "text-yellow-400";
    }
    return "text-green-400";
  };

  return (
    <div className="
      bg-black p-4 mt-3 rounded-lg
      max-h-72 overflow-auto
      text-xs font-mono
    ">
      {logs.split("\n").map((line, i) => (
        <div key={i} className={getColor(line)}>
          {line}
        </div>
      ))}
    </div>
  );
}