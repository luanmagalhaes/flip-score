"use client";

import { useRef, useState } from "react";
import { PhotoCropper } from "@/components/ui/PhotoCropper";
import { ZoomablePhoto } from "@/components/ui/ZoomablePhoto";

interface MyFaceProps {
  name: string;
  photo: string | null;
  emoji: string | null;
  size?: "sm" | "md" | "lg";
  busy: boolean;
  action?: boolean;
  onPhoto: (photo: Blob) => void;
}

export function MyFace({
  name,
  photo,
  emoji,
  size = "md",
  busy,
  action = false,
  onPhoto,
}: MyFaceProps) {
  const picker = useRef<HTMLInputElement>(null);
  const [cropping, setCropping] = useState<File | null>(null);

  const pickPhoto = () => picker.current?.click();

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <ZoomablePhoto
        name={name}
        photo={photo}
        emoji={emoji}
        size={size}
        canEdit
        busy={busy}
        onEdit={pickPhoto}
      />

      <input
        ref={picker}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            setCropping(file);
          }

          event.target.value = "";
        }}
      />

      {action ? (
        <button
          type="button"
          disabled={busy}
          onClick={pickPhoto}
          className="display cursor-pointer rounded-full border-2 border-ink bg-paper px-3 py-1 text-xs text-ink transition-colors hover:bg-sky disabled:cursor-not-allowed disabled:opacity-40"
        >
          {photo ? "Trocar a foto" : "Usar uma foto"}
        </button>
      ) : null}

      {cropping ? (
        <PhotoCropper
          file={cropping}
          busy={busy}
          onCancel={() => setCropping(null)}
          onDone={(picked) => {
            setCropping(null);
            onPhoto(picked);
          }}
        />
      ) : null}
    </div>
  );
}
