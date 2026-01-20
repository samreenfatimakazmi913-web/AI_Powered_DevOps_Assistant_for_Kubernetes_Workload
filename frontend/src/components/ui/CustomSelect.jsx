import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* close on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* close on ESC */
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="
          w-full px-3 py-2 text-left text-sm
          border border-gray-300 rounded-md
          bg-white
          flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-[#8B0000]
        "
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="
          absolute z-[9999] mt-1 w-full
          bg-white border border-gray-200 rounded-md
          shadow-lg max-h-48 overflow-auto
        ">
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="
                px-3 py-2 text-sm cursor-pointer
                hover:bg-[#8B0000]/10
                hover:text-[#8B0000]
              "
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
