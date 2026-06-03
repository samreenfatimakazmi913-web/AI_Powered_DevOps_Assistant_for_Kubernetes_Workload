export default function ServiceTable({ services = [] }) {
  if (services.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No services to display.
      </div>
    );
  }

  const statusStyle = (service) => {
  if (service.issueType === "NO_PODS") {
    return "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300";
  }

  if (service.issueType === "NO_ENDPOINTS") {
    return "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300";
  }

  if (service.issueType === "UNHEALTHY_PODS") {
    return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300";
  }

  return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300";
};

const statusText = (service) => {
  if (service.issueType === "NO_PODS") return "No Pods";

  if (service.issueType === "NO_ENDPOINTS") return "No Endpoints";

  if (service.issueType === "UNHEALTHY_PODS") return "Degraded";

  return "Healthy";
};

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-[#0f172a] text-gray-600 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3 text-left font-medium">NAME</th>
            <th className="px-4 py-3 text-center font-medium">TYPE</th>
            <th className="px-4 py-3 text-center font-medium">CLUSTER IP</th>
            <th className="px-4 py-3 text-center font-medium">PODS</th>
            <th className="px-4 py-3 text-center font-medium">STATUS</th>
            <th className="px-4 py-3 text-center font-medium">NAMESPACE</th>
          </tr>
        </thead>

        <tbody>
          {services.map((s) => (
            <tr
              key={`${s.namespace}-${s.name}`}
              className="border-t border-gray-200 dark:border-gray-800
                         hover:bg-gray-50 dark:hover:bg-gray-800/30 transition"
            >
              <td className="px-4 py-3 font-mono text-gray-800 dark:text-gray-100">
                {s.name}
              </td>

              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {s.type}
              </td>

              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {s.clusterIP || "-"}
              </td>

              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {s.matchedPodsCount}
              </td>

              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex items-center px-3 py-0.5 rounded-full
                              text-xs font-medium ${statusStyle(s)}`}
                >
                  {statusText(s)}
                </span>
              </td>

              <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                {s.namespace}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}