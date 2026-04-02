import { describe, it, expect } from 'vitest';
import { formatDate } from '../../src/utils/format';

describe('formatDate', () => {
  it('converts ISO UTC date to YYYY-MM-DD HH:MM format', () => {
    expect(formatDate('2026-04-01T14:30:00Z')).toBe('2026-04-01 14:30');
  });

  it('pads single-digit month and day', () => {
    expect(formatDate('2026-01-05T09:05:00Z')).toBe('2026-01-05 09:05');
  });

  it('handles midnight UTC correctly', () => {
    expect(formatDate('2026-12-31T00:00:00Z')).toBe('2026-12-31 00:00');
  });
});
