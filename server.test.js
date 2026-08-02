import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt, getAllowedOrigin } from './server.js';

test('buildPrompt instructs the model to help with Bible study and return richer scripture context', () => {
  const prompt = buildPrompt('What does the Bible say about purple?');

  assert.match(prompt, /Bible study/i);
  assert.match(prompt, /3 to 5 verse objects/i);
  assert.match(prompt, /context/i);
  assert.match(prompt, /do not use any hard-coded verse list/i);
});

test('getAllowedOrigin accepts localhost Vite ports', () => {
  assert.equal(getAllowedOrigin('http://localhost:5174'), 'http://localhost:5174');
  assert.equal(getAllowedOrigin('http://127.0.0.1:5175'), 'http://127.0.0.1:5175');
});

test('buildPrompt prioritizes verses that directly mention the color the user asks about', () => {
  const prompt = buildPrompt('What does the Bible say about blue?');

  assert.match(prompt, /directly mention.*color/i);
});
