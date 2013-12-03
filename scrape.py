#!/usr/bin/env python2

import sys      # sys.argv
import os       # environ
import platform # system, release
import sqlite3 as sql

from scrapers.chrome import ChromeScraper
from scrapers.firefox import FirefoxScraper

SCRAPERS = [ChromeScraper, FirefoxScraper]

DB_DIR = 'databases'
DB_NAME = 'visits'

def port_visits_db(scraper):
    os.chdir(os.path.dirname(os.path.realpath(__file__)))
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)
    
    dstConn = sql.connect(DB_DIR + '/' + DB_NAME)
    dstCur = dstConn.cursor()
    dstCur.execute("DROP TABLE IF EXISTS visits")
    dstCur.execute("CREATE TABLE IF NOT EXISTS visits \
            (id integer, url text, visit_time integer, \
            visit_duration integer)")
    dstConn.commit()
    """ TODO check if table already exists """
    
    rowsScraped = 0
    for (id, url, visit_time, visit_duration) in scraper.scrape_visits():
        dstCur.execute("INSERT INTO visits \
                (id, url, visit_time, visit_duration) \
                VALUES (?, ?, ?, ?)", (id, url, visit_time, visit_duration))
        rowsScraped += 1;
        if(rowsScraped % 5000 == 0):
            print "%s: scraped %d rows!" % \
                  (scraper.__class__.__name__, rowsScraped)

    dstConn.commit()
    dstConn.close()
    return

def do_scrape():
    for s in SCRAPERS:
        scraper = s()
        if(scraper.isReady() == True):
            port_visits_db(scraper)
        else:
            return (False, "Scraper %s not ready!" % scraper.__class__.__name__)

    return (True, "")

if __name__ == "__main__":
    do_scrape()
