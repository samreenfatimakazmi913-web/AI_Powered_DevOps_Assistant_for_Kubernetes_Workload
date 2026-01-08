export default function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  required = false,
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="
          peer w-full h-11 px-4
          rounded-md
          bg-white dark:bg-gray-900
          border border-gray-300 dark:border-gray-700
          text-gray-900 dark:text-gray-100
          placeholder-transparent
          focus:outline-none
          focus:border-blue-600
        "
        placeholder={label}
      />

      <label
        className="
          absolute left-4 top-1/2 -translate-y-1/2
          text-sm text-gray-500 dark:text-gray-400
          transition-all duration-200
          pointer-events-none
          peer-focus:top-2
          peer-focus:text-xs
          peer-focus:text-blue-600
          peer-placeholder-shown:top-1/2
          peer-placeholder-shown:text-sm
          peer-placeholder-shown:text-gray-500
        "
      >
        {label}
      </label>
    </div>
  );
}
