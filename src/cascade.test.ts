import { describe, expect, it } from "vitest";
import { Cascade } from "./cascade.js";

describe("Cascade", () => {
  const c = new Cascade<string, string>({
    codeIntents: new Set(["order_status"]),
    onCode: async () => "code",
    onLlm: async () => "llm",
    onHuman: async () => "human",
  });

  it("routes low confidence to human", async () => {
    await expect(
      c.handle("hi", { intent: "order_status", intentConfidence: 0.2, complexity: 0 }),
    ).resolves.toBe("human");
  });

  it("routes simple code intent to code", async () => {
    await expect(
      c.handle("hi", { intent: "order_status", intentConfidence: 0.9, complexity: 0.2 }),
    ).resolves.toBe("code");
  });

  it("routes other intents to llm", async () => {
    await expect(
      c.handle("hi", { intent: "complaint", intentConfidence: 0.9, complexity: 0.5 }),
    ).resolves.toBe("llm");
  });
});
