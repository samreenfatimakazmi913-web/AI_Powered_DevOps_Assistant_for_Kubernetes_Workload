import * as React from "react";

export function Button({ className = "", ...props }) {
  return (
    <button
      {...props}
      className={
        `
        px-4 py-2 rounded-md font-medium text-white
        bg-[#8B0000] hover:bg-[#720000]
        active:scale-95 transition
        focus:outline-none
        focus:ring-2 focus:ring-[#8B0000]
        dark:bg-[#8B0000] dark:hover:bg-[#720000]
        ` + className
      }
    />
  );
}
