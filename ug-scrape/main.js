import axios from 'axios'
import { extractChordSheet, extractDataUrlOverview } from './data-extract.js'
import { songUrls } from './urls.js'
import * as fs from 'node:fs'

function countOutputEntries() {
    const files = fs.readdirSync('./output')
    return files.length
}
// count entries in ./output to see how many chords we should skip right away

async function main() {
    const outputEntries = 0 // countOutputEntries();
    let i = 0
    try {
        for await (const u of songUrls(1, 1000)) {
            i += 1
            if (i <= outputEntries) {
                console.log('.')
                continue
            }

            let html = await axios.get(u)
            let res = extractChordSheet(html.data)
            let fname = u.split('tab/')[1].replaceAll('/', '--')
            fs.writeFile('./output/' + fname, res, () => {
                console.log(fname)
            })
        }
    } catch (error) {
        console.error('Error:', error.message)
    }
}

// Run the script
main()
