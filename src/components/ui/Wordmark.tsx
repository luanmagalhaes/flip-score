type WordmarkSize = "sm" | "md" | "lg";

interface WordmarkProps {
  size?: WordmarkSize;
  className?: string;
}

const sizes: Record<WordmarkSize, string> = {
  sm: "text-lg sm:text-xl",
  md: "text-3xl sm:text-5xl",
  lg: "text-4xl sm:text-7xl",
};

export function Wordmark({ size = "md", className = "" }: WordmarkProps) {
  return (
    <span className={`inline-flex max-w-full flex-wrap items-baseline justify-center gap-x-1.5 ${className}`}>
      <span
        className={`display leading-none text-ink ${sizes[size]}`}
        style={{ textShadow: "0 2px 0 var(--color-gold)" }}
      >
        FLIP
      </span>
      <span
        className={`display leading-none text-flame ${sizes[size]}`}
        style={{ textShadow: "0 2px 0 var(--color-ink)" }}
      >
        SCORE
      </span>
    </span>
  );
}
