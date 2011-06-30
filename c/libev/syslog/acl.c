#include "acl.h"
#include <assert.h>
#include <netinet/in.h> /* for struct in_addr */
#include <stdlib.h> /* for malloc and friends */
#include <stdio.h> /* for fprintf */
#include <string.h> /* for memcpy */

#define PREFIX_TO_MASK(prefix) (~((1 << (32 - prefix)) - 1))

acl_v4 *acl_v4_new(void) {
  acl_v4 *acl = malloc(sizeof(acl_v4));
  acl->acl_len = 0;
  acl->acl_size = 10;
  acl->acl = calloc(acl->acl_size, sizeof(acl_v4_entry));
  return acl;
} /* acl_v4_new */

int acl_v4_entry_parse(const char *cidr, size_t cidrlen, acl_v4_entry *acl) {
  static char tmp[] = "255.255.255.255/32"; /* max length of cidr */
  char *prefix_str;
  uint32_t prefix = 32;
  size_t prefix_offset = cidrlen;
  struct in_addr address;

  int i;

  /* Search backwards for the prefix delimiter "/" */
  for (i = cidrlen - 1; i >= (cidrlen - 3); i--) {
    //printf("Checking prefix %d: %.*s\n", i, cidrlen, cidr);
    //printf("                    %.*s^\n", i-1, "                        ");
    if (cidr[i] == '/') {
      prefix = (uint32_t) atoi(cidr + i + 1);
      prefix_offset = i;
      if (prefix > 32) {
        fprintf(stderr, "CIDR prefix '%d' is not valid in '%.*s'\n",
                prefix, cidrlen, cidr);
        return ACL_INVALID_PREFIX;
      }
      break; /* found it, move on */
    }
  }
  /* If we get here and didn't find the prefix, keep default /32 */ 

  memcpy(tmp, cidr, cidrlen);
  tmp[prefix_offset] = '\0';
  if (inet_aton(tmp, &address) == 0) {
    fprintf(stderr, "Invalid address: %s\n", tmp);
    return ACL_INVALID_ADDRESS;
  }

  acl->mask = PREFIX_TO_MASK(prefix); 
  acl->base_address = ntohl(address.s_addr) & acl->mask;
  return ACL_SUCCESS;
} /* acl_v4_parse */

int acl_v4_entry_allows(acl_v4_entry *acl_entry, struct in_addr *addr) {
  //printf("%08x/%08x includes %08x\n", acl_entry->base_address, acl_entry->mask,
         //addr->s_addr);
  return (addr->s_addr & acl_entry->mask) == acl_entry->base_address;
} /* acl_v4_entry_allows */

int acl_v4_add_str(acl_v4 *acl, const char *cidr, size_t cidrlen) {
  acl_v4_entry acl_entry;
  int rc;
  rc = acl_v4_entry_parse(cidr, cidrlen, &acl_entry);
  if (rc != ACL_SUCCESS) {
    return rc;
  }
  return acl_v4_add_entry(acl, &acl_entry);
} /* acl_v4_add_str */

int acl_v4_add_addr(acl_v4 *acl, struct in_addr addr, uint32_t prefix) {
  /* TODO(sissel): implement */
  assert("not implemented");
};

int acl_v4_add_entry(acl_v4 *acl, acl_v4_entry *acl_entry) {
  int i = 0;

  /* Make sure this entry isn't already in the set */
  for (i = 0; i < acl->acl_len; i++) {
    acl_v4_entry *cur = acl->acl + i;
    if (cur->base_address == acl_entry->base_address
        && cur->mask == acl_entry->mask) {
      return ACL_REJECTED_DUPLICATE;
    }
  }

  /* not a dup, add to the end of the list */
  memcpy(acl->acl + acl->acl_len, acl_entry, sizeof(acl_v4_entry));
  acl->acl_len++;

  /* Check if we need to grow the list. */
  if (acl->acl_len == acl->acl_size) {
    acl->acl_size *= 2;
    acl = realloc(acl, acl->acl_size);
  }

  return ACL_SUCCESS;
} /* acl_v4_add_entry */

int acl_v4_test(acl_v4 *acl, struct in_addr addr) {
  int i = 0;

  /* Make sure this entry isn't already in the set */
  for (i = 0; i < acl->acl_len; i++) {
    acl_v4_entry *cur = acl->acl + i;
    if (acl_v4_entry_allows(cur, &addr)) {
      return ACL_SUCCESS;
    }
  }

  return ACL_NOT_FOUND;
} /* acl_v4_test */

int acl_v4_length(acl_v4 *acl) {
  return acl->acl_len;
} /* acl_v4_length */

//int acl_v4_remove_str(acl_v4 *acl, const char *cidr, size_t cidrlen);
//int acl_v4_remove_addr(acl_v4 *acl, struct in_addr addr, uint32_t prefix);
//int acl_v4_remove_entry(acl_v4 *acl, acl_v4_entry *acl_entry);
