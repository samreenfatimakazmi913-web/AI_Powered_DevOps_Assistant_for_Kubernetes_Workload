import * as React from "react";

export const Input = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={
        "w-full px-3 py-2 border rounded-md text-sm shadow-sm outline-none " +
        "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 " +
        "dark:border-gray-700 dark:bg-gray-900 dark:text-white " +
        "dark:focus:border-blue-400 dark:focus:ring-blue-500 " +
        className
      }
      {...props}
    />
  );
});
