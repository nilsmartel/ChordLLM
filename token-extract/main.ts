import { getRawInputLines, getTokensUnclean } from "./extract-tokens";
import { SymbolType, getSymbolType } from "./token-type";

// TODO end of song tokens

function verifyAndCleanLine(line: string[]): string[] | null {
  let symbols = line.map(getSymbolType);

  let newLine: string[] = [];
  for (let i in line) {
    let s = symbols[i];
    // Ignore lines with Descriptions of chords
    if (s == SymbolType.ChordDesc) return null;
    if (s == SymbolType.NOISE) continue;
    if (s == SymbolType.Speech) continue;

    // Another option would be to just keep the repeat symbol.
    // but I think it would feel odd to get that from a chord completion model.
    if (s == SymbolType.Repeat) continue;

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
  console.log(tokens);
}
