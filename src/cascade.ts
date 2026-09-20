export type CascadeTriage = {
  intent: string;
  intentConfidence: number;
  complexity: number;
};

export type CascadeHandlers<TMsg, TOut> = {
  onCode: (msg: TMsg, triage: CascadeTriage) => Promise<TOut> | TOut;
  onLlm: (msg: TMsg, triage: CascadeTriage) => Promise<TOut> | TOut;
  onHuman: (msg: TMsg, triage: CascadeTriage) => Promise<TOut> | TOut;
  /** Intents that never need an LLM. */
  codeIntents: Set<string>;
  minConfidence?: number;
  llmComplexityAt?: number;
};

export class Cascade<TMsg, TOut> {
  constructor(private handlers: CascadeHandlers<TMsg, TOut>) {}

  async handle(msg: TMsg, triage: CascadeTriage): Promise<TOut> {
    const minC = this.handlers.minConfidence ?? 0.5;
    const llmAt = this.handlers.llmComplexityAt ?? 1.0;

    if (triage.intentConfidence < minC) {
      return this.handlers.onHuman(msg, triage);
    }
    if (this.handlers.codeIntents.has(triage.intent) && triage.complexity < llmAt) {
      return this.handlers.onCode(msg, triage);
    }
    if (triage.complexity >= llmAt + 1) {
      return this.handlers.onHuman(msg, triage);
    }
    return this.handlers.onLlm(msg, triage);
  }
}
