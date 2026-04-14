export default function NamespaceTable({ namespaces = [] }) {
  if (namespaces.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No namespaces to display.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-[#0f172a] text-gray-600 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3 text-left font-medium">NAME</th>
            <th className="px-4 py-3 text-center font-medium">STATUS</th>
            <th className="px-4 py-3 text-center font-medium">AGE</th>
          </tr>
        </thead>

        <tbody>
          {namespaces.map((ns) => (
            <tr
              key={ns.name}
              className="border-t border-gray-200 dark:border-gray-800
                         hover:bg-gray-50 dark:hover:bg-gray-800/30 transition"
            >
              <td className="px-4 py-3 font-mono text-gray-800 dark:text-gray-100">
                {ns.name}
              </td>

              <td className="px-4 py-3 text-center">
                <span
                  className="inline-flex items-center px-3 py-0.5 rounded-full
                             text-xs font-medium bg-emerald-50 text-emerald-700
                             dark:bg-emerald-900/20 dark:text-emerald-300"
                >
                  {ns.status}
                </span>
              </td>

              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {ns.age}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
