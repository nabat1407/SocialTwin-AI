import { describe, expect, it } from 'vitest';
import { deadlineNotice } from '../src/lib/deadline-notice';
import type { Opportunity } from '../src/lib/schemas';
const deadline: Opportunity['deadline'] = {
  kind: 'fixed_datetime',
  date: '2026-10-09',
  instant: '2026-10-09T18:00:00+04:00',
};
const cutoff = Date.parse(deadline.instant!);
describe('deadline warnings from the source cutoff', () => {
  it('shows remaining days and distinct approaching/normal states at the seven-day boundary', () => {
    expect(deadlineNotice(deadline, cutoff - 7 * 86400000)).toMatchObject({
      state: 'approaching',
      text: '7 gün qalır',
    });
    expect(deadlineNotice(deadline, cutoff - 7 * 86400000 - 1).state).toBe('normal');
    expect(deadlineNotice(deadline, cutoff - 12 * 86400000 - 2 * 3600000)).toMatchObject({
      state: 'normal',
      text: '12 gün 2 saat qalır',
    });
  });
  it('shows red urgency at exactly three hours and below', () => {
    expect(deadlineNotice(deadline, cutoff - 3 * 3600000)).toMatchObject({
      state: 'urgent',
      text: 'Vaxt bitir! 3 saat qalır',
    });
    expect(deadlineNotice(deadline, cutoff - 15 * 60000)).toMatchObject({
      state: 'urgent',
      text: 'Vaxt bitir! 15 dəqiqə qalır',
    });
  });
  it('does not label more than three hours critical and expires at the exact cutoff', () => {
    expect(deadlineNotice(deadline, cutoff - 3 * 3600000 - 1).state).toBe('soon');
    expect(deadlineNotice(deadline, cutoff).state).toBe('expired');
    expect(deadlineNotice(deadline, cutoff + 1).state).toBe('expired');
  });
  it('does not invent countdowns for unknown/date-only/rolling deadlines', () => {
    expect(deadlineNotice({ kind: 'fixed_date', date: '2026-10-09' }, cutoff - 3600000).state).toBe(
      'uncertain',
    );
    expect(deadlineNotice({ kind: 'rolling', date: null }, cutoff).state).toBe('normal');
    expect(
      deadlineNotice({ kind: 'fixed_datetime', date: '2026-10-09', instant: 'invalid' }, cutoff)
        .state,
    ).toBe('uncertain');
  });
});
