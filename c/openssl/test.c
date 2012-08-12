#include "../better-assert/insist.h"
#include <stdio.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <string.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <errno.h>

#include <openssl/bio.h>
#include <openssl/ssl.h>
#include <openssl/err.h>

int tcp_connect(const char *host, short port) {
  /* DNS lookup */
  struct hostent *hostinfo = gethostbyname(host);
  int fd;
  int rc;

  if (hostinfo == NULL) {
    /* DNS error, gethostbyname sets h_errno on failure */
    printf("gethostbyname(%s) failed: %s\n", host,  strerror(h_errno));
    return -1;
  }

  /* 'struct hostent' has the list of addresses resolved in 'h_addr_list'
   * It's a null-terminated list, so count how many are there. */
  unsigned int addr_count;
  for (addr_count = 0; hostinfo->h_addr_list[addr_count] != NULL; addr_count++);
  /* hostnames can resolve to multiple addresses, pick one at random. */
  char *address = hostinfo->h_addr_list[rand() % addr_count];

  printf("Connecting to %s(%s):%hd\n", host,
         inet_ntoa(*(struct in_addr *)address), port);
  fd = socket(PF_INET, SOCK_STREAM, 0); insist(fd >= 0, "socket() failed: %s\n", strerror(errno));

  struct sockaddr_in sockaddr;
  sockaddr.sin_family = PF_INET,
  sockaddr.sin_port = htons(port),
  memcpy(&sockaddr.sin_addr, address, hostinfo->h_length);

  rc = connect(fd, (struct sockaddr *)&sockaddr, sizeof(sockaddr));
  if (rc < 0) {
    return -1;
  }

  printf("Connected successfully to %s(%s):%hd\n", host,
         inet_ntoa(*(struct in_addr *)address), port);
  return fd;
}

int main(int argc, char **argv) {
  if (argc != 3) {
    printf("Usage: %s host port\n", argv[0]);
    return 1;
  }

  const char *host = argv[1];
  short port = (short)atoi(argv[2]);

  int fd = tcp_connect(host, port);
  insist(fd >= 0, "tcp_connect(%s, %h) failed: errno", host, port, strerror(errno));

  CRYPTO_malloc_init();
  SSL_library_init();
  SSL_load_error_strings();
  ERR_load_BIO_strings();
  OpenSSL_add_all_algorithms();

  SSL_CTX *ctx = SSL_CTX_new(SSLv3_client_method());
  SSL *ssl = SSL_new(ctx);
  //BIO *bio = BIO_new_ssl_connect(ctx);
  //ERR_print_errors_fp(stderr);
  //insist(bio != NULL, "BIO_new_ssl_connect failed?");

  BIO *bio = BIO_new_socket(fd, 1 /* close on free */);
  ERR_print_errors_fp(stderr);
  insist(bio != NULL, "BIO_new_socket failed?");
  SSL_set_connect_state(ssl); /* we're a client */
  SSL_set_mode(ssl, SSL_MODE_AUTO_RETRY); /* retry writes/reads that would block */
  SSL_set_bio(ssl,bio,bio);

  int rc = -1;
  printf("connect\n");

  for (;;) {
    rc = SSL_connect(ssl);
    if (rc < 0) {
      switch(SSL_get_error(ssl, rc)) {
        case SSL_ERROR_WANT_READ:
        case SSL_ERROR_WANT_WRITE:
          continue;
        default:
          ERR_print_errors_fp(stderr);
          abort();
      }
    }
    break;
  }
  char foo[] = "GET / HTTP/1.1\r\nHost: google.com\r\n\r\n";
  
  /* Many openssl examples use BIO wrappings of SSL instances, meh, I just go
   * direct. Using BIO methods instead is useful if you want want to have
   * configurable code use or not use SSL encryption */

  SSL_write(ssl, foo, strlen(foo));
  BIO_new
  char buf[1024];
  int bytes;
  bytes = SSL_read(ssl, buf, 1024);
  printf("buf: %.*s\n", bytes, buf);

  return 0;
}
