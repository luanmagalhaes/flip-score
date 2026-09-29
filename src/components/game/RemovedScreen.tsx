"use client";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { RoomPhase, type RoomRow } from "@/types/room";

interface RemovedScreenProps {
  room: RoomRow;
  onHome: () => void;
}

export function RemovedScreen({ room, onHome }: RemovedScreenProps) {
  return (
    <Screen
      footer={
        <Button variant="ink" size="lg" fullWidth onClick={onHome}>
          Voltar para o início
        </Button>
      }
    >
      <header className="mb-6 flex justify-end">
        <Wordmark size="sm" className="opacity-50" />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <span className="display text-3xl text-ink">Você saiu desta mesa</span>
        <p className="max-w-xs text-sm font-semibold text-ink/60">
          {room.phase === RoomPhase.Lobby
            ? `Quem abriu a sala tirou você. Se foi engano, entre de novo com o código ${room.code}.`
            : `Quem abriu a sala tirou você da partida ${room.code}. Como ela já começou, não dá para voltar nela.`}
        </p>
      </div>
    </Screen>
  );
}
