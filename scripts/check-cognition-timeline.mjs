// Browser fixture against the real component/API client; no model or production calls.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer } from 'node:http';
import { once } from 'node:events';
const require = createRequire(import.meta.url);
const { build } = require(createRequire(require.resolve('tsx')).resolve('esbuild'));
const { chromium } = await import('../apps/worker/node_modules/playwright/index.mjs');
const temporary = await mkdtemp(join(tmpdir(), 'cognition-timeline-'));
let browser, server;
try {
  await build({ stdin: { contents: `import React from 'react'; import {createRoot} from 'react-dom/client';
    import {CognitionTimeline} from './src/components/chat/CognitionTimeline.tsx';
    localStorage.setItem('agente_auth',JSON.stringify({token:'synthetic-test',mode:'live'}));
    const root=createRoot(document.getElementById('root'));
    root.render(React.createElement(CognitionTimeline,{refreshKey:'fixed'}));
    window.unmountTimeline=()=>root.unmount();`, resolveDir: resolve('apps/web'), loader: 'tsx' }, bundle: true,
    jsx: 'automatic', outfile: join(temporary, 'bundle.js'), platform: 'browser', logLevel: 'silent' });
  server = createServer(async (req, res) => {
    if (req.url === '/bundle.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(await readFile(join(temporary, 'bundle.js'))); }
    else { res.setHeader('Content-Type', 'text/html'); res.end('<div id="root"></div><script src="/bundle.js"></script>'); }
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  let mode = 'initial', requests = [];
  const phase = (sequence, state) => ({ sequence:String(sequence), eventId:`e${sequence}`, jobId:'job', at:'2026-11-16T00:00:00Z', receiptId:`r${sequence}`, state });
  await page.route('**/api/cognition-v2/journey?**', async (route) => {
    const cursor = new URL(route.request().url()).searchParams.get('after'); requests.push(cursor);
    assert.equal(route.request().headers().authorization, 'Bearer synthetic-test');
    if (mode === 'denied') return route.fulfill({status:403,json:{error:'Denied'}});
    if (mode === 'unavailable') return route.fulfill({status:503,json:{error:'Unavailable'}});
    const phases = cursor === '0' ? Array.from({length:100},(_,i)=>phase(i+1,'queued')) : cursor === '100' ? [phase(101,'running')] : mode === 'completed' ? [phase(101,'running'),phase(102,'completed')] : [];
    await route.fulfill({json:{phases,nextCursor:phases.at(-1)?.sequence ?? cursor}});
  });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.getByText('Tus análisis recientes').click();
  await page.getByText('Análisis iniciado',{exact:true}).waitFor();
  assert.deepEqual(requests.slice(0,2),['0','100']);
  mode='unavailable'; await page.evaluate(()=>window.dispatchEvent(new Event('online')));
  await page.getByRole('status').waitFor();
  mode='completed'; await page.evaluate(()=>window.dispatchEvent(new Event('online')));
  await page.getByText('Análisis guardado',{exact:true}).waitFor();
  assert.equal(await page.getByText('Análisis iniciado',{exact:true}).count(),1);
  assert.equal(await page.getByRole('status').count(),0);
  mode='denied'; await page.evaluate(()=>window.dispatchEvent(new Event('online')));
  await page.getByText('Tus análisis recientes').waitFor({state:'hidden'});
  const count=requests.length;
  await page.evaluate(()=>window.dispatchEvent(new Event('online')));
  await page.evaluate(()=>window.unmountTimeline());
  assert.equal(requests.length,count);
  console.log('PASS timeline: pagination, idle completion, cursor dedupe, connection recovery, denial clears data and stops polling');
} finally {
  await browser?.close();
  if (server) await new Promise((resolve)=>server.close(resolve));
  await rm(temporary,{recursive:true,force:true});
}
