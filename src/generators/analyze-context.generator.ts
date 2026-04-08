import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AnalyzeContextInput, AnalyzeContextResult } from "../types.js";

const SYSTEM_PROMPT = `You are a software architect assistant. Your ONLY output is a single valid JSON object.
Do NOT include markdown fences, explanations, or any text outside the JSON.

Analyze the user's software context (may be in Portuguese or English) and produce structured JSON with this schema:

{
  "project_context": "<short title for the overall initiative>",
  "tasks": [
    {
      "scope": "<layer: Frontend, Backend, Database, DevOps, etc.>",
      "issue": "<problem description — use for bug/fix tasks>",
      "solution": { "action": "<label>", "details": ["<step>", "..."] },
      "feature": "<feature name — use for new feature tasks>",
      "requirements": ["<requirement>", "..."],
      "logic_rules": { "<rule_key>": "<rule description>" }
    }
  ],
  "business_logic": [
    "<Business rule explicitly stated or strongly implied by the context>",
    "..."
  ],
  "constraints": {
    "forbidden": ["<Something explicitly stated as NOT allowed>", "..."],
    "mandatory": ["<Something that IS required or non-negotiable>", "..."]
  },
  "technical_implementation_hints": {
    "<technology or concern>": "<implementation guidance>"
  }
}

Rules:
- Each task MUST have "scope".
- Bug/fix tasks use "issue" + "solution". New feature tasks use "feature" + "requirements" and/or "logic_rules".
- "business_logic" lists explicit rules inferred from the context (e.g., idempotency rules, conditional flows, domain constraints).
- "constraints.forbidden" lists things explicitly stated as NOT allowed. "constraints.mandatory" lists non-negotiable requirements.
- If no constraints or business rules are identifiable, use empty arrays.
- Output ONLY valid JSON. No markdown. No prose. No extra keys.`;

export async function analyzeContext(
  server: McpServer,
  input: AnalyzeContextInput
): Promise<AnalyzeContextResult> {
  const response = await server.server.createMessage({
    systemPrompt: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Analyze the following software context and return the structured JSON:\n\n${input.context}`,
        },
      },
    ],
    maxTokens: 4096,
  });

  const block = response.content;

  if (!block || block.type !== "text") {
    throw new Error("O host MCP não retornou conteúdo de texto.");
  }

  let raw = block.text.trim();

  // Fallback: remove markdown fences se o modelo ignorar a instrução
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }

  try {
    return JSON.parse(raw) as AnalyzeContextResult;
  } catch {
    throw new Error(`Resposta inválida (JSON malformado):\n${raw}`);
  }
}
