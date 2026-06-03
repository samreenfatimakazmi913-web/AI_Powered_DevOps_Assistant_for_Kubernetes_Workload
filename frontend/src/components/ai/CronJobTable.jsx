export default function CronJobTable({ cronjobs = [] }) {
  if (cronjobs.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No cronjobs to display.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-[#0f172a] text-gray-600 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3 text-left font-medium">NAME</th>
            <th className="px-4 py-3 text-center font-medium">SCHEDULE</th>
            <th className="px-4 py-3 text-center font-medium">SUSPENDED</th>
            <th className="px-4 py-3 text-center font-medium">ACTIVE</th>
          </tr>
        </thead>

        <tbody>
          {cronjobs.map(cj => (
            <tr
              key={cj.name}
              className="border-t border-gray-200 dark:border-gray-800
                         hover:bg-gray-50 dark:hover:bg-gray-800/30 transition"
            >
              <td className="px-4 py-3 font-mono text-gray-800 dark:text-gray-100">
                {cj.name}
              </td>

              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {cj.schedule}
              </td>

              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {cj.suspend}
              </td>

              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {cj.active}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
