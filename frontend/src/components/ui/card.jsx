export function Card({ className = "", children, ...props }) {
  return (
    <div
      {...props}
      className={`
        p-4 rounded-xl border shadow-sm
        bg-white dark:bg-gray-900
        border-gray-200 dark:border-gray-700
        text-gray-900 dark:text-gray-200
        ${className}
      `}
    >
      {children}
    </div>
  );
}
