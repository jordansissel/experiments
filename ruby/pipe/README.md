# Pipes in Ruby

Hacking the backtick operator and making it so you can pipe things together.

    [1] pry(main)> pipes = `seq 15` | `grep 5`
    => <Pipe#5542080 input=#<IO:0x00000000a920e0> output=#<IO:0x00000000ac1368> args=["sh", "-c", "grep 5"]>
    [2] pry(main)> tty = pipes.start
    => #<TTY:0x00000000a92270
     @keyboard=#<IO:fd 5>,
     @keyboard_input=#<IO:fd 6>,
     @terminal=#<IO:fd 8>>
    [3] pry(main)> tty.read
    => "5\n15\n"

