import { cn } from "@/lib/utils";

export function GlowCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "relative rounded-2xl bg-white/5 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] border border-white/5",
        "overflow-hidden",
        className
      )}
    >
      {/* corner glow layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(240px 160px at 8% 8%, rgba(72,159,227,0.15), transparent 60%)," + // PB blue
            "radial-gradient(200px 140px at 92% 16%, rgba(103,255,216,0.12), transparent 60%)," + // PB aqua
            "radial-gradient(220px 160px at 88% 88%, rgba(232,247,255,0.10), transparent 60%)",   // whiteHot
        }}
      />
      {children}
    </div>
  );
}
