#include "openssl/bio.h"
#include "openssl/ssl.h"
#include "openssl/err.h"

int main() {
  BIO *bio;
  const int len = 4096;
  char buf[4096];
  SSL_CTX *ctx;
  SSL *ssl;

  SSL_library_init();
  SSL_load_error_strings();

  ctx = SSL_CTX_new(SSLv23_client_method());
  bio = BIO_new_ssl_connect(ctx);
  BIO_get_ssl(bio,  &ssl);

  if (ssl == NULL) {
    fprintf(stderr, "Failure to get ssl on bio\n");
    return 1;
  }

  SSL_set_mode(ssl, SSL_MODE_AUTO_RETRY);
  BIO_set_conn_hostname(bio, "www.google.com:443");

  if(bio == NULL)
  {
    /* Handle the failure */
  }

  if(BIO_do_connect(bio) <= 0)
  {
    /* Handle failed connection */
  }

  BIO_printf(bio, "GET / HTTP/1.0\r\n\r\n");
  int x = BIO_read(bio, buf, len);
  if(x == 0)
  {
    printf("Closed\n");
    /* Handle closed connection */
  }
  else if(x < 0)
  {
    if(! BIO_should_retry(bio))
    {
      /* Handle failed read here */
    }

    /* Do something to handle the retry */
    return 1;
  }
  fwrite(buf, x, 1, stdout);

  (void) BIO_reset(bio);
  BIO_free_all(bio);
  return 0;
}
