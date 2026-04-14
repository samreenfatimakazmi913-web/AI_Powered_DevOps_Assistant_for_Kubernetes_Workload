import * as React from "react";

export function Button({ className = "", ...props }) {
  return (
    <button
      {...props}
      className={
        `
        px-4 py-2 rounded-md font-medium text-white
        bg-primary hover:opacity-90
        active:scale-95 transition
        focus:outline-none
        focus:ring-2 focus:ring-primary/30
        ` + className
      }
    />
  );
}