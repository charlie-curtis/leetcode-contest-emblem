import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeContestMode, contestModeLabel } from '../src/contestMode.js';

test('normalizeContestMode defaults to actual', () => {
  assert.equal(normalizeContestMode(), 'actual');
  assert.equal(normalizeContestMode(''), 'actual');
});

test('normalizeContestMode accepts actual and virtual', () => {
  assert.equal(normalizeContestMode('actual'), 'actual');
  assert.equal(normalizeContestMode('Virtual'), 'virtual');
});

test('normalizeContestMode rejects unknown modes', () => {
  assert.throws(() => normalizeContestMode('ranked'), /Invalid contest mode/);
});

test('contestModeLabel formats mode labels', () => {
  assert.equal(contestModeLabel('actual'), 'Actual contest stats');
  assert.equal(contestModeLabel('virtual'), 'Virtual contest stats');
});
