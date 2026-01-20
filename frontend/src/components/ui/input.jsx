import * as React from "react";

export const Input = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      className={
        `
        w-full px-3 py-2 border rounded-md text-sm shadow-sm
        outline-none
        border-gray-300
        focus:border-[#8B0000]
        focus:ring-2 focus:ring-[#8B0000]

        dark:border-gray-700
        dark:bg-gray-900 dark:text-white
        dark:focus:border-[#8B0000]
        dark:focus:ring-[#8B0000]
        ` + className
      }
    />
  );
});
