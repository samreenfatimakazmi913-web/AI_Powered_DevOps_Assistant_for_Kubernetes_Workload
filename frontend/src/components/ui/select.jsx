import * as React from "react";

export function Select({ children, className = "", ...props }) {
  return (
    <select
      className={
        "w-full px-3 py-2 rounded-md border text-sm shadow-sm " +
        "border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white " +
        "focus:ring-2 focus:ring-blue-400 focus:border-blue-400 " +
        className
      }
      {...props}
    >
      {children}
    </select>
  );
}
