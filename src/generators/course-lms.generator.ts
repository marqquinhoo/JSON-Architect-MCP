import type { GeneratorInput, GeneratorResult } from "../types.js";

export function generateCourseLMS({ context, output_format }: GeneratorInput): GeneratorResult {
  const courseTitle = context.slice(0, 80);
  const slug = context
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 60);

  const seoMetadata = {
    title: courseTitle,
    slug,
    description: `${context} — structured course content.`,
    keywords: context.split(" ").slice(0, 8),
    ogImage: `https://cdn.example.com/courses/${slug}/cover.jpg`,
  };

  const makeLesson = (index: number, topic: string) => ({
    id: `lesson-${index}`,
    title: `${topic} — Lesson ${index}`,
    duration: "15min",
    type: "video",
    content: `Introduction to ${topic}`,
  });

  const makeModule = (index: number, topic: string) => ({
    id: `module-${index}`,
    title: `Module ${index}: ${topic}`,
    description: `Core concepts for ${topic}`,
    lessons: [makeLesson(1, topic), makeLesson(2, topic)],
  });

  let payload: unknown;

  switch (output_format) {
    case "schema_only":
      payload = {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        properties: {
          courseTitle: { type: "string" },
          version: { type: "string" },
          language: { type: "string" },
          totalHours: { type: "number" },
          modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                lessons: { type: "array" },
              },
              required: ["id", "title", "lessons"],
            },
          },
          seoMetadata: {
            type: "object",
            properties: {
              title: { type: "string" },
              slug: { type: "string" },
              description: { type: "string" },
              keywords: { type: "array", items: { type: "string" } },
              ogImage: { type: "string" },
            },
            required: ["title", "slug", "description"],
          },
        },
        required: ["courseTitle", "modules", "seoMetadata"],
      };
      break;

    case "system_prompt":
      payload = {
        systemPrompt: `You are a curriculum designer. Generate a detailed course for: "${context}". Return JSON with the following structure: { courseTitle, modules: [{ id, title, description, lessons: [{ id, title, duration, type, content }] }], seoMetadata: { title, slug, description, keywords, ogImage } }`,
      };
      break;

    case "tool_config":
    default:
      payload = {
        courseTitle,
        version: "1.0.0",
        language: "pt-BR",
        totalHours: 2,
        modules: [
          makeModule(1, "Fundamentos"),
          makeModule(2, "Aplicação Prática"),
          makeModule(3, "Avaliação e Projeto Final"),
        ],
        seoMetadata,
      };
      break;
  }

  return { payload, language: "json" };
}
