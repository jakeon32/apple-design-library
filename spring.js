// Apple's damping/response spring model — see ~/.claude/skills/apple-design/SKILL.md §4-6.
// damping: 1.0 = critically damped (no overshoot). < 1.0 = underdamped (bouncy).
// response: seconds to reach the target — NOT a fixed duration; settle time emerges from the physics.

export function springStep(current, target, velocity, dt, { damping = 1, response = 0.4 } = {}) {
  const angularFreq = (2 * Math.PI) / response;
  const dampingCoef = 2 * damping * angularFreq;
  const springCoef = angularFreq * angularFreq;
  const accel = springCoef * (target - current) - dampingCoef * velocity;
  const newVelocity = velocity + accel * dt;
  const newPosition = current + newVelocity * dt;
  return { position: newPosition, velocity: newVelocity };
}

export function animateSpring({
  from,
  to,
  velocity = 0,
  damping = 1,
  response = 0.4,
  onUpdate,
  onComplete,
  settleThreshold = 0.01,
}) {
  let position = from;
  let vel = velocity;
  let target = to;
  let rafId = null;
  let lastTime = null;
  let cancelled = false;
  // Distinct from `cancelled`: set when the spring settles naturally and the
  // rAF loop stops scheduling itself. retarget() uses this (not `cancelled`)
  // to decide whether the loop needs to be woken back up — settling is
  // resumable, cancellation is terminal.
  let settled = false;

  function frame(time) {
    if (cancelled) return;
    if (lastTime === null) lastTime = time;
    const dt = Math.min((time - lastTime) / 1000, 1 / 30); // clamp to avoid a spiral of death on tab switch
    lastTime = time;

    const step = springStep(position, target, vel, dt, { damping, response });
    position = step.position;
    vel = step.velocity;
    onUpdate(position, vel);

    const isSettled = Math.abs(target - position) < settleThreshold && Math.abs(vel) < settleThreshold;
    if (isSettled) {
      onUpdate(target, 0);
      settled = true;
      rafId = null;
      if (onComplete) onComplete();
      return;
    }
    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);

  return {
    cancel() {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    },
    retarget(newTarget, newVelocity) {
      target = newTarget;
      if (newVelocity !== undefined) vel = newVelocity;
      // If the loop already settled (and wasn't cancelled), it stopped
      // scheduling rAF callbacks — nothing will ever read the new target
      // unless we restart it, mirroring the initial bootstrap below.
      if (settled && !cancelled) {
        settled = false;
        lastTime = null;
        rafId = requestAnimationFrame(frame);
      }
    },
    getState() {
      return { position, velocity: vel };
    },
  };
}

// Progressive resistance past a boundary — the further past the edge, the less the element follows.
export function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

// Momentum projection — where a release velocity would carry the element if it decelerated naturally.
export function project(initialVelocity, decelerationRate = 0.998) {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}
