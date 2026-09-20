# molten-cascade

> System One skims the slag. Code hammers what is sharp. Frontier fire only for the stubborn ore.

**@ormus/molten-cascade** implements **Jev Pattern 4**: a three-stage pour — **Jev triage → deterministic code → LLM**. Most tickets should never touch the expensive burner.

Paraphrased from the cascade ideas in public **TypeSafe / Vercel Jev** materials and the accessible **master-Jev** curriculum: escalate only when confidence and determinism both fail.

## Install

```bash
npm i @ormus/molten-cascade
```

## Quick pour

```ts
import { runCascade, mockJevTriage, mockCodeStage, mockLlmStage } from '@ormus/molten-cascade';

await runCascade(
  { id: '1', intent: 'normalize text', payload: { text: '  Hi ' } },
  { jev: mockJevTriage, code: mockCodeStage, llm: mockLlmStage },
);
```

Swap mocks for real Jev Nouls / AI SDK calls when you wire production.

## Liquid Gold siblings

| Repo | Role |
|------|------|
| [aurum-gate](https://github.com/Ormus-Solutions/aurum-gate) | Pattern 2 gates |
| [quicksilver-judge](https://github.com/Ormus-Solutions/quicksilver-judge) | Raven pre-filter |
| [gold-assay](https://github.com/Ormus-Solutions/gold-assay) | Vibium assay |
| [molten-cascade](https://github.com/Ormus-Solutions/molten-cascade) | **You are here** — Pattern 4 |
| [karat-filter](https://github.com/Ormus-Solutions/karat-filter) | Pattern 5 |
| [liquid-gold](https://github.com/Ormus-Solutions/liquid-gold) | Index |

## Scripts

```bash
npm test
npm run build
```

## License

MIT © 2026 Ormus Solutions
