import {
  runCascade,
  mockJevTriage,
  mockCodeStage,
  mockLlmStage,
} from './index.js';

console.log('=== Molten Cascade — Jev → code → LLM ===\n');

const handlers = {
  jev: mockJevTriage,
  code: (t: Parameters<typeof mockCodeStage>[0]) => mockCodeStage(t),
  llm: (t: Parameters<typeof mockLlmStage>[0]) => mockLlmStage(t),
  acceptAbove: 0.8,
};

const tickets = [
  { id: '1', intent: 'health ping', payload: {} },
  { id: '2', intent: 'normalize text', payload: { text: '  Hello   WORLD ' } },
  { id: '3', intent: 'draft a nuanced apology', payload: { customer: 'A' } },
];

for (const t of tickets) {
  const r = await runCascade(t, handlers);
  console.log(`#${r.ticketId} @${r.stage}:`, r.value, '| path:', r.path.join('→'));
}
