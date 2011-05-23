# Premise

I have some code that does acl checking; compares an client ip  address against a list of addresses (or subnets) that permit or reject. This largely involves iterating across a set of IPAddr objects asking addr.include?(client_addr). Performance is terrible when I include this acl checking.

Why? IPAddr is really slow, so I implemented what I needed as "TubeAddress" and compared the speeds.

# Data

     implementation |  platform     | duration | rate
             ipaddr |   rbx/  1.8.7 |    18.96 | 2637.29
             ipaddr |  ruby/  1.8.7 |     3.54 | 14120.15
             ipaddr | jruby/  1.9.2 |     2.76 | 18122.51
             ipaddr | jruby/  1.8.7 |     2.46 | 20316.94
             ipaddr |  ruby/  1.9.2 |     2.22 | 22474.13
           tubeaddr | jruby/  1.9.2 |     1.54 | 32383.42
           tubeaddr |   rbx/  1.8.7 |     1.53 | 32778.22
           tubeaddr | jruby/  1.8.7 |     1.52 | 32981.53
           tubeaddr |  ruby/  1.8.7 |     0.89 | 56136.06
           tubeaddr |  ruby/  1.9.2 |     0.42 | 117957.64


# Conclusions

ipaddr is another really slow ruby core/stdlib tool. In call tests, my version beats the stdlib ipaddr by a wide margin.
