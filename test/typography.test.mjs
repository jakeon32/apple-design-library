import assert from 'node:assert/strict';
import { computeOpticalSizing } from '../demos/typography.js';

// At the 16px baseline, tracking and leading should sit at their neutral values.
{
  const { tracking, leading } = computeOpticalSizing(16);
  assert.equal(tracking, 0, `expected 0 tracking at baseline, got ${tracking}`);
  assert.equal(leading, 1.5, `expected 1.5 leading at baseline, got ${leading}`);
  console.log('PASS: baseline (16px) is neutral');
}

// Large text: tracking goes negative, leading tightens.
{
  const { tracking, leading } = computeOpticalSizing(80);
  assert.ok(tracking < 0, `expected negative tracking for large text, got ${tracking}`);
  assert.ok(leading < 1.5, `expected tighter leading for large text, got ${leading}`);
  console.log('PASS: large text gets negative tracking and tighter leading');
}

// Small text: tracking goes positive, leading loosens.
{
  const { tracking, leading } = computeOpticalSizing(12);
  assert.ok(tracking > 0, `expected positive tracking for small text, got ${tracking}`);
  assert.ok(leading > 1.5, `expected looser leading for small text, got ${leading}`);
  console.log('PASS: small text gets positive tracking and looser leading');
}

console.log('\nAll typography.js tests passed.');
