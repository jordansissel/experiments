# Work handling experiments

Evented vs Threading vs Hybrid?

This experiment includes an implementation of a socket server with different
run-time implementations.

* Event driven - uses libev and cooperative multitasking. 
* Thread driven - uses pthreads and has a 1:1 mapping of client connections
  to active threads.
* Hybrid - uses threads for work and events for activation and messaging.

Considerations:

* Event driven - Only one piece of work can be executed at any given time and
  is thus limited to a single CPU. With modern CPUs shipping with 2, 4, 6, or
  more cores on a single chip, this kind of worker alone will leave much
  of your computational hardware idle. Put another way, because only one
  work unit can be active at any given time, any single-task slowness can
  starve faster tasks.
* Thread driven - With a 1:1 mapping for work to threads, this lets you use
  all cpu cores available, but after you have more work threads than CPUs you
  can end up spending time consuming much CPU trying scheduling and context
  switching between those threads.
