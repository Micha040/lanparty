export function formatTime(totalSeconds: number): string {
  if (totalSeconds == null || typeof totalSeconds !== 'number' || isNaN(totalSeconds)) {
    totalSeconds = 0;
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
}

export function parseTime(val: string): number {
  if (!val) return 0;
  const parts = val.trim().split(':');
  let totalSeconds = 0;
  if (parts.length === 3) {
    totalSeconds = (parseInt(parts[0], 10) || 0) * 3600 + (parseInt(parts[1], 10) || 0) * 60 + (parseInt(parts[2], 10) || 0);
  } else if (parts.length === 2) {
    totalSeconds = (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  } else {
    totalSeconds = parseInt(parts[0], 10) || 0;
  }
  return Math.max(0, totalSeconds);
}
