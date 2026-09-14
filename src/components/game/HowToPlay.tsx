"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { flipSevenBonus, targetScore } from "@/lib/game/rules";

interface HowToPlayProps {
  onClose: () => void;
}

function Good({ children }: { children: ReactNode }) {
  return <strong className="display font-normal text-teal">{children}</strong>;
}

function Bad({ children }: { children: ReactNode }) {
  return (
    <strong className="display font-normal text-flame underline decoration-flame/40 decoration-2 underline-offset-2">
      {children}
    </strong>
  );
}

function Gold({ children }: { children: ReactNode }) {
  return <strong className="display font-normal text-gold-deep">{children}</strong>;
}

interface Slide {
  title: string;
  tone: string;
  art: ReactNode;
  body: ReactNode;
}

function CardFace({ value, tint }: { value: string; tint: string }) {
  return (
    <span
      className={`display flex h-16 w-12 items-center justify-center rounded-xl border-2 border-ink text-2xl ${tint}`}
    >
      {value}
    </span>
  );
}

const slides: Slide[] = [
  {
    title: "Presta atenção, benção!",
    tone: "foil-band animate-foil-slide text-ink",
    art: (
      <div className="flex items-end justify-center gap-1.5">
        <CardFace value="3" tint="bg-paper text-ink" />
        <CardFace value="8" tint="bg-paper text-ink" />
        <CardFace value="11" tint="bg-paper text-ink" />
      </div>
    ),
    body: (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-base leading-snug text-ink/80">
          Na sua vez você escolhe: <Good>vira</Good> mais uma carta ou <Good>para</Good> e guarda o
          que já tem.
        </p>
        <div className="rounded-2xl border-2 border-ink bg-paper p-3">
          <p className="text-sm leading-snug text-ink/80">Virou um número que ainda não tinha?</p>
          <p className="display mt-1 text-lg leading-tight text-teal">Segue vivo</p>
        </div>
        <p className="text-sm leading-snug text-ink/75">
          O app não vira carta nenhuma. Ele só guarda o que aconteceu na mesa e faz a conta pra
          você.
        </p>
      </div>
    ),
  },
  {
    title: "Repetiu, estourou",
    tone: "bg-flame text-paper",
    art: (
      <div className="flex items-end justify-center gap-1.5">
        <CardFace value="9" tint="bg-paper text-ink" />
        <CardFace value="9" tint="bg-flame-soft text-ink" />
      </div>
    ),
    body: (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm leading-snug text-ink/75">
          Virou um número que <Bad>você já tinha</Bad>? Acabou a rodada pra você.
        </p>
        <div className="rounded-2xl border-2 border-ink bg-flame-soft p-3">
          <p className="display text-xl leading-tight text-ink">Estourou é zero.</p>
          <p className="mt-1 text-xs font-semibold text-ink/75">
            Não importa quanto tinha acumulado. A rodada inteira vira nada.
          </p>
        </div>
        <p className="text-sm leading-snug text-ink/75">
          E o baralho não é justo: existem <Bad>doze cartas 12</Bad> e só <Good>uma carta 1</Good>.
          Quanto mais alto o número que falta, maior a chance dele aparecer.
        </p>
      </div>
    ),
  },
  {
    title: "Sete diferentes, prêmio",
    tone: "bg-teal text-paper",
    art: (
      <div className="flex items-end justify-center gap-1">
        {["1", "4", "6", "7", "9", "10", "12"].map((value) => (
          <span
            key={value}
            className="display flex h-12 w-7 items-center justify-center rounded-lg border-2 border-ink bg-paper text-sm text-ink"
          >
            {value}
          </span>
        ))}
      </div>
    ),
    body: (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm leading-snug text-ink/75">
          Fechou <Good>sete números diferentes</Good> sem estourar? Isso é o Flip 7.
        </p>
        <div className="rounded-2xl border-2 border-ink bg-aqua p-3">
          <p className="display text-2xl leading-tight text-ink">+{flipSevenBonus} pontos</p>
          <p className="mt-1 text-xs font-semibold text-ink/75">
            O app marca sozinho assim que você toca no sétimo número.
          </p>
        </div>
        <p className="text-sm leading-snug text-ink/75">
          Ainda tem as cartas <Gold>x2</Gold>, <Gold>+2</Gold>, <Gold>+4</Gold>, <Gold>+6</Gold>,{" "}
          <Gold>+8</Gold> e <Gold>+10</Gold>. O x2 dobra a soma dos números; os outros entram
          depois.
        </p>
        <div className="rounded-2xl border-4 border-ink bg-paper p-3">
          <p className="display text-lg leading-tight text-ink">Vence quem chegar a</p>
          <p className="display text-3xl leading-tight text-flame">{targetScore} pontos</p>
        </div>
      </div>
    ),
  },
];

export function HowToPlay({ onClose }: HowToPlayProps) {
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const last = step === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/80 p-3 sm:items-center sm:p-4">
      <div className="animate-card-pop flex max-h-[calc(100dvh-1.5rem)] w-full max-w-sm flex-col overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
        <div className={`shrink-0 px-5 pb-4 pt-5 text-center ${slide.tone}`}>
          {slide.art}
          <h2 className="display mt-3 text-2xl leading-tight text-balance">{slide.title}</h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{slide.body}</div>

        <div className="shrink-0 border-t-2 border-ink/10 px-5 pb-5 pt-4">
          <div className="mb-3 flex items-center justify-center gap-2.5">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setStep(index)}
                aria-label={`Ir para a parte ${index + 1}: ${item.title}`}
                aria-current={index === step}
                className={`display flex h-8 w-6 items-center justify-center rounded-md border-2 border-ink text-xs transition-all duration-200 ${
                  index === step
                    ? "scale-110 bg-gold text-ink"
                    : "bg-paper text-ink/40 hover:text-ink"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 ? (
              <Button variant="paper" fullWidth onClick={() => setStep(step - 1)}>
                Como é mesmo?
              </Button>
            ) : null}
            <Button
              variant={last ? "flame" : "ink"}
              fullWidth
              onClick={() => (last ? onClose() : setStep(step + 1))}
            >
              {last ? "Valeu, pai. Entendido" : "Saquei"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
