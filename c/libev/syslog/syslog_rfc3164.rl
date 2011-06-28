#include <stdio.h>
#include <unistd.h>
#include <string.h>

#include "insist.h"
%%{
  machine syslog_rfc3164;

  action message {
    printf("got message: <%d>%.*s\n", parser->priority, parser->message_pos, parser->message);
  }

  action initialize {
    /* start of new message */
    parser->priority = 0;
    parser->message_pos = 0;
    parser->eof = NULL;
  }
  
  action read_priority {
    parser->priority = (parser->priority * 10) + (fc - '0');
  }

  action read_message {
    parser->message[parser->message_pos] = fc;

    parser->message_pos++;
    if (parser->message_pos >= parser->message_size) {
      parser->message_size *= 2;
      parser->message = realloc(parser->message, parser->message_size);
    }
  }

  action read_timestamp {
    parser->timestamp[parser->timestamp_pos] = fc;
    parser->timestamp_pos++;
  }

  action default_pri {
    parser->priority = 13;
  }

  month = ( "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun"
            | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec" ) ;

  day = ((" "? [1-9]) | ([12] [0-9]) | ("3" [01])) ;
  hour = (([01] [0-9]) | "2" [0-4]) ;
  minute = ([0-5][0-9]) ;
  second = ([0-5][0-9]) ;

  time = ( hour ":" minute ":" second ) ;

  pri_num = [0-9] $read_priority @{ parser->message_pos = 0; } ;
  pri = ( "<" pri_num{1,3}  ">" ) @lerr(default_pri);
  message = [^\n]+ $read_message;
  timestamp = ( month " " day " " time ) $read_timestamp ;

  RFC3164 =
    ( 
      pri (timestamp " " %{ parser->message_pos = 0; }) message
      | (pri %{ parser->message_pos = 0; }) message
      | message
    ) %message >initialize
  ;

  TCP_RFC3164 = (RFC3164 "\n") ;
  main := ( TCP_RFC3164* ) ;
}%%

struct syslog_event {
  short priority;
  /* timestamp ? */
  char *message;
};

struct parser {
  int cs; /* current state */
  int priority; /* syslog priority */
  char *message;
  ssize_t message_size;
  ssize_t message_pos;

  char *timestamp; /* no 'size' since we know max length */
  ssize_t timestamp_pos;
  char *eof; /* eof pointer, null if no EOF */
};

%% write data;

void init(struct parser *parser) {
  int cs = 0;
  const char *eof = NULL;
  %% write init;
  parser->cs = cs;
  parser->priority = 0;
  parser->message_size = 1024;
  parser->message = malloc(parser->message_size);
  parser->message_pos = 0;

  /* length of timestamp is constant, "Jan 01 00:00:00" == 15 bytes */
  parser->timestamp = malloc(15);
  parser->timestamp_pos = 0;
}

ssize_t parse(struct parser *parser, char *buffer, ssize_t offset, ssize_t buffer_len) {
  const char *p; /* buffer position */
  const char *pe; /* buffer end */
  const char *eof = NULL;
  int cs = parser->cs;
  p = buffer + offset;
  pe = buffer + (buffer_len);

  printf("parsing: '%.*s...'\n", 3, p);

  %% write exec;

  parser->cs = cs;

  return (p - (buffer + offset)); /* return bytes consumed */
} /* parse */

int main(int argc, char **argv) {
  struct parser parser;
  ssize_t buflen = 4096;
  ssize_t bytes;
  char buf[4096];
  int count;

  init(&parser);

  for (count = 0; count < 1; count++) {
    bytes = read(0, buf, buflen);
    if (bytes == 0) {
      break;
    }

    ssize_t offset = 0;
    while (1) {
      printf("[before offset:%d of %d] cs: %d (want: %d)\n", offset, bytes, parser.cs, syslog_rfc3164_first_final);
      offset += parse(&parser, buf, offset, bytes);
      printf("[after  offset:%d of %d] cs: %d (want: %d)\n", offset, bytes, parser.cs, syslog_rfc3164_first_final);
      /* TODO(sissel): Take any good values from parser */

      if (offset == bytes) {
        printf("End of string reached.\n");
        break;
      }
      //if (strcmp(message, "Hello world") != 0) {
        //printf("Got invalid message: %s\n", message);
      //}
      sleep(1);
    }
    //printf("Message: %s\n", message);
  }

  return 0;
}
