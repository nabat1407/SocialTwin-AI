import type { DocumentKind } from '@/lib/documents';
import type { Locale } from '@/lib/schemas';
import { parseDocument } from '@/lib/document-layout';

export function DocumentPreview({
  text,
  locale,
  kind,
  name = '',
  template = 'modern',
}: {
  text: string;
  locale: Locale;
  kind: DocumentKind;
  name?: string;
  template?: 'modern' | 'classic';
}) {
  const paper = parseDocument(text, locale, kind, name);
  return (
    <article
      className={`document-paper paper-${template} paper-${kind}`}
      aria-label="Sənədin çap görünüşü"
    >
      {(paper.title || paper.lead.length > 0) && (
        <header className={`paper-heading ${kind === 'letter' ? 'paper-letter-heading' : ''}`}>
          {paper.title && <h1>{paper.title}</h1>}
          {kind === 'letter'
            ? paper.lead
                .join('\n')
                .split(/\n\s*\n/u)
                .map((p, i) => <p key={i}>{p}</p>)
            : paper.lead.map((line, i) =>
                line.trim() ? <p key={i}>{line}</p> : <div key={i} className="paper-gap" />,
              )}
        </header>
      )}
      {paper.sections.map((section, i) => (
        <section className="paper-section" key={`${i}-${section.title}`}>
          <h2>{section.title}</h2>
          {section.lines.map((line, j) =>
            line.trim() ? (
              <p key={j} className={line.startsWith('• ') ? 'paper-bullet' : undefined}>
                {line}
              </p>
            ) : (
              <div className="paper-gap" key={j} />
            ),
          )}
        </section>
      ))}
    </article>
  );
}
