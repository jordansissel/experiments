Logstash (1.1.0 and older)'s agent is pretty crappy (code complexity, speed, etc)

Want:

* benchmark throughput of minimal logstash agent pipeline (generator input,
  null filter, null output)
* replicate behavior with minimal code
* experiment with different pipeline implementations (message passing down a
  chain of workers). Choose the fastest.

Requirements:

* Reconfigurability at runtime (insert, remove, modify a worker)
* Minimal churn through pipeline (minimize object creation, etc)
* Fast would be nice.
