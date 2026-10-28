import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatDateTime, toDisplayDate } from './dateTimeUtils.ts';

describe('formatDateTime', () => {
  it('formats date-only yyyy-MM-dd from calendar parts without timezone shift', () => {
    assert.equal(formatDateTime('2026-10-26'), '26/10/2026');
    assert.equal(formatDateTime('2026-10-26', 'YYYY-MM-DD'), '2026-10-26');
  });

  it('formats date-only midnight without timezone designator as calendar date', () => {
    assert.equal(formatDateTime('2026-10-26T00:00:00'), '26/10/2026');
    assert.equal(formatDateTime('2026-10-26 00:00:00'), '26/10/2026');
  });

  it('formats ISO timestamps in the browser local timezone', () => {
    const value = new Date('2026-10-26T13:30:00.000Z');
    const expected = formatDateTime(value, 'DD/MM/YYYY HH:mm:ss');
    assert.equal(
      formatDateTime('2026-10-26T13:30:00.000Z', 'DD/MM/YYYY HH:mm:ss'),
      expected
    );
  });

  it('returns dash for empty values', () => {
    assert.equal(formatDateTime(null), '-');
    assert.equal(formatDateTime(undefined), '-');
    assert.equal(formatDateTime(''), '-');
  });
});

describe('toDisplayDate', () => {
  it('uses the same calendar rules but returns empty string for blanks', () => {
    assert.equal(toDisplayDate(null), '');
    assert.equal(toDisplayDate(''), '');
    assert.equal(toDisplayDate('2026-10-26'), '26/10/2026');
  });
});
