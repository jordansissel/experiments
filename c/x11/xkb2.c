#include <stdlib.h>
#include <string.h>
#ifndef _XOPEN_SOURCE
#define _XOPEN_SOURCE 600
#endif /* _XOPEN_SOURCE */

#include <regex.h>
#include <stdarg.h>
#include <strings.h>
#include <sys/select.h>
#include <unistd.h>

#include <X11/XKBlib.h>
#include <X11/Xatom.h>
#include <X11/Xlib.h>
#include <X11/Xresource.h>
#include <X11/Xutil.h>
#include <X11/cursorfont.h>
#include <X11/extensions/XTest.h>
#include <X11/extensions/Xinerama.h>
#include <X11/keysym.h>

#include <xkbcommon/xkbcommon.h>

const char *vmodnames(Display *dpy, XkbDescPtr desc, short vmods) {
  static char names[1024];
  memset(names, 0, sizeof(names));

  if (vmods == 0) {
    return "<none>";
  }

  for (int i = 0; (1 << i) <= vmods; i++) {
    if (vmods & (1 << i)) {
      const char *n = XGetAtomName(dpy, desc->names->vmods[i]);
      if (names[0] == 0) {
        sprintf(names, "%s", n);
      } else {
        sprintf(names, "%s+%s", names, n);
      }
    }
  }

  if (strlen(names) == 0) {
    printf("bug: empty vmod string for value: %d\n", vmods);
  }

  return names;
}

const char *modnames(short mask) {
  static char names[1024];
  memset(names, 0, sizeof(names));

  if (mask == 0) {
    return "<none>";
  }

  if (mask & ShiftMask)
    sprintf(names, "%s+Shift", names);
  if (mask & LockMask)
    sprintf(names, "%s+Lock", names);
  if (mask & ControlMask)
    sprintf(names, "%s+Control", names);
  if (mask & Mod1Mask)
    sprintf(names, "%s+Mod1", names);
  if (mask & Mod2Mask)
    sprintf(names, "%s+Mod2", names);
  if (mask & Mod3Mask)
    sprintf(names, "%s+Mod3", names);
  if (mask & Mod4Mask)
    sprintf(names, "%s+Mod4", names);
  if (mask & Mod5Mask)
    sprintf(names, "%s+Mod5", names);

  if (names[0] == '+') {
    sprintf(names, "%s", names + 1);
  }

  return names;
}

int main() {
  Display *dpy = XOpenDisplay(NULL);
  if (dpy == NULL) {
    printf("XOpenDisplay failed\n");
    exit(1);
  }

  XkbDescPtr desc = XkbGetMap(dpy, XkbAllClientInfoMask, XkbUseCoreKbd);

  XkbGetNames(
      // Fetch atom names so XGetAtomName works on Xkb atoms
      dpy, XkbKeyTypeNamesMask | XkbKTLevelNamesMask | XkbVirtualModNamesMask,
      desc);

  for (int keycode = desc->min_key_code; keycode <= desc->max_key_code;
       keycode++) {
    for (int group = 0; group < XkbKeyNumGroups(desc, keycode); group++) {
      XkbKeyTypePtr key_type = XkbKeyKeyType(desc, keycode, group);

      if (key_type->num_levels == 0) {
        printf("No shift levels found for code:%d, group: %d\n", keycode,
               group);
        continue;
      }

      Bool modmask0found = 0;

      for (int li = 0; li < key_type->num_levels; li++) {
        if (key_type->map_count == 0) {
          // no map entries, every modifier results in shift level "one" aka 0
          // index.
          const int level = 0;
          modmask0found = 1;

          KeySym keysym = XkbKeycodeToKeysym(dpy, keycode, group, level);
          if (keysym == NoSymbol) {
            printf("No keysym found for code:%d, group: %d, level:%d\n",
                   keycode, group, level);
            continue;
          }

          printf(
              "[group %d, level %d] (KT: %s) Symbol(%s) = keycode %d with any "
              "or no modifiers\n",
              group, li, XGetAtomName(dpy, key_type->name),
              XKeysymToString(keysym), keycode);
        } else {
          XkbKTMapEntryRec map = key_type->map[li];
          if (!map.active) {
            continue;
          }

          KeySym keysym = XkbKeycodeToKeysym(dpy, keycode, group, map.level);
          if (keysym == NoSymbol) {
            printf("No keysym found for code:%d, group: %d, level:%d\n",
                   keycode, group, map.level);
            continue;
          }

          if (map.mods.real_mods == 0 && map.mods.vmods == 0) {
            printf("Warning: found a mod entry with mods=0. This isn't "
                   "expected?\n");
            modmask0found = 1;
          }

          printf("[group %d, level %d] (KT: %s) Symbol(%s) = keycode %d with "
                 "level name %s, reachable with "
                 "mask:%s, "
                 "real_mods:%x, vmods:%s\n",
                 group, map.level, XGetAtomName(dpy, key_type->name),
                 XKeysymToString(keysym), keycode,
                 XGetAtomName(dpy, key_type->level_names[li]),
                 modnames(map.mods.mask), map.mods.real_mods,
                 vmodnames(dpy, desc, map.mods.vmods));
        }
      }

      // From:
      // https://x.z-yx.cc/libX11/XKB/16-chapter-15-xkb-client-keyboard-mapping.html#The_Canonical_Key_Types
      // > Any combination of modifiers not explicitly listed somewhere in the
      // map yields shift level one.
      //
      // So if there's no entry for a specific modifier mask, then that modmask
      // means shift level 1 aka Base
      if (!modmask0found) {
        KeySym keysym = XkbKeycodeToKeysym(dpy, keycode, group, 0);

        printf("[group %d, level 1] (KT: %s) Symbol(%s) = keycode %d "
               "with no modifiers, implies level 1\n",
               group, XGetAtomName(dpy, key_type->name),
               XKeysymToString(keysym), keycode);
      }
    }
  }
}
