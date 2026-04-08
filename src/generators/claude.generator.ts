import type { GeneratorInput, GeneratorResult } from "../types.js";

export function generateClaude({ context, output_format }: GeneratorInput): GeneratorResult {
  const toolName = slugify(context) || "generated_tool";

  const inputSchema = {
    type: "object",
    properties: {
      input: {
        type: "string",
        description: context,
      },
    },
    required: ["input"],
  };

  let payload: unknown;

  switch (output_format) {
    case "schema_only":
      payload = inputSchema;
      break;

    case "system_prompt":
      payload = {
        system: `You are an assistant. Use the tool "${toolName}" when the user asks about: ${context}`,
      };
      break;

    case "tool_config":
    default:
      payload = {
        tools: [
          {
            name: toolName,
            description: context,
            input_schema: inputSchema,
          },
        ],
        tool_choice: { type: "auto" },
      };
      break;
  }

  return { payload, language: "json" };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 64);
}
