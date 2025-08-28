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
}

export function removePunctuation(input: string): string {
  return input.replaceAll(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/, "");
}

export function getSymbolType(token: string): SymbolType {
  // Token cleared of puncuation
  const cleared = removePunctuation(token);

  if (cleared == "") return SymbolType.NOISE;
  // TODO recognize CHORD_TAB
  return SymbolType.Chord;
}
