# go + unix datagram == :(

## Example

* Note: to send a message to this socket, on linux, use `logger -du /tmp/example.sock hello world`

    % rm /tmp/example.sock; strace -e trace=socket,connect,recvfrom,open ./example
    socket(PF_FILE, SOCK_DGRAM, 0)          = 3
    recvfrom(3, 0xf84006e000, 4096, 0, 0xf840000150, 0xf8400490a0) = -1 EAGAIN (Resource temporarily unavailable)
    recvfrom(3, "<5>Jul 27 23:21:39 jls: hello\0", 4096, 0, {sa_family=AF_UNSPEC, sa_data="\0\0\0\0\0\0\0\0\0\0\0\0\0\0"}, [0]) = 30
    conn.ReadFrom error: read unixgram /tmp/example.sock: address family not supported by protocol
    +++ exited with 0 +++

## Conclusion

The error from conn.ReadFrom fails, yet strace reveals that the recvfrom(2) call is successful. 

There's a bug somewhere in Go, here. Some likely problems:

* net.ListenUnixgram returns, quite confusingly, a UDPConn, shouldn't this return a UnixConn? 
