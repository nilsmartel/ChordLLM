import {
  getRawInputLines,
  getTokensUnclean,
  transformToken,
} from "./extract-tokens";
import { TokenType, getSymbolType } from "./token-type";

// TODO end of song tokens

function verifyAndCleanLine(line: string[]): string[] | null {
  let symbols = line.map(getSymbolType);

  let newLine: string[] = [];
  for (let i in line) {
    let s = symbols[i];
    // Ignore lines with Descriptions of chords
    if (s == TokenType.ChordDesc) return null;
    // Another option would be to just keep the repeat symbol.
    // but I think it would feel odd to get that from a chord completion model.
    if (s == TokenType.Repeat) continue;
    if (s == TokenType.NOISE) continue;
    if (s == TokenType.Speech) continue;

    let token = line[i];
    newLine.push(token);
  }

  if (line.length == 0) return null;
  return newLine;
}

const input = getRawInputLines();

for (let line of input) {
  let tokens = verifyAndCleanLine(getTokensUnclean(line));
  if (!tokens) continue;
  tokens = tokens.map(transformToken);
  console.log(tokens.join(" "));
}
