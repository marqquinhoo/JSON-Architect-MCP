import type { GeneratorInput, GeneratorResult } from "../types.js";

export function generateGPT({ context, output_format, tasks }: GeneratorInput): GeneratorResult {
  const items = tasks && tasks.length > 0 ? tasks : [context];

  const makeParameters = (description: string) => ({
    type: "object",
    properties: {
      input: { type: "string", description },
    },
    required: ["input"],
    additionalProperties: false,
  });

  let payload: unknown;

  switch (output_format) {
    case "schema_only":
      payload = items.length === 1
        ? makeParameters(items[0])
        : items.map((task) => ({ name: slugify(task) || "task", parameters: makeParameters(task) }));
      break;

    case "system_prompt":
      payload = {
        messages: [
          {
            role: "system",
            content: items.length === 1
              ? items[0]
              : items.map((t, i) => `Task ${i + 1}: ${t}`).join("\n"),
          },
        ],
        response_format: { type: "json_object" },
      };
      break;

    case "tool_config":
    default: {
      const toolList = items.map((task) => {
        const name = slugify(task) || "generated_function";
        return {
          type: "function",
          function: {
            name,
            description: task,
            strict: true,
            parameters: makeParameters(task),
          },
        };
      });

      payload = {
        model: "gpt-4o",
        tools: toolList,
        tool_choice: "auto",
      };
      break;
    }
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
