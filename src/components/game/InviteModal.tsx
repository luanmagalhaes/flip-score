"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface InviteModalProps {
  code: string;
  roundNumber: number;
  onClose: () => void;
}

export function InviteModal({ code, roundNumber, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const share = async () => {
    try {
      await navigator.share({
        title: "Flip Score",
        text: `Senta aqui na mesa! Entre em ${window.location.origin} com o código ${code}.`,
      });
    } catch {
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-[58] flex items-end justify-center bg-ink/75 p-3 sm:items-center sm:p-4">
      <div className="animate-card-pop flex max-h-[calc(100dvh-2rem)] w-full max-w-sm flex-col overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
        <div className="shrink-0 bg-teal px-5 py-4 text-paper">
          <span className="display block text-xl leading-tight">Chamar mais alguém</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 text-sm text-ink/75">
          <button
            type="button"
            onClick={copyCode}
            className="w-full cursor-pointer rounded-3xl border-2 border-ink bg-aqua p-5 text-center text-ink shadow-[0_6px_0_var(--color-ink)] transition-transform hover:-translate-y-[2px] active:translate-y-[2px]"
          >
            <span className="display block text-xs uppercase tracking-[0.2em] opacity-65">
              Código da sala
            </span>
            <span className="display mt-2 block pb-1 text-5xl leading-tight tracking-[0.2em]">
              {code}
            </span>
            <span className="mt-2 block text-xs font-semibold opacity-70">
              {copied ? "Código copiado!" : "Toque para copiar"}
            </span>
          </button>

          <ul className="mt-4 flex flex-col gap-1.5 text-xs">
            <li className="rounded-xl bg-sky/50 px-3 py-2">
              A pessoa entra pelo mesmo endereço do jogo, com esse código
            </li>
            <li className="rounded-xl bg-sky/50 px-3 py-2">
              Quem senta agora começa com 0 ponto e lança a partir da rodada {roundNumber}
            </li>
          </ul>
        </div>

        <div className="shrink-0 border-t-2 border-ink/10 px-5 pb-5 pt-4">
          <div className="flex flex-col gap-2">
            {canShare ? (
              <Button variant="ink" size="lg" fullWidth onClick={() => void share()}>
                Mandar o convite
              </Button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="display cursor-pointer rounded-xl px-3 py-2 text-sm text-ink/55 transition-colors hover:text-ink"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
