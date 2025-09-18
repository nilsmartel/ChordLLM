import {
  getRawInputLines,
  getTokensUnclean,
  transformToken,
  verifyAndCleanLine,
} from "./extract-tokens";

import fs from "fs";

function getCliArgs(): [string, string] {
  let filepath = process.argv[2];
  let validTokenFile = process.argv[3];
  if (filepath == null || filepath == "--help") {
    console.log("expected first argument to be filepath or - for stdin. Expected second argument to be list of almost any allowed tokens");
    process.exit(1);
  }
  if (filepath == "-") filepath = "/dev/stdin";

  // conviniencehack for myself
  if (filepath == ":default")
    filepath =
      "./ultimate-guitar/ultimate-guitar-popular-tabs/top_songs_full.csv";

  return [filepath, validTokenFile];
}

const [filename, validTokenFile] = getCliArgs()
const input = getRawInputLines(filename);


/**
 * returns the set of valid (transformed) tokens
 * @returns Set<String>
 */
function getValidTokens(filepath: string): Set<string> {
  let content = String(fs.readFileSync(filepath));
  let lines = content.split("\n");
  return new Set(lines);
}

const validTokens = getValidTokens(validTokenFile);

for (let line of input) {
  let uncleanTokens = getTokensUnclean(line, validTokens);
  let tokens = verifyAndCleanLine(uncleanTokens);
  if (tokens == null) continue;

  tokens = tokens.map(transformToken);
  for (let t of tokens) console.log(t);
}
