from bs4 import BeautifulSoup
import requests

def song_overview_pages():
    i=1
    while True:
        yield "https://www.ultimate-guitar.com/explore?order=songname_asc&type[]=Chords&page=" + str(i)
        i += 1

def song_urls():
    for url in song_overview_pages():
        body = requests.get(url).text
        html = BeautifulSoup(body, 'html.parser')

        for url in song_overview_page_urls(html):
            yield url


# TODO skip over CONSECUTIVE songs from the SAME ARTIST
def song_overview_page_urls(soup):
    # .dyhP1
    # article > a where ref !contains "/artist/"
    hrefs = [a['href'] for a in soup.select('div.dyhP1 a') if a.get('href')]
    return hrefs


