import {
  getRawInputLines,
  getTokensUnclean,
  START_OF_SONG,
  transformToken,
  verifyAndCleanLine,
} from "./extract-tokens";
import { TokenType, getSymbolType } from "./token-type";

// TODO end of song tokens

const input = getRawInputLines();

for (let line of input) {
  let tokens = verifyAndCleanLine(getTokensUnclean(line));
  if (tokens == null) continue;

  tokens = tokens.map(transformToken);
  for (let t of tokens) console.log(t);
}
