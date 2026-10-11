// Where a job sits in the pipeline. Order matters: automatic updates only move forward.
export const STATUSES = [
  'found',        // discovered by a scan or import, not yet rated
  'rated',        // fit score/verdict recorded
  'picked',       // you chose Apply
  'preparing',    // resume/cover letter/form being prepared
  'ready',        // filled and waiting at the review gate
  'submitted',    // you confirmed it was submitted
  'interviewing',
  'offer',
  'rejected',
  'withdrawn',
  'closed',       // posting disappeared before you applied
  'passed',       // you chose Pass, or it was excluded
];

export const CHOICES = ['apply', 'maybe', 'pass'];

// Statuses a scan or import may never overwrite on its own.
export const SETTLED = new Set(['submitted', 'interviewing', 'offer', 'rejected', 'withdrawn', 'passed']);

const rank = new Map(STATUSES.map((status, index) => [status, index]));

export function assertStatus(status) {
  if (!rank.has(status)) throw new Error(`Unknown status "${status}". Use one of: ${STATUSES.join(', ')}`);
  return status;
}

export function assertChoice(choice) {
  if (!CHOICES.includes(choice)) throw new Error(`Unknown choice "${choice}". Use one of: ${CHOICES.join(', ')}`);
  return choice;
}

// True when moving from `current` to `next` is forward progress (never out of a settled status).
export function isForward(current, next) {
  if (SETTLED.has(current) || current === 'closed') return false;
  return rank.get(next) > rank.get(current);
}
