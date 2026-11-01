#!/usr/bin/env node
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { cpus } from 'node:os';
import { argv, exit } from 'node:process';

if (isMainThread) {
  const args = new Map();
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key && value) {
      args.set(key.replace(/^--/, ''), value);
    }
  }

  const workerCount = Number(args.get('workers')) || cpus().length;
  const durationMs = Number(args.get('duration')) || 5000;

  const workers = [];
  const results = new Array(workerCount).fill(0);
  let completed = 0;

  for (let i = 0; i < workerCount; i++) {
    const worker = new Worker(new URL(import.meta.url), {
      workerData: { durationMs }
    });
    worker.on('message', (msg) => {
      if (msg.type === 'ops') {
        results[i] = msg.count;
      }
    });
    worker.on('exit', () => {
      completed++;
      if (completed === workerCount) {
        const total = results.reduce((a, b) => a + b, 0);
        console.log('Cortex benchmark completed');
        console.log(`Workers   : ${workerCount}`);
        console.log(`Duration  : ${durationMs} ms`);
        console.log(`Total ops : ${total}`);
        console.log(`Ops/worker: ${results.map((c) => Math.round(c)).join(', ')}`);
        exit(0);
      }
    });
    workers.push(worker);
  }
} else {
  const { durationMs } = workerData;
  const end = Date.now() + durationMs;
  let ops = 0;
  while (Date.now() < end) {
    ops += Math.imul(123456789, 987654321) >>> 0;
  }
  parentPort.postMessage({ type: 'ops', count: ops });
  process.exit(0);
}
