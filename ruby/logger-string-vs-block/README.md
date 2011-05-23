Run each test through rbx, jruby (1.8 and 1.9), mri 1.8.7 and 1.9.2.

     method     | platform      |  duration
         string |   rbx/  1.8.7 |    11.80
         string | jruby/  1.9.2 |    10.57
         string | jruby/  1.8.7 |     9.25
          block |   rbx/  1.8.7 |     8.87
          block | jruby/  1.9.2 |     6.32
          block |  ruby/  1.9.2 |     6.13
         string |  ruby/  1.9.2 |     5.96
          block | jruby/  1.8.7 |     5.51
          block |  ruby/  1.8.7 |     5.26
         string |  ruby/  1.8.7 |     4.89

Going in, my hypothesis was that doing `logger.info { some data }` as a block would be faster than `logger.info(["some message with #{subsitutions}", { some hash }])`. I assumed that block generation was faster (and more cacheable) than string substituion is.

Conclusions:

I am amused that ruby 1.8.7 beats everything in both string and block runs.

Turns out, it depends greatly on your ruby platform.

For MRI/YARV rubies, string is faster, but only marginally. For JRuby, block beats string by 1.5x.
