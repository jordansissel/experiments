#include "openssl/bio.h"
#include "openssl/ssl.h"
#include "openssl/err.h"

int main() {
  BIO *sbio, *out;
  int len;
  char tmpbuf[1024];
  SSL_CTX *ctx;
  SSL *ssl;

  SSL_library_init();
  SSL_load_error_strings();
  OpenSSL_add_all_algorithms();

  /* We would seed the PRNG here if the platform didn't
   * do it automatically
   */

  ctx = SSL_CTX_new(SSLv23_client_method());

  /* We'd normally set some stuff like the verify paths and
   * mode here because as things stand this will connect to
   * any server whose certificate is signed by any CA.
   */

  sbio = BIO_new_ssl_connect(ctx);

  BIO_get_ssl(sbio, &ssl);

  if(!ssl) {
    fprintf(stderr, "Can't locate SSL pointer\n");
    /* whatever ... */
  }

  /* Don't want any retries */
  SSL_set_mode(ssl, SSL_MODE_AUTO_RETRY);

  /* We might want to do other things with ssl here */

  BIO_set_conn_hostname(sbio, "www.google.com:https");

  out = BIO_new_fp(stdout, BIO_NOCLOSE);
  if(BIO_do_connect(sbio) <= 0) {
    fprintf(stderr, "Error connecting to server\n");
    ERR_print_errors_fp(stderr);
    /* whatever ... */
  }
  if(BIO_do_handshake(sbio) <= 0) {
    fprintf(stderr, "Error establishing SSL connection\n");
    ERR_print_errors_fp(stderr);
    /* whatever ... */
  }

  /* Could examine ssl here to get connection info */

  BIO_puts(sbio, "GET / HTTP/1.0\n\n");
  for(;;) {
    len = BIO_read(sbio, tmpbuf, 1024);
    if(len <= 0) break;
    BIO_write(out, tmpbuf, len);
  }
  BIO_free_all(sbio);
  BIO_free(out);
  return 0;
}
