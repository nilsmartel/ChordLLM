const fs = require("fs");
const process = require("process");

try {
  const filename = process.argv[2];
  if (!filename) throw "Expected first argument to be path of jupyter notebook";
  const content = String(fs.readFileSync(filename));
  const json = JSON.parse(content);

  for (let cell of json.cells) {
    if (cell.outputs) cell.outputs = [];
  }

  fs.writeFileSync(filename, JSON.stringify(json));
} catch (e) {
  console.error("error while executing script", e);
  process.exit(1);
}
