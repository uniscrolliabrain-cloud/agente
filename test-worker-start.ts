import { TaskWorker } from "./apps/server/src/engine/worker.ts";

console.log("TaskWorker name:", TaskWorker.name);
console.log("TaskWorker toString:", TaskWorker.toString().slice(0, 200));
console.log("Prototype keys:", Object.getOwnPropertyNames(TaskWorker.prototype));
console.log("Has start:", 'start' in TaskWorker.prototype);
console.log("Has stop:", 'stop' in TaskWorker.prototype);
console.log("Has abort:", 'abort' in TaskWorker.prototype);
console.log("Has tick:", 'tick' in TaskWorker.prototype);
console.log("Has run:", 'run' in TaskWorker.prototype);

// Check if run exists and where it comes from
if ('run' in TaskWorker.prototype) {
  const desc = Object.getOwnPropertyDescriptor(TaskWorker.prototype, 'run');
  console.log("run descriptor:", desc ? 'found' : 'undefined');
  console.log("run is own?", TaskWorker.prototype.hasOwnProperty('run'));
}