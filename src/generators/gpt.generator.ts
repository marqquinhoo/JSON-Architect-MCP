import type { GeneratorInput, GeneratorResult } from "../types.js";

export function generateGPT({ context, output_format }: GeneratorInput): GeneratorResult {
  const functionName = slugify(context) || "generated_function";

  const parameters = {
    type: "object",
    properties: {
      input: {
        type: "string",
        description: context,
      },
    },
    required: ["input"],
    additionalProperties: false,
  };

  let payload: unknown;

  switch (output_format) {
    case "schema_only":
      payload = parameters;
      break;

    case "system_prompt":
      payload = {
        messages: [
          {
            role: "system",
            content: context,
          },
        ],
        response_format: { type: "json_object" },
      };
      break;

    case "tool_config":
    default:
      payload = {
        model: "gpt-4o",
        tools: [
          {
            type: "function",
            function: {
              name: functionName,
              description: context,
              strict: true,
              parameters,
            },
          },
        ],
        tool_choice: "auto",
        response_format: {
          type: "json_schema",
          json_schema: {
            name: `${functionName}_output`,
            strict: true,
            schema: parameters,
          },
        },
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
