#include <stdio.h> /* for FILE, sprintf, fprintf, etc */
#include <time.h> /* for struct tm, localtime_r */
#include <sys/time.h> /* for gettimeofday */

int main() {
  struct timeval tv;
  struct tm tm;
  char timestamp[] = "YYYY-MM-ddTHH:mm:ss.SSS+0000";

  /* Get the current time at high precision; could also use clock_gettime() for
   * even higher precision times if we want it. */
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
  printf("%s\n", timestamp);

  return 0;
}


