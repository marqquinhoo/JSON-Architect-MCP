# JSON-Architect-MCP

Servidor MCP (Model Context Protocol) em Node.js/TypeScript que gera JSONs estruturados para diferentes ecossistemas de IA a partir de um contexto ou regras de negócio.

## Plataformas suportadas

| Plataforma | O que gera |
|---|---|
| **Claude** | Definições de Tools com `input_schema` (JSON Schema) |
| **Gemini** | `generationConfig` com `responseMimeType` e `responseSchema` |
| **GPT** | Function Calling com `tools[]` e `response_format` (Structured Outputs) |
| **Course-LMS** | Estrutura de curso com `modules[]`, `lessons[]` e `seoMetadata` |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [Claude Code](https://claude.ai/code) instalado

---

## Instalação

```bash
# 1. Entre na pasta do projeto
cd mcp_gerajson_ia

# 2. Instale as dependências
npm install

# 3. Compile o TypeScript
npm run build
```

---

## Registrar no Claude Code

Abra (ou crie) o arquivo `~/.claude/claude.json` e adicione o bloco `mcpServers`:

```json
{
  "mcpServers": {
    "json-architect": {
      "command": "node",
      "args": ["C:/Users/marcos.paulo/Desktop/ProjetosDiversos/mcp_gerajson_ia/dist/index.js"]
    }
  }
}
```

Reinicie o Claude Code. A ferramenta `mcp__json-architect__generate_ai_json` estará disponível automaticamente.

---

## Como usar

Basta pedir ao Claude naturalmente:

> "Gere um JSON de tool_config para o Claude para um sistema de suporte ao cliente"

> "Crie um JSON Gemini com system_prompt para análise de sentimentos"

> "Monte uma estrutura Course-LMS para um curso de React"

### Parâmetros da ferramenta

| Parâmetro | Obrigatório | Opções | Padrão |
|---|---|---|---|
| `target_ia` | Sim | `Claude`, `Gemini`, `GPT`, `Course-LMS` | — |
| `context` | Sim | Texto livre com seu contexto ou regras de negócio | — |
| `output_format` | Não | `tool_config`, `system_prompt`, `schema_only` | `tool_config` |

### Descrição dos formatos de saída

- **`tool_config`** — JSON completo pronto para uso na API da plataforma escolhida
- **`system_prompt`** — Apenas a configuração de system/instrução de sistema
- **`schema_only`** — Apenas o JSON Schema da estrutura, sem configurações extras

---

## Exemplos de saída

### Claude — `tool_config`

```json
{
  "tools": [
    {
      "name": "suporte_ao_cliente",
      "description": "Sistema de suporte ao cliente",
      "input_schema": {
        "type": "object",
        "properties": {
          "input": { "type": "string", "description": "Sistema de suporte ao cliente" }
        },
        "required": ["input"]
      }
    }
  ],
  "tool_choice": { "type": "auto" }
}
```

### Gemini — `tool_config`

```json
{
  "systemInstruction": {
    "parts": [{ "text": "Análise de sentimentos em avaliações de produtos" }]
  },
  "generationConfig": {
    "responseMimeType": "application/json",
    "responseSchema": {
      "type": "OBJECT",
      "properties": {
        "result": { "type": "STRING" }
      },
      "required": ["result"]
    },
    "temperature": 0.2,
    "topP": 0.95
  }
}
```

### GPT — `tool_config`

```json
{
  "model": "gpt-4o",
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "classificar_email",
        "description": "Classificação de e-mails por categoria",
        "strict": true,
        "parameters": {
          "type": "object",
          "properties": {
            "input": { "type": "string" }
          },
          "required": ["input"],
          "additionalProperties": false
        }
      }
    }
  ],
  "tool_choice": "auto"
}
```

### Course-LMS — `tool_config`

```json
{
  "courseTitle": "Programacao em Python para iniciantes",
  "version": "1.0.0",
  "language": "pt-BR",
  "totalHours": 2,
  "modules": [
    {
      "id": "module-1",
      "title": "Module 1: Fundamentos",
      "lessons": [...]
    }
  ],
  "seoMetadata": {
    "title": "Programacao em Python para iniciantes",
    "slug": "programacao-em-python-para-iniciantes",
    "description": "...",
    "keywords": ["Python", "iniciantes"],
    "ogImage": "https://cdn.example.com/courses/..."
  }
}
```

---

## Desenvolvimento

```bash
# Recompilar automaticamente ao salvar
npm run dev

# Executar o servidor diretamente
npm start
```

### Testar via linha de comando

```bash
# Listar ferramentas disponíveis
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js

# Chamar a ferramenta
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"generate_ai_json","arguments":{"target_ia":"Claude","context":"Sistema de agendamento de consultas","output_format":"tool_config"}}}' | node dist/index.js
```

---

## Estrutura do projeto

```
mcp_gerajson_ia/
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
└── src/
    ├── index.ts                     <- Servidor MCP (entry point)
    ├── types.ts                     <- Tipos compartilhados
    └── generators/
        ├── index.ts                 <- Registry + dispatch()
        ├── claude.generator.ts
        ├── gemini.generator.ts
        ├── gpt.generator.ts
        └── course-lms.generator.ts
```

## Adicionando uma nova plataforma

1. Crie `src/generators/nova-ia.generator.ts` exportando `generateNovaIA()`
2. Adicione a entrada no registry em `src/generators/index.ts`
3. Adicione o novo valor no tipo `TargetIA` em `src/types.ts`
4. Recompile com `npm run build`
