import assert from "node:assert/strict";

const endpoint = process.env.SHEET_CDP_URL ?? "http://127.0.0.1:9222";
const target = await (await fetch(new URL("/json/new?about:blank", endpoint), { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener("open", resolve, {once:true}));
let id = 0;
const calls = new Map();
ws.addEventListener("message", ({data}) => {
  const response = JSON.parse(data);
  if (response.id) {
    calls.get(response.id)(response);
    calls.delete(response.id);
  }
});
async function call(method, params) {
  const request = ++id;
  const pending = new Promise(resolve => calls.set(request, resolve));
  ws.send(JSON.stringify({id:request, method, params}));
  const response = await pending;
  if (response.error) throw Error(JSON.stringify(response.error));
  return response.result;
}
async function evaluate(expression) {
  const response = await call("Runtime.evaluate", {expression, returnByValue:true});
  if (response.exceptionDetails) throw Error(response.exceptionDetails.exception.description);
  return response.result.value;
}
async function waitFor(selector) {
  for (let retry = 0; retry < 150; retry++) {
    if (await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error(`Missing ${selector}`);
}
await call("Emulation.setDeviceMetricsOverride", {mobile:true,width:393,height:740,deviceScaleFactor:2});
await call("Emulation.setTouchEmulationEnabled", {enabled:true,maxTouchPoints:5});
await call("Page.navigate", {url: process.env.SHEET_TEST_URL ?? "http://127.0.0.1:5173/"});
await waitFor(".login-demo-btn, .chat-fab");
await evaluate("document.querySelector('.login-demo-btn')?.click()");
await waitFor(".chat-fab");
assert.equal(await evaluate("document.querySelectorAll('.chat-fab').length"), 1);
async function touch(type, x, y) {
  await call("Input.dispatchTouchEvent", {type,touchPoints:type === "touchEnd" || type === "touchCancel" ? [] : [{x,y,id:0}]});
}
async function center(selector) {
  return evaluate(`(() => {const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2]})()`);
}
const fab = await center(".chat-fab");
await touch("touchStart", ...fab);
await touch("touchEnd");
await waitFor(".mobile-chat-sheet");
await new Promise(resolve => setTimeout(resolve, 300));
const opened = await evaluate(`(() => {
  const b = document.querySelector('.mobile-chat-sheet .v2-send');
  const r = b.getBoundingClientRect();
  const hit = document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
  return {fabs:document.querySelectorAll('.chat-fab').length,hit:hit?.tagName,sendHit:b.contains(hit),viewport:visualViewport.height,slider:document.querySelector('[role=slider]').getAttribute('aria-valuenow')};
})()`);
assert.equal(opened.fabs, 0);
assert.equal(opened.sendHit, true);
const grip = await center(".mobile-sheet-grip");
await touch("touchStart", ...grip);
await touch("touchMove", grip[0], grip[1]-95);
await touch("touchMove", grip[0], grip[1]-145);
await touch("touchEnd");
await new Promise(resolve => setTimeout(resolve, 300));
assert.equal(await evaluate("document.querySelector('[role=slider]').getAttribute('aria-valuenow')"), "45");
if (process.env.SHEET_EXPECTED_SHA) {
  await waitFor('textarea[aria-label="Métricas de la hoja"]');
  const report = await evaluate(`JSON.parse(document.querySelector('textarea[aria-label="Métricas de la hoja"]').value)`);
  assert.equal(report.build, process.env.SHEET_EXPECTED_SHA);
  assert.equal(report.fabCount, 0);
  assert.equal(report.sendHit, true);
  assert.ok(report.counters.touchmove > 0);
  assert.equal(typeof report.activeTag, "string");
} else {
  assert.equal(await evaluate(`document.querySelector('textarea[aria-label="Métricas de la hoja"]')`), null);
}
const message = "Mensaje sintético de prueba del FAB";
await evaluate(`(() => {
  const textarea = document.querySelector(".mobile-chat-sheet textarea");
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(textarea, ${JSON.stringify(message)});
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
})()`);
const send = await center(".mobile-chat-sheet .v2-send");
await touch("touchStart", ...send);
await touch("touchEnd");
await waitFor('.mobile-chat-sheet [title="Detener"]');
await waitFor('.mobile-chat-sheet [title="Enviar"]');
assert.equal(await evaluate(`document.querySelector(".side-chat-body").textContent.split(${JSON.stringify(message)}).length - 1`), 1);
const close = await center('.mobile-chat-sheet [aria-label="Cerrar chat"]');
await touch("touchStart", ...close);
await touch("touchEnd");
await waitFor(".chat-fab");
assert.equal(await evaluate("document.querySelectorAll('.mobile-chat-sheet').length"), 0);
await touch("touchStart", ...fab);
await touch("touchEnd");
await waitFor(".mobile-chat-sheet");
assert.equal(await evaluate("document.querySelectorAll('.chat-fab').length"), 0);
const reopenedGrip = await center(".mobile-sheet-grip");
await touch("touchStart", ...reopenedGrip);
await touch("touchEnd");
await new Promise(resolve => setTimeout(resolve, 300));
const cancelledGrip = await center(".mobile-sheet-grip");
await touch("touchStart", ...cancelledGrip);
await touch("touchCancel");
assert.equal(await evaluate("document.querySelector('[role=slider]').getAttribute('aria-valuenow')"), "45");
const tapGrip = await center(".mobile-sheet-grip");
await touch("touchStart", ...tapGrip);
await touch("touchEnd");
assert.equal(await evaluate("document.querySelector('[role=slider]').getAttribute('aria-valuenow')"), "68");
await evaluate(`document.querySelector('[role="slider"]').focus()`);
await call("Input.dispatchKeyEvent", { type: "keyDown", key: "End", code: "End" });
assert.equal(await evaluate("document.querySelector('[role=slider]').getAttribute('aria-valuenow')"), "100");
await new Promise(resolve => setTimeout(resolve, 300));
const downGrip = await center(".mobile-sheet-grip");
await touch("touchStart", ...downGrip);
await touch("touchMove", downGrip[0], downGrip[1] + 410);
await touch("touchEnd");
assert.equal(await evaluate("document.querySelector('[role=slider]').getAttribute('aria-valuenow')"), "45");
await new Promise(resolve => setTimeout(resolve, 300));
console.log("PASS: mobile FAB, send hit testing and single submission, drag, close and reopen");
ws.close();
await fetch(new URL(`/json/close/${target.id}`, endpoint));
