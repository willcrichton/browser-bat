#!/usr/bin/env python

import sys      # sys.argv
import os       # environ
import platform # system, release


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
            path = "/Users/%s/Library/Application Support" \
                    + "/Google/Chrome/Default" \
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
        # actual scraping code here, in some nice modular way

    return

if __name__ == "__main__":
    main()
