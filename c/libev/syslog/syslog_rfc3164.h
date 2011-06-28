#ifndef _SYSLOG_RFC3164_H_
#define _SYSLOG_RFC3164_H_

struct syslog3164_parser;

struct syslog3164_parser {
  int cs; /* current state */
  int priority; /* syslog priority */
  char *message;
  ssize_t message_pos;
  ssize_t message_size;

  char *timestamp; /* no 'size' since we know max length */
  ssize_t timestamp_pos;
  char *eof; /* eof pointer, null if no EOF */

  int count;
  void (*callback)(struct syslog3164_parser *parser);
  void *data;
}; /* struct syslog3164_parser */

void syslog3164_init(struct syslog3164_parser *parser);
ssize_t syslog3164_parse(struct syslog3164_parser *parser, char *buffer,
                         ssize_t offset, ssize_t buffer_len);

#endif /* _SYSLOG_RFC3164_H_ */
