import {
  getRawInputLines,
  getTokensUnclean,
  START_OF_SONG,
  transformToken,
  verifyAndCleanLine,
} from "./extract-tokens";
import { TokenType, getSymbolType } from "./token-type";

function getFilename(): string {
  let filepath = process.argv[2];
  if (filepath == null || filepath == "--help") {
    console.log("expected first argument to be filepath or - for stdin.");
    process.exit(1);
  }
  if (filepath == "-") filepath = "/dev/stdin";

  return filepath;
}

const input = getRawInputLines(getFilename());

for (let line of input) {
  let tokens = verifyAndCleanLine(getTokensUnclean(line));
  if (tokens == null) continue;

  tokens = tokens.map(transformToken);
  for (let t of tokens) console.log(t);
}
