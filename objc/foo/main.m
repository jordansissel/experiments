#import <stdio.h>
#import <Foundation/NSException.h>
#import <Foundation/NSAutoreleasePool.h>
#import <Foundation/Foundation.h>
#import <FooException.h>

int main( int argc, const char *argv[] ) {
    NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];

    NSException *exception = [FooException 
      exceptionWithName: @"FooException"
                 reason: @"The level is above 100"
               userInfo: nil];

    @try {
      @throw(exception);
    } @catch (FooException *e) {
      NSLog(@"Exception hurray");
    }

    [pool release];
    return 0;
}

