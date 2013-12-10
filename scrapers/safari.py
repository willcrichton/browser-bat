#!/user/bin/env python2

import platform
import os
import subprocess
import plistlib as pl

class SafariScraper(object):
    name = "Safari"

    def __init__(self):
        if platform.system() != "Darwin":
            self.ready = False
            return

        self.ready = True
        self.path = self.config_path('', '')[1]
        
    def config_path(self, platform, release):
        return (True, '/Users/%s/Library/Safari/' % os.environ['USER'])

    def getPlist(self, path, name):
        output = subprocess.check_output(['plutil', '-convert', 'xml1', path + name, '-o', '-'])
        return pl.readPlistFromString(output)
        
    def isReady(self):
        return self.ready

    def scrape_visits(self):
        history = self.getPlist(self.path, 'History.plist')
        for (idx, visit) in enumerate(history['WebHistoryDates']):
            
            # safari uses CFTime (http://hintsforums.macworld.com/showthread.php?t=71483)
            # so we offset by unix time since 2001, or 978307200
            yield (idx, visit[''], float(visit['lastVisitedDate']) + 978307200, 0)

    def scrape_downloads(self):
        downloads = self.getPlist(self.path, 'Downloads.plist')
        for (idx, dl) in enumerate(downloads['DownloadHistory']):
            yield(idx, dl['DownloadEntryPath'])
