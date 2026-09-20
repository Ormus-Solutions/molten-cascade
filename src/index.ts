/**
 * @ormus/molten-cascade — Pattern 4: Jev triage → deterministic code → frontier LLM.
 * Spend intelligence only on the hard minority.
 */

export type CascadeStage = 'jev' | 'code' | 'llm';

export interface CascadeTicket {
  id: string;
  intent: string;
  payload: Record<string, unknown>;
}

export interface StageOutcome<T = unknown> {
  stage: CascadeStage;
  handled: boolean;
  value?: T;
  confidence: number;
  notes?: string;
}

export interface CascadeResult<T = unknown> {
  ticketId: string;
  stage: CascadeStage;
  value?: T;
  confidence: number;
  path: CascadeStage[];
  notes: string[];
}

export interface CascadeHandlers<T = unknown> {
  /** Cheap System-One / Jev-style classifier. */
  jev: (ticket: CascadeTicket) => Promise<StageOutcome<T>> | StageOutcome<T>;
  /** Deterministic middle (rules, parsers, pure functions). */
  code: (ticket: CascadeTicket, prior: StageOutcome<T>) => Promise<StageOutcome<T>> | StageOutcome<T>;
  /** Frontier LLM for residual hard cases. */
  llm: (ticket: CascadeTicket, prior: StageOutcome<T>) => Promise<StageOutcome<T>> | StageOutcome<T>;
  /** Confidence to accept a stage without escalating. */
  acceptAbove?: number;
}

export async function runCascade<T = unknown>(
  ticket: CascadeTicket,
  handlers: CascadeHandlers<T>,
): Promise<CascadeResult<T>> {
  const acceptAbove = handlers.acceptAbove ?? 0.8;
  const path: CascadeStage[] = [];
  const notes: string[] = [];

  const jevOut = await handlers.jev(ticket);
  path.push('jev');
  if (jevOut.notes) notes.push(jevOut.notes);
  if (jevOut.handled && jevOut.confidence >= acceptAbove) {
    return { ticketId: ticket.id, stage: 'jev', value: jevOut.value, confidence: jevOut.confidence, path, notes };
  }

  const codeOut = await handlers.code(ticket, jevOut);
  path.push('code');
  if (codeOut.notes) notes.push(codeOut.notes);
  if (codeOut.handled && codeOut.confidence >= acceptAbove) {
    return { ticketId: ticket.id, stage: 'code', value: codeOut.value, confidence: codeOut.confidence, path, notes };
  }

  const llmOut = await handlers.llm(ticket, codeOut);
  path.push('llm');
  if (llmOut.notes) notes.push(llmOut.notes);
  return {
    ticketId: ticket.id,
    stage: 'llm',
    value: llmOut.value,
    confidence: llmOut.confidence,
    path,
    notes,
  };
}

/** Built-in mock triage for demos/tests — keyword heuristics only. */
export function mockJevTriage(ticket: CascadeTicket): StageOutcome<string> {
  const intent = ticket.intent.toLowerCase();
  if (intent.includes('ping') || intent.includes('health')) {
    return { stage: 'jev', handled: true, value: 'pong', confidence: 0.99, notes: 'trivial health' };
  }
  if (intent.includes('parse') || intent.includes('normalize')) {
    return { stage: 'jev', handled: false, value: undefined, confidence: 0.55, notes: 'defer to code' };
  }
  return { stage: 'jev', handled: false, confidence: 0.4, notes: 'ambiguous — escalate' };
}

export function mockCodeStage(ticket: CascadeTicket): StageOutcome<string> {
  const raw = String(ticket.payload['text'] ?? '');
  if (ticket.intent.toLowerCase().includes('normalize') && raw) {
    return {
      stage: 'code',
      handled: true,
      value: raw.trim().toLowerCase().replace(/\s+/g, ' '),
      confidence: 0.95,
      notes: 'deterministic normalize',
    };
  }
  return { stage: 'code', handled: false, confidence: 0.3, notes: 'no deterministic rule' };
}

export function mockLlmStage(ticket: CascadeTicket): StageOutcome<string> {
  return {
    stage: 'llm',
    handled: true,
    value: `llm-stub:${ticket.intent}`,
    confidence: 0.7,
    notes: 'frontier stub (no live API)',
  };
}
