# Chord LLM

The code in this readme should describe the pipeline to get to the finished and trained LLM, including collecting scraping data.

The steps should be executed in order.

## Scrape chord sheets

```bash
cd ug-scrape
node main.js
```

## Simplify data

```bash
cd output
for f in *
do
    ../../simplify-whitespace $f
done
```

## Cultivate dataset
```bash
mkdir output
```
