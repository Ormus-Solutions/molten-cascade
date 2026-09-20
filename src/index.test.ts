import { describe, it, expect } from 'vitest';
import {
  runCascade,
  mockJevTriage,
  mockCodeStage,
  mockLlmStage,
} from './index.js';

const handlers = {
  jev: mockJevTriage,
  code: mockCodeStage,
  llm: mockLlmStage,
  acceptAbove: 0.8,
};

describe('molten-cascade', () => {
  it('stops at jev for trivial intents', async () => {
    const r = await runCascade({ id: 'a', intent: 'ping health', payload: {} }, handlers);
    expect(r.stage).toBe('jev');
    expect(r.path).toEqual(['jev']);
    expect(r.value).toBe('pong');
  });

  it('uses code for normalize', async () => {
    const r = await runCascade(
      { id: 'b', intent: 'normalize text', payload: { text: '  X  Y ' } },
      handlers,
    );
    expect(r.stage).toBe('code');
    expect(r.value).toBe('x y');
    expect(r.path).toContain('code');
  });

  it('falls through to llm stub for hard intents', async () => {
    const r = await runCascade(
      { id: 'c', intent: 'write a careful legal summary', payload: {} },
      handlers,
    );
    expect(r.stage).toBe('llm');
    expect(r.path).toEqual(['jev', 'code', 'llm']);
    expect(String(r.value)).toMatch(/^llm-stub:/);
  });
});
