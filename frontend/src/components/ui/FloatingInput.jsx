import React, { useEffect, useRef, useState } from "react";

export default function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  required = false,
}) {
  const inputRef = useRef(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value) {
      setFilled(true);
    }
  }, [value]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={e => {
          onChange(e);
          setFilled(e.target.value.length > 0);
        }}
        required={required}
        autoComplete={
          type === "password" ? "current-password" : "email"
        }
        placeholder=" "
        className="
          peer w-full
          px-3 pt-5 pb-2
          bg-transparent
          border border-border
          rounded-md
          text-text
          focus:outline-none
          focus:border-primary
          focus:ring-2 focus:ring-primary/20
          transition
        "
      />

      <label
        className={`
          absolute left-3 px-1
          bg-surface
          text-muted
          pointer-events-none
          transition-all duration-200

          ${filled
            ? "top-0 -translate-y-1/2 text-xs"
            : "top-1/2 -translate-y-1/2 text-sm"}

          peer-focus:top-0
          peer-focus:-translate-y-1/2
          peer-focus:text-xs
          peer-focus:text-primary
        `}
      >
        {label}
      </label>
    </div>
  );
}