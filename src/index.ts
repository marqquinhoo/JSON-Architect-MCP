import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { dispatch } from "./generators/index.js";
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
  },
  async ({ target_ia, context, output_format }) => {
    const markdown = dispatch(target_ia as TargetIA, {
      context,
      output_format: output_format as OutputFormat,
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

const transport = new StdioServerTransport();
await server.connect(transport);
