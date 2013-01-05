#include <stdio.h> /* for FILE, sprintf, fprintf, etc */
#include <time.h> /* for struct tm, localtime_r */
#include <sys/time.h> /* for gettimeofday */
#include <stdarg.h> /* for va_start, va_end */

void flog(FILE *stream, const char *format, ...) {
  va_list args;
  struct timeval tv;
  struct tm tm;
  char timestamp[] = "YYYY-MM-ddTHH:mm:ss.SSS+0000";
  gettimeofday(&tv, NULL);

  /* convert to time to 'struct tm' for use with strftime */
  localtime_r(&tv.tv_sec, &tm);

  /* format the time */
  strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%S.000%z", &tm);

  /* but, since strftime() can't subsecond precision, we have to hack it
   * in manually. '20' is the string offset of the subsecond value in our
   * timestamp string. Also, because sprintf always writes a null, we have to 
   * write the subsecond value as well as the rest of the string already there.
   */
  sprintf(timestamp + 20, "%03ld%s", tv.tv_usec / 1000, timestamp + 23);

  /* print the timestamp */
  fprintf(stream, "%.28s ", timestamp); /* 28 is the length of the timestamp */

  /* print the log message */
  va_start(args, format);
  vfprintf(stream, format, args);
  va_end(args);

  /* print a newline */
  fprintf(stream, "\n");
} /* flog */

int main() {
  flog(stdout, "Hello world");
  flog(stdout, "Hello world");
  flog(stdout, "Hello world");
  flog(stdout, "Hello world");
  return 0;
}
