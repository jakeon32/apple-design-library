import assert from 'node:assert/strict';
import { resolveDemoFromHash } from '../app.js';

const demos = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

assert.equal(resolveDemoFromHash('#b', demos).id, 'b', 'should resolve an existing hash to its demo');
assert.equal(resolveDemoFromHash('', demos).id, 'a', 'empty hash should fall back to the first demo');
assert.equal(resolveDemoFromHash('#does-not-exist', demos).id, 'a', 'unknown hash should fall back to the first demo');
assert.equal(resolveDemoFromHash('#a', demos).id, 'a', 'should resolve the first demo explicitly');

console.log('PASS: resolveDemoFromHash');
