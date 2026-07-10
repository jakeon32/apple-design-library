import assert from 'node:assert/strict';
import { springStep, rubberband, project } from '../spring.js';

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

console.log('\nAll spring.js tests passed.');
