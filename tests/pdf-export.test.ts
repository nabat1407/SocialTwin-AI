import { describe, expect, it, vi } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { renderPdf, wrapPdfText } from '../src/lib/server/pdf-export';
import { parseDocument } from '../src/lib/document-layout';
import { exportRequestSchema } from '../src/lib/export-contracts';
import type { ExportRequest } from '../src/lib/export-contracts';

vi.mock('server-only', () => ({}));
const input: ExportRequest = {
  text: 'Aysel Əliyeva\naysel@example.test\n\nTƏHSİL\nİnformasiya texnologiyaları · 2024\n\nLAYİHƏLƏR\n• Müştəri sorğularını Excel ilə təhlil etdim.',
  name: 'Aysel Əliyeva',
  locale: 'az',
  kind: 'cv',
  template: 'modern',
  approved: true,
  demo: false,
};

describe('editable document PDF export', () => {
  it('preserves edited paragraphs, bullets and AZ section labels in the layout', () => {
    const paper = parseDocument(input.text, 'az', 'cv', input.name);
    expect(paper.title).toBe('Aysel Əliyeva');
    expect(paper.lead).toEqual(['aysel@example.test']);
    expect(paper.sections).toEqual([
      { title: 'TƏHSİL', lines: ['İnformasiya texnologiyaları · 2024'] },
      { title: 'LAYİHƏLƏR', lines: ['• Müştəri sorğularını Excel ilə təhlil etdim.'] },
    ]);
    expect(
      parseDocument('Edited heading\n\nPROJECTS\n• User revision', 'en', 'resume', 'Old Name').lead,
    ).toEqual(['Edited heading']);
  });
  it('requires explicit approval and rejects oversized or invalid export requests', () => {
    expect(exportRequestSchema.safeParse({ ...input, approved: false }).success).toBe(false);
    expect(exportRequestSchema.safeParse({ ...input, text: 'x'.repeat(20001) }).success).toBe(
      false,
    );
    expect(exportRequestSchema.safeParse({ ...input, template: 'unknown' }).success).toBe(false);
  });
  it('embeds fonts for Azerbaijani and produces a real A4 PDF', async () => {
    const bytes = await renderPdf(input);
    expect(new TextDecoder().decode(bytes.slice(0, 8))).toMatch(/^%PDF/);
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getPage(0).getWidth()).toBeCloseTo(595.28);
    expect(pdf.getTitle()).toBe('Aysel Əliyeva - CV');
  });
  it('paginates long documents and wraps unbroken strings without exceeding the available width', async () => {
    const bytes = await renderPdf({
      ...input,
      text: `${input.name}\n\nLAYİHƏLƏR\n${Array.from({ length: 85 }, (_, i) => `• Layihə ${i + 1}: ${'mətn '.repeat(20)}`).join('\n')}`,
    });
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThan(2);
    const measure = { widthOfTextAtSize: (text: string) => text.length * 5 };
    const lines = wrapPdfText('https://example.test/' + 'x'.repeat(100), measure, 10, 80);
    expect(lines.every((line) => line.length <= 16)).toBe(true);
    expect(lines.join('')).toBe('https://example.test/' + 'x'.repeat(100));
  });
  it('does not silently remove unsupported characters', async () => {
    await expect(renderPdf({ ...input, text: 'Candidate 🦄' })).rejects.toThrow(
      'UNSUPPORTED_GLYPH',
    );
  });
  it('returns a PDF attachment and safe failures through the same-origin export route', async () => {
    const { POST } = await import('../src/app/api/export/route');
    const request = (data: unknown, origin = 'http://localhost:3000') =>
      new Request('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: origin },
        body: JSON.stringify(data),
      });
    const response = await POST(request(input));
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toContain('socialtwin-cv.pdf');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect((await POST(request({ ...input, approved: false }))).status).toBe(400);
    expect((await POST(request(input, 'https://other.example'))).status).toBe(403);
  });
});
