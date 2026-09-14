import type { ReactNode } from "react";

type Face = "number" | "freeze" | "flipthree" | "second" | "modifier";

interface CardArtProps {
  face: Face;
  label: string;
  note?: string;
  className?: string;
}

const skins: Record<Face, string> = {
  number: "bg-paper text-ink",
  freeze: "bg-sky text-ink",
  flipthree: "bg-gold text-ink",
  second: "bg-flame text-paper",
  modifier: "bg-gold text-ink",
};

function Mark({ face }: { face: Face }): ReactNode {
  if (face === "freeze") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M12 2v20M12 7l-4-3M12 7l4-3M12 17l-4 3M12 17l4 3M3 7l18 10M8 8L3.5 7.2M8 8l-.8-4.5M16 16l4.5.8M16 16l.8 4.5M21 7L3 17M16 8l4.5-.8M16 8l.8-4.5M8 16l-4.5.8M8 16l-.8 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (face === "flipthree") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M13 2L5 13h6l-2 9 8-11h-6z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (face === "second") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M12 20s-7-4.4-7-9.3A4 4 0 0 1 12 7a4 4 0 0 1 7 3.7C19 15.6 12 20 12 20z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return null;
}

export function CardArt({ face, label, note, className = "" }: CardArtProps) {
  return (
    <span
      className={`inline-flex h-[6.5rem] w-[4.6rem] flex-col items-center justify-between rounded-xl border-[3px] border-ink px-1.5 py-1.5 text-center ${skins[face]} ${className}`}
    >
      <span className="flex w-full items-center justify-between opacity-70">
        <Mark face={face} />
        <Mark face={face} />
      </span>

      <span
        className={`display leading-none ${
          face === "number" ? "text-3xl" : label.length > 6 ? "text-[0.6rem]" : "text-sm"
        }`}
      >
        {label}
      </span>

      <span className="text-[0.5rem] font-semibold uppercase tracking-wider opacity-65">
        {note ?? ""}
      </span>
    </span>
  );
}
