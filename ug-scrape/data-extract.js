import * as fs from "node:fs";
//
// file contains functions to extract data from ug page
function unsanitze(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replaceAll("&ntilde;", "~");
}

export function extractDataContent(s) {
  // extract content between data-content" and the next " (string delimiter)
  let dataContent = s.split('data-content="')[1].split('"')[0];
  // unsanitize content
  let json = unsanitze(dataContent);
  // it's in json format, so we can work with a js object here
  return JSON.parse(json);
}

/*
  takes ug html page and extracts json.
  returns Array of {artist_name, tab_url}
*/
export function extractDataUrlOverview(s) {
  let fullData = extractDataContent(s);
  return fullData.store.page.data.data.tabs.map((s) => ({
    artist_name: s.artist_name,
    tab_url: s.tab_url,
  }));
}

/*
  takes ug chord html-page and extracts the chord txt as string
*/
export function extractChordSheet(s) {
  let fullData = extractDataContent(s);
  return fullData;
}

