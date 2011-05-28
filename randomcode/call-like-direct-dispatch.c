#define NEXT goto **ip++
#define guard(n) asm("#" #n)

void next1()
{
  guard(1);
}

void next2()
{
  guard(2);
}

void next3()
{
  guard(3);
}

void next4()
{
  guard(4);
}

void next5()
{
  guard(5);
}

main()
{
  /* this has 50% mispredictions (50-60% is typical in large benchmarks) */
  static void  *prog[] = {&&op_next1,&&op_next2,&&op_next1,&&op_next3,&&op_next1,&&op_next4,&&op_next1,&&op_next5,&&op_next1,&&loop};
  void **ip=prog;
  int    count = 10000000;
  NEXT;
 op_next1:
  next1();
  NEXT;
 op_next2:
  next2();
  NEXT;
 op_next3:
  next3();
  NEXT;
 op_next4:
  next4();
  NEXT;
 op_next5:
  next5();
  NEXT;
 loop:
  if (count>0) {
    count--;
    ip=prog;
    NEXT;
  }
  exit(0);
}

