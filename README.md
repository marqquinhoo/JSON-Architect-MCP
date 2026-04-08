# JSON-Architect-MCP

Servidor MCP (Model Context Protocol) em Node.js/TypeScript que oferece duas ferramentas:

1. **`generate_ai_json`** — Gera JSONs de configuração estáticos para diferentes ecossistemas de IA (Claude, Gemini, GPT, Course-LMS)
2. **`analyze_context`** — Analisa um contexto em linguagem natural e retorna um JSON estruturado com tasks, regras de negócio e restrições (usa Claude API)

---

## Plataformas suportadas — `generate_ai_json`

| Plataforma | O que gera |
|---|---|
| **Claude** | Definições de Tools com `input_schema` (JSON Schema) |
| **Gemini** | `generationConfig` com `responseMimeType` e `responseSchema` |
| **GPT** | Function Calling com `tools[]` e `response_format` (Structured Outputs) |
| **Course-LMS** | Estrutura de curso com `modules[]`, `lessons[]` e `seoMetadata` |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- Uma das IDEs/clientes MCP suportados abaixo (Claude Code, Claude Desktop, VS Code com extensão Claude, Cursor)

> **Sem chaves externas.** A ferramenta `analyze_context` usa **MCP Sampling** — solicita a inferência diretamente ao LLM do host (Claude Code, Claude Desktop, etc.) que já está autenticado. Nenhuma chave adicional é necessária.

---

## Instalação

```bash
# 1. Clone ou baixe o projeto
cd JSON-Architect-MCP

# 2. Instale as dependências
npm install

# 3. Compile o TypeScript
npm run build
```

---

## Configuração por IDE / Cliente MCP

### Recomendado: `.mcp.json` na raiz do projeto

A forma mais simples e portável de registrar o servidor é criar um arquivo `.mcp.json` na **raiz do projeto** onde você vai usar as ferramentas. Isso elimina a necessidade de alterar as configurações globais do VS Code, do Claude Desktop ou do Claude Code — basta o arquivo existir na pasta e o cliente MCP o detecta automaticamente.

```json
{
  "mcpServers": {
    "json-architect": {
      "command": "node",
      "args": ["C:/caminho/para/JSON-Architect-MCP/dist/index.js"]
    }
  }
}
```

> **Por que usar `.mcp.json` no projeto?**
> - Funciona em qualquer cliente MCP compatível (Claude Code, VS Code com extensão Claude, Cursor) sem configuração extra
> - O registro fica versionado junto ao projeto — quem clonar o repositório já tem a configuração pronta
> - Evita poluir as configurações globais da IDE ou do cliente Claude

---

### Alternativa: configuração global por IDE / Cliente MCP

Use as opções abaixo apenas se preferir registrar o servidor globalmente, fora do projeto.

### Claude Code (CLI)

Abra (ou crie) o arquivo `~/.claude/claude.json` e adicione o bloco `mcpServers`:

```json
{
  "mcpServers": {
    "json-architect": {
      "command": "node",
      "args": ["C:/caminho/para/JSON-Architect-MCP/dist/index.js"]
    }
  }
}
```

Reinicie o Claude Code. As ferramentas estarão disponíveis automaticamente como `mcp__json-architect__generate_ai_json` e `mcp__json-architect__analyze_context`.

---

### Visual Studio Code (Extensão Claude)

1. Instale a extensão **Claude** no VS Code (marketplace da Microsoft)
2. Abra as configurações do VS Code (`Ctrl+,`) e pesquise por **MCP**
3. Clique em **"Edit in settings.json"** e adicione:

```json
{
  "claude.mcpServers": {
    "json-architect": {
      "command": "node",
      "args": ["C:/caminho/para/JSON-Architect-MCP/dist/index.js"]
    }
  }
}
```

Alternativamente, crie o arquivo `.vscode/mcp.json` na raiz do seu workspace:

```json
{
  "servers": {
    "json-architect": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/caminho/para/JSON-Architect-MCP/dist/index.js"]
    }
  }
}
```

---

