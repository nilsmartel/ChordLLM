import {
  getRawInputLines,
  getTokensUnclean,
  transformToken,
  verifyAndCleanLine,
} from "./extract-tokens";

import fs from "fs";
import path from "path";

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

// Synchronous
function isDirectory(path: string): boolean {
    try {
        const stats = fs.statSync(path);
        return stats.isDirectory();
    } catch (error) {
        console.error("failed to stat path:", path, error);
        process.exit(1)
    }
}

let filenames = []
try {
  filenames = isDirectory(filename)? fs.readdirSync(filename).map(f => path.join(filename, f)) : [filename];
} catch (e) {
  console.error("Error reading directory or file:", e);
  process.exit(1);
}


let total = filenames.length
console.error("0 / " + total);
let i = 0
for (let file of filenames) {
  i++
  if (isDirectory(file)) {
    continue
  }
  const input = getRawInputLines(file);

  for (let line of input) {
    let uncleanTokens = getTokensUnclean(line, validTokens);
    let tokens = verifyAndCleanLine(uncleanTokens);
    if (tokens == null) continue;

    tokens = tokens.map(transformToken);
    for (let t of tokens) console.log(t);
  }
  console.error((i + 1) + " / " + total);

}