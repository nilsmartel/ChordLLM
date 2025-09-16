//
// file contains functions to extract data from ug page
function unsanitze(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export function extractDataContent(s) {
  // extract content between data-content" and the next " (string delimiter)
  let dataContent = s.split('data-content="')[1].split('"')[0];
  // unsanitize content
  let json = unsanitze(dataContent);
  // it's in json format, so we can work with a js object here
  return JSON.parse(json);
}
