import { cn } from "@/lib/utils";

type FloorPlanPreviewProps = {
  imageUrl: string | null;
  name: string;
  compact?: boolean;
};

export function FloorPlanPreview({ imageUrl, name, compact = false }: FloorPlanPreviewProps) {
  if (imageUrl) {
    return (
      <div
        aria-label={`${name} map preview`}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
    );
  }

  return (
    <div
      aria-label={`${name} map preview`}
      className={cn(
        "absolute inset-0 overflow-hidden bg-slate-100",
        "before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-teal-700/25",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-teal-700/25",
      )}
    >
      <span className="absolute left-[12%] top-[18%] h-[28%] w-[26%] rounded-md border border-slate-300 bg-white/70 shadow-sm" />
      <span className="absolute right-[12%] top-[18%] h-[28%] w-[24%] rounded-md border border-slate-300 bg-white/70 shadow-sm" />
      <span className="absolute bottom-[14%] left-[16%] h-[24%] w-[34%] rounded-md border border-slate-300 bg-white/70 shadow-sm" />
      {!compact ? (
        <span className="absolute bottom-[15%] right-[13%] h-[24%] w-[27%] rounded-md border border-slate-300 bg-white/70 shadow-sm" />
      ) : null}
      <span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-600 shadow-[0_0_0_8px_rgba(13,148,136,0.16)]" />
    </div>
  );
}
