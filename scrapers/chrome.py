#!/usr/bin/env python2

import platform
import os
import sqlite3 as sql

class ChromeScraper(object):
    name = "Chrome"

    def __init__(self):
        (result, path) = self.config_path(platform.system(), platform.release())
        if result:
            srcConn = sql.connect(path + "/History")
            self.srcCur = srcConn.cursor()
            self.ready = True
        else:
            print(path)
            self.ready = False

    
    def isReady(self):
        return self.ready


    def config_path(self, platform, release):
        """ 
        returns (false, errMsg) if (platform, release browser) not supported
        returns (true, path) otherwise

        Add to this function as we support more platforms and browsers
        TODO: test on machines other than Ubuntu
        """
        path = ""
        error = ""

        if platform == "Linux":
            path = "/home/%s/.config/google-chrome/Default" \
                    % os.environ["USER"]
        elif platform == "Darwin":
            path = ("/Users/%s/Library/Application Support" \
                    + "/Google/Chrome/Default") \
                    % os.environ["USER"]
        elif platform == "Windows" and release == "XP":
            path = ("C:\\Documents and Settings\\%s" \
                    + "\\Local Settings\\Application Data" \
                    + "\\Google\\Chrome\\User Data\\Default") \
                    % os.environ["USERNAME"]
        elif platform == "Windows":
            path = ("C:\\Users\\%s\\AppData\\Local" \
                    + "\\Google\\Chrome\\User Data\\Default") \
                    % os.environ["USERNAME"]
        else:
            error = "Your platform, %s %s, is not supported" \
                    % (platform, release)

        if path != "":
            return (True, path)
        else:
            return (False, error)


    def scrape_visits(self):
        for (id, url, visit_time, visit_duration) in \
            self.srcCur.execute(\
                    """SELECT visits.id, urls.url, 
                    visits.visit_time, visits.visit_duration 
                       FROM visits INNER JOIN urls 
                         ON visits.url = urls.id"""): 
            new_time = (visit_time - 11644473600000000) / 1000000
            new_duration = visit_duration / 1000000
            yield (id, url, new_time, new_duration, "chrome")

        return

    def scrape_downloads(self):
      for (id, path) in self.srcCur.execute("SELECT id, current_path FROM downloads"):
          if path == "": continue
          else: yield (id, path, "chrome")

      return
