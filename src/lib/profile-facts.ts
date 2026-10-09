const languageAliases = [
  /english|ingilis|ingiliz/iu,
  /french|fransız(?:ca)?|fransiz(?:ca)?|français/iu,
  /german|alman|deutsch/iu,
  /azerbaijani|azərbaycan|azerbaycan/iu,
  /turkish|türk(?:çe|cə)?/iu,
  /russian|rus(?:ca)?/iu,
  /spanish|ispan|ispanyol/iu,
  /arabic|ərəb|arap/iu,
];

// A conservative anchor for extracted language metadata. Manual edits remain
// user declarations. Nationality/residence alone is never language evidence.
export function sourceBackedLanguages(languages: string[], source: string) {
  const statements = source
    .toLocaleLowerCase('az')
    .split(/[.!?;\n]+/)
    .map((statement) =>
      statement.replace(
        /\S+\s+(?:vətəndaş\S*|vatandaş\S*|citizen\S*|nationality|national)\b/giu,
        '',
      ),
    );
  return languages.filter((language) => {
    const alias = languageAliases.find((pattern) => pattern.test(language.toLocaleLowerCase('az')));
    return statements.some(
      (statement) =>
        (alias
          ? alias.test(statement)
          : statement.toLocaleLowerCase('az').includes(language.toLocaleLowerCase('az'))) &&
        /dil|language|speak|fluent|native|level|səviyy|seviy|bili|know|[abc][12]/iu.test(statement),
    );
  });
}

// Keep the user's complete, explicit statement for review rather than silently
// promoting tool metadata to a confirmed qualification. This is a conservative
// source anchor, not a general natural-language truth verifier.
export function sourceBackedSkillStatements(skills: string[], source: string) {
  const patterns = skills.map(
    (skill) =>
      new RegExp(
        `(?:^|[^\\p{L}\\p{N}])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^\\p{L}\\p{N}])`,
        'iu',
      ),
  );
  return source
    .split(/[!?;\n]+|\.(?=\s|$)/u)
    .map((statement) => statement.trim())
    .filter(
      (statement) =>
        statement.length > 0 &&
        statement.length <= 1000 &&
        patterns.some((pattern) => pattern.test(statement)) &&
        /istifadə|işlə|bilir|bilirem|bilirəm|biliyorum|kulland|use[ds]?|know|built|develop|implement|hazırla|yarat|wrote/iu.test(
          statement,
        ) &&
        !/öyrənir|öğreniyor|learning|want to|istəyir|axtar|do not know|don't know|bilmir|bilmiyorum|uydur|pretend|invent/iu.test(
          statement,
        ),
    )
    .slice(0, 4);
}
