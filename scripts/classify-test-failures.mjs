import { readFile, writeFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { run } from 'node:test';
import { parseArgs } from 'node:util';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { baseline: { type: 'string' }, snapshot: { type: 'string' } },
});

async function collect(files) {
  const results = new Map();
  const issues = [];
  for await (const { type, data } of run({ files, timeout: 10_000, execArgv: process.execArgv })) {
    if (type !== 'test:pass' && type !== 'test:fail') continue;
    const { file, name, skip, todo, details } = data;
    const failure = details.error?.failureType;
    if (failure === 'subtestsFailed') continue;
    if (!file || resolve(name) === resolve(file)) {
      if (type === 'test:fail') issues.push(file ?? name);
      continue;
    }
    const path = relative('.', file).split(sep).join('/');
    const key = JSON.stringify([path, name]);
    let state = 'pass';
    if (skip || todo) state = 'omitted';
    else if (type === 'test:fail') {
      state = ['testCodeFailure', 'testTimeoutFailure'].includes(failure) ? 'fail' : 'invalid';
    }
    const previous = results.get(key);
    results.set(key, {
      path, name,
      state: previous ? 'ambiguous' : state,
      hadFailure: Boolean(previous?.hadFailure || state === 'fail' || state === 'invalid'),
    });
  }
  return { results, issues };
}

function classify(repeats, base) {
  if (repeats.some(state => state !== 'pass' && state !== 'fail')) return 'sin clasificar';
  if (repeats.includes('pass')) return 'flaky';
  if (base === 'fail') return 'preexistente';
  if (base === 'pass') return 'nuevo';
  return 'sin clasificar';
}

function cell(value) {
  return String(value).replaceAll('|', '&#124;').replace(/[\r\n]+/g, ' ');
}

async function main() {
  if (!positionals.length) throw new Error('Indica al menos un archivo de test.');
  if (values.baseline && values.snapshot) throw new Error('Usa --baseline o --snapshot por ejecución.');
  const files = [...new Set(positionals.map(file => resolve(file)))];
  const current = await collect(files);
  if (values.snapshot) {
    if (current.issues.length) throw new Error('Base incompleta: ' + current.issues.join(', '));
    await writeFile(values.snapshot, JSON.stringify([...current.results], null, 2) + '\n', { flag: 'wx' });
    return;
  }
  const baseline = values.baseline ? new Map(JSON.parse(await readFile(values.baseline, 'utf8'))) : new Map();
  const failed = [...current.results].filter(([, result]) => result.hadFailure);
  const affected = [...new Set(failed.map(([, result]) => resolve(result.path)))];
  const retries = [];
  if (affected.length) {
    for (let attempt = 0; attempt < 3; attempt++) retries.push(await collect(affected));
  }

  console.log('| Archivo | Test | R1 | R2 | R3 | Base | Etiqueta |');
  console.log('| --- | --- | --- | --- | --- | --- | --- |');
  for (const [key, result] of failed) {
    const states = retries.map(({ results, issues }) => {
      if (issues.some(file => resolve(file) === resolve(result.path))) return 'infraestructura';
      return results.get(key)?.state ?? 'ausente';
    });
    const base = baseline.get(key)?.state ?? 'ausente';
    const label = result.state === 'fail' ? classify(states, base) : 'sin clasificar';
    console.log('| ' + [result.path, result.name, ...states, base, label].map(cell).join(' | ') + ' |');
  }
  for (const [index, { issues }] of [current, ...retries].entries()) {
    for (const issue of issues) console.error('Fallo de infraestructura en ejecución ' + index + ': ' + issue);
  }
  if (failed.length || [current, ...retries].some(result => result.issues.length)) process.exitCode = 1;
}

await main().catch(error => {
  console.error(error.message);
  process.exitCode = 2;
});
