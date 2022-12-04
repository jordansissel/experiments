#include <stdio.h>
#include <string.h>

// C doesn't typically have nice container or data structure classes
// like you might find in Java, Python, etc, so we have to roll our own.
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

// Return 1 (true) if range one and range two overlap.
// Returns 0 (false) otherwise.
int range_any_overlap(Range one, Range two) {
    // Check if either range bound is within the bounds of the other.
    return (
        (one.start >= two.start && one.start <= two.end)
        || (one.end >= two.start && one.end <= two.end)
        || (two.start >= one.start && two.start <= one.end)
        || (two.end >= one.start && two.end <= one.end)
    );
}

int main(int argc, char *argv[]) {
    FILE *input = stdin;
    if (argc > 1) {
        input = fopen(argv[1], "r");
        if (input == NULL) {
            char *errstr;
            perror(errstr);
            fprintf(stderr, "Error opening file, '%s': %s\n", argv[1], errstr);
            return 1;
        }
    }

    char *data;
    size_t len;

    Range elf1, elf2;

    unsigned int count_fully_contained = 0;
    unsigned int count_any_contained = 0;

    while (fscanf(input, "%u-%u,%u-%u", &elf1.start, &elf1.end, &elf2.start, &elf2.end) > 0) {
        //printf("Range: %u - %u; %u - %u\n", elf1.start, elf1.end, elf2.start, elf2.end);

        // Part 1, how many elf pairs have one range fully overlapping the other?
        if (range_fully_contains(elf1, elf2)) {
            count_fully_contained++;
        }

        // Part two, how many elf pairs have any overlapping jobs at all?
        if (range_any_overlap(elf1, elf2)) {
            count_any_contained++;
        }
    }

    int err = ferror(input);
    if (err != 0) {
        fprintf(stderr, "Error reading from file: %s\n", strerror(err));
        return 1;
    }

    printf("Count of fully contained; %u\n", count_fully_contained);
    printf("Count of any overlap: %u\n", count_any_contained);

    return 0;
}