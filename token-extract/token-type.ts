/**
 * There is value in recognizing different types of tokens.
 * The type itself affects how we treat the remainng tokens in a line.
 *
 * Things like
 * D x00232
 * become
 * CHORD  CHORD_TAB
 *
 * and if we see a CHORD_TAB, we want to skip the entire line,
 * because it's not a melody, but just describing how Chords are played.
 *
 * but if we see
 *
 * C | D
 * i.e.
 * CHORD NOISE CHORD
 *
 * We just filter out the mark and go on
 */

export enum SymbolType {
  // A C#
  Chord,
  // | , . [] ""
  NOISE,
  // [0254x0] xx0232
  ChordTab,
  // TUNED HALF STEP DOWN
  Speech,
}

export function removePunctuation(input: string): string {
  return input.replaceAll(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/, "");
}

function recognizeChordTab(input: string): boolean {
  return false;
}

// TODO maybe remove these common words before?
// Reason: we have things like cm7pause in the documents

const commonWords = new Set(
  "tuned half step down barre riff open single strum walk to low high once bend hold pause".split(
    " ",
  ),
);

export function getSymbolType(token: string): SymbolType {
  // Token cleared of puncuation
  const cleared = removePunctuation(token).toLowerCase();
  const cleared = removePunctuation(token).toLowerCase().trim();

  if (cleared == "") return SymbolType.NOISE;

  if (commonWords.has(cleared)) return SymbolType.Speech;

  if (recognizeChordTab(cleared)) return SymbolType.ChordTab;
  // TODO recognize CHORD_TAB
  return SymbolType.Chord;
}
