type Props = {
  title: string;
  onClick: () => void;
};

export function SoftHandoff({ title, onClick }: Props) {
  return (
    <div className="px-4 md:px-6 py-2 relative z-10">
      <svg className="w-full h-4" viewBox="0 0 600 20" preserveAspectRatio="none">
        <line
          x1="8"
          y1="10"
          x2="592"
          y2="10"
          stroke="url(#pb-grad)"
          strokeWidth="1.25"
          strokeDasharray="6 8"
          strokeLinecap="round"
          filter="url(#pb-grad-glow)"
        />
      </svg>
      <div className="mt-1 text-sm text-slate-200/90">
        Next reference:{" "}
        <button
          className="underline decoration-[#489FE3]/60 hover:text-cyan-300 transition"
          onClick={onClick}
        >
          {title}
        </button>
      </div>
    </div>
  );
}
