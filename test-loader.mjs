import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import ts from 'typescript';

const srcDir = path.resolve('src');

function resolveFile(basePath) {
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js'];
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath;
  }
  for (const ext of extensions) {
    const candidate = basePath + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.css') || specifier.includes('.css?')) {
    return {
      url: 'data:text/javascript,export default {};',
      shortCircuit: true,
    };
  }

  if (specifier.startsWith('@/')) {
    const targetPath = path.join(srcDir, specifier.slice(2));
    const resolved = resolveFile(targetPath);
    if (resolved) {
      return nextResolve(pathToFileURL(resolved).href, context);
    }
  } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
    if (context.parentURL) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const targetPath = path.resolve(parentDir, specifier);
      const resolved = resolveFile(targetPath);
      if (resolved) {
        return nextResolve(pathToFileURL(resolved).href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith('file://') && (url.endsWith('.tsx') || url.endsWith('.ts'))) {
    const filePath = fileURLToPath(url);
    if (fs.existsSync(filePath)) {
      let source = fs.readFileSync(filePath, 'utf8');
      if (source.includes('import.meta.env')) {
        source = 'if (!import.meta.env) import.meta.env = {};\n' + source;
      }
      const transformed = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
        },
        fileName: filePath,
      });
      return {
        format: 'module',
        source: transformed.outputText,
        shortCircuit: true,
      };
    }
  }
  return nextLoad(url, context);
}
