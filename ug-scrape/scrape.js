import axios from "axios";
import * as cheerio from "cheerio";

// NOTE none if this will work, as the data gets processed as a string,
// instead of directly sending structured dom nodes

// "One liner" to make it easier to play around.
const loadSamplePage = () =>
  axios
    .get(
      "https://www.ultimate-guitar.com/explore?order=songname_asc&type[]=Chords",
    )
    .then((r) => r.data)
    .then(cheerio.load);

async function* songOverviewPages() {
  for (let i = 1; ; i++)
    yield `https://www.ultimate-guitar.com/explore?order=songname_asc&type[]=Chords&page=${i}`;
}

function songOverviewPageUrls($) {
  const hrefs = [];
  $("div.dyhP1 a").each((_, element) => {
    const href = $(element).attr("href");
    if (href) {
      hrefs.push(href);
    }
  });
  return hrefs;
}

async function* songUrls() {
  for await (const url of songOverviewPages()) {
    try {
      const response = await axios.get(url);
      console.log("loaded page: " + url);
      const $ = cheerio.load(response.data);

      const urls = songOverviewPageUrls($);
      console.log("urls: ", urls);
      // TODO URLS.length == 0 is a current problem
      for (const songUrl of urls) {
        yield songUrl;
      }
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      break; // Stop if we encounter an error (e.g., page not found)
    }
  }
}

async function main() {
  let i = 0;

  try {
    for await (const u of songUrls()) {
      console.log(u);
      i++;
      if (i > 10) {
        break;
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the script
main();
