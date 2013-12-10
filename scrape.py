#!/usr/bin/env python2

import sys      # sys.argv
import os       # environ
import platform # system, release
import sqlite3 as sql

from scrapers.chrome  import ChromeScraper
from scrapers.firefox import FirefoxScraper
from scrapers.safari  import SafariScraper

SCRAPERS = [ChromeScraper, FirefoxScraper, SafariScraper]

DB_DIR = 'databases'
DB_NAME = 'visits'

def port_visits_db(scraper, dstCur):

    # extract visit history
    rowsScraped = 0
    for (id, url, visit_time, visit_duration, browser) in scraper.scrape_visits():
        dstCur.execute("INSERT INTO visits \
                (id, url, visit_time, visit_duration, browser) \
                VALUES (?, ?, ?, ?, ?)", (id, url, visit_time, visit_duration, browser))
        rowsScraped += 1;
        if(rowsScraped % 5000 == 0):
            print "%s: scraped %d rows!" % \
                  (scraper.__class__.__name__, rowsScraped)

    # extract downloads
    rowsScraped = 0
    for (id, path, browser) in scraper.scrape_downloads():
        dstCur.execute("INSERT INTO downloads (id, path, browser) VALUES(?, ?, ?)",
                       (id, path, browser))
        rowsScraped += 1
        if(rowsScraped % 100 == 0):
            print "scraped %d downloads!" %rowsScraped

    return

def do_scrape():

    # open database directory (relative to scrape.py)
    os.chdir(os.path.dirname(os.path.realpath(__file__)))
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)

    # open connection to the database
    dstConn = sql.connect(DB_DIR + '/' + DB_NAME)
    dstCur = dstConn.cursor()
    
    # reset visits and downloads tables
    dstCur.execute("DROP TABLE IF EXISTS visits")
    dstCur.execute("DROP TABLE IF EXISTS downloads")
    dstCur.execute("CREATE TABLE IF NOT EXISTS visits \
            (id integer, url text, visit_time integer, \
            visit_duration integer, browser text)")
    dstCur.execute("CREATE TABLE IF NOT EXISTS downloads \
            (id integer, path text, browser text)")
    dstConn.commit()

    # load data from all possible scrapers
    for s in SCRAPERS:
        scraper = s()
        if(scraper.isReady() == True):
            port_visits_db(scraper, dstCur)

    dstConn.commit()
    dstConn.close()

    return (True, "")

if __name__ == "__main__":
    do_scrape()
