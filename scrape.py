#!/usr/bin/env python

import sys      # sys.argv
import os       # environ
import platform # system, release
import sqlite3 as sql

DB_DIR = 'databases'
DB_NAME = 'visits'

def config_path(platform, release, browser):
    """ 
    returns (false, errMsg) if (platform, release browser) not supported
    returns (true, path) otherwise

    Add to this function as we support more platforms and browsers
    TODO: test on machines other than Ubuntu
    """
    path = ""
    error = ""

    if browser == "chrome":
        if platform == "Linux":
            path = "/home/%s/.config/google-chrome/Default" \
                    % os.environ["USER"]
        elif platform == "Darwin":
            path = ("/Users/%s/Library/Application Support" \
                    + "/Google/Chrome/Default") \
                    % os.environ["USER"]
        elif platform == "Windows" and release == "XP":
            path = "C:\\Documents and Settings\\%s" \
                    + "\\Local Settings\\Application Data" \
                    + "\\Google\\Chrome\\User Data\\Default" \
                    % os.environ["USERNAME"]
        elif platform == "Windows" and release == "Vista":
            path = "C:\\Users\\%s\\AppData\\Local" \
                    + "\\Google\\Chrome\\User Data\\Default" \
                    % os.environ["USERNAME"]
        else:
            error = "Your platform, %s %s, is not supported" \
                    % (platform, release)
    else:
        error = "Your browser, %s, is not supported" % browser

    if path != "":
        return (True, path)
    else:
        return (False, error)
           
def port_visits_db(cPath):
    os.chdir(os.path.dirname(os.path.realpath(__file__)))
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)

    srcConn = sql.connect(cPath + "/History")
    dstConn = sql.connect(DB_DIR + '/' + DB_NAME)
    srcCur = srcConn.cursor()
    dstCur = dstConn.cursor()
    dstCur.execute("CREATE TABLE IF NOT EXISTS visits \
            (id integer, url text, visit_time integer, \
            visit_duration integer)")
    dstConn.commit()
    """ TODO check if table already exists """
    
    rowsScraped = 0
    for (id, url, visit_time, visit_duration) in \
        srcCur.execute(\
                """SELECT visits.id, urls.url, 
                visits.visit_time, visits.visit_duration 
                   FROM visits INNER JOIN urls 
                     ON visits.url = urls.id"""): 
        new_time = (visit_time - 11644473600000000) / 1000000
        dstCur.execute("INSERT INTO visits \
                (id, url, visit_time, visit_duration) \
                VALUES (?, ?, ?, ?)", (id, url, new_time, visit_duration))
        rowsScraped += 1;
        if(rowsScraped % 5000 == 0):
            print "scraped %d rows!" %rowsScraped

    dstConn.commit()
    dstConn.close()
    return

def main():
    if len(sys.argv) != 2:
        print "USAGE: %s <browser_name>" % sys.argv[0]
        sys.exit(0)

    cPathOut = config_path(platform.system(), platform.release(), sys.argv[1])
    if cPathOut[0] == False:
        print cPathOut[1]
        sys.exit(0)
    else:
        print "ready to scrape from \"%s\"!" % cPathOut[1]
        port_visits_db(cPathOut[1])

    return

if __name__ == "__main__":
    main()
