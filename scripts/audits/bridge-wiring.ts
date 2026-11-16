import ts from "typescript";
import { dirname, resolve } from "node:path";
export function hasExportedFunction(source: string, name: string): boolean {
  const file = ts.createSourceFile("bridge.ts", source, ts.ScriptTarget.Latest, true);
  return file.statements.some(node => ts.isFunctionDeclaration(node) && node.name?.text === name
    && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword));
}

/** Conservative syntax check; actual runtime reachability requires integration tests. */
export function importsAndCalls(source: string, entryFile: string, targetFile: string, symbol: string, entryMethod?: string): boolean {
  const file = ts.createSourceFile(entryFile, source, ts.ScriptTarget.Latest, true);
  const options: ts.CompilerOptions = { noLib: true, noResolve: true, target: ts.ScriptTarget.Latest };
  const host = ts.createCompilerHost(options);
  host.getSourceFile = (name) => resolve(name) === resolve(entryFile) ? file : undefined;
  host.fileExists = (name) => resolve(name) === resolve(entryFile);
  host.readFile = (name) => resolve(name) === resolve(entryFile) ? source : undefined;
  const checker = ts.createProgram([entryFile], options, host).getTypeChecker();
  const bindings = new Set<ts.Symbol>();
  const matches = (path: string) => resolve(dirname(entryFile), path) === resolve(targetFile);
  const add = (name: ts.Identifier) => { const local = checker.getSymbolAtLocation(name); if (local) bindings.add(local); };
  const collect = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && matches(node.moduleSpecifier.text) && !node.importClause?.isTypeOnly) {
      const named = node.importClause?.namedBindings;
      if (named && ts.isNamedImports(named)) for (const binding of named.elements) {
        if (!binding.isTypeOnly && (binding.propertyName ?? binding.name).text === symbol) add(binding.name);
      }
    }
    if (ts.isVariableDeclaration(node) && ts.isObjectBindingPattern(node.name) && node.initializer) {
      const value = ts.isAwaitExpression(node.initializer) ? node.initializer.expression : node.initializer;
      if (ts.isCallExpression(value) && value.expression.kind === ts.SyntaxKind.ImportKeyword && value.arguments.length === 1
        && ts.isStringLiteral(value.arguments[0]) && matches(value.arguments[0].text)) {
        for (const binding of node.name.elements) if (ts.isIdentifier(binding.name) && (!binding.propertyName || ts.isIdentifier(binding.propertyName))) {
          if ((binding.propertyName ?? binding.name).getText(file) === symbol) add(binding.name);
        }
      }
    }
    ts.forEachChild(node, collect);
  };
  collect(file);
  const constant = (node: ts.Expression): boolean | undefined => {
    while (ts.isParenthesizedExpression(node)) node = node.expression;
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken) {
      const value = constant(node.operand); return value === undefined ? undefined : !value;
    }
    return undefined;
  };
  const reachable = (call: ts.Node): boolean => {
    let child = call;
    for (let parent = call.parent; parent; child = parent, parent = parent.parent) {
      if (ts.isIfStatement(parent)) {
        const value = constant(parent.expression);
        if ((child === parent.thenStatement && value === false) || (child === parent.elseStatement && value === true)) return false;
      }
      if (ts.isWhileStatement(parent) && child === parent.statement && constant(parent.expression) === false) return false;
      if (ts.isForStatement(parent) && child === parent.statement && parent.condition && constant(parent.condition) === false) return false;
      if (ts.isBinaryExpression(parent) && child === parent.right) {
        const value = constant(parent.left);
        if ((parent.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && value === false) ||
            (parent.operatorToken.kind === ts.SyntaxKind.BarBarToken && value === true)) return false;
      }
      if (ts.isBlock(parent)) {
        const index = parent.statements.findIndex(statement => statement === child);
        if (index >= 0 && parent.statements.slice(0, index).some(statement => ts.isReturnStatement(statement) || ts.isThrowStatement(statement))) return false;
      }
    }
    if (entryMethod) {
      let current: ts.Node | undefined = call.parent;
      while (current && !ts.isMethodDeclaration(current)) current = current.parent;
      if (!current || !ts.isMethodDeclaration(current) || !current.name || current.name.getText(file) !== entryMethod) return false;
    }
    return true;
  };
  let found = false;
  const find = (node: ts.Node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const called = checker.getSymbolAtLocation(node.expression);
      if (called && bindings.has(called) && reachable(node)) found = true;
    }
    ts.forEachChild(node, find);
  };
  find(file);
  return found;
}
