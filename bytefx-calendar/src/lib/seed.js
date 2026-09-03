/**
 * Deterministic pseudo-randomness.
 *
 * Every generated figure in the calendar is derived from a string seed such as
 * `us-nonfarm-payrolls|2026-09-04|actual`. The same seed always produces the
 * same number, which means:
 *
 *   - the server render and the client hydration agree exactly,
 *   - navigating away from a date and back shows the same figures,
 *   - and the data still looks unpredictable release to release.
 */

/** FNV-1a — small, fast, good enough spread for this. */
export function hashString(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** A seeded generator returning floats in [0, 1). */
export function seededRandom(seed) {
  let state = hashString(seed) || 1;
  return function next() {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0x100000000;
  };
}

/** One-shot float in [0, 1) for a seed. */
export function randomFor(seed) {
  return seededRandom(seed)();
}

/** Float in [min, max) for a seed. */
export function floatFor(seed, min, max) {
  return min + randomFor(seed) * (max - min);
}

/** Integer in [min, max] for a seed. */
export function intFor(seed, min, max) {
  return Math.floor(floatFor(seed, min, max + 1));
}

/** Pick one item from a list, deterministically. */
export function pickFor(seed, list) {
  return list[intFor(seed, 0, list.length - 1)];
}

/** True with probability `p`. */
export function chanceFor(seed, p) {
  return randomFor(seed) < p;
}

/**
 * Approximately normal noise in roughly [-1, 1], by averaging four uniforms.
 * Gives figures that cluster near the mean instead of spreading flat, which is
 * what real forecast deviations look like.
 */
export function noiseFor(seed) {
  const next = seededRandom(seed);
  const sum = next() + next() + next() + next();
  return (sum / 2 - 1);
}
