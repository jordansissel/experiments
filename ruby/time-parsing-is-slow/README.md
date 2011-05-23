Hacking time in ruby. Here's a benchmark of stdlib Time.strptime, home_run's version, or my own hack.

The original cause for this was having a piece of code able to process 40,000 messages/sec, but adding time parsing (via Time.strptime) dropped it to 3,000 messages/sec. That sucks.

Some folks recommended 'home_run' (rubygem) as an option to improve Time.strptime speed.

I also implemented enough of a 'Time.strptime' to parse the same thing I wanted. 

Let's race.

## Basics

Basic code was this:

    iterations = 200000
    1.upto(iterations).each do |i|
      Time.strptime("May 19 21:56:06", "%b %d %H:%M:%S")
    end

Code is attached to this gist (timefix.rb)

Running it:

    % ruby timefix.rb <native|home_run|mine>

* JRuby used was 1.6.0. 
* Rubinius (RBX) used was 'head' - whatever that means (installed with rvm). 
* Ruby 1.9.2 was p180

## Results

     implementation | ruby version  | duration | parses/sec
             native |   rbx/  1.8.7 |     fail |   - 
           home_run |   rbx/  1.8.7 |     fail |   - 
           home_run | jruby/  1.8.7 |     fail |   -
             native | jruby/  1.8.7 |    64.56 |   3098  ***
             native |  ruby/  1.9.2 |    37.51 |   5331
             native | jruby/  1.9.2 |    26.53 |   7540
               mine |   rbx/  1.8.7 |    10.59 |  18881
               mine |  ruby/  1.9.2 |     9.69 |  20640
           home_run |  ruby/  1.9.2 |     7.43 |  26912
               mine | jruby/  1.9.2 |     5.51 |  36271
               mine | jruby/  1.8.7 |     5.27 |  37979

## Conclusions

JRuby continues to rock. JRuby's 1.8.7 and 1.9.2 speeds tied on my hack. Nice.

YARV 1.9.2 with home_run came in 2nd (to jruby). The native Time.strptime lost hardcore to everyone, especially on implementations without Time.strptime (where I used DateTime.strptime)


* rbx 'native' failed. Time.strptime is not defined in rbx 1.8.7, so I tried DateTime.strptime instead (whicih exists) but the test ran longer than 60 seconds so I aborted it. Mega slow (DateTime itself is horribly slow anyway)
* rbx 'home_run' failed: 'gem install home_run' failed
* jruby 'home_run' failed: 'gem install home_run' failed (native C extensions aren't supported yet)
* jruby doesn't seem to have Time.strptime (missing like rbx). So I swapped in DateTime.strptime. It was not fast. (64 seconds, see above)

