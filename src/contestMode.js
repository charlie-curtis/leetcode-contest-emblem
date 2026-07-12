export const CONTEST_MODES = new Set(['actual', 'virtual']);

export function normalizeContestMode(value = 'actual') {
  const normalized = String(value || 'actual').trim().toLowerCase();
  if (!CONTEST_MODES.has(normalized)) {
    const error = new Error(`Invalid contest mode "${value}". Use "actual" or "virtual".`);
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

export function contestModeLabel(mode) {
  return mode === 'virtual' ? 'Virtual contest stats' : 'Actual contest stats';
}
