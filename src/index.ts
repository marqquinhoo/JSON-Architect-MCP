import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { dispatch } from "./generators/index.js";
import { analyzeContext } from "./generators/analyze-context.generator.js";
import type { TargetIA, OutputFormat } from "./types.js";

const server = new McpServer({
  name: "json-architect-mcp",
  version: "1.0.0",
});

server.tool(
  "generate_ai_json",
  "Generates a structured JSON for a target AI ecosystem (Claude, Gemini, GPT-4, or Course-LMS) based on raw context or business rules.",
  {
    target_ia: z
      .enum(["Claude", "Gemini", "GPT", "Course-LMS"])
      .describe("Target AI platform: Claude | Gemini | GPT | Course-LMS"),
    context: z
      .string()
      .min(1)
      .describe("Raw content or business rules to structure into the target format"),
    output_format: z
      .enum(["system_prompt", "tool_config", "schema_only"])
      .default("tool_config")
      .describe("Output shape: system_prompt | tool_config | schema_only"),
    tasks: z
      .array(z.string().min(1))
      .optional()
      .describe("List of individual task descriptions to generate a separate tool for each one"),
  },
  async ({ target_ia, context, output_format, tasks }) => {
    const markdown = dispatch(target_ia as TargetIA, {
      context,
      output_format: output_format as OutputFormat,
      tasks,
    });

    return {
      content: [
        {
          type: "text",
          text: markdown,
        },
      ],
    };
  }
);

server.tool(
  "analyze_context",
  "Analyzes a natural language software context using Claude AI and returns a structured JSON with tasks, scopes, solutions, business logic and constraints.",
  {
    context: z
      .string()
      .min(10)
      .describe(
        "Natural language description of software problems, requirements, or feature requests (Portuguese or English)"
      ),
  },
  async ({ context }) => {
    try {
      const result = await analyzeContext(server, { context });
      return {
        content: [
          {
            type: "text",
            text: "```json\n" + JSON.stringify(result, null, 2) + "\n```",
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Erro: ${message}` }],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
