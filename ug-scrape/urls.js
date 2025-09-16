import axios from "axios";
import { extractDataUrlOverview } from "./data-extract.js";

async function* songOverviewPages(start, max) {
  for (let i = start; i < max; i++)
    yield `https://www.ultimate-guitar.com/explore?order=songname_asc&type[]=Chords&page=${i}`;
}

export async function* songUrls(start, max) {
  for await (const url of songOverviewPages(start, max)) {
    try {
      const response = await axios.get(url).then((r) => r.data);
      let info = extractDataUrlOverview(response);
      let last_artist = "";
      for (const { artist_name, tab_url } of info) {
        yield tab_url;
      }
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      break; // Stop if we encounter an error (e.g., page not found)
    }
  }
}

async function main() {
  try {
    for await (const u of songUrls(1, 10)) {
      console.log(u);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the script
main();
