# Premise

I'm working on a new syslog server for us to use at Loggly.

# Test System

* 2 x Opteron 270 (Dual core, 2gHz)
* rvm
* ruby 1.8.7p334
* ruby 1.9.2-p180
* jruby 1.6.2
* rbx-head 
* eventmachine (0.12.10)
* logporter (0.1.4)

rbx took so long I gave up running it. I'm not sure what the deal was here.
Version info is rubinius 1.2.4dev (1.8.7 6eefb1b6 yyyy-mm-dd JI)
[x86_64-unknown-linux-gnu]

# basic.rb results

The 'basic.rb' code results are here; the 'netty-em' implementation is used
when given the '--netty' flag:

     implementation |  platform     | duration | rate
       eventmachine |  ruby/  1.8.7 |   104.72 | 95491.90
       eventmachine |  ruby/  1.9.2 |    86.13 | 116097.87
           netty-em | jruby/  1.9.2 |    74.81 | 133673.76   (--1.9)
           netty-em | jruby/  1.9.2 |    74.56 | 134125.57   (--1.9 --fast)
           netty-em | jruby/  1.8.7 |    68.99 | 144942.24
       eventmachine | jruby/  1.8.7 |    64.65 | 154683.83   (--fast)
       eventmachine | jruby/  1.9.2 |    63.48 | 157527.45   (--1.9)
       eventmachine | jruby/  1.9.2 |    61.95 | 161420.50   (--1.9 --fast)
       eventmachine | jruby/  1.8.7 |    60.71 | 164714.80

I also ran the basic test here with Rubinius, but after 2.5 minutes, still
not complete, and using more than 500MB of ram and growing, I aborted.

# porter.rb results (:wire => :syslog, iterations = 1,000,000)

     implementation |  platform     | duration | rate
       eventmachine |  ruby/  1.9.2 |   150.75 | 13266.58
       eventmachine |  ruby/  1.8.7 |   139.86 | 14299.82
           netty-em | jruby/  1.9.2 |    68.18 | 29334.55        (--1.9 --fast)
           netty-em | jruby/  1.8.7 |    65.80 | 30395.60
       eventmachine | jruby/  1.8.7 |    64.13 | 31187.62        (--fast)
       eventmachine | jruby/  1.8.7 |    62.70 | 31898.44
           netty-em | jruby/  1.8.7 |    61.09 | 32740.73        (--fast)

# porter.rb results (--wire raw --iterations 5000000)

     implementation |  platform     | duration | rate
       eventmachine | jruby/  1.8.7 |    47.03 | 106321.90
           netty-em | jruby/  1.8.7 |    47.29 | 105732.83



# Conclusions

Note that I observed variation in execution speed around 10%. My workstation I
was testing on was not totally idle while running these tests.

Anyway, JRuby continues to be the winner in most of my benchmarkings.
