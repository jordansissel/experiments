#include <string.h>
#include <stdlib.h>

/**
 * The code below copied from nethack's engrave.c
 * Nethack's license is viewable here:
 *   https://raw.githubusercontent.com/NetHack/NetHack/bd98dda8c19edbf589746a576999cb98b8035281/dat/license
 */

#define SIZE(x) (int)(sizeof(x) / sizeof(x[0]))
#define BUFSZ 256

/* Partial rubouts for engraving characters. -3. */
static const struct {
    char wipefrom;
    const char *wipeto;
} rubouts[] = { { 'A', "^" },
                { 'B', "Pb[" },
                { 'C', "(" },
                { 'D', "|)[" },
                { 'E', "|FL[_" },
                { 'F', "|-" },
                { 'G', "C(" },
                { 'H', "|-" },
                { 'I', "|" },
                { 'K', "|<" },
                { 'L', "|_" },
                { 'M', "|" },
                { 'N', "|\\" },
                { 'O', "C(" },
                { 'P', "F" },
                { 'Q', "C(" },
                { 'R', "PF" },
                { 'T', "|" },
                { 'U', "J" },
                { 'V', "/\\" },
                { 'W', "V/\\" },
                { 'Z', "/" },
                { 'b', "|" },
                { 'd', "c|" },
                { 'e', "c" },
                { 'g', "c" },
                { 'h', "n" },
                { 'j', "i" },
                { 'k', "|" },
                { 'l', "|" },
                { 'm', "nr" },
                { 'n', "r" },
                { 'o', "c" },
                { 'q', "c" },
                { 'w', "v" },
                { 'y', "v" },
                { ':', "." },
                { ';', ",:" },
                { ',', "." },
                { '=', "-" },
                { '+', "-|" },
                { '*', "+" },
                { '@', "0" },
                { '0', "C(" },
                { '1', "|" },
                { '6', "o" },
                { '7', "/" },
                { '8', "3o" } };

// Short replacement for Nethack's rn2 implementation.
int rn2(int x) {
  return rand() % x;
}

/* degrade some of the characters in a string */
void
wipeout_text(
    char *engr,    /* engraving text */
    int cnt,       /* number of chars to degrade */
    unsigned seed) /* for semi-controlled randomization */
{
    char *s;
    int i, j, nxt, use_rubout;
    unsigned lth = (unsigned) strlen(engr);

    if (lth && cnt > 0) {
        while (cnt--) {
            /* pick next character */
            if (!seed) {
                /* random */
                nxt = rn2((int) lth);
                use_rubout = rn2(4);
            } else {
                /* predictable; caller can reproduce the same sequence by
                   supplying the same arguments later, or a pseudo-random
                   sequence by varying any of them */
                nxt = seed % lth;
                seed *= 31, seed %= (BUFSZ - 1);
                use_rubout = seed & 3;
            }
            s = &engr[nxt];
            if (*s == ' ')
                continue;

            /* rub out unreadable & small punctuation marks */
            if (strchr("?.,'`-|_", *s)) {
                *s = ' ';
                continue;
            }

            if (!use_rubout) {
                i = SIZE(rubouts);
            } else {
                for (i = 0; i < SIZE(rubouts); i++)
                    if (*s == rubouts[i].wipefrom) {
                        unsigned ln = (unsigned) strlen(rubouts[i].wipeto);
                        /*
                         * Pick one of the substitutes at random.
                         */
                        if (!seed) {
                            j = rn2((int) ln);
                        } else {
                            seed *= 31, seed %= (BUFSZ - 1);
                            j = seed % ln;
                        }
                        *s = rubouts[i].wipeto[j];
                        break;
                    }
            }

            /* didn't pick rubout; use '?' for unreadable character */
            if (i == SIZE(rubouts))
                *s = '?';
        }
    }

    /* trim trailing spaces */
    while (lth && engr[lth - 1] == ' ')
        engr[--lth] = '\0';
}
