async function main() {
  try {
    for await (const u of songUrls(1, 1000)) {
      let html = await axios.get(u);
      let res = extractChordSheet(html.data);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the script
main();
