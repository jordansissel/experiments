#ifndef _ACL_H_
#define _ACL_H_

#include <stdint.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

typedef struct acl_v4_entry {
  uint32_t base_address;
  uint32_t mask;
} acl_v4_entry;

typedef struct acl_v4 {
  acl_v4_entry *acl;
  size_t acl_len;
  size_t acl_size;
} acl_v4;

typedef enum {
  ACL_SUCCESS = 0,
  ACL_INVALID_ADDRESS = 1,
  ACL_INVALID_PREFIX = 2,
  ACL_NOT_FOUND = 3,
  ACL_REJECTED_DUPLICATE = 4,
} acl_code;

acl_v4 *acl_v4_new(void);
int acl_v4_length(acl_v4 *acl);
int acl_v4_add_str(acl_v4 *acl, const char *cidr, size_t cidrlen);
int acl_v4_add_addr(acl_v4 *acl, struct in_addr addr, uint32_t prefix);
int acl_v4_add_entry(acl_v4 *acl, acl_v4_entry *acl_entry);

int acl_v4_remove_str(acl_v4 *acl, const char *cidr, size_t cidrlen);
int acl_v4_remove_addr(acl_v4 *acl, struct in_addr addr, uint32_t prefix);
int acl_v4_remove_entry(acl_v4 *acl, acl_v4_entry *acl_entry);

int acl_v4_test(acl_v4 *acl, struct in_addr addr);

/** Parse a string CIDR address into an acl_v4 struct */
int acl_v4_entry_parse(const char *cidr, size_t cidrlen, acl_v4_entry *acl_entry);

/** Does this acl allow the address? */
int acl_v4_entry_allows(acl_v4_entry *acl_entry, struct in_addr *addr);

#endif /* _ACL_H_ */
