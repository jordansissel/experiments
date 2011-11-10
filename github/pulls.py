import requests
import json
import os
import time
import sys
import optparse

from optparse import OptionParser

class PullChecker(object):
  def __init__(self):
    self.baseurl = "https://github.com/api/v2"
    parser = OptionParser()
    parser.add_option("-u", "--user", dest="user", help="Your github username", metavar="USER")
    parser.add_option("-k", "--apikey", dest="apikey", help="Your github apikey", metavar="APIKEY")
    parser.add_option("-o", "--org", dest="org", help="The github org/account to scan", metavar="ORG")
    (self.options, args) = parser.parse_args()
    self.auth = ("%s/token" % self.options.user, self.options.apikey)
    #requests.defaults.defaults["verbose"] = sys.stderr
  # end __init__
  
  def repos(self):
    r = requests.get("%s/json/repos/show/%s" % (self.baseurl, self.options.org), auth=self.auth)
    repositories = json.loads(r.content)["repositories"]
    return repositories
  # end repos
  
  def pulls(self, reponame):
    # Review closed pull requests
    r = requests.get("%s/json/pulls/%s/%s/closed" % (self.baseurl, self.options.org, reponame), auth=self.auth)
    pulls = json.loads(r.content)["pulls"]
    return pulls
  # end pulls
# end class PullChecker

if __name__ == "__main__":
  pullcheck = PullChecker()
  for repo in pullcheck.repos():
    pulls = pullcheck.pulls(repo["name"])
    if len(pulls) == 0:
      print "http://github.com/%s/%s (has no pull requests?)" % (pullcheck.options.org, repo["name"])
    else:
      for pull in pullcheck.pulls(repo["name"]):
        print "http://github.com/%s/%s/pull/%s (comments: %d)" % (pullcheck.options.org, repo["name"], pull["number"], pull["comments"])
        # Sleep to avoid spamming github
        time.sleep(1)

