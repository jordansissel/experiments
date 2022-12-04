#include <stdio.h>
#include <string.h>

typedef struct range {
    unsigned int start;
    unsigned int end;
} Range;

// Compare two ranges and 
// return 1 (true) if one range fully includes the other
// return 0 (false) otherwise.
int range_fully_contains(Range one, Range two) {
    if (one.start <= two.start && one.end >= two.end) {
        return 1;
    } else if (two.start <= one.start && two.end >= one.end) {
        return 1;
    }
    return 0;
}

int main(int argc, char *argv[]) {
    FILE *input = stdin; // XXX: Maybe we want to accept filename input via args?

    char *data;
    size_t len;


    Range elf1, elf2;

    //while ((data = fgetln(input, &len)) != NULL)

    unsigned int count_fully_contained = 0;
    while (fscanf(input, "%u-%u,%u-%u", &elf1.start, &elf1.end, &elf2.start, &elf2.end) > 0) {
        //printf("Range: %u - %u; %u - %u\n", elf1.start, elf1.end, elf2.start, elf2.end);

        if (range_fully_contains(elf1, elf2)) {
            count_fully_contained++;
        }
    }

    int err = ferror(input);
    if (err != 0) {
        fprintf(stderr, "Error reading from file: %s\n", strerror(err));
        return 1;
    }

    printf("Count of fully contained; %u\n", count_fully_contained);

    return 0;
}