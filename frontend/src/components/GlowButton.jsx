export default function GlowButton({ text }) {
  return (
    <button
      className="
        px-5 py-2.5 rounded-md
        bg-primary
        text-white
        text-sm font-medium
        transition

        hover:opacity-90
        hover:shadow-medium
        active:scale-95
      "
    >
      {text}
    </button>
  );
}