import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hasExportedFunction,importsAndCalls} from '../scripts/audits/bridge-wiring.ts';
test('bridge evidence requires an exported function and real import/call syntax rather than markers',()=>{
 const entry='/repo/service.ts',target='/repo/bridge.ts',symbol='start';
 assert.equal(hasExportedFunction('// export function start() {}','start'),false);
 assert.equal(hasExportedFunction('export function start() {}','start'),true);
 assert.equal(importsAndCalls('// import {start} from "./bridge.ts"; start()',entry,target,symbol),false);
 assert.equal(importsAndCalls('const marker=\'start()\'; const {start}=await import("./bridge.ts");',entry,target,symbol),false);
 assert.equal(importsAndCalls('const {start}=await import("./wrong.ts"); start();',entry,target,symbol),false);
 assert.equal(importsAndCalls('const {start:boot}=await import("./bridge.ts"); boot();',entry,target,symbol),true);
 assert.equal(importsAndCalls('import {start as boot} from "./bridge.ts"; boot();',entry,target,symbol),true);
});
