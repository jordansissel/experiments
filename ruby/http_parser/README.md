# Bug in http\_parser.rb?

## This bug was fixed in http\_parser.rb 8595cac0e255c6f94b261144e464d1f7c4a2e594 )

Run it:

    rvm all do gem install minitest http_parser.rb
    rvm all do ruby run.rb

Results are in `output/`

Here's what I get:

     % grep failures output/*
    output/jruby-1.6.6@1.8.7:2 tests, 2 assertions, 0 failures, 0 errors, 0 skips
    output/jruby-1.6.6@1.9.2:2 tests, 2 assertions, 0 failures, 0 errors, 0 skips
    output/ruby@1.8.7:2 tests, 2 assertions, 1 failures, 0 errors, 0 skips
    output/ruby@1.9.2:2 tests, 2 assertions, 1 failures, 0 errors, 0 skips
    output/ruby@1.9.3:2 tests, 2 assertions, 1 failures, 0 errors, 0 skips

This request parses properly:

    request = buildrequest([
      "GET /foo HTTP/1.1",
      "host: localhost",
      ""
    ])

This request does not:

    request = buildrequest([
      "GET /websocket HTTP/1.1",
      "host: localhost",
      "connection: Upgrade",
      "upgrade: websocket",
      "sec-websocket-key: SD6/hpYbKjQ6Sown7pBbWQ==",
      "sec-websocket-version: 13",
      ""
    ])

The failure is that `parser << data` is returning an offset that is one byte
short:
    
    % grep OFFSET output/*
    output/ruby@1.8.7:OFFSET WRONG? Data remaining: "\n"
    output/ruby@1.9.2:.OFFSET WRONG? Data remaining: "\n"
    output/ruby@1.9.3:OFFSET WRONG? Data remaining: "\n"
