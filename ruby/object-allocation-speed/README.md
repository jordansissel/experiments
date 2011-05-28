# Object Allocation. It sucks.

While profiling some code in JRuby, I noticed Java's GC was reclaiming 40MB
every 100ms. That's 400mb/sec of temporary or short-lived objects. What did
it look like in jvisualvm? See this image: <jruby-jvisualvm.png>

That's bad.

So my initial reaction was "Let's reuse objects instead of creating them willy nilly".

Yeah, I said willy nilly, but what are other consequences of creating objects like there's no tomorrow?

Object creation isn't very fast. Let's test that, and perhaps show that object
reuse is both faster (Foo.new is slow) and that it reduces GC overhead since
there's less crap to reclaim every run.

# Data


           implementation |  platform     | duration | rate
                find_user |   rbx/  1.8.7 |    60.66 | 164841
                find_user |  ruby/  1.8.7 |    60.17 | 166198
                find_user |  ruby/  1.9.2 |    40.76 | 245360
                find_user | jruby/  1.8.7 |    25.84 | 386966    (--fast)
                find_user | jruby/  1.8.7 |    24.01 | 416562
                find_user | jruby/  1.9.2 |    23.27 | 429664    (--1.9)
                find_user | jruby/  1.9.2 |    23.25 | 430163    (--1.9 --fast)
  find_user_with_existing |  ruby/  1.8.7 |    15.39 | 649891
  find_user_with_existing |  ruby/  1.9.2 |     7.57 | 1320205
  find_user_with_existing |   rbx/  1.8.7 |     5.78 | 1729872
  find_user_with_existing | jruby/  1.9.2 |     4.94 | 2025521   (--1.9)
  find_user_with_existing | jruby/  1.8.7 |     4.39 | 2276348
  find_user_with_existing | jruby/  1.9.2 |     4.03 | 2480158   (--1.9 --fast)
  find_user_with_existing | jruby/  1.8.7 |     3.59 | 2783964   (--fast)

# GC?

TBD

# Conclusions

From the data above, reusing objects is clearly the fastest way to go by a wide
margin (4x faster in MRI 1.8.7, 5.5x fasterin JRuby, 10x faster in Rubinius)

So: reuse objects when you can and when it makes sense. When would it make
sense? For my current work project, a syslog server, I create an "Event" object
every time I read a new event from a client. In reality, only one event comes
in over each socket at any given time - so it would be safe for me to reuse
that Event object for every client connection, and depending on the threading
model used, it might be safe to reuse only one Event instance for the entire
application.
