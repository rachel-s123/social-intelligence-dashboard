export const getMarketDisplayName = (key) => {
  if (!key) return '';
  const normalized = key.toLowerCase();
  if (normalized === 'uk') return 'UK';
  return normalized
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
