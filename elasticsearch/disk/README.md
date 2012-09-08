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

# Results

<table>
  <tr>
    <td> run </td>
    <td> space usage </td>
    <td> run time (wall clock) </td>
  </tr>
  <tr>
    <td> 0 </td>
    <td> 1358M    /data/jls/millionlogstest/0.yml </td>
    <td> 6m47.343s </td>
  </tr>
  <tr>
    <td> 1 </td>
    <td> 1183M    /data/jls/millionlogstest/1.yml </td>
    <td> 6m13.339s </td>
  </tr>
  <tr>
    <td> 2 </td>
    <td> 539M    /data/jls/millionlogstest/1.yml </td>
    <td> 6m17.103s </td>
  </tr>
</table>

# Environment

carrera.
