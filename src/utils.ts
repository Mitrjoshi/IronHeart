export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

// utils/index.ts
export const formatElapsedTime = (ms: number) => {
  const sec = Math.floor((ms / 1000) % 60);
  const min = Math.floor((ms / (1000 * 60)) % 60);
  const hr = Math.floor(ms / (1000 * 60 * 60));

  if (hr > 0) return `${hr}h ${min}m ${sec}s`;
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
};

export const formatDuration = (seconds: number) => {
  const hr = Math.floor(seconds / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;

  if (hr > 0) return `${hr}h ${min}m ${sec}s`;
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
};

export const formatVolume = (volume: number) => {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}t`;
  return `${volume}kg`;
};

export const formatWeight = (kg: number) => {
  if (kg === 0) return "0kg";
  return `${kg}kg`;
};
