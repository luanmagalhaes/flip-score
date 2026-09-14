"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { CardArt } from "@/components/game/CardArt";
import { flipSevenBonus, flipSevenCount, targetScore } from "@/lib/game/rules";
import { maxPlayers, minPlayers } from "@/lib/game/limits";

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

function Original({ children }: { children: ReactNode }) {
  return (
    <span className="display rounded-md bg-ink px-1.5 py-0.5 text-[0.7rem] text-paper">
      {children}
    </span>
  );
}

interface Slide {
  title: string;
  tone: string;
  art: ReactNode;
  body: ReactNode;
}

const slides: Slide[] = [
  {
    title: "Mas por que Flip 7?",
    tone: "foil-band animate-foil-slide text-ink",
    art: (
      <div className="flex items-end justify-center gap-1">
        {["1", "4", "6", "7", "9", "10", "12"].map((value) => (
          <span
            key={value}
            className="display flex h-11 w-7 items-center justify-center rounded-lg border-2 border-ink bg-paper text-sm text-ink"
          >
            {value}
          </span>
        ))}
      </div>
    ),
    body: (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-base leading-snug text-ink/80">
          O nome vem do prêmio máximo do jogo: virar{" "}
          <Good>{flipSevenCount} números diferentes</Good> numa rodada só.
        </p>
        <div className="rounded-2xl border-2 border-ink bg-aqua p-3">
          <p className="display text-2xl leading-tight text-ink">Flip 7 = +{flipSevenBonus}</p>
          <p className="mt-1 text-xs font-semibold text-ink/75">
            Além de somar os números, você ganha esse bônus de presente.
          </p>
        </div>
        <p className="text-sm leading-snug text-ink/75">
          Parece fácil, mas cada carta nova é uma chance de repetir um número que você já tem. E
          repetir <Bad>zera a rodada inteira</Bad>.
        </p>
        <p className="text-sm leading-snug text-ink/75">
          A corrida vai até <Gold>{targetScore} pontos</Gold>, somando rodada após rodada.
        </p>
      </div>
    ),
  },
  {
    title: "Como anda a rodada",
    tone: "bg-teal text-paper",
    art: (
      <div className="flex items-end justify-center gap-1.5">
        <CardArt face="number" label="3" note="three" />
        <CardArt face="number" label="8" note="eight" />
        <CardArt face="number" label="11" note="eleven" />
      </div>
    ),
    body: (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm leading-snug text-ink/75">
          Ninguém recebe mão inicial. Quem dá as cartas entrega{" "}
          <Good>uma carta virada para cima</Good> a cada pessoa, uma de cada vez.
        </p>
        <div className="rounded-2xl border-2 border-ink bg-paper p-3">
          <p className="text-sm leading-snug text-ink/80">Na sua vez você decide:</p>
          <p className="display mt-1 text-lg leading-tight text-teal">
            pedir mais uma ou parar
          </p>
          <p className="mt-1 text-xs font-semibold text-ink/65">
            Parou, os pontos são seus e você sai desta rodada.
          </p>
        </div>
        <p className="text-sm leading-snug text-ink/75">
          A rodada acaba quando todo mundo parou ou estourou — ou quando alguém fecha o Flip 7.
        </p>
      </div>
    ),
  },
  {
    title: "Repetiu, estourou",
    tone: "bg-flame text-paper",
    art: (
      <div className="flex items-end justify-center gap-1.5">
        <CardArt face="number" label="9" note="nine" />
        <CardArt face="number" label="9" note="nine" className="rotate-6 opacity-70" />
      </div>
    ),
    body: (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm leading-snug text-ink/75">
          Virou um número que <Bad>você já tinha</Bad>? A rodada acabou e você fica com{" "}
          <Bad>zero</Bad>, por maior que fosse.
        </p>
        <div className="rounded-2xl border-2 border-ink bg-flame-soft p-3">
          <p className="display text-lg leading-tight text-ink">O baralho não é justo</p>
          <p className="mt-1 text-xs font-semibold text-ink/75">
            Existe <strong>uma</strong> carta 1, <strong>duas</strong> cartas 2, e assim por diante
            até <strong>doze</strong> cartas 12.
          </p>
        </div>
        <p className="text-sm leading-snug text-ink/75">
          Ou seja: quanto mais alto o número que falta para você, maior a chance dele reaparecer.
          Números altos valem mais e assustam mais.
        </p>
      </div>
    ),
  },
  {
    title: "As cartas especiais",
    tone: "bg-sky text-ink",
    art: (
      <div className="flex items-end justify-center gap-1.5">
        <CardArt face="freeze" label="FREEZE" />
        <CardArt face="flipthree" label="FLIP THREE" />
        <CardArt face="second" label="SECOND CHANCE" />
      </div>
    ),
    body: (
      <div className="flex flex-col gap-3">
        <p className="text-center text-xs font-semibold text-ink/60">
          Suas cartas são em inglês, então segue o nome original e o que fazer com cada uma.
        </p>

        <div className="rounded-2xl border-2 border-ink bg-sky p-3">
          <div className="flex items-center gap-2">
            <Original>FREEZE</Original>
            <span className="display text-sm text-ink">Congelar</span>
          </div>
          <p className="mt-1.5 text-xs leading-snug text-ink/80">
            Quem recebe <Good>para na hora</Good>, guarda os pontos que já tinha e sai da rodada.
            Pode ser dada a qualquer pessoa ainda viva, inclusive você.
          </p>
        </div>

        <div className="rounded-2xl border-2 border-ink bg-gold p-3">
          <div className="flex items-center gap-2">
            <Original>FLIP THREE</Original>
            <span className="display text-sm text-ink">Vire três</span>
          </div>
          <p className="mt-1.5 text-xs leading-snug text-ink/80">
            Quem recebe é obrigado a virar <Bad>três cartas seguidas</Bad>. Só para antes se
            estourar ou fechar o Flip 7. É a carta mais cruel do baralho.
          </p>
        </div>

        <div className="rounded-2xl border-2 border-ink bg-flame-soft p-3">
          <div className="flex items-center gap-2">
            <Original>SECOND CHANCE</Original>
            <span className="display text-sm text-ink">Segunda chance</span>
          </div>
          <p className="mt-1.5 text-xs leading-snug text-ink/80">
            Guarde na frente. Quando vier o número repetido, descarte os dois e{" "}
            <Good>continue vivo</Good>. Vale só contra número repetido, não contra o Freeze.
          </p>
        </div>

        <p className="text-center text-xs text-ink/60">
          Carta de ação recebida quando você é o último de pé tem que ser usada em você mesmo.
        </p>
      </div>
    ),
  },
  {
    title: "As cartas de bônus",
    tone: "bg-gold text-ink",
    art: (
      <div className="flex items-end justify-center gap-1.5">
        <CardArt face="modifier" label="x2" />
        <CardArt face="modifier" label="+6" />
        <CardArt face="modifier" label="+10" />
      </div>
    ),
    body: (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm leading-snug text-ink/75">
          São seis: <Gold>x2</Gold>, <Gold>+2</Gold>, <Gold>+4</Gold>, <Gold>+6</Gold>,{" "}
          <Gold>+8</Gold> e <Gold>+10</Gold>.
        </p>
        <div className="rounded-2xl border-2 border-ink bg-paper p-3 text-left">
          <p className="display text-sm text-ink">A ordem da conta importa</p>
          <ol className="mt-1.5 flex flex-col gap-1 text-xs text-ink/80">
            <li>1. Soma as cartas de número</li>
            <li>
              2. Dobra com o <Gold>x2</Gold>, se tiver
            </li>
            <li>3. Só então soma os bônus fixos</li>
            <li>4. E acrescenta os +{flipSevenBonus} do Flip 7</li>
          </ol>
          <p className="mt-2 text-xs font-semibold text-ink/60">
            O app faz isso sozinho. É só tocar no que apareceu na mesa.
          </p>
        </div>
        <p className="text-sm leading-snug text-ink/75">
          Bônus não é número: ter o <Gold>+10</Gold> não conta para fechar o Flip 7.
        </p>
      </div>
    ),
  },
  {
    title: "Quem cabe na mesa",
    tone: "foil-band animate-foil-slide text-ink",
    art: (
      <div className="flex items-end justify-center gap-1">
        {[3, 6, 9, 12].map((value) => (
          <span
            key={value}
            className="display flex h-11 w-9 items-center justify-center rounded-lg border-2 border-ink bg-paper text-sm text-ink"
          >
            {value}
          </span>
        ))}
      </div>
    ),
    body: (
      <div className="flex flex-col gap-3 text-center">
        <div className="rounded-2xl border-2 border-ink bg-paper p-3">
          <p className="display text-xl leading-tight text-ink">De 3 a 18 pessoas</p>
          <p className="mt-1 text-xs font-semibold text-ink/70">
            É o que a caixa permite. Com muita gente o baralho acaba rápido e é embaralhado de novo
            no meio da rodada.
          </p>
        </div>
        <p className="text-sm leading-snug text-ink/75">
          Aqui no app dá para marcar até <Good>{maxPlayers} pessoas</Good>, que é onde o placar
          ainda cabe na tela do celular sem virar sopa de letrinha. O mínimo é {minPlayers}.
        </p>
        <div className="rounded-2xl border-2 border-dashed border-ink/35 p-3">
          <p className="text-xs leading-snug text-ink/75">
            <strong className="text-ink">E em duplas?</strong> O jogo não tem modo de times nas
            regras oficiais. Se a mesa quiser jogar assim, dá para somar os pontos de dois em dois
            no fim — mas isso é combinado de vocês, não regra da caixa.
          </p>
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
        <div className={`shrink-0 px-4 pb-4 pt-5 text-center ${slide.tone}`}>
          {slide.art}
          <h2 className="display mt-3 text-2xl leading-tight text-balance">{slide.title}</h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">{slide.body}</div>

        <div className="shrink-0 border-t-2 border-ink/10 px-4 pb-4 pt-3">
          <div className="mb-3 flex items-center justify-center gap-1.5">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setStep(index)}
                aria-label={`Ir para a parte ${index + 1}: ${item.title}`}
                aria-current={index === step}
                className={`display flex h-7 w-6 items-center justify-center rounded-md border-2 border-ink text-[0.7rem] transition-all duration-200 ${
                  index === step ? "scale-110 bg-gold text-ink" : "bg-paper text-ink/40"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 ? (
              <Button variant="paper" fullWidth onClick={() => setStep(step - 1)}>
                Voltar
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
