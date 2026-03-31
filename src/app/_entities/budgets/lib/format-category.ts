const formatCategory = (raw: string): string => {
  return raw
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export { formatCategory };
