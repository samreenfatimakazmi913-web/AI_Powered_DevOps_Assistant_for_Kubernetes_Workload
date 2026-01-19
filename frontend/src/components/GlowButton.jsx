export default function GlowButton({ text }) {
  return (
    <button
      className="
        px-5 py-2.5 rounded-md
        bg-gray-900 dark:bg-white
        text-white dark:text-gray-900
        text-sm font-medium
        hover:opacity-90 transition
      "
    >
      {text}
    </button>
  );
}
