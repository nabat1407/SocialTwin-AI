import { sectionLabels, type DocumentKind } from './documents';
import type { Locale } from './schemas';

export type PaperSection = { title: string; lines: string[] };

// Parse the current editor text rather than regenerating or replacing user edits.
export function parseDocument(text: string, locale: Locale, kind: DocumentKind, name = '') {
  const lines = text.replace(/\r\n?/gu, '\n').split('\n');
  const first = lines.findIndex((line) => Boolean(line.trim()));
  const hasName = first >= 0 && Boolean(name.trim()) && lines[first].trim() === name.trim();
  const hasTitle = hasName || (kind === 'plan' && first >= 0);
  const title = hasTitle ? lines[first].trim() : '';
  if (hasTitle) lines.splice(first, 1);
  const headings = new Set(Object.values(sectionLabels[locale]));
  const lead: string[] = [];
  const sections: PaperSection[] = [];
  let current: PaperSection | null = null;
  for (const line of lines) {
    const clean = line.trim();
    const heading = headings.has(clean) || (kind === 'plan' && /^\d+[.)]\s/u.test(clean));
    if (heading) {
      current = { title: clean, lines: [] };
      sections.push(current);
    } else {
      (current?.lines ?? lead).push(line);
    }
  }
  const trimBlank = (values: string[]) => {
    while (values.length && !values[0].trim()) values.shift();
    while (values.length && !values[values.length - 1].trim()) values.pop();
    return values;
  };
  return {
    title,
    lead: trimBlank(lead),
    sections: sections.map((s) => ({ ...s, lines: trimBlank(s.lines) })),
  };
}
