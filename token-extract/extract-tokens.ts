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
 * Processes a line of text,
 * deciding wether it's compromised of tokens
 * and, if so, returns the (transformed) tokens.
 */
export function getTokensUnclean(line: string): string[] {
  // if this percentage of tokens are valid tokens, all tokens in the line are assumed to be valid
  const CUTOFF_VALUE = 0.5;

  // remove all whitespace from line
  let l = line.replaceAll("\r", " ").replaceAll("\t", " ").trim();
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

  return rawTokens;
}
