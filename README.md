# 🃏 Flip Score

> O placar do Flip 7, com a cara de quem está jogando.

**Flip Score** é um marcador de pontos para o jogo de cartas **Flip 7**. As cartas são as de verdade, na mesa — o app só guarda o que aconteceu, faz a conta e mostra quem está ganhando a corrida até **200 pontos**.

Cada pessoa entra na mesa com **nome e foto**. A foto fica só no aparelho, nunca sai dele.

---

## 🎯 O que ele faz

| | |
| --- | --- |
| 📸 | Foto de cada jogador, tirada na hora ou escolhida da galeria |
| 🧮 | Soma dos números, multiplicador `x2` e bônus `+2` a `+10` na ordem certa |
| 🎉 | Marca o **Flip 7** sozinho quando o sétimo número diferente é tocado |
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

Tudo isso vive em funções puras cobertas por teste — inclusive os casos que costumam passar batido, como multiplicador com bônus junto e Flip 7 de quem estourou.

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

Amostradas da arte oficial do Flip 7: azul-marinho `#1d2060`, turquesa `#05a2a2`, dourado `#f2c14e`, vermelho `#e8483c`, e o degradê foil que atravessa turquesa, céu, rosa e dourado — o metalizado da caixa.

---

Flip 7 é um jogo de Eric Olsen, publicado pela The Op. Este é um marcador de pontos independente, feito por fã, sem vínculo com a editora.
