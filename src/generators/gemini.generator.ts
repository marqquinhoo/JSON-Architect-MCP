import type { GeneratorInput, GeneratorResult } from "../types.js";

export function generateGemini({ context, output_format }: GeneratorInput): GeneratorResult {
  const responseSchema = {
    type: "OBJECT",
    properties: {
      result: { type: "STRING", description: context },
    },
    required: ["result"],
  };

  let payload: unknown;

  switch (output_format) {
    case "schema_only":
      payload = responseSchema;
      break;

    case "system_prompt":
      payload = {
        systemInstruction: {
          parts: [{ text: context }],
        },
      };
      break;

    case "tool_config":
    default:
      payload = {
        systemInstruction: {
          parts: [{ text: context }],
        },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.2,
          topP: 0.95,
        },
      };
      break;
  }

  return { payload, language: "json" };
}
