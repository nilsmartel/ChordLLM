# Token extract

within this project I am writing the code to extract individual chords from song documents.

Since there is a lot of variation in human curated content and, suprisingly, thousands of chords,
this is proving to be a bit of challenge.

## Current solution:

we have a document of thousands of chord documents, concatenated.

by simply going over all lines I filtered which had a high likelyhood
of being compromised of chordshapes by their whitespace to non whitespace ratio.

E.g.

```
    Em       A
this is a line of lyrics
```

the line with lots of whitespace was compromised of chords!

This worked poorly!

after splitting the remaining lines by whitespace
tens of thousands of tokens were extracted. Often words like "and" and suprising things.
Also, there were thousands of chords, which completly took me by suprise.

After manual cleanup, I had a set of chords, and now I went over all lines again.

For each line I tokenzied it by splitting whitespace, and if more than 50% of the tokens were in our previously curated set,
the entire line is assumed to be made of chords.

This allows to generalize even to allow chords not in our curated list!
