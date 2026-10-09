import { describe, expect, it } from 'vitest';
import { sourceBackedLanguages, sourceBackedSkillStatements } from '../src/lib/profile-facts';

describe('language source anchors', () => {
  it('does not infer French proficiency from citizenship', () => {
    expect(
      sourceBackedLanguages(
        ['Fransız dili', 'İngilis B2'],
        'Fransız vətəndaşıyam. İngilis dilini B2 səviyyəsində bilirəm.',
      ),
    ).toEqual(['İngilis B2']);
  });
  it('does not infer a language from residence or the language of the message', () => {
    expect(sourceBackedLanguages(['English'], 'I live in England and use Excel.')).toEqual([]);
    expect(sourceBackedLanguages(['Türkçe'], "Türkiye'de yaşıyorum.")).toEqual([]);
  });
  it('preserves explicitly stated languages/levels and multilingual declarations', () => {
    expect(
      sourceBackedLanguages(
        ['Fransız dili C1'],
        'Fransız vətəndaşıyam, fransız dilini C1 səviyyəsində bilirəm.',
      ),
    ).toEqual(['Fransız dili C1']);
    expect(sourceBackedLanguages(['English', 'French'], 'I speak English and French.')).toEqual([
      'English',
      'French',
    ]);
  });
});

describe('explicit tool statements for approval', () => {
  it('preserves complete source statements with all declared tools', () => {
    expect(
      sourceBackedSkillStatements(
        ['Python', 'SQL', 'FastAPI'],
        'Python, FastAPI və SQL istifadə etmişəm. Junior iş axtarıram.',
      ),
    ).toEqual(['Python, FastAPI və SQL istifadə etmişəm']);
  });
  it('does not convert a learning goal, negative declaration or substring into skill evidence', () => {
    expect(sourceBackedSkillStatements(['Python'], 'Python öyrənirəm.')).toEqual([]);
    expect(sourceBackedSkillStatements(['Python'], "I don't know Python.")).toEqual([]);
    expect(sourceBackedSkillStatements(['SQL'], 'I used NoSQL.')).toEqual([]);
    expect(sourceBackedSkillStatements(['Rust'], 'I used Python.')).toEqual([]);
  });
  it('preserves dotted tool names and limits review additions without truncating statements', () => {
    expect(sourceBackedSkillStatements(['Node.js'], 'I used Node.js for a project.')).toEqual([
      'I used Node.js for a project',
    ]);
    expect(sourceBackedSkillStatements(['Python'], 'I used Python. '.repeat(6))).toHaveLength(4);
  });
});
