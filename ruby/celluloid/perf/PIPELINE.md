# Pipeline using 'future'

Experimenting with different processing pipeline implementations.

Logstash can do roughly 50000 events/sec under MRI with the generator input and stdout output. The current logstash model uses threads for each worker (plugin, usually) and SizedQueue for message passing.

How does a similar workflow perform in Celluloid? Quite poorly, at least with the way I've implemented it.

## JRuby 1.7.0

    % ruby pipeline.rb
    Rate: 943.2182607055272
    Duration: 10.404999999999603 - Rate: 961.0764055742798
    Environment: jruby1.7.0 1.9.3
    Breakdown:
                                       0...0: ████████
                  0.0009765625...0.001953125: █████████████████████████████████████
                    0.001953125...0.00390625: ██████
                      0.00390625...0.0078125: █
                        0.0078125...0.015625: █
                          0.015625...0.03125: █

## MRI 1.9.3

    % ruby pipeline.rb
    Rate: 1138.1477500867477
    Duration: 8.565509864000017 - Rate: 1167.4728251763509
    Environment: ruby 1.9.3
    Breakdown:
              0.000244140625...0.00048828125: █
                0.00048828125...0.0009765625: ████████████████████████████████████████
                  0.0009765625...0.001953125: ██████████
                    0.001953125...0.00390625: █
                      0.00390625...0.0078125: █
                        0.0078125...0.015625: █

# Pipeline using 'async'

## JRuby 1.7.0

    % ruby pipeline_with_async.rb
    Duration: 9.789446558000025 - Rate: 1021.5082068993889
    Environment: ruby 1.9.3
    Breakdown:
            0.0001220703125...0.000244140625: █
              0.000244140625...0.00048828125: ██
                0.00048828125...0.0009765625: ███████████████████████████████
                  0.0009765625...0.001953125: █████████████████
                    0.001953125...0.00390625: █
                      0.00390625...0.0078125: █
                        0.0078125...0.015625: █
                          0.015625...0.03125: █

## MRI 1.9.3

    % ruby pipeline_with_async.rb
    Duration: 6.1790000000003715 - Rate: 1618.3848519176888
    Environment: jruby1.7.0 1.9.3
    Breakdown:
                                       0...0: ██████████████████████
                  0.0009765625...0.001953125: ███████████████████████████
                    0.001953125...0.00390625: ██
                      0.00390625...0.0078125: █
                        0.0078125...0.015625: █
                          0.015625...0.03125: █
