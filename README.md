# 🃏 Flip Score

> O placar da mesa, com a cara de quem está jogando.

**Flip Score** é um marcador de pontos para um jogo de cartas de corrida até **200 pontos**. As cartas são as de verdade, na mesa: o app só guarda o que aconteceu, faz a conta e mostra quem está na frente.

Cada pessoa entra na mesa com **nome e foto**. A foto fica só no aparelho, nunca sai dele.

---

## 🎯 O que ele faz

| | |
| --- | --- |
| 📸 | Foto de cada jogador, tirada na hora ou escolhida da galeria |
| 🧮 | Soma dos números, multiplicador `x2` e bônus `+2` a `+10` na ordem certa |
| 🎉 | Marca o bônus do **Sete** sozinho quando o sétimo número diferente é tocado |
| 💥 | Um toque para registrar quem estourou e zerar a rodada |
| 🏁 | Confete e a foto do campeão quando alguém cruza os 200 |
| ↩️ | Apagar a última rodada quando a mesa erra o lançamento |
| 📖 | Carrossel de regras para quem nunca jogou |

## 🧮 Como a conta é feita

A ordem importa e é a das regras oficiais:

1. Soma as cartas de número (repetido não conta duas vezes)
2. Aplica o `x2`, se houver
3. Só então soma os bônus fixos (`+2`, `+4`, `+6`, `+8`, `+10`)
4. Acrescenta **+15** se fecharam sete números diferentes
5. Quem estourou termina em **0**, por maior que fosse a rodada

Tudo isso vive em funções puras cobertas por teste, inclusive os casos que costumam passar batido, como multiplicador com bônus junto e Sete de quem estourou.

## 🔒 Onde ficam os dados

Nenhum servidor. A partida inteira — jogadores, fotos e rodadas — fica no `localStorage` do aparelho que está marcando. Funciona **offline**, que é como um jogo de mesa costuma acontecer. Encerrar a partida apaga tudo, fotos inclusive.

## 🛠️ Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** strict
- **Tailwind CSS 4** — `@theme` e `@utility`, sem arquivo de config
- **Vitest** para as regras de pontuação
- Confete em `<canvas>`, sem biblioteca

## 🚀 Rodando

```bash
pnpm install
pnpm dev        # http://localhost:1000
pnpm test
pnpm lint
pnpm build
pnpm icons      # regenera todos os tamanhos a partir de src/app/icon.svg
```

Não precisa de variável de ambiente nenhuma.

## 🎨 Cores

Azul-marinho `#1d2060`, turquesa `#05a2a2`, dourado `#f2c14e`, vermelho `#e8483c` e um degradê foil que atravessa turquesa, céu, rosa e dourado.
