#include <ev.h>
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>

#include <sys/time.h>
#include <sys/resource.h>

/* TODO(sissel): Notes
 * ionice is only available if you call the syscall with syscall()
 *   See 'man ioprio_set(2)'
 */

struct process {
  ev_child child_watcher; /** the child watcher for libev */
  ev_timer restart_timer; /** the child restart timer */

  struct ev_loop *evloop;
  int start_count;

  char *name; /** the name of this process */
  char *command; /** the command to execute */
  char **args; /** the arguments to the command */

  //int instances; /** the number of instances to run */

  pid_t pid; /** the child pid */
  struct ulimit *limits; /** array of things to send to setrlimit */
  uid_t uid; /** the uid to run as */
  gid_t gid; /** the gid to run as */
  int nice; /** the nice level */
  int ionice; /** the ionice level, requires linux kernel >= 2.6.13 */

  int state_what; /** What state */
  int state_why; /** Why are we in this state? */
};

enum process_states {
  PROCESS_STATE_RUNNING = 1,
  PROCESS_STATE_EXITED = 2,
  PROCESS_STATE_STOPPED = 3,
  PROCESS_STATE_STOPPING = 4
};

struct ulimit {
  struct rlimit rlimit;
  int resource;
};

static void start_process(struct process *process);
static void child_restart_cb(EV_P_ ev_timer *timer, int revents);

static void child_cb (EV_P_ ev_child *w, int revents) {
  ev_child_stop (EV_A_ w);
  struct process *process = (struct process*) w;

  if (process->state_what == PROCESS_STATE_RUNNING) {
    process->state_what = PROCESS_STATE_EXITED;
    printf("Starting timer\n");

    ev_timer_init(&process->restart_timer, child_restart_cb, 1, 0);
    process->restart_timer.data = process;
    ev_timer_start(process->evloop, &process->restart_timer);
  }

  printf ("process %s[%d] exited with status %x\n", process->name, w->rpid, w->rstatus);
}

static void child_restart_cb(EV_P_ ev_timer *timer, int revents) {
  ev_timer_stop(EV_A_ timer);
  struct process *process = (struct process *)timer->data;

  printf("Restarting process: %s\n", process->name);
  start_process(process);
}

static void start_process(struct process *process) {
  process->pid = fork();
  if (process->pid != 0) {
    process->start_count++;
    process->state_what = PROCESS_STATE_RUNNING;
    ev_child_init(&process->child_watcher, child_cb, process->pid, 0);
    ev_child_start(process->evloop, &process->child_watcher);
    return; /* parent, return... */
  }

  /* child */
  int ret;
  ret = setrlimit(process->limits[0].resource, &(process->limits[0].rlimit));
  if (ret != 0) {
    perror("setrlimit");
  }
  execvp(process->command, process->args);
  exit(0);
}

int
main (void)
{
  // use the default event loop unless you have special needs
  struct ev_loop *loop = EV_DEFAULT;
  struct process process;

  process.evloop = loop;
  process.name = "Hello world";
  process.command = "/bin/sh";
  process.args = calloc(4, sizeof(char *));
  process.args[0] = process.command;
  process.args[1] = "-c";
  process.args[2] = "echo -n hello world - ; date";
  process.args[3] = NULL;

  process.limits = calloc(sizeof(struct ulimit), 1);
  process.limits[0].resource = RLIMIT_NOFILE;
  process.limits[0].rlimit.rlim_cur = 50000;
  process.limits[0].rlimit.rlim_max = 80000;

  start_process(&process);

  // now wait for events to arrive
  ev_run (loop, 0);

  // break was called, so exit
  return 0;
}
