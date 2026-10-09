import type { Opportunity } from './schemas';
export function deadlineNotice(deadline: Opportunity['deadline'], now: number) {
  if (deadline.kind === 'rolling')
    return { state: 'normal' as const, text: 'Davamlı qəbul', remaining_ms: null };
  if (deadline.kind !== 'fixed_datetime')
    return {
      state: 'uncertain' as const,
      text: 'Dəqiq bağlanma saatını mənbədə yoxla',
      remaining_ms: null,
    };
  const remaining = Date.parse(deadline.instant ?? '') - now;
  if (!Number.isFinite(remaining))
    return {
      state: 'uncertain' as const,
      text: 'Dəqiq son tarix təsdiqlənməlidir',
      remaining_ms: null,
    };
  if (remaining <= 0) return { state: 'expired' as const, text: 'Qəbul bitib', remaining_ms: 0 };
  const minutes = Math.ceil(remaining / 60000);
  const hours = Math.floor(minutes / 60);
  const extraMinutes = minutes % 60;
  const duration = [hours ? `${hours} saat` : '', extraMinutes ? `${extraMinutes} dəqiqə` : '']
    .filter(Boolean)
    .join(' ');
  if (remaining <= 3 * 3600000)
    return {
      state: 'urgent' as const,
      text: `Vaxt bitir! ${duration} qalır`,
      remaining_ms: remaining,
    };
  if (remaining <= 24 * 3600000)
    return { state: 'soon' as const, text: `Son gün: ${duration} qalır`, remaining_ms: remaining };
  const days = Math.floor(remaining / 86400000);
  const restHours = Math.floor((remaining % 86400000) / 3600000);
  const dayDuration = `${days} gün${restHours ? ` ${restHours} saat` : ''}`;
  if (remaining <= 7 * 86400000)
    return { state: 'approaching' as const, text: `${dayDuration} qalır`, remaining_ms: remaining };
  return { state: 'normal' as const, text: `${dayDuration} qalır`, remaining_ms: remaining };
}
