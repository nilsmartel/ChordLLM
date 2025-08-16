import { getRawInputLines, getTokensUnclean } from "./extract-tokens";

const input = getRawInputLines();

for (let line of input) {
  let tokens = getTokensUnclean(line);
  if (tokens.length > 0) {
    console.log(line.substring(0, 90));
  }
}