### Claude Desktop App

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "json-architect": {
      "command": "node",
      "args": ["C:/caminho/para/JSON-Architect-MCP/dist/index.js"]
    }
  }
}
```

---

### Cursor

Abra `~/.cursor/mcp.json` (ou crie se não existir):

```json
{
  "mcpServers": {
    "json-architect": {
      "command": "node",
      "args": ["C:/caminho/para/JSON-Architect-MCP/dist/index.js"]
    }
  }
}
```

---

## Ferramentas disponíveis

### 1. `generate_ai_json` — Gerador de configurações estáticas

Gera JSONs prontos para uso nas APIs da plataforma escolhida.

#### Parâmetros

| Parâmetro | Obrigatório | Opções | Padrão |
|---|---|---|---|
| `target_ia` | Sim | `Claude`, `Gemini`, `GPT`, `Course-LMS` | — |
| `context` | Sim | Texto livre com seu contexto ou regras de negócio | — |
| `output_format` | Não | `tool_config`, `system_prompt`, `schema_only` | `tool_config` |

#### Formatos de saída

- **`tool_config`** — JSON completo pronto para uso na API da plataforma
- **`system_prompt`** — Apenas a configuração de system/instrução de sistema
- **`schema_only`** — Apenas o JSON Schema da estrutura

#### Exemplos de uso

> "Gere um JSON de tool_config para o Claude para um sistema de suporte ao cliente"

> "Crie um JSON Gemini com system_prompt para análise de sentimentos"

> "Monte uma estrutura Course-LMS para um curso de React"

---

### 2. `analyze_context` — Análise inteligente de contexto

Analisa uma descrição em linguagem natural (PT ou EN) e retorna um JSON estruturado com tasks identificadas, regras de negócio e restrições. Usa a Claude API internamente.

#### Parâmetros

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `context` | Sim | Descrição em linguagem natural dos problemas ou requisitos de software |

#### Estrutura do JSON retornado

```json
{
  "project_context": "Título resumido da iniciativa",
  "tasks": [
    {
      "scope": "Frontend | Backend | Database | DevOps | ...",
      "issue": "Descrição do problema (tarefas de bug/fix)",
      "solution": {
        "action": "Ação a realizar",
        "details": ["Passo 1", "Passo 2"]
      },
      "feature": "Nome da funcionalidade (tarefas de nova feature)",
      "requirements": ["Requisito 1", "Requisito 2"],
      "logic_rules": {
        "regra_chave": "Descrição da regra"
      }
    }
  ],
  "business_logic": [
    "Regra de negócio identificada no contexto"
  ],
  "constraints": {
    "forbidden": ["O que NÃO pode ser feito"],
    "mandatory": ["O que É obrigatório"]
  },
  "technical_implementation_hints": {
    "database": "Sugestão de schema ou índices",
    "controller_method": "Nome sugerido para o método",
    "frontend_component": "Nome sugerido para o componente"
  }
}
```

#### Exemplo de uso

> "Analise este contexto: Tenho um sistema de consulta de CPF onde o usuário consegue digitar texto no campo. Preciso criar um formulário de login e um controller que dispare emails sem duplicatas no mesmo dia."

---

## Exemplos de saída — `generate_ai_json`

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
      "lessons": []
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

# Chamar generate_ai_json
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"generate_ai_json","arguments":{"target_ia":"Claude","context":"Sistema de agendamento de consultas","output_format":"tool_config"}}}' | node dist/index.js

# Chamar analyze_context (requer ANTHROPIC_API_KEY)
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"analyze_context","arguments":{"context":"Campo de CPF permite texto. Preciso criar formulario de login e controller de email sem duplicatas."}}}' | ANTHROPIC_API_KEY=sk-ant-... node dist/index.js
```

---

## Estrutura do projeto

```
JSON-Architect-MCP/
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
└── src/
    ├── index.ts                          <- Servidor MCP (entry point)
    ├── types.ts                          <- Tipos compartilhados
    └── generators/
        ├── index.ts                      <- Registry + dispatch()
        ├── analyze-context.generator.ts  <- analyze_context (Claude API)
        ├── claude.generator.ts
        ├── gemini.generator.ts
        ├── gpt.generator.ts
        └── course-lms.generator.ts
```

## Adicionando uma nova plataforma ao `generate_ai_json`

1. Crie `src/generators/nova-ia.generator.ts` exportando `generateNovaIA()`
2. Adicione a entrada no registry em `src/generators/index.ts`
3. Adicione o novo valor no tipo `TargetIA` em `src/types.ts`
4. Recompile com `npm run build`
