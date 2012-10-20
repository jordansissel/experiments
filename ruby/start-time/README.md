## Debugging Logstash slow starts from jar files

Command:

    ruby linetime.rb java -jar logstash.jar agent -e 'input { generator { count => 1 type => foo } } filter { grok { pattern => ".*" } }'

Output: <output.txt>

Notes:

* Time to first byte (first require() call): 2.72 seconds
* Time to first logstash event: 10.43 seconds

## Longest require() trace

    7.464531         3.206000 cabin success
    7.477099       3.221000 logstash/logging success
    7.540985     3.311000 logstash/filterworker success
    8.228135   4.359000 logstash/agent success

* It takes 4.3 seconds to require("logstash/agent")
