# Test scenarios

* 0: test defaults
* 1: disable _all
* 2: store compress + disable _all
* 3: store compress w/ snappy + disable _all
* 4: remove @message (simulate 'apache logs in json')

# Test data

One million apache logs from semicomplete.com:

    % du -hs /data/jls/million.apache.logs 
    218M    /data/jls/million.apache.logs
    % wc -l /data/jls/million.apache.logs
    1000000 /data/jls/million.apache.logs
