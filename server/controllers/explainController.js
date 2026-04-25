// server/controllers/explainController.js
// Handles Codebase Explainer: parses code, generates graph, gets AI explanation
// WHY: Two-path approach — AST gives us reliable structure, AI gives us understanding.
// The graph is built from AST data (not AI), so it's always accurate.

import { explainCode } from '../services/aiService.js';
import { parseCode, parseMultipleFiles } from '../services/parserService.js';
import { generateGraph, generateSingleFileGraph } from '../services/graphService.js';
import { getExplainPrompt, getMultiFileExplainPrompt } from '../prompts/explainPrompt.js';

/**
 * POST /api/explain-codebase
 * Parses code, generates dependency graph, and AI explanation
 * Body: { code?: string, files?: Array<{name, content}>, filename?: string }
 */
export const explainCodebaseHandler = async (req, res, next) => {
  try {
    const { code, files, filename = 'code.js' } = req.body;

    // Validate: need either single code string or array of files
    if (!code && (!files || !Array.isArray(files) || files.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Either "code" (string) or "files" (array of {name, content}) is required',
      });
    }

    let graph, parsedData, aiExplanation;

    if (files && files.length > 0) {
      // ── Multi-file mode ──────────────────────────────────
      parsedData = parseMultipleFiles(files);
      graph = generateGraph(parsedData);

      // AI explanation (limit input size to avoid token limits)
      const truncatedFiles = files.map((f) => ({
        name: f.name,
        content: f.content.length > 3000 ? f.content.substring(0, 3000) + '\n// ... truncated' : f.content,
      }));
      const prompt = getMultiFileExplainPrompt(truncatedFiles);
      aiExplanation = await explainCode(prompt);
    } else {
      // ── Single-file mode ─────────────────────────────────
      parsedData = parseCode(code, filename);
      graph = generateSingleFileGraph(parsedData);

      const prompt = getExplainPrompt(code, filename);
      aiExplanation = await explainCode(prompt);
    }

    res.json({
      success: true,
      data: {
        explanation: aiExplanation,
        graph,
        parsed: Array.isArray(parsedData)
          ? parsedData.map((p) => ({
              filename: p.filename,
              functions: p.functions,
              imports: p.imports,
              exports: p.exports,
              dependencies: p.dependencies,
            }))
          : {
              filename: parsedData.filename,
              functions: parsedData.functions,
              imports: parsedData.imports,
              exports: parsedData.exports,
              dependencies: parsedData.dependencies,
            },
      },
    });
  } catch (error) {
    next(error);
  }
};
