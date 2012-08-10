#include <sys/types.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
   int fd;
   char buf[1024];
   struct sockaddr_un addr;

   fd = socket(AF_UNIX, SOCK_DGRAM, 0);
   if (fd < 0) {
      perror("socket");
      return 1;
   }

  if (argc != 2) {
    printf("usage: %s <path_to_socket>\n", argv[0]);
    return 1;
  }
  
   addr.sun_family = AF_UNIX;
   strcpy(addr.sun_path, argv[1]);
   if (bind(fd, (struct sockaddr *)&addr, SUN_LEN(&addr))) {
      perror("bind");
      return 1;
   }

   socklen_t client_addr_len = 100;
   struct sockaddr *client = malloc(client_addr_len);
   
   ssize_t len;
   if ((len = recvfrom(fd, buf, 1024, 0, (struct sockaddr*)client, &client_addr_len)) < 0) {
      perror("recvfrom");
   }
   printf("client addr type, len: %d, %d\n", client->sa_family, client_addr_len);
   printf("Got: '%.*s\n", len, buf);
   perror("recvfrom");
   close(fd);
   unlink(addr.sun_path);
}

