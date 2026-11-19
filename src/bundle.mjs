// Turns src/assets/app.js, written as an ES module that imports from src/shared/, into one classic
// script for the browser, so the site still ships a single file and has no runtime dependencies.
// Each imported module runs once, in its own function scope, and only the names that are imported
// become visible to the importer. Supports `import { a, b } from './x.mjs'` and `export const|function`,
// which is all src/shared/ uses; anything else is an error rather than silently wrong output.
import fs from 'node:fs';
import path from 'node:path';

const IMPORT = /^import\s*\{([^}]*)\}\s*from\s*'([^']+)';?[ \t]*$/gm;
const EXPORT = /^export\s+(?:const|let|function)\s+([A-Za-z_$][\w$]*)/gm;

/**
 * @param {string} entry path to the entry module
 * @returns {string} a classic script
 */
export function bundle(entry) {
  /** @type {Map<string, string>} module file -> variable holding its exports */
  const ids = new Map();
  /** @type {string[]} */
  const out = [];

  /** @param {string} file */
  function load(file) {
    let src = fs.readFileSync(file, 'utf8');
    const deps = [...src.matchAll(IMPORT)].map((m) => ({ names: m[1], file: path.resolve(path.dirname(file), m[2]) }));
    for (const d of deps) if (!ids.has(d.file)) { ids.set(d.file, '__' + path.basename(d.file, '.mjs').replace(/\W/g, '_')); load(d.file); }
    let i = 0;
    src = src.replace(IMPORT, () => `const {${deps[i].names}} = ${ids.get(deps[i++].file)};`);
    if (file === entry) { out.push(src); return; }
    const names = [...src.matchAll(EXPORT)].map((m) => m[1]);
    src = src.replace(/^export\s+(?=const|let|function)/gm, '');
    if (/^\s*export\b/m.test(src) || /^\s*import\b/m.test(src)) throw new Error(`${path.relative(process.cwd(), file)}: only "import { ... } from" and "export const|function" are supported`);
    out.push(`const ${ids.get(file)} = (() => {\n${src}\nreturn { ${names.join(', ')} };\n})();`);
  }

  load(path.resolve(entry));
  return `(function(){\n'use strict';\n${out.join('\n')}\n})();\n`;
}
