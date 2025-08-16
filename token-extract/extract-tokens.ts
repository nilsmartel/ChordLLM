import fs from "fs";

export function getRawInputLines(): Array<string> {
  const filepath =
    "./ultimate-guitar/ultimate-guitar-popular-tabs/top_songs_full.csv";

  let content = String(fs.readFileSync(filepath));
  // console.log("bytes:", content.length);

  let lines = content.split("\n");
  return lines;
}

export function transformToken(token: string) {
  return token
    .trim()
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replaceAll("|", "")
    .toLowerCase();
}

/**
 * returns the set of valid (transformed) tokens
 * @returns Set<String>
 */
function getValidTokens(): Set<String> {
  const filepath = "./valid-tokens.csv";
  let content = String(fs.readFileSync(filepath));
  let lines = content.split("\n");
  return new Set(lines);
}

const VALID_TOKENS = getValidTokens();

/**
 * handles some common outliers and filters unwanted lines
 */
function transformSomeOutlierLines(line: string) {
  if (line.includes(":")) {
    let ll = line.toLowerCase();
    if (ll.includes("tuning") || ll.includes("key") || ll.includes(",")) {
      return null;
    }

    if (ll.startsWith("interlude")) return line.substring(10);
    if (ll.startsWith("prechorus")) return line.substring(10);
    if (ll.startsWith("refrain:")) return line.substring(8);
    if (ll.startsWith("repeat:")) return line.substring(7);
    if (ll.startsWith("chords:")) return line.substring(7);
    if (ll.startsWith("chorus:")) return line.substring(7);
    if (ll.startsWith("intro:")) return line.substring(6);
    if (ll.startsWith("piano:")) return line.substring(6);
    if (ll.startsWith("outro:")) return line.substring(6);
    if (ll.startsWith("verse:")) return line.substring(6);
    if (ll.startsWith("solo:")) return line.substring(5);
    if (ll.startsWith("play:")) return line.substring(5);

    return null;
  }

  return line;
}

/**
 * Processes a line of text,
 * deciding wether it's compromised of tokens
 * and, if so, returns the (transformed) tokens.
 */
export function getTokensUnclean(line: string): string[] {
  /* TODO recognize end of song and export as unique token */

  // if this percentage of tokens are valid tokens, all tokens in the line are assumed to be valid
  const CUTOFF_VALUE = 0.5;

  // remove all whitespace from line
  let lraw = line.replaceAll("\r", " ").replaceAll("\t", " ").trim();

  let l = transformSomeOutlierLines(lraw);
  if (!l) return [];

  let rawTokens: string[] = l.split(" ").filter((s) => s != "");
  if (rawTokens.length == 0) return [];

  let tokenratio: number =
    rawTokens.map(transformToken).filter((t) => VALID_TOKENS.has(t)).length /
    rawTokens.length;

  // if there aren't any tokens we recognize as chords,
  // the entire line is probably not compromised of chords.
  // If we recognize at least, say, 50% or so as chords,
  // the other tokens on the line are probably also valid tokens
  if (tokenratio < CUTOFF_VALUE) return [];

  // for lines containing - it's really tricks, this trick does a lot of heavy lifting
  // this does pass: Am7 - Bm7 - Cmaj7 - Am7 - Bm7 - Em - Em7
  // this does not:  G/A       x-0-0-0-0-x
  if (l.includes("-") && tokenratio == CUTOFF_VALUE) return [];

  return rawTokens;
}
