#include <stdio.h>
#include <unistd.h>
#include <err.h>
#include <errno.h>
#include <string.h>

#define READSIZE 64<<10

static char *prefix = "/tmp/split.";
static int byte_size = 20<<20;   /* 20 megs default */
static char *current_output_file = NULL;

static int verbose = 0;
static int xargs = 0;
static int bytes_written = 0;
static int split_count = 0;

void usage(char *);
void split(char *file);
void newfile(FILE **ofpp);

void usage(char *msg) {
  printf("Usage: choplog [-p output_path_prefix] [-b byte_size]\n");
  printf("               [-x]");
  printf(" -x outputs the file name when that file is done being written."
         " For use with xargs.\n");
  if (msg != NULL)
    printf("error: %s\n", msg);

  exit(1);
}

void close_output(FILE *fp, char *filename) {
  if (xargs && filename) {
    printf("%s\n", filename);
    fflush(stdout);
  }
  fclose(fp);
}

int main(int argc, char **argv) {
  char *ep;
  int ch;
  
  while ((ch = getopt(argc, argv, "xp:b:")) != -1)
    switch (ch) {
      case 'p':
        prefix = strdup(optarg);
        break;
      case 'b':
        if ((byte_size = strtol(optarg, &ep, 10)) <= 0 || *ep)
          usage("illegal byte size");
        break;
      case 'x':
        xargs++;
        break;
      default:
        usage("Invalid option");
    }
    
  argv += optind;
  argc -= optind;

  if (argc == 0)
    usage("what do you want me to split?");

  split(*argv);

  return 0;
}

void newfile(FILE **ofpp) {
  char *newfilename;
  if (*ofpp)
    close_output(*ofpp, current_output_file);

  asprintf(&newfilename, "%s%05d", prefix, split_count);
  *ofpp = fopen(newfilename, "w");

  //fprintf(stderr, "New file: %s\n", newfilename);

  if (*ofpp == NULL) {
    fprintf(stderr, "Problem opening '%s'\n", newfilename);
    fprintf(stderr, "Error: %s\n", strerror(errno));
    exit(1);
  }

  split_count++;
  bytes_written = 0;

  if (current_output_file != NULL)
    free(current_output_file);
  current_output_file = newfilename;
}

void output(char *buf, int size, FILE **ofpp) {
  int bytes;
  if (*ofpp == NULL || bytes_written > byte_size )
    newfile(ofpp);

  bytes = fwrite(buf, 1, size, *ofpp);
  if (bytes < size) {
    fprintf(stderr, "Error while writing to '%s'\n", current_output_file);
    fprintf(stderr, "Error: %s\n", strerror(errno));
    exit(1);
  }
  bytes_written += bytes;
}

void split(char *file) {
  FILE *ifp = NULL, *ofp = NULL;
  int bytes = 0;
  char buf[READSIZE];

  memset(buf, 0, READSIZE);
  ifp = fopen(file, "r");

  if (ifp == NULL) {
    fprintf(stderr, "Problem opening '%s'\n", file);
    fprintf(stderr, "Error: %s\n", strerror(errno));
    exit(1);
  }

  while ((bytes = fread(buf, 1, READSIZE, ifp)) == READSIZE)
    output(buf, bytes, &ofp);
  
  if (!feof(ifp)) {
    fprintf(stderr, "Error while reading from '%s'\n", file);
    fprintf(stderr, "Error: %s\n", strerror(errno));
    exit(1);
  }

  if (bytes > 0)
    output(buf, bytes, &ofp);
    
  if (ofp)
    close_output(ofp, current_output_file);

}
