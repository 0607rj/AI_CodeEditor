// server/services/parserService.js
// AST-based code parser using Babel
// WHY: Regex-based parsing breaks on nested structures, template literals, and edge cases.
// Babel gives us a real AST with the visitor pattern for clean, extensible extraction.
// This is the core "code intelligence" layer of the editor.

import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';

// Handle ESM default export from @babel/traverse
const traverse = _traverse.default || _traverse;

/**
 * Parse a JavaScript/JSX/TypeScript file and extract structural information
 * @param {string} code - Source code string
 * @param {string} filename - Name of the file (used for language detection)
 * @returns {Object} Parsed structure: imports, exports, functions, variables, dependencies
 */
export const parseCode = (code, filename = 'unknown.js') => {
  const result = {
    filename,
    imports: [],
    exports: [],
    functions: [],
    variables: [],
    classes: [],
    dependencies: new Set(),
    hooks: [],
  };

  // Determine parser plugins based on file extension
  const isTypeScript = filename.endsWith('.ts') || filename.endsWith('.tsx');
  const isJSX = filename.endsWith('.jsx') || filename.endsWith('.tsx');

  const plugins = [
    'classProperties',
    'optionalChaining',
    'nullishCoalescingOperator',
    'dynamicImport',
    'exportDefaultFrom',
  ];
  if (isTypeScript) plugins.push('typescript');
  if (isJSX || !isTypeScript) plugins.push('jsx');

  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins,
      errorRecovery: true, // Don't crash on syntax errors — parse what we can
    });
  } catch (err) {
    console.warn(`⚠️  Parser error for ${filename}:`, err.message);
    return { ...result, dependencies: [], parseError: err.message };
  }

  // Walk the AST using the visitor pattern
  try {
    traverse(ast, {
      // ── Imports ──────────────────────────────────────────
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const specifiers = path.node.specifiers.map((s) => {
          if (s.type === 'ImportDefaultSpecifier') return { name: s.local.name, type: 'default' };
          if (s.type === 'ImportNamespaceSpecifier') return { name: s.local.name, type: 'namespace' };
          return { name: s.local.name, type: 'named' };
        });
        result.imports.push({ source, specifiers });

        // Track external dependencies (not relative paths)
        if (!source.startsWith('.') && !source.startsWith('/')) {
          result.dependencies.add(source.split('/')[0]); // Handle scoped packages
        }
      },

      // ── Exports ──────────────────────────────────────────
      ExportDefaultDeclaration(path) {
        const decl = path.node.declaration;
        const name = decl.id?.name || decl.name || 'default';
        result.exports.push({ name, type: 'default' });
      },

      ExportNamedDeclaration(path) {
        if (path.node.declaration) {
          const decl = path.node.declaration;
          if (decl.declarations) {
            decl.declarations.forEach((d) => {
              result.exports.push({ name: d.id.name, type: 'named' });
            });
          } else if (decl.id) {
            result.exports.push({ name: decl.id.name, type: 'named' });
          }
        }
        if (path.node.specifiers) {
          path.node.specifiers.forEach((s) => {
            result.exports.push({ name: s.exported.name, type: 'named' });
          });
        }
      },

      // ── Function Declarations ────────────────────────────
      FunctionDeclaration(path) {
        if (path.node.id) {
          result.functions.push({
            name: path.node.id.name,
            type: 'function',
            params: path.node.params.map(extractParamName),
            line: path.node.loc?.start.line,
            async: path.node.async,
          });
        }
      },

      // ── Arrow Functions & Function Expressions (assigned to variables) ──
      VariableDeclarator(path) {
        const init = path.node.init;
        if (!init) return;

        const name = path.node.id?.name;
        if (!name) return;

        // Detect React hooks (convention: starts with "use")
        if (name.startsWith('use') && name.length > 3 && name[3] === name[3].toUpperCase()) {
          result.hooks.push({
            name,
            line: path.node.loc?.start.line,
          });
        }

        if (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') {
          result.functions.push({
            name,
            type: init.type === 'ArrowFunctionExpression' ? 'arrow' : 'function-expr',
            params: init.params.map(extractParamName),
            line: path.node.loc?.start.line,
            async: init.async,
          });
        } else {
          // Regular variable
          result.variables.push({
            name,
            kind: path.parent.kind, // const, let, var
            line: path.node.loc?.start.line,
          });
        }
      },

      // ── Classes ──────────────────────────────────────────
      ClassDeclaration(path) {
        const methods = [];
        path.node.body.body.forEach((member) => {
          if (member.type === 'ClassMethod') {
            methods.push({
              name: member.key.name || member.key.value,
              kind: member.kind, // constructor, method, get, set
              static: member.static,
            });
          }
        });

        result.classes.push({
          name: path.node.id?.name || 'AnonymousClass',
          superClass: path.node.superClass?.name || null,
          methods,
          line: path.node.loc?.start.line,
        });
      },

      // ── require() calls (CommonJS) ───────────────────────
      CallExpression(path) {
        if (
          path.node.callee.name === 'require' &&
          path.node.arguments.length > 0 &&
          path.node.arguments[0].type === 'StringLiteral'
        ) {
          const source = path.node.arguments[0].value;
          result.imports.push({
            source,
            specifiers: [{ name: 'require', type: 'commonjs' }],
          });
          if (!source.startsWith('.') && !source.startsWith('/')) {
            result.dependencies.add(source.split('/')[0]);
          }
        }
      },
    });
  } catch (traverseError) {
    console.warn(`⚠️  Traverse error for ${filename}:`, traverseError.message);
  }

  // Convert Set to Array for JSON serialization
  result.dependencies = Array.from(result.dependencies);

  return result;
};

/**
 * Parse multiple files and return combined results
 * @param {Array<{name: string, content: string}>} files
 * @returns {Array<Object>} Array of parsed file results
 */
export const parseMultipleFiles = (files) => {
  return files.map((file) => parseCode(file.content, file.name));
};

/**
 * Helper: Extract parameter name from various AST param types
 */
function extractParamName(param) {
  if (param.type === 'Identifier') return param.name;
  if (param.type === 'AssignmentPattern') return param.left?.name || '...';
  if (param.type === 'RestElement') return `...${param.argument?.name || ''}`;
  if (param.type === 'ObjectPattern') return '{...}';
  if (param.type === 'ArrayPattern') return '[...]';
  return '?';
}
