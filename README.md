This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Feriados

O calendário mostra feriados nacionais e de Goiânia, incluindo Sexta-feira da Paixão e Corpus Christi. Pontos facultativos, como Carnaval, não são marcados como feriados.

A Fundação da Cidade de Goiás é indicada para repartições estaduais. Sua data legal é 26 de julho, mas pode ser transferida por decreto; estão incluídas as transferências conhecidas para [2025](https://legisla.casacivil.go.gov.br/api/v2/pesquisa/legislacoes/110964/pdf) e [2026](https://legisla.casacivil.go.gov.br/pesquisa_legislacao/115759/decreto-numerado-10935). Outras transferências devem ser atualizadas manualmente em `src/lib/holidays.ts`. Confira também as leis municipais sobre [24 de outubro](https://www.goiania.go.gov.br/html/gabinete_civil/sileg/dados/legis/1991/lo_19910619_000006968.html) e [os feriados religiosos](https://feriados.net.br/2026/go/goiania/).

Para testar os cálculos de feriados, use Node.js 22.18 ou superior:

```bash
node --test scripts/holidays.test.mjs
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
