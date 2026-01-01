export default function PodTable({ pods = [] }) {
  if (pods.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No pods to display.
      </div>
    );
  }

  const statusStyle = (status) => {
    switch (status) {
      case "Running":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
      case "Completed":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300";
      case "Pending":
        return "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400";
      case "Failed":
        return "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-[#0f172a] text-gray-600 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3 text-left font-medium">NAME</th>
            <th className="px-4 py-3 text-center font-medium">READY</th>
            <th className="px-4 py-3 text-center font-medium">STATUS</th>
            <th className="px-4 py-3 text-center font-medium">RESTARTS</th>
            <th className="px-4 py-3 text-center font-medium">AGE</th>
            <th className="px-4 py-3 text-center font-medium">NAMESPACE</th>
          </tr>
        </thead>

        <tbody>
          {pods.map((p) => (
            <tr
              key={`${p.namespace}-${p.name}`}
              className="border-t border-gray-200 dark:border-gray-800
                         hover:bg-gray-50 dark:hover:bg-gray-800/30 transition"
            >
              <td className="px-4 py-3 font-mono text-gray-800 dark:text-gray-100">
                {p.name}
              </td>

              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {p.ready}
              </td>

              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex items-center px-3 py-0.5 rounded-full
                              text-xs font-medium ${statusStyle(p.status)}`}
                >
                  {p.status}
                </span>
              </td>

              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {p.restarts}
              </td>

              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {p.age}
              </td>

              <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                {p.namespace}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
