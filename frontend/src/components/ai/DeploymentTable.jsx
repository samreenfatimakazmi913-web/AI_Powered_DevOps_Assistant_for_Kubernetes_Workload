export default function DeploymentTable({ deployments = [] }) {
  if (deployments.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No deployments to display.
      </div>
    );
  }

  const statusStyle = (d) => {
    if (d.unhealthy) {
      return "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300";
    }

    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300";
  };

  const statusText = (d) => {
    if (d.unhealthy) return "Not Ready";
    return "Healthy";
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-[#0f172a] text-gray-600 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3 text-left font-medium">NAME</th>
            <th className="px-4 py-3 text-center font-medium">REPLICAS</th>
            <th className="px-4 py-3 text-center font-medium">READY</th>
            <th className="px-4 py-3 text-center font-medium">AVAILABLE</th>
            <th className="px-4 py-3 text-center font-medium">STATUS</th>
            <th className="px-4 py-3 text-center font-medium">NAMESPACE</th>
          </tr>
        </thead>

        <tbody>
          {deployments.map((d) => (
            <tr
              key={`${d.namespace}-${d.name}`}
              className="border-t border-gray-200 dark:border-gray-800
                         hover:bg-gray-50 dark:hover:bg-gray-800/30 transition"
            >
              <td className="px-4 py-3 font-mono text-gray-800 dark:text-gray-100">
                {d.name}
              </td>

              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {d.replicas}
              </td>

              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {d.readyReplicas}
              </td>

              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {d.availableReplicas}
              </td>

              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex items-center px-3 py-0.5 rounded-full
                              text-xs font-medium ${statusStyle(d)}`}
                >
                  {statusText(d)}
                </span>
              </td>

              <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                {d.namespace}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}