import * as React from "react";

export const Input = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      className={`
        w-full px-3 py-2 rounded-md text-sm
        border border-border
        bg-surface
        text-text
        outline-none

        focus:border-primary
        focus:ring-2 focus:ring-primary/20

        transition
        ${className}
      `}
    />
  );
});