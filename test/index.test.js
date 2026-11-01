import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { resolve } from 'node:path';

test('cortex CLI runs with custom parameters', (t, done) => {
  const cliPath = resolve('src', 'index.js');
  execFile('node', [cliPath, '--workers', '2', '--duration', '1000'], (error, stdout, stderr) => {
    assert.ifError(error);
    assert.match(stdout, /Cortex benchmark completed/);
    assert.match(stdout, /Workers\s+:\s+2/);
    assert.match(stdout, /Total ops\s+:/);
    done();
  });
});
