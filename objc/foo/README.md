

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
