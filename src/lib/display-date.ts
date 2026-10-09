const months = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avqust',
  'sentyabr',
  'oktyabr',
  'noyabr',
  'dekabr',
];
// Use the source calendar date, without converting a deadline to another zone.
export function displayDateAz(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return months[month - 1] && day > 0 && day < 32
    ? `${day} ${months[month - 1]} ${year}`
    : 'Tarix məlum deyil';
}
