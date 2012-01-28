# DNS resolution inconsistencies

## Conclusions

Quite a mess here.

### Socket.gethostbyname

* MRI ruby 1.9.2 and 1.9.3 provide both AAAA (IPv6) and A (IPv4) records even
  though the API clearly claims to return only one address type (noted by the
  'family' return value of Socket.gethostbyname).
* JRuby in both 1.8 and 1.9 modes only ever seems to yield IPv4 addresses.
* MRI 1.8.7 gets an IPv6 address for 'localhost' while JRuby in gets an IPv4 address
* This API (Socket.gethostbyname) lacks any hints to indicate what address type
  you want. The right API to use is probably the ruby 'resolv' library from
  stdlib - Resolve::DNS, etc.
* I don't think this is a bug, but it is a difference: Note the string encoding
  differences between 1.8.7 and 1.9 modes (both MRI and JRuby). 1.8 uses octal,
  1.9 uses hex when displayed.

### Resolv::DNS is better, right?

* There's wildly inconsistent results in both Socket.gethostbyname and in Resolve::DNS.
* In MRI and Socket.gethostbyname: 1.8 yields only one address family, 1.9 yields both.
* In MRI and Resolv::DNS: 1.8 yields both address types, 1.9 yields only one.

WTF. There's so much inconsistency, there's no point in filing bugs or patcheS
because I still have to provide work arounds for the older versions people
still have in production (where "older versions" includes ruby 1.9.3, too).

## Data

### Ruby Versions

    % rvm list 
    ...
    ruby-1.9.2-p290 [ x86_64 ]
    ruby-1.8.7-p357 [ x86_64 ]
    ruby-1.8.7-p352 [ x86_64 ]
    ruby-1.9.3-p0 [ x86_64 ]
    ruby-1.9.3-preview1 [ x86_64 ]
    jruby-1.6.5 [ amd64 ]

### Socket.gethostbyname

Resolve 'orange.kame.net'

    % rvm all do ruby run.rb orange.kame.net
    ["1.9.2[p290]/ruby", "IPv4", ["\xCB\xB2\x8D\xC2", " \x01\x02\x00\r\xFF\xFF\xF1\x02\x16>\xFF\xFE\xB1D\xD7"]]
    ["1.8.7[p357]/ruby", "IPv4", ["\313\262\215\302"]]
    ["1.8.7[p352]/ruby", "IPv4", ["\313\262\215\302"]]
    ["1.9.3[p0]/ruby", "IPv4", ["\xCB\xB2\x8D\xC2", " \x01\x02\x00\r\xFF\xFF\xF1\x02\x16>\xFF\xFE\xB1D\xD7"]]
    ["1.9.3[p-1]/ruby", "IPv4", ["\xCB\xB2\x8D\xC2", " \x01\x02\x00\r\xFF\xFF\xF1\x02\x16>\xFF\xFE\xB1D\xD7"]]
    ["1.8.7[p330]/jruby", "IPv4", ["\313\262\215\302"]]
    ["1.9.2[p136]/jruby", "IPv4", ["\xCB\xB2\x8D\xC2"]]

Resolve 'localhost'

    % rvm all do ruby run.rb localhost
    ["1.9.2[p290]/ruby", "IPv6", ["\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01", "\x7F\x00\x00\x01"]]
    ["1.8.7[p357]/ruby", "IPv6", ["\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\001"]]
    ["1.8.7[p352]/ruby", "IPv6", ["\000\000\000\000\000\000\000\000\000\000\000\000\000\000\000\001"]]
    ["1.9.3[p0]/ruby", "IPv6", ["\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01", "\x7F\x00\x00\x01"]]
    ["1.9.3[p-1]/ruby", "IPv6", ["\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01", "\x7F\x00\x00\x01"]]
    ["1.8.7[p330]/jruby", "IPv4", ["\177\000\000\001"]]
    ["1.9.2[p136]/jruby", "IPv4", ["\x7F\x00\x00\x01"]]

### Resolv::DNS

Resolve 'orange.kame.net'

    % rvm all do ruby use-resolv.rb orange.kame.net
    ["1.9.2[p290]/ruby", ["203.178.141.194"]]
    ["1.8.7[p357]/ruby", ["203.178.141.194", "2001:200:DFF:FFF1:216:3EFF:FEB1:44D7"]]
    ["1.8.7[p352]/ruby", ["203.178.141.194", "2001:200:DFF:FFF1:216:3EFF:FEB1:44D7"]]
    ["1.9.3[p0]/ruby", ["203.178.141.194"]]
    ["1.9.3[p-1]/ruby", ["203.178.141.194"]]
    ["1.8.7[p330]/jruby", ["203.178.141.194", "2001:200:DFF:FFF1:216:3EFF:FEB1:44D7"]]

* JRuby with --1.9 failed with: NoMethodError: undefined method `ip_address_list' for Socket:Class

Resolve 'localhost'

    % rvm all do ruby use-resolv.rb localhost
    ["1.9.2[p290]/ruby", []]
    ["1.8.7[p357]/ruby", []]
    ["1.8.7[p352]/ruby", []]
    ["1.9.3[p0]/ruby", []]
    ["1.9.3[p-1]/ruby", []]
    ["1.8.7[p330]/jruby", []]
    ["1.8.7[p330]/jruby", []]

Ooookay so localhost doesn't resolve, but "localhost." will ? Blah.

    % rvm all do ruby use-resolv.rb localhost.
    ["1.9.2[p290]/ruby", [#<Resolv::IPv4 127.0.0.1>]]
    ["1.8.7[p357]/ruby", [#<Resolv::IPv4 127.0.0.1>, #<Resolv::IPv6 ::1>]]
    ["1.8.7[p352]/ruby", [#<Resolv::IPv4 127.0.0.1>, #<Resolv::IPv6 ::1>]]
    ["1.9.3[p0]/ruby", [#<Resolv::IPv4 127.0.0.1>]]
    ["1.9.3[p-1]/ruby", [#<Resolv::IPv4 127.0.0.1>]]
    ["1.8.7[p330]/jruby", [#<Resolv::IPv4 127.0.0.1>, #<Resolv::IPv6 ::1>]]
    ["1.8.7[p330]/jruby", [#<Resolv::IPv4 127.0.0.1>, #<Resolv::IPv6 ::1>]]
