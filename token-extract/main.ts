import { getRawInputLines, getTokensUnclean } from "./extract-tokens";

const input = getRawInputLines();

function isOddLine(line: string) {
  return line.includes(":");
}

for (let line of input) {
  let tokens = getTokensUnclean(line);
  if (tokens.length > 0) {
    //console.log(tokens.join(" "));
    if (isOddLine(line)) console.log(line);
  }
}
