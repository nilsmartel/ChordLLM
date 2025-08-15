const fs = require("fs");

function getRawInputLines() {
  const filepath =
    "../ultimate-guitar/ultimate-guitar-popular-tabs/top_songs_full.csv";

  let content = String(fs.readFileSync(filepath));
  // console.log("bytes:", content.length);

  let lines = content.split("\n");
  return lines;
}

function transformToken(token) {
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
function getValidTokens() {
  const filepath = "./valid-tokens.csv";
  let content = String(fs.readFileSync(filepath));
  let lines = content.split("\n");
  return new Set(lines);
}

/**
 * Processes a line of text,
 * deciding wether it's compromised of tokens
 * and, if so, returns the (transformed) tokens.
 */
function getTokensUnclean(line) {
  // remove all whitespace
  l.replaceAll("\r", "").trim();
}

for (let l of lines) {
  l = l.replaceAll("\r", "").replaceAll("\t", "").trim();
  let p = whitespacePercentage(l);
  if (p <= 0.3) continue;

  for (let token of l.split(" ")) {
    token = cleanToken(token);
    if (token == "") continue;
    console.log(token);
  }
  // console.log("'" + l + "'");
  // console.log("    ", p);
}

function whitespacePercentage(inputLine) {
  // Trim whitespace left and right
  let line = inputLine + "";
  let chars = [...line];
  if (chars.length == 0) return 0;
  let wsCount = chars.filter((c) => c == " ").length;

  return wsCount / chars.length;
}
