import type { TargetIA, GeneratorInput, GeneratorResult } from "../types.js";
import { generateClaude } from "./claude.generator.js";
import { generateGemini } from "./gemini.generator.js";
import { generateGPT } from "./gpt.generator.js";
import { generateCourseLMS } from "./course-lms.generator.js";

type GeneratorFn = (input: GeneratorInput) => GeneratorResult;

const REGISTRY: Record<TargetIA, GeneratorFn> = {
  Claude: generateClaude,
  Gemini: generateGemini,
  GPT: generateGPT,
  "Course-LMS": generateCourseLMS,
};

export function dispatch(target: TargetIA, input: GeneratorInput): string {
  const generator = REGISTRY[target];
  const result = generator(input);
  const json = JSON.stringify(result.payload, null, 2);
  return `\`\`\`${result.language}\n${json}\n\`\`\``;
}
