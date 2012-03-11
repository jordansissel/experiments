# Pipes in Ruby

Hacking the backtick operator and making it so you can pipe things together.

    [1] pry(main)> pipes = `seq 15` | `grep 5`
    [2] pry(main)> tty = pipes.start
    [3] pry(main)> tty.read
    => "5\n15\n"

With this hack, the ` operator now gets you a Pipe object which you can pipe
(|) to other Pipe instances.
