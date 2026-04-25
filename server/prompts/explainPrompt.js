// server/prompts/explainPrompt.js
// Prompt template for Codebase Explainer
// WHY: Generates structured explanations that can be rendered as both text and graph data.

export const getExplainPrompt = (code, filename) => `
You are a senior software architect. Explain the following code file in detail.

**File:** ${filename || 'unknown'}
**Code:**
\`\`\`
${code}
\`\`\`

**Your tasks:**
1. Provide a clear summary of what this code does
2. Identify all imports and their purposes
3. Map out all functions/components and their responsibilities
4. Describe the data flow through the code
5. Identify any external dependencies

**Return your response as valid JSON with this exact structure:**
{
  "summary": "Clear explanation of what this file does",
  "purpose": "The role this file plays in the larger application",
  "imports": [
    {
      "source": "module-name",
      "items": ["imported1", "imported2"],
      "purpose": "Why this import is needed"
    }
  ],
  "functions": [
    {
      "name": "functionName",
      "type": "function" | "component" | "hook" | "class" | "method",
      "purpose": "What this function does",
      "params": ["param1", "param2"],
      "returns": "What it returns",
      "complexity": "low" | "medium" | "high"
    }
  ],
  "dataFlow": "Description of how data flows through this code",
  "dependencies": ["list", "of", "external", "packages"],
  "keyPatterns": ["Design patterns or architectural patterns used"]
}

Important: Return ONLY valid JSON, no markdown formatting, no code blocks.
`;

export const getMultiFileExplainPrompt = (files) => `
You are a senior software architect. Analyze the following codebase and explain how the files relate to each other.

**Files:**
${files.map((f) => `--- ${f.name} ---\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n')}

**Return your response as valid JSON with this exact structure:**
{
  "summary": "Overall codebase summary",
  "architecture": "Description of the architectural pattern",
  "fileRelationships": [
    {
      "from": "source-file.js",
      "to": "target-file.js",
      "relationship": "imports" | "extends" | "uses" | "configures",
      "description": "How they relate"
    }
  ],
  "dataFlow": "How data flows through the application",
  "entryPoint": "The main entry file",
  "suggestions": ["Architectural improvement suggestions"]
}

Important: Return ONLY valid JSON, no markdown formatting, no code blocks.
`;
