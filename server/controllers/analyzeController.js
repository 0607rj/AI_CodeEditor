// server/controllers/analyzeController.js
// Handles Intent Mode requests: code analysis, optimization, and suggestions
// WHY: Thin controller — validates input, calls services, shapes response.
// Business logic lives in services (aiService, parserService).

import { analyzeCode } from '../services/aiService.js';
import { parseCode } from '../services/parserService.js';
import { getAnalyzePrompt } from '../prompts/analyzePrompt.js';

/**
 * POST /api/analyze-code
 * Analyzes code for issues, bad practices, and generates optimized version
 * Body: { code: string, language?: string, filename?: string }
 */
export const analyzeCodeHandler = async (req, res, next) => {
  try {
    const { code, language = 'javascript', filename = 'code.js' } = req.body;

    // Validate input
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Code is required and must be a non-empty string',
      });
    }

    // Step 1: Parse code with AST for structural data
    const parsed = parseCode(code, filename);

    // Step 2: Generate AI analysis
    const prompt = getAnalyzePrompt(code, language);
    const aiResult = await analyzeCode(prompt);

    // Step 3: Combine results
    res.json({
      success: true,
      data: {
        analysis: aiResult,
        structure: {
          functions: parsed.functions,
          imports: parsed.imports,
          exports: parsed.exports,
          dependencies: parsed.dependencies,
          hooks: parsed.hooks,
        },
        originalCode: code,
        optimizedCode: aiResult.optimizedCode || code,
      },
    });
  } catch (error) {
    next(error);
  }
};
