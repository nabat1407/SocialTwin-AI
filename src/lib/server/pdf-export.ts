import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PDFDocument, rgb, type PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { parseDocument } from '../document-layout';
import type { ExportRequest } from '../export-contracts';

const navy = rgb(0.067, 0.122, 0.227);
const ink = rgb(0.12, 0.16, 0.22);
const muted = rgb(0.37, 0.43, 0.52);
const accent = rgb(0.14, 0.33, 0.73);
const border = rgb(0.84, 0.87, 0.91);

// Split with actual embedded-font metrics, including long URLs/unbroken words.
export function wrapPdfText(
  text: string,
  font: Pick<PDFFont, 'widthOfTextAtSize'>,
  size: number,
  width: number,
) {
  const result: string[] = [];
  let line = '';
  for (const word of text.replace(/\t/gu, '    ').split(/ +/u)) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) {
      line = candidate;
      continue;
    }
    if (line) {
      result.push(line);
      line = '';
    }
    for (const character of word) {
      if (line && font.widthOfTextAtSize(line + character, size) > width) {
        result.push(line);
        line = '';
      }
      line += character;
    }
  }
  if (line || !result.length) result.push(line);
  return result;
}

export async function renderPdf(input: ExportRequest) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fontBytes = await Promise.all([
    readFile(join(process.cwd(), 'public/fonts/NotoSans-Regular.ttf')),
    readFile(join(process.cwd(), 'public/fonts/NotoSans-Bold.ttf')),
  ]);
  const [regular, bold] = await Promise.all(
    fontBytes.map((bytes) => doc.embedFont(bytes, { subset: true })),
  );
  const available = new Set(regular.getCharacterSet());
  // Missing glyphs must be reported; never silently drop or replace candidate text.
  if (
    Array.from(input.text).some(
      (char) => !/[\n\r\t]/u.test(char) && !available.has(char.codePointAt(0)!),
    )
  )
    throw new Error('UNSUPPORTED_GLYPH');
  const paper = parseDocument(input.text, input.locale, input.kind, input.name);
  doc.setTitle(`${input.name || 'SocialTwin'} - ${input.kind.toUpperCase()}`);
  doc.setCreator('SocialTwin AI');
  const width = 595.28,
    height = 841.89,
    margin = 48,
    contentWidth = width - margin * 2;
  let page = doc.addPage([width, height]);
  let y = height - margin;
  const addPage = () => {
    page = doc.addPage([width, height]);
    y = height - margin;
    if (paper.title) {
      page.drawText(paper.title, { x: margin, y: y - 10, size: 10, font: bold, color: navy });
      y -= 25;
    }
  };
  const ensure = (space: number) => {
    if (y - space < 52) addPage();
  };
  const paragraph = (
    text: string,
    size = 10.5,
    font = regular,
    color = ink,
    indent = 0,
    gap = 5,
  ) => {
    if (!text.trim()) {
      y -= 6;
      return;
    }
    const bullet = text.startsWith('• ');
    const offset = indent + (bullet ? 12 : 0);
    const lines = wrapPdfText(bullet ? text.slice(2) : text, font, size, contentWidth - offset);
    ensure(Math.min(lines.length, 2) * size * 1.45 + gap);
    lines.forEach((line, i) => {
      ensure(size * 1.45);
      if (bullet && i === 0)
        page.drawText('•', { x: margin + indent, y: y - size, size, font, color });
      page.drawText(line, { x: margin + offset, y: y - size, size, font, color });
      y -= size * 1.45;
    });
    y -= gap;
  };
  if (input.demo) {
    paragraph('DEMO / NÜMUNƏ', 9, bold, muted);
    y -= 6;
  }
  if (paper.title) {
    if (input.template === 'modern') {
      page.drawRectangle({ x: margin, y: y - 6, width: 36, height: 3, color: accent });
      y -= 20;
    }
    paragraph(paper.title, 26, bold, navy, 0, 8);
  }
  paper.lead.forEach((line) =>
    paragraph(
      line,
      input.kind === 'letter' ? 11 : 10,
      regular,
      input.kind === 'letter' ? ink : muted,
      0,
      input.kind === 'letter' ? 9 : 3,
    ),
  );
  if (paper.title && input.kind !== 'letter') {
    y -= 8;
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: input.template === 'modern' ? 2 : 0.7,
      color: input.template === 'modern' ? accent : border,
    });
    y -= 14;
  }
  paper.sections.forEach((section) => {
    ensure(65);
    y -= 8;
    paragraph(section.title, 10, bold, input.template === 'modern' ? accent : navy, 0, 7);
    page.drawLine({
      start: { x: margin, y: y + 3 },
      end: { x: width - margin, y: y + 3 },
      thickness: 0.5,
      color: border,
    });
    section.lines.forEach((line) => paragraph(line));
    y -= 6;
  });
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawLine({
      start: { x: margin, y: 37 },
      end: { x: width - margin, y: 37 },
      thickness: 0.5,
      color: border,
    });
    const count = `${i + 1} / ${pages.length}`;
    p.drawText(count, {
      x: width - margin - regular.widthOfTextAtSize(count, 8),
      y: 23,
      size: 8,
      font: regular,
      color: muted,
    });
    if (input.demo)
      p.drawText('DEMO / NÜMUNƏ', { x: margin, y: 23, size: 8, font: regular, color: muted });
  });
  return doc.save();
}
