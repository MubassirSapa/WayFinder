import { cn } from "@/lib/utils";

type VideoPlayerProps = {
  src: string;
  title: string;
  className?: string;
};

export function VideoPlayer({ src, title, className }: VideoPlayerProps) {
  return (
    <video
      aria-label={title}
      className={cn("aspect-video w-full rounded-md border border-border bg-black", className)}
      controls
      playsInline
      preload="metadata"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
