export function formatInteger(value) {
  if (!Number.isFinite(value)) {
    return 'n/a';
  }

  return Math.round(value).toLocaleString('en-US');
}

export function formatDecimal(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return 'n/a';
  }

  return value.toFixed(digits);
}

export function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return 'n/a';
  }

  return `${value.toFixed(2)}%`;
}

export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return 'n/a';
  }

  const seconds = Math.round(totalSeconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}
