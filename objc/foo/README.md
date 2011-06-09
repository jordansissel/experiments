

# With gcc

    % make clean all && ./obj/test
    This is gnustep-make 2.4.0. Type 'make print-gnustep-make-help' for help.
    rm -rf ./*~ ./obj
    Making all for tool test...
     Compiling file main.m ...
     Compiling file FooException.m ...
     Linking tool test ...
    2011-06-08 20:18:46.943 test[6938] Exception hurray


# With clang

    % make clean all CC=clang OBJCFLAGS="-fblocks -I/usr/lib/gcc/x86_64-linux-gnu/4.4.4/include" CPP="clang -E" && ./obj/test
    This is gnustep-make 2.4.0. Type 'make print-gnustep-make-help' for help.
    rm -rf ./*~ ./obj
    Making all for tool test...
     Compiling file main.m ...
     Compiling file FooException.m ...
     Linking tool test ...
    zsh: abort      ./obj/test


Crash :(

GDB

    Reading symbols from /home/jls/projects/experiments/objc/foo/obj/test...done.
    (gdb) r
    Starting program: /home/jls/projects/experiments/objc/foo/obj/test 
    [Thread debugging using libthread_db enabled]

    Program received signal SIGABRT, Aborted.
    0x00007ffff6b6aba5 in raise () from /lib/libc.so.6
    (gdb) where
    #0  0x00007ffff6b6aba5 in raise () from /lib/libc.so.6
    #1  0x00007ffff6b6e6b0 in abort () from /lib/libc.so.6
    #2  0x00007ffff7366d70 in objc_exception_throw () from /usr/lib/libobjc.so.2
    #3  0x0000000000400cc9 in main (argc=7255, argv=0x1c57) at main.m:16
    (gdb) frame 3
    #3  0x0000000000400cc9 in main (argc=7255, argv=0x1c57) at main.m:16
    16            @throw(exception);

