# Safely crashing stdin consumer

Let's say I wanted to replace 'logger' with a custom tool, but my custom tool
was complex and could be prone to crashing. Perhaps this example, calling my
custom tool 'slurper':

```
# Replace logger in this:
./someprogram | logger -t myprogram

# With this:
./someprogram | slurper
```

If slurper crashes, its stdin is closed and 'someprogram' has its stdout
brutally destroyed. The process usually dies via SIGPIPE or a related write
failure the next time it tries to write to stdout. 

Here's an example of what happens with stdout closes:

```
% ruby -e 'loop { puts "ok"; $stdout.flush }'  | true
-e:1:in `flush': Broken pipe (Errno::EPIPE)

# Or more simply, try this with 'seq':
% seq 10 | true
% echo $pipestatus
141 0

# exit code 141 == Signal 13 == SIGPIPE
```

Since 'true' exits pretty quickly, ruby has its stdout blown up and the next
write to stdout gets a SIGPIPE. Oops.

Just like the 'true' command above, I worry that my hypothetical 'slurper'
process could crash, or generally exit prematurely.

## fork to the rescue

We can solve this by having a master process babysit our 'slurper' using this
pseudocode:

```
loop forever:
  fork 'slurper'
  wait for 'slurper' to die
  exit if stdin is dead
```

## is stdin dead?

In the master/babysitter process, we are never reading from stdin, so
it might be tricky to determine if stdin is dead.

I tried many ways to check if 'stdin' was dead:

* read(0, NULL, 0) - always succeeds, even with stdin is dead.
* lseek(0, 0, SEEK_CUR) - always fails; can't seek in a pipe.
* write(0, NULL, 0) - always fails; can't write on a read-only fd.
* select(1, [0], NULL, NULL, NULL) - always succeeds claiming stdin is
  readable, even when it is dead.
* poll({ .fd = 0, .events = POLLIN }, 1, -1) - Success!

poll(2) for POLLIN on fd 0 (stdin) works well and the pollfd's `revents` member
(based on observations):

* will include POLLHUP if the upstream hungup (died abnormally, like via signal)
* will not include POLLIN, indicating stdin is not readable and dead (upstream
  died normally though)

I also found information suggesting that poll(2) support on various OSs varies
quite a bit (<http://www.greenend.org.uk/rjk/tech/poll.html>)

## Example:

See 'master.c' in this directory for the implementation of the above pseudocode.

Here's what happens when we don't use the babysitting trick; stdin dies and we lose data:

```
% seq 10 | sh -c 'read a; echo "Read: $a"'
Read: 1
```

We lost most of the output in our simulated crash. Oops.

But what if we babysit it as described, restarting the dead 'stdin consumer'
when it dies - continually, until stdin is actually closed?

```
% seq 10 | ./master sh -c 'read a; echo "Read: $a"'
Read: 1
Read: 2
Read: 3
Read: 4
Read: 5
Read: 6
Read: 7
Read: 8
Read: 9
Read: 10
upstream stdin closed.
```

Boom! Victory. (Tested against Linux 3.3.0-4 and Linux 2.6.32-71.29.1.el6)
