export function Card({ className = "", children }) {
  return (
    <div
      className={
        "p-4 rounded-xl border shadow-sm bg-white border-gray-200 " +
        "dark:bg-gray-900 dark:border-gray-700 " +
        className
      }
    >
      {children}
    </div>
  );
}
