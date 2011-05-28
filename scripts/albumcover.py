import re
import urllib

AMAZON_AWS_ID = "INSERT YOUR AWS ID HERE"

class AmazonAlbumImage(object):
  awsurl = "http://ecs.amazonaws.com/onca/xml"
  def __init__(self, artist, album):
    self.artist = artist
    self.album = album

  def fetch(self):
    url = self._GetResultURL(self._SearchAmazon())
    if not url:
      return None
    img_re = re.compile(r'''registerImage\("original_image", "([^"]+)"''')
    prod_data = urllib.urlopen(url).read()
    m = img_re.search(prod_data)
    if not m:
      return None
    img_url = m.group(1)
    return img_url

  def _SearchAmazon(self):
    data = {
      "Service": "AWSECommerceService",
      "Version": "2005-03-23",
      "Operation": "ItemSearch",
      "ContentType": "text/xml",
      "SubscriptionId": AMAZON_AWS_ID,
      "SearchIndex": "Music",
      "ResponseGroup": "Small",
    }

    data["Artist"] = self.artist
    data["Keywords"] = self.album

    fd = urllib.urlopen("%s?%s" % (self.awsurl, urllib.urlencode(data)))

    return fd.read()

  def _GetResultURL(self, xmldata):
    url_re = re.compile(r"<DetailPageURL>([^<]+)</DetailPageURL>")
    m = url_re.search(xmldata)
    return m and m.group(1)

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 3:
    print "usage: %s <artist> <album>" % argv[0]
    sys.exit(1)

  artist = sys.argv[1]
  album = sys.argv[2]

  print AmazonAlbumImage(artist, album).fetch()
