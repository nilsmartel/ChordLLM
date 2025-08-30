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

export enum TokenType {
  // A C#
  Chord,
  // | , . [] ""
  Noise,
  // [0254x0] xx0232
  ChordDesc,
  // TUNED HALF STEP DOWN
  Speech,
  // x2 x4 x3
  Repeat,
}

export function removePunctuation(input: string): string {
  return input
    .replaceAll("…", "")
    .replaceAll(/[‘’–¼!"#$%&'()*+,\-./:;<=>?@[\\\]^__`{|}~]/g, "");
}

// see token-research/chord-tab-example file to see, what kind of strings this is supposed to catch
function recognizeChordTab(input: string): boolean {
  // expect input to be cleared of puncuation and lowercase.
  return /([0-9x]){6,}/.test(input);
}

// TODO maybe remove these common words before?
// Reason: we have things like cm7pause in the documents

const commonWords = new Set(
  "stop for free guitar etc fret yeah you your with til oh faster repeat break bridge chorus coda instrumental int interlude intro let outro solo verse mute until hit note on string each and then play tuned half step down barre riff open single strum walk to low high once bend hold pause".split(
    " ",
  ),
);

function isRepitition(input: string): boolean {
  if (/x[0-9]{1,2}/.test(input)) return true;
  if (/[0-9]{1,2}x/.test(input)) return true;
  return false;
}

export function getSymbolType(token: string): TokenType {
  // Token cleared of puncuation
  const cleared = removePunctuation(token).toLowerCase().trim();

  if (cleared == "") return TokenType.Noise;

  if (commonWords.has(cleared)) return TokenType.Speech;
  if (recognizeChordTab(cleared)) return TokenType.ChordDesc;
  if (isRepitition(cleared)) return TokenType.Repeat;
  if (cleared.includes("x")) return TokenType.Noise;
  if (/^\d+/.test(cleared)) return TokenType.Noise;
  if (cleared >= "h") return TokenType.Noise;

  return TokenType.Chord;
}
