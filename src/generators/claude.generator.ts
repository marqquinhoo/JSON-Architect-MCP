import type { GeneratorInput, GeneratorResult } from "../types.js";

export function generateClaude({ context, output_format, tasks }: GeneratorInput): GeneratorResult {
  const items = tasks && tasks.length > 0 ? tasks : [context];

  const makeSchema = (description: string) => ({
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
        ? makeSchema(items[0])
        : items.map((task) => ({ name: slugify(task) || "task", schema: makeSchema(task) }));
      break;

    case "system_prompt":
      payload = {
        system: items.length === 1
          ? `You are an assistant. Use the tool "${slugify(items[0]) || "generated_tool"}" when the user asks about: ${items[0]}`
          : `You are an assistant with ${items.length} specialized tools:\n` +
            items.map((t, i) => `${i + 1}. ${slugify(t) || `task_${i + 1}`}: ${t}`).join("\n"),
      };
      break;

    case "tool_config":
    default:
      payload = {
        tools: items.map((task) => ({
          name: slugify(task) || "generated_tool",
          description: task,
          input_schema: makeSchema(task),
        })),
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
