/* File: testkey.c
 *
 * Compile with:
 * gcc -lxdo testkey.c
 *
 * Requires libxdo (from xdotool project)
 */

#include <xdo.h>

int main() {
  xdo_t *xdo = xdo_new(NULL);
  xdo_keysequence(xdo, CURRENTWINDOW, "J", 0);
  return  0;
}
