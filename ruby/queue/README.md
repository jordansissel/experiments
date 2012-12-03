
## SizedQueue

```
% ruby manythreads.rb
Queue implementation: SizedQueue / [SizedQueue, Queue, Object, Kernel, BasicObject]
5.008 (count: 33126): behind > 5 seconds = 0
10.01 (count: 55236): behind > 5 seconds = 343
15.018 (count: 79041): behind > 5 seconds = 382
20.024 (count: 102770): behind > 5 seconds = 341
25.026 (count: 127411): behind > 5 seconds = 388
30.027 (count: 151756): behind > 5 seconds = 384
35.029 (count: 176134): behind > 5 seconds = 197
40.034 (count: 204189): behind > 5 seconds = 313
45.035 (count: 227936): behind > 5 seconds = 289
50.042 (count: 253460): behind > 5 seconds = 318
55.044 (count: 278935): behind > 5 seconds = 296
60.049 (count: 303357): behind > 5 seconds = 395
```

* 5055 SizedQueue#pop per second.
* 331 - Average number of threads blocked in Queue#push for more than 5 seconds

## ArrayBlockingQueue

```
% ruby manythreads.rb
Queue implementation: JSizedQueue / [JSizedQueue, Java::JavaUtilConcurrent::ArrayBlockingQueue, Java::JavaUtilConcurrent::BlockingQueue, Java::JavaIo::Serializable, Java::JavaUtil::AbstractQueue, Java::JavaUtil::Queue, Java::JavaUtil::AbstractCollection, Java::JavaUtil::Collection, Java::JavaLang::Iterable, Enumerable, Java::JavaLang::Object, ConcreteJavaProxy, JavaProxy, JavaProxyMethods, Object, Kernel, BasicObject]

5.001 (count: 211933): behind > 5 seconds = 0
10.002 (count: 447957): behind > 5 seconds = 0
15.003 (count: 682080): behind > 5 seconds = 0
20.004 (count: 920608): behind > 5 seconds = 0
25.005 (count: 1158781): behind > 5 seconds = 0
30.006 (count: 1388855): behind > 5 seconds = 0
35.007 (count: 1624962): behind > 5 seconds = 0
40.008 (count: 1865475): behind > 5 seconds = 0
45.009 (count: 2105055): behind > 5 seconds = 0
50.01 (count: 2347150): behind > 5 seconds = 0
55.011 (count: 2592961): behind > 5 seconds = 0
60.012 (count: 2837339): behind > 5 seconds = 0
```

* 47279 JSizedQueue#pop per second.
* 0 - Average number of threads blocked in Queue#push for more than 5 seconds
