// server/prompts/analyzePrompt.js
// Prompt template for Intent Mode (code analysis + optimization)
// WHY: Separating prompts from business logic makes them easy to iterate on
// without touching service code. Structured JSON output enables reliable parsing.

export const getAnalyzePrompt = (code, language) => `
You are a senior software engineer and code reviewer. Analyze the following ${language} code thoroughly.

**Code to analyze:**
\`\`\`${language}
${code}
\`\`\`

**Your tasks:**
1. Identify code issues (bugs, anti-patterns, performance problems)
2. Suggest improvements with clear explanations
3. Detect bad practices and explain why they're problematic
4. Suggest a better folder/file structure if applicable
5. Provide an optimized rewrite of the code

**Return your response as valid JSON with this exact structure:**
{
  "summary": "Brief 1-2 sentence overall assessment",
  "issues": [
    {
      "line": <line_number_or_null>,
      "severity": "high" | "medium" | "low",
      "type": "bug" | "performance" | "security" | "style" | "best-practice",
      "message": "Clear description of the issue",
      "fix": "How to fix it"
    }
  ],
  "suggestions": [
    "Actionable improvement suggestion 1",
    "Actionable improvement suggestion 2"
  ],
  "badPractices": [
    {
      "practice": "What the bad practice is",
      "why": "Why it's bad",
      "alternative": "What to do instead"
    }
  ],
  "optimizedCode": "The full optimized version of the code",
  "folderStructure": "Suggested folder structure if applicable, or null"
}

Important: Return ONLY valid JSON, no markdown formatting, no code blocks.
`;

export const getQuickFixPrompt = (code, issue) => `
Fix the following issue in this code:
Issue: ${issue}

Code:
\`\`\`
${code}
\`\`\`

Return ONLY the fixed code, nothing else.
`;
