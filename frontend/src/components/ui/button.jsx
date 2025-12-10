import * as React from "react";

export function Button({ className = "", ...props }) {
  return (
    <button
      className={
        "px-4 py-2 rounded-md font-medium transition bg-blue-600 text-white hover:bg-blue-700 active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-600 " +
        className
      }
      {...props}
    />
  );
}
