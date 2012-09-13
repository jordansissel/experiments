# Securing Redis

Security redis communication with stunnel and unix sockets when the client runs
on an untrusted machine.

* Client creates a safely-permissioned unix socket to have redis client talk to.
* Have local stunnel listen on this socket, forward to a remote stunnel encrypted.
* A 'server' stunnel listening on a port, forwarding to a local redis.

I patched the 'example.c' from hiredis to use a unix socket (redisConnectUnixWithTimeout) instead of tcp.

## Output

    % strace -e trace=network ./a.out
    socket(PF_FILE, SOCK_STREAM, 0)         = 3
    connect(3, {sa_family=AF_FILE, sun_path="/tmp/redis.ssl.sock"}, 110) = 0
    PING: PONG
    SET: OK
    SET (binary API): OK
    GET foo: hello world
    INCR counter: 3
    INCR counter: 4
    0) element-9
    1) element-8
    2) element-7
    3) element-6
    4) element-5
    5) element-4
    6) element-3
    7) element-2
    8) element-1
    9) element-0
    +++ exited with 0 +++

