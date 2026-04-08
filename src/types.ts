export type TargetIA = "Claude" | "Gemini" | "GPT" | "Course-LMS";
export type OutputFormat = "system_prompt" | "tool_config" | "schema_only";

export interface GeneratorInput {
  context: string;
  output_format: OutputFormat;
}

export interface GeneratorResult {
  payload: unknown;
  language: "json";
}
