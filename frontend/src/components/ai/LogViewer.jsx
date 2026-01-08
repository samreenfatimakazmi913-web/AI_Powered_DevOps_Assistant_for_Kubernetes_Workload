export default function LogViewer({ logs }) {
  if (!logs) return null;

  return (
    <pre className="
      bg-black text-green-400
      p-4 mt-3 rounded-lg
      max-h-72 overflow-auto
      text-xs font-mono
      whitespace-pre-wrap
    ">
      {logs}
    </pre>
  );
}
