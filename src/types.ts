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

// ---- analyze_context tool ----

export interface AnalyzeContextInput {
  context: string;
}

export interface TaskSolution {
  action: string;
  details: string[];
}

export interface AnalyzedTask {
  scope: string;
  issue?: string;
  feature?: string;
  solution?: TaskSolution;
  logic_rules?: Record<string, string>;
  requirements?: string[];
}

export interface AnalyzeContextResult {
  project_context: string;
  tasks: AnalyzedTask[];
  business_logic: string[];
  constraints: {
    forbidden: string[];
    mandatory: string[];
  };
  technical_implementation_hints: Record<string, string | string[]>;
}
