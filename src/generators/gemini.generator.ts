import type { GeneratorInput, GeneratorResult } from "../types.js";

export function generateGemini({ context, output_format, tasks }: GeneratorInput): GeneratorResult {
  const items = tasks && tasks.length > 0 ? tasks : [context];

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s_-]/g, "").trim().replace(/\s+/g, "_").slice(0, 64);

  const makeParameters = (description: string) => ({
    type: "object",
    properties: {
      input: { type: "string", description },
    },
    required: ["input"],
  });

  let payload: unknown;

  switch (output_format) {
    case "schema_only":
      payload = items.length === 1
        ? { type: "OBJECT", properties: { result: { type: "STRING", description: items[0] } }, required: ["result"] }
        : items.map((task) => ({ name: slugify(task) || "task", schema: { type: "OBJECT", properties: { result: { type: "STRING", description: task } }, required: ["result"] } }));
      break;

    case "system_prompt":
      payload = {
        systemInstruction: {
          parts: [{ text: items.length === 1 ? items[0] : items.map((t, i) => `Task ${i + 1}: ${t}`).join("\n") }],
        },
      };
      break;

    case "tool_config":
    default:
      if (items.length === 1) {
        payload = {
          systemInstruction: { parts: [{ text: items[0] }] },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: { type: "OBJECT", properties: { result: { type: "STRING", description: items[0] } }, required: ["result"] },
            temperature: 0.2,
            topP: 0.95,
          },
        };
      } else {
        payload = {
          tools: [
            {
              functionDeclarations: items.map((task) => ({
                name: slugify(task) || "generated_function",
                description: task,
                parameters: makeParameters(task),
              })),
            },
          ],
          toolConfig: { functionCallingConfig: { mode: "AUTO" } },
        };
      }
      break;
  }

  return { payload, language: "json" };
}
