# Test scenarios

* 0: test defaults
* 1: disable _all
* 2: store compress + disable _all
* 3: store compress w/ snappy + disable _all
* 4: remove superfluous things (@message and @source) (simulate 'apache logs in json')

# Test data

One million apache logs from semicomplete.com:

    % du -hs /data/jls/million.apache.logs 
    218M    /data/jls/million.apache.logs
    % wc -l /data/jls/million.apache.logs
    1000000 /data/jls/million.apache.logs

# Environment

This should be unrelated to the experiment, but including for posterity if the
run-time of these tests is of interest to you.

* CPU: Xeon E31230 (4-core)
* Memory: 16GB
* Disk: Unknown spinning variety, 1TB

# Results

<table>
  <tr>
    <td> run </td>
    <td> space usage </td>
    <td> elasticsearch/original ratio  </td>
    <td> run time (wall clock) </td>
  </tr>
  <tr> 
    <td> ORIGIN </td>
    <td> 218M    /data/jls/million.apache.logs </td>
    <td> N/A </td>
    <td> N/A </td>
  </tr>
  <tr>
    <td> 0 </td>
    <td> 1358M    /data/jls/millionlogstest/0.yml </td>
    <td> 6.23x </td>
    <td> 6m47.343s </td>
  </tr>
  <tr>
    <td> 1 </td>
    <td> 1183M    /data/jls/millionlogstest/1.yml </td>
    <td> 5.47x </5d>
    <td> 6m13.339s </td>
  </tr>
  <tr>
    <td> 2 </td>
    <td> 539M    /data/jls/millionlogstest/2.yml </td>
    <td> 2.47x </td>
    <td> 6m17.103s </td>
  </tr>
  <tr>
    <td> 3 </td>
    <td> 537M    /data/jls/millionlogstest/3.yml </td>
    <td> 2.47x </td>
    <td> 6m15.382s </td>
  </tr>
  <tr>
    <td> 4 </td>
    <td> 395M    /data/jls/millionlogstest/4.yml </td>
    <td> 1.81x </td>
    <td> 6m39.278s </td>
  </tr>
</table>
