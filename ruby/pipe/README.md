# Pipes in Ruby

Hacking the backtick operator and making it so you can pipe things together.

    [1] pry(main)> pipes = `seq 15` | `grep 5`
    [2] pry(main)> tty = pipes.start
    [3] pry(main)> tty.read
    => "5\n15\n"

With this hack, the ` operator now gets you a Pipe object which you can pipe
(|) to other Pipe instances.

## Using the Pipe class directly

    [1] pry(main)> pipe = Pipe.new("seq", "15") | Pipe.new("grep", "1")
    [2] pry(main)> tty = pipe.start
    [3] pry(main)> tty.read
    => "1\n10\n11\n12\n13\n14\n15\n"

