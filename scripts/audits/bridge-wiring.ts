import ts from "typescript";
import { dirname, resolve } from "node:path";
export function hasExportedFunction(source: string, name: string): boolean {
  const file = ts.createSourceFile("bridge.ts", source, ts.ScriptTarget.Latest, true);
  return file.statements.some(node => ts.isFunctionDeclaration(node) && node.name?.text === name
    && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword));
}
/** Static evidence of an imported symbol actually called; comments/strings do not count. */
export function importsAndCalls(source: string, entryFile: string, targetFile: string, symbol: string): boolean {
  const file = ts.createSourceFile(entryFile, source, ts.ScriptTarget.Latest, true);
  const locals = new Set<string>(), calls = new Set<string>();
  const matches = (path: string) => resolve(dirname(entryFile), path) === resolve(targetFile);
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && matches(node.moduleSpecifier.text)) {
      const bindings = node.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) for (const binding of bindings.elements) {
        if ((binding.propertyName ?? binding.name).text === symbol) locals.add(binding.name.text);
      }
    }
    if (ts.isVariableDeclaration(node) && ts.isObjectBindingPattern(node.name) && node.initializer) {
      const value = ts.isAwaitExpression(node.initializer) ? node.initializer.expression : node.initializer;
      if (ts.isCallExpression(value) && value.expression.kind === ts.SyntaxKind.ImportKeyword && value.arguments.length === 1
        && ts.isStringLiteral(value.arguments[0]) && matches(value.arguments[0].text)) {
        for (const binding of node.name.elements) if (ts.isIdentifier(binding.name) && (!binding.propertyName || ts.isIdentifier(binding.propertyName))) {
          if ((binding.propertyName ?? binding.name).getText(file) === symbol) locals.add(binding.name.text);
        }
      }
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) calls.add(node.expression.text);
    ts.forEachChild(node, visit);
  };
  visit(file);
  return [...locals].some(name => calls.has(name));
}
