import axios from 'axios'
import { extractDataUrlOverview } from './data-extract.js'

/**
 * this file contains utilities to get a list of urls of ultimate guitar pages
 */

async function* songOverviewPages(start, max) {
    for (let i = start; i < max; i++)
        // yield `https://www.ultimate-guitar.com/explore?order=songname_asc&type[]=Chords&page=${i}`;
        yield `https://www.ultimate-guitar.com/explore?order=date_desc&type[]=Chords&page=${i}`
}

export async function* songUrls(start, max) {
    for await (const url of songOverviewPages(start, max)) {
        try {
            const response = await axios.get(url).then((r) => r.data)
            let info = extractDataUrlOverview(response)
            let last_artist = ''
            for (const { artist_name, tab_url } of info) {
                // Since artist usually dont have multiple songs with the same name
                // this is an effective way to filter out multiples.
                if (artist_name == last_artist) continue
                last_artist = artist_name
                yield tab_url
            }
        } catch (error) {
            console.error(`Error fetching ${url}:`, error.message)
            break // Stop if we encounter an error (e.g., page not found)
        }
    }
}
