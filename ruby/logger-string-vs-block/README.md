Run each test through rbx, jruby (1.8 and 1.9), mri 1.8.7 and 1.9.2.

         method     | platform      |  duration
     ---------------+---------------+------------
         control_if | jruby/  1.9.3 |     0.23
          string_if | jruby/  1.9.3 |     0.23
              block | jruby/  1.9.3 |     0.44
        doubleblock | jruby/  1.9.3 |     0.44
             string | jruby/  1.9.3 |     0.81
     ---------------+---------------+------------
          string_if |  ruby/  1.9.3 |     0.57
         control_if |  ruby/  1.9.3 |     0.59
              block |  ruby/  1.9.3 |     2.03
        doubleblock |  ruby/  1.9.3 |     2.05
             string |  ruby/  1.9.3 |     3.37

The problem space here was that I have some pretty complex 'logger.debug(...)'
calls that build up large hashes to log. That action of 'build a hash' is just
wasted cycles if the log level is below debug.

Hypothesis: logger.debug(...) is slow because the '...' in my case creates
objects that are immediately thrown away when the log level is not debug.

Test cases:

* Control case: 'nil if logger.debug?'
* Known-slow case: logger.debug(something complex)
* Candidate: logger.debug { something complex }
* Candidate: logger.debug(something complex) if logger.debug?
* Candidate: logger.debug { lambda { something complex } }

(the double block is an attempt to do even later binding, I guess. I dunno. It
was worth a try)

Conclusions:

Blocks are faster in both MRI and JRuby, but aren't anywhere as fast as
`logger.debug(...) if logger.debug?`

You can see from the data above, a 'nil if logger.debug?' control case was
exactly as fast as a 'logger.debug(...) if logger.debug?'

This is why blocks, while an improvement, aren't the best solution.

I'd like to avoid having to change all logger code invocations to append 'if
logger.LOGLEVEL?' since that's a maintenance hazard.
