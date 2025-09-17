async function main() {
  try {
    for await (const u of songUrls(1, 1000)) {
      let html = await axios.get(u);
      let res = extractChordSheet(html.data);
      let fname = u.split("tab/")[1].replaceAll("/", "--");
      fs.writeFile("./output/" + fname, res, () => {
        console.log(fname);
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the script
main();
