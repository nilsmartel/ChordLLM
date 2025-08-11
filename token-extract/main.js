const fs = require("fs");

const filepath =
  "../ultimate-guitar/ultimate-guitar-popular-tabs/top_songs_full.csv";

let content = String(fs.readFileSync(filepath));
// console.log("bytes:", content.length);

let lines = content.split("\n");

// console.log("lines:", lines.length);

for (let l of lines) {
  console.log(whitespacePercentage(l));
}

function whitespacePercentage(inputLine) {
  // Trim whitespace left and right
  let line = inputLine + "";
  let chars = [...line];
  if (chars.length == 0) return 0;
  let wsCount = chars.filter((c) => c == " ").length;

  return wsCount / chars.length;
}
