# JSON serializing performance

```
Converting the following object to JSON 200000 times
{"hello"=>"world", "fizzle"=>[1, 2, 3], "test"=>{"one"=>"two"}}

Rehearsal -------------------------------------------------------------
obj.to_json                 3.190000   0.480000   3.670000 (  2.290000)
JSON.dump(obj)              2.600000   0.290000   2.890000 (  2.152000)
MultiJson.dump(obj)         6.360000   1.010000   7.370000 (  4.759000)
JrJackson::Json.dump(obj)   1.070000   0.260000   1.330000 (  1.044000)
--------------------------------------------------- total: 15.260000sec

                                user     system      total        real
obj.to_json                 1.400000   0.210000   1.610000 (  1.362000)
JSON.dump(obj)              1.730000   0.230000   1.960000 (  1.670000)
MultiJson.dump(obj)         2.520000   0.310000   2.830000 (  2.164000)
JrJackson::Json.dump(obj)   1.130000   0.180000   1.310000 (  1.074000)
```
