!SLIDE transition=fade
# logging problems

!SLIDE transition=fade incremental
# Problem: Unknown Value

* We don't know what's in the logs.
* Should we care what's in the logs?

!SLIDE transition=fade incremental
# Symptom: Unknown Value

* Keep logs, they might be useful, right?
* 3AM on a Saturday, logs fill up your disks.
* Add logrotate, right?

!SLIDE transition=fade incremental
# Problem: Unstructured Data

* We don't know how to read the logs.
* All logs have different unstructuredness
* Machines can't read the logs.

!SLIDE transition=fade incremental
# Problem: Unstructured Data

* `logger.info("Error opening %s" % path)`
* `System.out.println("Something went wrong")`

!SLIDE transition=fade
# Solution: Structured Logs

    { 
      "client address": "184.105.173.34",
      "timestamp": "2011-04-28T22:38:38-0700",
      "verb": "GET",
      "path": "/robots.txt",
      "http version": 1.1,
      "response code": 200,
      "bytes": 276,
      "referrer": null
      "user agent": "LexxeBot/1.0"
    } 

!SLIDE transition=fade 
# Too Much Data

!SLIDE transition=fade full-screen 

<pre style="font-size: 0.7em">
66.235.116.128 - - [01/Apr/2010:00:00:39 -0700] "GET /?flav=rss20 HTTP/1.1" 200 34853 "-" "Bloglines/3.1 (http://www.bloglines.com; 10 subscribers)"
89.248.174.76 - - [01/Apr/2010:00:01:00 -0700] "POST /blog/static/about HTTP/1.1" 200 17853 "http://www.semicomplete.com/about/" "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)"
81.52.143.31 - - [01/Apr/2010:00:01:02 -0700] "GET /robots.txt HTTP/1.1" 200 - "-" "Mozilla/5.0 (Windows; U; Windows NT 5.1; fr; rv:1.8.1) VoilaBot BETA 1.2 (support.voilabot@orange-ftgroup.com)"
81.52.143.31 - - [01/Apr/2010:00:01:06 -0700] "GET /blog/tags/cut HTTP/1.1" 200 7407 "-" "Mozilla/5.0 (Windows; U; Windows NT 5.1; fr; rv:1.8.1) VoilaBot BETA 1.2 (support.voilabot@orange-ftgroup.com)"
62.219.121.253 - - [01/Apr/2010:00:01:31 -0700] "GET /articles/ssh-security/ HTTP/1.1" 200 26185 "-" "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.9) Gecko/20100315 Firefox/3.5.9 (.NET CLR 3.5.30729)"
62.219.121.253 - - [01/Apr/2010:00:01:32 -0700] "GET /reset.css HTTP/1.1" 200 1015 "http://www.semicomplete.com/articles/ssh-security/" "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.9) Gecko/20100315 Firefox/3.5.9 (.NET CLR 3.5.30729)"
62.219.121.253 - - [01/Apr/2010:00:01:32 -0700] "GET /style2.css HTTP/1.1" 200 4635 "http://www.semicomplete.com/articles/ssh-security/" "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.9) Gecko/20100315 Firefox/3.5.9 (.NET CLR 3.5.30729)"
62.219.121.253 - - [01/Apr/2010:00:01:32 -0700] "GET /images/jordan-80.png HTTP/1.1" 200 6146 "http://www.semicomplete.com/articles/ssh-security/" "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.9) Gecko/20100315 Firefox/3.5.9 (.NET CLR 3.5.30729)"
62.219.121.253 - - [01/Apr/2010:00:01:32 -0700] "GET /jquery.js HTTP/1.1" 200 14885 "http://www.semicomplete.com/articles/ssh-security/" "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.9) Gecko/20100315 Firefox/3.5.9 (.NET CLR 3.5.30729)"
62.219.121.253 - - [01/Apr/2010:00:01:33 -0700] "GET /images/web/2009/banner.png HTTP/1.1" 200 52315 "http://www.semicomplete.com/style2.css" "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.9) Gecko/20100315 Firefox/3.5.9 (.NET CLR 3.5.30729)"
62.219.121.253 - - [01/Apr/2010:00:01:34 -0700] "GET /favicon.ico HTTP/1.1" 200 3638 "-" "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.9) Gecko/20100315 Firefox/3.5.9 (.NET CLR 3.5.30729)"
62.219.121.253 - - [01/Apr/2010:00:01:35 -0700] "GET /favicon.ico HTTP/1.1" 304 - "-" "Mozilla/5.0 (compatible; Google Desktop/5.9.911.3589; http://desktop.google.com/)"
174.17.224.141 - - [01/Apr/2010:00:02:51 -0700] "GET /favicon.ico HTTP/1.0" 200 3638 "-" "Safari/6531.22.7 CFNetwork/454.5 Darwin/10.2.0 (i386) (MacBookPro5%2C4)"
67.195.111.55 - - [01/Apr/2010:00:03:24 -0700] "GET /blog/geekery/Kyocera-KPC650-EVDO-in-FreeBSD.html HTTP/1.0" 200 14653 "-" "Mozilla/5.0 (compatible; Yahoo! Slurp/3.0; http://help.yahoo.com/help/us/ysearch/slurp)"
67.195.183.64 - - [01/Apr/2010:00:03:39 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 3 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
67.195.183.64 - - [01/Apr/2010:00:03:39 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 3 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
67.195.183.64 - - [01/Apr/2010:00:03:40 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 3 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
67.195.183.64 - - [01/Apr/2010:00:03:40 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 23642 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
66.249.68.238 - - [01/Apr/2010:00:04:20 -0700] "GET /projects/xdotool/ HTTP/1.1" 200 10315 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
74.125.158.80 - - [01/Apr/2010:00:04:26 -0700] "GET /?flav=rss20 HTTP/1.1" 200 34853 "-" "FeedBurner/1.0 (http://www.FeedBurner.com)"
207.46.204.196 - - [01/Apr/2010:00:04:29 -0700] "GET /blog/geekery/keynav-20080501.html HTTP/1.1" 200 10670 "-" "msnbot/2.0b (+http://search.msn.com/msnbot.htm)"
216.246.7.40 - - [01/Apr/2010:00:04:54 -0700] "GET /resume.xml HTTP/1.0" 200 16884 "-" "-"
207.46.199.38 - - [01/Apr/2010:00:04:59 -0700] "GET /files/firefox-tabsearch/tabsearch-20080430.xpi HTTP/1.1" 200 4562 "-" "msnbot/2.0b (+http://search.msn.com/msnbot.htm)"
207.46.204.195 - - [01/Apr/2010:00:04:59 -0700] "GET /projects/pmbackup/pmb.rc HTTP/1.1" 200 359 "-" "msnbot/2.0b (+http://search.msn.com/msnbot.htm)"
173.50.101.10 - - [01/Apr/2010:00:05:30 -0700] "GET /articles/dynamic-dns-with-dhcp/ HTTP/1.1" 200 29915 "http://www.google.com/search?hl=en&client=opera&hs=R3E&rls=en&q=update+failed%3A+NOTZONE+dynamic+dns&aq=f&aqi=&aql=&oq=&gs_rfai=" "Opera/9.80 (Windows NT 6.1; U; en) Presto/2.5.22 Version/10.51"
193.2.69.186 - - [01/Apr/2010:00:06:27 -0700] "GET /articles/week-of-unix-tools/ HTTP/1.1" 200 11657 "http://www.semicomplete.com/articles/openldap-with-saslauthd/" "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.1.8) Gecko/20100216 Fedora/3.5.8-1.fc12 Firefox/3.5.8"
193.2.69.186 - - [01/Apr/2010:00:06:27 -0700] "GET /reset.css HTTP/1.1" 200 1015 "http://www.semicomplete.com/articles/week-of-unix-tools/" "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.1.8) Gecko/20100216 Fedora/3.5.8-1.fc12 Firefox/3.5.8"
193.2.69.186 - - [01/Apr/2010:00:06:27 -0700] "GET /style2.css HTTP/1.1" 200 4635 "http://www.semicomplete.com/articles/week-of-unix-tools/" "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.1.8) Gecko/20100216 Fedora/3.5.8-1.fc12 Firefox/3.5.8"
193.2.69.186 - - [01/Apr/2010:00:06:27 -0700] "GET /jquery.js HTTP/1.1" 200 14885 "http://www.semicomplete.com/articles/week-of-unix-tools/" "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.1.8) Gecko/20100216 Fedora/3.5.8-1.fc12 Firefox/3.5.8"
193.2.69.186 - - [01/Apr/2010:00:06:30 -0700] "GET /articles/openldap-with-saslauthd/ HTTP/1.1" 200 17229 "-" "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.1.8) Gecko/20100216 Fedora/3.5.8-1.fc12 Firefox/3.5.8"
193.2.69.186 - - [01/Apr/2010:00:06:33 -0700] "GET /blog/projects/xdotool/main.html HTTP/1.1" 200 10315 "-" "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.1.8) Gecko/20100216 Fedora/3.5.8-1.fc12 Firefox/3.5.8"
87.250.252.241 - - [01/Apr/2010:00:07:15 -0700] "GET /blog/geekery/python-cgrok-bindings-2.html?commentlimit=0 HTTP/1.1" 200 10705 "-" "Yandex/1.01.001 (compatible; Win16; I)"
67.195.183.64 - - [01/Apr/2010:00:07:41 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 4638 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
67.195.183.64 - - [01/Apr/2010:00:07:43 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 4639 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
67.195.183.64 - - [01/Apr/2010:00:07:45 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 4746 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
67.195.183.64 - - [01/Apr/2010:00:07:46 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 17283 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
67.195.183.65 - - [01/Apr/2010:00:08:02 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 4617 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
67.195.183.65 - - [01/Apr/2010:00:08:04 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 4639 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
67.195.183.65 - - [01/Apr/2010:00:08:06 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 4723 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
67.195.183.65 - - [01/Apr/2010:00:08:07 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 17089 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
207.46.204.234 - - [01/Apr/2010:00:09:59 -0700] "GET /blog/geekery/liboverride-project-page.html?commentlimit=0 HTTP/1.1" 200 10263 "-" "msnbot/2.0b (+http://search.msn.com/msnbot.htm)"
69.59.132.52 - - [01/Apr/2010:00:10:20 -0700] "GET /?flav=rss20 HTTP/1.1" 200 34853 "-" "Feedfetcher-SpoonFeedr; (+http://www.spoonfeedr.com; 1 subscribers; feed-id=667)"
66.249.68.238 - - [01/Apr/2010:00:10:53 -0700] "GET /projects/grok HTTP/1.1" 301 425 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:10:54 -0700] "GET /scripts HTTP/1.1" 301 414 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:10:55 -0700] "GET /scripts/ HTTP/1.1" 200 19504 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:10:56 -0700] "GET /articles HTTP/1.1" 301 415 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:10:57 -0700] "GET /articles/ HTTP/1.1" 200 11872 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:10:58 -0700] "GET /projects HTTP/1.1" 301 415 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:10:59 -0700] "GET /projects/ HTTP/1.1" 200 12818 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:00 -0700] "GET /projects/fex HTTP/1.1" 301 419 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:01 -0700] "GET /projects/fex/ HTTP/1.1" 200 17112 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:02 -0700] "GET /projects/newpsm HTTP/1.1" 301 422 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:02 -0700] "GET /projects/newpsm/ HTTP/1.1" 200 24950 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:04 -0700] "GET /projects/keynav HTTP/1.1" 301 422 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:04 -0700] "GET /projects/keynav/ HTTP/1.1" 200 15715 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:06 -0700] "GET /projects/xdotool HTTP/1.1" 301 423 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:08 -0700] "GET /projects/nis2ldap HTTP/1.1" 301 424 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:08 -0700] "GET /projects/nis2ldap/ HTTP/1.1" 200 10564 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:10 -0700] "GET /projects/pmbackup HTTP/1.1" 301 424 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:10 -0700] "GET /projects/pmbackup/ HTTP/1.1" 200 17957 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:12 -0700] "GET /presentations/vim HTTP/1.1" 301 424 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:12 -0700] "GET /presentations/vim/ HTTP/1.1" 200 20572 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:14 -0700] "GET /projects/solaudio HTTP/1.1" 301 424 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:14 -0700] "GET /projects/solaudio/ HTTP/1.1" 200 10251 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:15 -0700] "GET /presentations/mpi HTTP/1.1" 301 424 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:16 -0700] "GET /presentations/mpi/ HTTP/1.1" 200 6676 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:17 -0700] "GET /projects/xboxproxy HTTP/1.1" 301 425 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:18 -0700] "GET /projects/xboxproxy/ HTTP/1.1" 200 23763 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:19 -0700] "GET /projects/xpathtool HTTP/1.1" 301 425 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:20 -0700] "GET /projects/xpathtool/ HTTP/1.1" 200 14269 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:21 -0700] "GET /projects/liboverride HTTP/1.1" 301 427 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:22 -0700] "GET /projects/liboverride/ HTTP/1.1" 200 15478 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:23 -0700] "GET /projects/pam_captcha HTTP/1.1" 301 427 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:23 -0700] "GET /projects/pam_captcha/ HTTP/1.1" 200 15835 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:25 -0700] "GET /projects/xmlpresenter HTTP/1.1" 301 428 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:25 -0700] "GET /projects/xmlpresenter/ HTTP/1.1" 200 15355 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:27 -0700] "GET /presentations/security HTTP/1.1" 301 429 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:27 -0700] "GET /presentations/security/ HTTP/1.1" 200 38217 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:29 -0700] "GET /presentations/hackday06 HTTP/1.1" 301 430 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:29 -0700] "GET /presentations/hackday06/ HTTP/1.1" 200 6719 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:31 -0700] "GET /presentations/hackday08 HTTP/1.1" 301 430 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:31 -0700] "GET /presentations/hackday08/ HTTP/1.1" 200 2817 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:33 -0700] "GET /projects/firefox-urledit HTTP/1.1" 301 431 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:33 -0700] "GET /projects/firefox-urledit/ HTTP/1.1" 200 12284 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:34 -0700] "GET /presentations/unix-basics HTTP/1.1" 301 432 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:35 -0700] "GET /presentations/unix-basics/ HTTP/1.1" 200 38555 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
216.97.225.60 - - [01/Apr/2010:00:11:36 -0700] "GET /errors.php?error=http://www.eskimo.com/~bgudgel/utru/test.txt?? HTTP/1.1" 404 378 "-" "Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.7.12) Gecko/20050915 Firefox/1.0.7"
66.249.68.238 - - [01/Apr/2010:00:11:36 -0700] "GET /projects/firefox-tabsearch HTTP/1.1" 301 433 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
216.97.225.60 - - [01/Apr/2010:00:11:37 -0700] "GET /misc/errors.php?error=http://www.eskimo.com/~bgudgel/utru/test.txt?? HTTP/1.1" 404 383 "-" "Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.7.12) Gecko/20050915 Firefox/1.0.7"
66.249.68.238 - - [01/Apr/2010:00:11:37 -0700] "GET /projects/firefox-tabsearch/ HTTP/1.1" 200 15599 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:38 -0700] "GET /presentations/semantic-blogging HTTP/1.1" 301 438 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:39 -0700] "GET /presentations/semantic-blogging/ HTTP/1.1" 200 6649 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:40 -0700] "GET /articles/efficiency/ HTTP/1.1" 200 44520 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:11:42 -0700] "GET /articles/arp-security/ HTTP/1.1" 200 26547 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
67.195.183.64 - - [01/Apr/2010:00:11:44 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 3 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
67.195.183.64 - - [01/Apr/2010:00:11:44 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 3 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
67.195.183.64 - - [01/Apr/2010:00:11:44 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 3 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
66.249.68.238 - - [01/Apr/2010:00:11:44 -0700] "GET /articles/ssh-security/ HTTP/1.1" 200 26185 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
67.195.183.64 - - [01/Apr/2010:00:11:44 -0700] "POST /hackday08/randomtags.py HTTP/1.0" 200 23642 "http://pipes.yahoo.com/pipes/pipe.info?_id=oFqDT3KB3RG8tyjP073fcQ" "Yahoo Pipes 1.0"
66.249.68.238 - - [01/Apr/2010:00:11:46 -0700] "GET /articles/ppp-over-ssh/ HTTP/1.1" 200 26494 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
67.195.111.55 - - [01/Apr/2010:00:12:00 -0700] "GET /misc/nmh/mhl.headers HTTP/1.0" 200 536 "-" "Mozilla/5.0 (compatible; Yahoo! Slurp/3.0; http://help.yahoo.com/help/us/ysearch/slurp)"
66.249.68.238 - - [01/Apr/2010:00:12:06 -0700] "GET /projects/xdotool/xdotool HTTP/1.1" 200 20036 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
66.249.68.238 - - [01/Apr/2010:00:12:17 -0700] "GET /articles/dynamic-dns-with-dhcp/ HTTP/1.1" 200 29915 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
81.52.143.33 - - [01/Apr/2010:00:12:30 -0700] "GET /blog/2008/Jun/06 HTTP/1.1" 200 7432 "-" "Mozilla/5.0 (Windows; U; Windows NT 5.1; fr; rv:1.8.1) VoilaBot BETA 1.2 (support.voilabot@orange-ftgroup.com)"
66.249.68.238 - - [01/Apr/2010:00:12:33 -0700] "GET /articles/openldap-with-saslauthd/ HTTP/1.1" 200 17229 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
209.85.238.70 - - [01/Apr/2010:00:13:43 -0700] "GET /blog/tags/firefox?flav=rss20 HTTP/1.1" 200 15651 "-" "Feedfetcher-Google; (+http://www.google.com/feedfetcher.html; 4 subscribers; feed-id=14171215010336145331)"
174.143.126.121 - - [01/Apr/2010:00:14:10 -0700] "GET /errors.php?error=http://www.growthinstitute.in/magazine/content/db.txt?? HTTP/1.1" 404 378 "-" "libwww-perl/5.805"
208.93.0.128 - - [01/Apr/2010:00:14:12 -0700] "GET /?flav=rss20 HTTP/1.1" 200 34853 "-" "LiveJournal.com (webmaster@livejournal.com; for http://www.livejournal.com/users/cshpsionic/; 10 readers)"
207.46.13.145 - - [01/Apr/2010:00:14:59 -0700] "GET /articles/week-of-unix-tools/ HTTP/1.1" 200 11657 "-" "msnbot/2.0b (+http://search.msn.com/msnbot.htm)"
67.195.111.55 - - [01/Apr/2010:00:15:12 -0700] "GET /blog/2008/Aug/ HTTP/1.0" 200 9876 "-" "Mozilla/5.0 (compatible; Yahoo! Slurp/3.0; http://help.yahoo.com/help/us/ysearch/slurp)"
208.93.0.128 - - [01/Apr/2010:00:16:30 -0700] "GET /?flav=atom HTTP/1.1" 200 37753 "-" "LiveJournal.com (webmaster@livejournal.com; for http://www.livejournal.com/users/semicomplete_rs/; 1 readers)"
222.231.42.197 - - [01/Apr/2010:00:16:33 -0700] "GET /robots.txt HTTP/1.1" 200 - "-" "Mozilla/5.0 (compatible; MSIE or Firefox mutant; not on Windows server; +http://ws.daum.net/aboutWebSearch.html) Daumoa/2.0"
222.231.42.197 - - [01/Apr/2010:00:16:34 -0700] "GET /projects/xdotool/ HTTP/1.1" 200 10315 "http://www.semicomplete.com/" "Mozilla/5.0 (compatible; MSIE or Firefox mutant; not on Windows server; +http://ws.daum.net/aboutWebSearch.html) Daumoa/2.0"
38.113.234.181 - - [01/Apr/2010:00:17:39 -0700] "GET /?flav=rss20 HTTP/1.1" 200 34853 "-" "Voyager/1.0"
174.17.224.141 - - [01/Apr/2010:00:17:53 -0700] "GET /favicon.ico HTTP/1.0" 200 3638 "-" "Safari/6531.22.7 CFNetwork/454.5 Darwin/10.2.0 (i386) (MacBookPro5%2C4)"
133.27.171.231 - - [01/Apr/2010:00:18:46 -0700] "GET /reset.css HTTP/1.1" 200 1015 "http://www.semicomplete.com/articles/ssh-security/" "Opera/9.80 (Windows NT 5.1; U; ja) Presto/2.2.15 Version/10.10"
133.27.171.231 - - [01/Apr/2010:00:18:46 -0700] "GET /favicon.ico HTTP/1.1" 200 3638 "http://www.semicomplete.com/articles/ssh-security/" "Opera/9.80 (Windows NT 5.1; U; ja) Presto/2.2.15 Version/10.10"
133.27.171.231 - - [01/Apr/2010:00:18:46 -0700] "GET /style2.css HTTP/1.1" 200 4635 "http://www.semicomplete.com/articles/ssh-security/" "Opera/9.80 (Windows NT 5.1; U; ja) Presto/2.2.15 Version/10.10"
133.27.171.231 - - [01/Apr/2010:00:18:46 -0700] "GET /articles/ssh-security/ HTTP/1.1" 200 26185 "-" "Opera/9.80 (Windows NT 5.1; U; ja) Presto/2.2.15 Version/10.10"
</pre>

!SLIDE transition=fade center

![Apache Response Codes visualized](apache-response-codes.png)

Isn't this better than reading raw logs?

!SLIDE transition=fade
# Accessibility sucks

!SLIDE transition=fade center

![PERL!](xkcd.png)

You can be a hero!

!SLIDE transition=fade center

![PERL!](xkcd-perlswing-many.png)

Hero dependency locks you in :(

!SLIDE transition=fade incremental
# Too Many Formats 

* Collation is difficult
* Shared tooling is nonexistant

!SLIDE transition=fade
# Timestamps

TBD

!SLIDE transition=fade
# "multiline events"

TBD
