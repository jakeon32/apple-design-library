import assert from 'node:assert/strict';
import { springStep, animateSpring, rubberband, project } from '../spring.js';

// Minimal deterministic rAF polyfill for testing animateSpring in Node.
// Node has no native requestAnimationFrame/cancelAnimationFrame; a queue
// flushed manually via tick() keeps these tests synchronous and
// deterministic instead of depending on real wall-clock timing.
let rafQueue = [];
let simulatedTime = 0;
globalThis.requestAnimationFrame = (cb) => {
  rafQueue.push(cb);
  return rafQueue.length;
};
globalThis.cancelAnimationFrame = () => {};
function tick(deltaMs) {
  simulatedTime += deltaMs;
  const queue = rafQueue;
  rafQueue = [];
  queue.forEach((cb) => cb(simulatedTime));
}

// springStep: critically damped (damping=1.0) converges without overshoot
{
  let current = 0, velocity = 0;
  const target = 100;
  let maxPosition = 0;
  for (let i = 0; i < 1000; i++) {
    const step = springStep(current, target, velocity, 1 / 60, { damping: 1, response: 0.4 });
    current = step.position;
    velocity = step.velocity;
    maxPosition = Math.max(maxPosition, current);
  }
  assert.ok(Math.abs(current - target) < 0.1, `expected convergence near ${target}, got ${current}`);
  assert.ok(maxPosition <= target + 0.5, `critically damped spring should not overshoot, max was ${maxPosition}`);
  console.log('PASS: springStep critically damped converges without overshoot');
}

// springStep: underdamped (damping<1.0) overshoots
{
  let current = 0, velocity = 0;
  const target = 100;
  let maxPosition = 0;
  for (let i = 0; i < 1000; i++) {
    const step = springStep(current, target, velocity, 1 / 60, { damping: 0.5, response: 0.4 });
    current = step.position;
    velocity = step.velocity;
    maxPosition = Math.max(maxPosition, current);
  }
  assert.ok(maxPosition > target + 1, `underdamped spring should overshoot, max was ${maxPosition}`);
  console.log('PASS: springStep underdamped overshoots');
}

// rubberband: zero overshoot -> zero resistance offset
{
  assert.equal(rubberband(0, 300, 0.55), 0, 'zero overshoot should produce zero displacement');
  console.log('PASS: rubberband(0) === 0');
}

// rubberband: displacement always less than raw overshoot, grows with overshoot
{
  const small = rubberband(10, 300, 0.55);
  const large = rubberband(100, 300, 0.55);
  assert.ok(large > small, 'larger overshoot should produce larger displacement');
  assert.ok(large < 100, 'rubberband displacement must always be less than the raw overshoot');
  console.log('PASS: rubberband dampens large overshoot');
}

// project: zero velocity -> zero projected distance
{
  assert.equal(project(0), 0, 'zero velocity should project zero distance');
  console.log('PASS: project(0) === 0');
}

// project: higher velocity projects further
{
  const slow = project(500);
  const fast = project(2000);
  assert.ok(fast > slow, 'higher velocity should project further');
  console.log('PASS: project scales with velocity');
}

// animateSpring: converges to target over repeated simulated frames
{
  let lastPosition = null;
  const handle = animateSpring({
    from: 0,
    to: 100,
    damping: 1,
    response: 0.4,
    onUpdate: (position) => {
      lastPosition = position;
    },
  });
  for (let i = 0; i < 120 && lastPosition !== 100; i++) {
    tick(16);
  }
  assert.ok(Math.abs(lastPosition - 100) < 0.5, `expected animateSpring to converge near 100, got ${lastPosition}`);
  handle.cancel();
  console.log('PASS: animateSpring converges to target');
}

// animateSpring: cancel() stops further onUpdate calls
{
  let updateCount = 0;
  const handle = animateSpring({
    from: 0,
    to: 100,
    damping: 1,
    response: 0.4,
    onUpdate: () => {
      updateCount += 1;
    },
  });
  tick(16);
  tick(16);
  const countAfterCancel = updateCount;
  handle.cancel();
  tick(16);
  tick(16);
  assert.equal(updateCount, countAfterCancel, 'cancel() should stop further onUpdate calls');
  console.log('PASS: animateSpring cancel() stops updates');
}

// animateSpring: retarget() after natural settle resumes the animation loop
{
  let position = null;
  let completed = false;
  const handle = animateSpring({
    from: 0,
    to: 1, // small hop settles in very few frames
    damping: 1,
    response: 0.15,
    settleThreshold: 0.01,
    onUpdate: (p) => {
      position = p;
    },
    onComplete: () => {
      completed = true;
    },
  });

  // Drive the clock until the spring settles naturally.
  for (let i = 0; i < 60 && !completed; i++) {
    tick(16);
  }
  assert.ok(completed, 'expected the spring to settle naturally before retargeting');
  assert.ok(Math.abs(position - 1) < 0.01, `expected settled position near 1, got ${position}`);

  const settledPosition = position;

  // Now retarget a settled handle — this must resume the rAF loop, not no-op.
  // Without the fix, nothing reads the new target and position stays frozen
  // at settledPosition forever.
  handle.retarget(50);
  for (let i = 0; i < 60; i++) {
    tick(16);
  }
  assert.ok(
    position > settledPosition + 1,
    `expected retarget() to resume animation toward 50, position stuck at ${position}`
  );
  assert.ok(Math.abs(position - 50) < 1, `expected animateSpring to converge near 50 after retarget, got ${position}`);

  handle.cancel();
  console.log('PASS: animateSpring retarget() resumes after settling');
}

console.log('\nAll spring.js tests passed.');
