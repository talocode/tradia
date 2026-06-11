export function maskApiKey(key: string | undefined | null): string {
  if (!key?.trim()) {
    return '(not set)';
  }

  const trimmed = key.trim();
  if (trimmed.length <= 4) {
    return '****';
  }

  const prefix = trimmed.startsWith('uw_') ? 'uw_' : trimmed.slice(0, 3);
  const suffix = trimmed.slice(-4);
  return `${prefix}****${suffix}`;
}

export function containsFullApiKey(text: string, key: string | undefined | null): boolean {
  if (!key?.trim()) {
    return false;
  }
  return text.includes(key.trim());
}