"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { brand } from "@/data/copy";
import { shrinkPhoto } from "@/lib/photo";
import { targetScore } from "@/lib/game/rules";
import { maxPlayers, minPlayers } from "@/lib/game/limits";
import { players as playerLabel } from "@/utils/plural";
import type { Player } from "@/types/game";

interface SetupScreenProps {
  roster: Player[];
  onAdd: (name: string, photo: string | null) => void;
  onRemove: (playerId: string) => void;
  onStart: () => void;
  onRules: () => void;
}

export function SetupScreen({ roster, onAdd, onRemove, onStart, onRules }: SetupScreenProps) {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ready = name.trim().length > 0 && roster.length < maxPlayers;
  const enough = roster.length >= minPlayers;

  const pick = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    setWorking(true);
    setProblem(null);

    try {
      setPhoto(await shrinkPhoto(file));
    } catch {
      setProblem("Não consegui usar essa foto. Tente outra.");
    } finally {
      setWorking(false);
    }
  };

  const add = () => {
    if (!ready) {
      return;
    }

    const clean = name.trim();

    if (roster.some((person) => person.name.toLowerCase() === clean.toLowerCase())) {
      setProblem("Já tem alguém com esse nome na mesa.");

      return;
    }

    onAdd(clean, photo);
    setName("");
    setPhoto(null);
    setProblem(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  return (
    <Screen
      footer={
        <div className="flex flex-col gap-2">
          <Button variant="flame" size="lg" fullWidth disabled={!enough} onClick={onStart}>
            {enough
              ? `Começar a corrida até ${targetScore}`
              : `Faltam ${minPlayers - roster.length} para começar`}
          </Button>
          <button
            type="button"
            onClick={onRules}
            className="display cursor-pointer rounded-xl px-3 py-1.5 text-sm text-ink/60 transition-colors hover:text-ink"
          >
            Como se joga?
          </button>
        </div>
      }
    >
      <header className="mb-6 overflow-hidden text-center">
        <div className="animate-rise-in">
          <Wordmark size="md" />
        </div>
        <p className="mt-2 text-sm font-semibold text-ink/65">{brand.tagline}</p>
      </header>

      <section className="deco-card mb-6 rounded-3xl border-4 border-ink bg-paper p-4">
        <span className="display block text-xs uppercase tracking-[0.18em] text-ink/50">
          Quem está jogando
        </span>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={working}
            aria-label="Escolher a foto de quem vai entrar"
            className="relative shrink-0 cursor-pointer rounded-2xl transition-transform duration-150 hover:-translate-y-[2px]"
          >
            <Avatar name={name || "?"} photo={photo} size="lg" />
            <span className="display absolute -bottom-1 -right-1 rounded-lg border-2 border-ink bg-gold px-1.5 py-0.5 text-[0.6rem] text-ink">
              {photo ? "trocar" : "foto"}
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  add();
                }
              }}
              placeholder="Nome de quem entra"
              maxLength={20}
              autoComplete="off"
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck={false}
              lang="pt-BR"
              className="w-full rounded-2xl border-2 border-ink bg-cream px-4 py-3 text-base text-ink outline-none placeholder:text-ink/35 focus:ring-4 focus:ring-teal/25"
            />
            <p className="mt-1.5 text-xs text-ink/55">
              A foto é opcional e fica só neste aparelho.
            </p>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void pick(event.target.files?.[0])}
        />

        {problem ? (
          <p className="mt-3 rounded-2xl border-2 border-ink bg-flame px-3 py-2 text-xs font-semibold text-paper">
            {problem}
          </p>
        ) : null}

        <div className="mt-3">
          <Button variant="teal" fullWidth disabled={!ready || working} onClick={add}>
            {working ? "Preparando a foto..." : "Colocar na mesa"}
          </Button>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="display text-lg text-ink">Na mesa</h2>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink/45">
            {playerLabel(roster.length)} de {maxPlayers}
          </span>
        </div>

        {roster.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-ink/30 p-5 text-center text-sm text-ink/55">
            Ninguém na mesa ainda. Coloque pelo menos {minPlayers} para começar.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {roster.map((person) => (
              <li
                key={person.id}
                className="animate-card-pop flex items-center gap-3 rounded-2xl border-2 border-ink bg-paper p-2.5"
              >
                <Avatar name={person.name} photo={person.photo} size="md" />
                <span className="display min-w-0 flex-1 truncate text-ink">{person.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(person.id)}
                  aria-label={`Tirar ${person.name} da mesa`}
                  className="display shrink-0 cursor-pointer rounded-lg px-2 py-1 text-xs text-ink/40 transition-colors hover:bg-flame hover:text-paper"
                >
                  tirar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Screen>
  );
}
