/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore Unit Testing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals CoreTest */

// these compiler directives are normally defined in runtime's core.  But
// since the testing framework needs to be totally independent, we redefine
// them here also.
var require = require || function sc_require() {};
var sc_require = sc_require || require;
var sc_resource = sc_resource || function sc_resource() {};

// map used to exist, this is here for backwards compatibility
var Q$ = jQuery;

/** @namespace

  CoreTest is the unit testing library for SproutCore.  It includes a test 
  runner based on QUnit with some useful extensions for testing SproutCore-
  based applications.
  
  You can use CoreTest just like you would use QUnit in your tests directory.
*/
CoreTest = {
  
  /** 
    Empty function.  Useful for some operations. 
  */
  K: function() { return this; },

  /**
    Copied from SproutCore Runtime Core.  Included here to avoid dependencies.

    @param obj {Object} the object to beget
    @returns {Object} the new object.
  */
  beget: function(obj) {
    if (!obj) return null ;
    var K = CoreTest.K; K.prototype = obj ;
    var ret = new K();
    K.prototype = null ; // avoid leaks
    return ret ;
  },
  
  /**
    Copied from SproutCore Runtime Core.  Included here to avoid dependencies.

    @param target {Object} the target object to extend
    @param properties {Object} one or more objects with properties to copy.
    @returns {Object} the target object.
    @static
  */
  mixin: function() {
    // copy reference to target object
    var target = arguments[0] || {};
    var idx = 1;
    var length = arguments.length ;
    var options ;

    // Handle case where we have only one item...extend CoreTest
    if (length === 1) {
      target = this || {};
      idx=0;
    }

    for ( ; idx < length; idx++ ) {
      if (!(options = arguments[idx])) continue ;
      for(var key in options) {
        if (!options.hasOwnProperty(key)) continue ;
        var src = target[key];
        var copy = options[key] ;
        if (target===copy) continue ; // prevent never-ending loop
        if (copy !== undefined) target[key] = copy ;
      }
    }

    return target;
  },
  
  
  /** Borrowed from SproutCore Runtime Core */
  fmt: function(str) {
    // first, replace any ORDERED replacements.
    var args = arguments;
    var idx  = 1; // the current index for non-numerical replacements
    return str.replace(/%@([0-9]+)?/g, function(s, argIndex) {
      argIndex = (argIndex) ? parseInt(argIndex,0) : idx++ ;
      s =args[argIndex];
      return ((s===null) ? '(null)' : (s===undefined) ? '' : s).toString(); 
    }) ;
  },
  
  /**
    Returns a stub function that records any passed arguments and a call
    count.  You can pass no parameters, a single function or a hash.  
    
    If you pass no parameters, then this simply returns a function that does 
    nothing but record being called.  
    
    If you pass a function, then the function will execute when the method is
    called, allowing you to stub in some fake behavior.
    
    If you pass a hash, you can supply any properties you want attached to the
    stub function.  The two most useful are "action", which is the function 
    that will execute when the stub runs (as if you just passed a function), 
    and "expect" which should evaluate the stub results.
    
    In your unit test you can verify the stub by calling stub.expect(X), 
    where X is the number of times you expect the function to be called.  If
    you implement your own test function, you can actually pass whatever you
    want.
    
    Calling stub.reset() will reset the record on the stub for further 
    testing.

    @param {String} name the name of the stub to use for logging
    @param {Function|Hash} func the function or hash
    @returns {Function} stub function
  */
  stub: function(name, func) {  

    // normalize param
    var attrs = {};
    if (typeof func === "function") {
      attrs.action = func;
    } else if (typeof func === "object") {
      attrs = func ;
    }

    // create basic stub
    var ret = function() {
      ret.callCount++;
      
      // get arguments into independent array and save in history
      var args = [], loc = arguments.length;
      while(--loc >= 0) args[loc] = arguments[loc];
      args.unshift(this); // save context
      ret.history.push(args);
      
      return ret.action.apply(this, arguments);
    };
    ret.callCount = 0 ;
    ret.history = [];
    ret.stubName = name ;

    // copy attrs
    var key;
    for(key in attrs) {
      if (!attrs.hasOwnProperty(key)) continue ;
      ret[key] = attrs[key];
    }

    // add on defaults
    if (!ret.reset) {
      ret.reset = function() {
        this.callCount = 0;
        this.history = [];
      };
    }
    
    if (!ret.action) {
      ret.action = function() { return this; };
    }
    
    if (!ret.expect) {
      ret.expect = function(callCount) {
        if (callCount === YES) {
          ok(this.callCount > 0, CoreTest.fmt("%@ should be called at least once", this.stubName));
        } else {
          if (callCount === NO) callCount = 0;
          equals(this.callCount, callCount, CoreTest.fmt("%@ should be called X times", this.stubName));
        }
      };
    }
    
    return ret ;
  },

  /** Test is OK */
  OK: 'passed',

  /** Test failed */
  FAIL: 'failed',

  /** Test raised exception */
  ERROR: 'errors',

  /** Test raised warning */
  WARN: 'warnings',

  showUI : false,

  spyOn: function(object, method) {
    if(!object) throw new Error('ERROR: Attempted to spy upon an invalid object');
    if(!object[method]) throw new Error('ERROR: The requested method does not exist on the given object');

    var spy = new CoreTest.Spy;
    object[method] = function() { spy.call(CoreTest.argumentsArray(arguments)) };
    return spy;
  },

  stubMethod: function(object, method) {
    if(!object) throw new Error('ERROR: Attempted to spy upon an invalid object');
    if(!object[method]) throw new Error('ERROR: The requested method does not exist on the given object');

    var stub = new CoreTest.Stub;
    object[method] = function() { return stub.call() };
    return stub;
  }
};

CoreTest.Spy = function() {
  this.wasCalled = false;
};

CoreTest.Spy.prototype.call = function(args) {
  this.wasCalledWithArguments = args;
  this.wasCalled = true;
};

CoreTest.Spy.prototype.wasCalledWith = function() {
  return CoreTest._isIdenticalArray(this.wasCalledWithArguments,CoreTest.argumentsArray(arguments));
};

CoreTest.Stub = function() {
};

CoreTest.Stub.prototype.andReturn = function(value) {
  this.stubbedValue = value;
};

CoreTest.Stub.prototype.call = function() {
  if(this.stubbedValue === undefined) throw new Error('ERROR: You never specified what value the stub should return');
  return this.stubbedValue;
};

CoreTest.argumentsArray = function(args) {
  var arrayOfArgs = [];
  for (var i = 0; i < args.length; i++) arrayOfArgs.push(args[i]);
  return arrayOfArgs;
};

CoreTest._isIdenticalArray = function(array1, array2) {
  if(array1.length !== array2.length) return false;
  for(var i = 0; i < array1.length; i++)
    if(array1[i] !== array2[i]) return false;
  return true;
};

/* >>>>>>>>>> BEGIN source/utils.js */
// ==========================================================================
// Project:   SproutCore Unit Testing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// These utility methods are included from the SproutCore's foundation to 
// make it easier write unit tests.  They only install themselves if a method
// has not already been defined.

if (!String.prototype.camelize) {
  String.prototype.camelize = function camelize() {
    var ret = this.replace(SC.STRING_TITLEIZE_REGEXP, 
      function(str,separater,character) { 
        return (character) ? character.toUpperCase() : '' ;
      }) ;
    var first = ret.charAt(0), lower = first.toLowerCase() ;
    return (first !== lower) ? (lower + ret.slice(1)) : ret ;
  };
}

if (!String.prototype.trim) {
  String.prototype.trim = function trim() {
    return this.replace(/^\s+|\s+$/g,"");
  } ;
}

if (!String.prototype.fmt) {
  String.prototype.fmt = function fmt() {
    // first, replace any ORDERED replacements.
    var args = arguments;
    var idx  = 0; // the current index for non-numerical replacements
    return this.replace(/%@([0-9]+)?/g, function(s, argIndex) {
      argIndex = (argIndex) ? parseInt(argIndex,0)-1 : idx++ ;
      s =args[argIndex];
      return ((s===null) ? '(null)' : (s===undefined) ? '' : s).toString(); 
    }) ;
  } ;
}

if (!Array.prototype.uniq) {
  Array.prototype.uniq = function uniq() {
    var ret = [], len = this.length, item, idx ;
    for(idx=0;idx<len;idx++) {
      item = this[idx];
      if (ret.indexOf(item) < 0) ret.push(item);
    }
    return ret ;
  };
}

if (!String.prototype.w) {
  String.prototype.w = function w() { 
    var ary = [], ary2 = this.split(' '), len = ary2.length ;
    for (var idx=0; idx<len; ++idx) {
      var str = ary2[idx] ;
      if (str.length !== 0) ary.push(str) ; // skip empty strings
    }
    return ary ;
  };
}

/* >>>>>>>>>> BEGIN __sc_chance.js */
if (typeof CHANCE_SLICES === 'undefined') var CHANCE_SLICES = [];CHANCE_SLICES = CHANCE_SLICES.concat([]);

/* >>>>>>>>>> BEGIN source/extras.js */
// ==========================================================================
// Project:   SproutCore Unit Testing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global Q$ synchronize */
// additional methods for use with qunit

/**
  Call this method instead of test() to temporarily disable a test. 
*/
function notest(name, callback, nowait) {
  
}


/* >>>>>>>>>> BEGIN source/system/dump.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals CoreTest module */

/**
 * jsDump
 * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
 * Date: 5/15/2008
 * @projectDescription Advanced and extensible data dumping for Javascript.
 * @version 1.0.0
 * @author Ariel Flesler
 * @link {http://flesler.blogspot.com/2008/05/jsdump-pretty-dump-of-any-javascript.html}
 */
(function(){
  var reName, jsDump;
  
  function quote( str ){
    return '"' + str.toString().replace(/"/g, '\\"') + '"';
  }
  
  function literal( o ){
    return o + '';  
  }
  
  function join( pre, arr, post ){
    var s     = jsDump.separator(),
        base  = jsDump.indent(),
        inner = jsDump.indent(1);
        
    if( arr.join )  arr = arr.join( ',' + s + inner );
    if( !arr ) return pre + post;
    
    return [ pre, inner + arr, base + post ].join(s);
  }
  
  function array( arr ){
    var i = arr.length, ret = new Array(i);         
    this.up();
    while( i-- ) ret[i] = this._parse( arr[i] );        
    this.down();
    return join( '[', ret, ']' );
  }
  
  reName = /^function (\w+)/;
  
  jsDump = CoreTest.jsDump = {

    parse: function(obj, type) {
      if (obj && obj.toString) {
        var toString = obj.toString;
        if ((toString !== Object.prototype.toString) && (toString !== Array.toString)) return obj.toString();
      }
      if (obj && obj.inspect) return obj.inspect();
      
      this.seen = [];
      var ret = this._parse(obj, type);
      this.seen = null;
      return ret ;
    },
    
    //type is used mostly internally, you can fix a (custom)type in advance
    _parse: function( obj, type ) {
      
      
      var parser = this.parsers[ type || this.typeOf(obj) ];
      type = typeof parser;     

      // avoid recursive loops
      if ((parser === this.parsers.object) && (this.seen.indexOf(obj)>=0)) {
        return '(recursive)';
      }
      this.seen.push(obj);
      
      return type == 'function' ? parser.call( this, obj ) :
           type == 'string' ? parser :
           this.parsers.error;
    },
    typeOf:function( obj ){
      var type = typeof obj,
        f = 'function';//we'll use it 3 times, save it
        
      if (obj && (obj.isObject || obj.isClass)) return 'scobj';
      return type != 'object' && type != f ? type :
        !obj ? 'null' :
        obj.exec ? 'regexp' :// some browsers (FF) consider regexps functions
        obj.getHours ? 'date' :
        obj.scrollBy ?  'window' :
        obj.nodeName == '#document' ? 'document' :
        obj.nodeName ? 'node' :
        obj.item ? 'nodelist' : // Safari reports nodelists as functions
        obj.callee ? 'arguments' :
        obj.call || obj.constructor != Array && //an array would also fall on this hack
          (obj+'').indexOf(f) != -1 ? f : //IE reports functions like alert, as objects
        'length' in obj ? 'array' :
        type;
    },
    separator:function(){
      return this.multiline ? this.HTML ? '<br />' : '\n' : this.HTML ? '&nbsp;' : ' ';
    },
    indent:function( extra ){// extra can be a number, shortcut for increasing-calling-decreasing
      if( !this.multiline ) return '';
      
      var chr = this.indentChar;
      if( this.HTML ) chr = chr.replace(/\t/g,'   ').replace(/ /g,'&nbsp;');
      return (new Array( this._depth_ + (extra||0) )).join(chr);
    },
    up:function( a ){
      this._depth_ += a || 1;
    },
    down:function( a ){
      this._depth_ -= a || 1;
    },
    setParser:function( name, parser ){
      this.parsers[name] = parser;
    },
    // The next 3 are exposed so you can use them
    quote:quote, 
    literal:literal,
    join:join,
    //
    _depth_: 1,
    // This is the list of parsers, to modify them, use jsDump.setParser
    parsers:{
      window: '[Window]',
      document: '[Document]',
      error:'[ERROR]', //when no parser is found, shouldn't happen
      unknown: '[Unknown]',
      'null':'null',
      'undefined':'undefined',
      'function':function( fn ){
        var ret = 'function',
          name = 'name' in fn ? fn.name : (reName.exec(fn)||[])[1];//functions never have name in IE
        if( name ) ret += ' ' + name;
        ret += '(';
        
        ret = [ ret, this._parse( fn, 'functionArgs' ), '){'].join('');
        return join( ret, this._parse(fn,'functionCode'), '}' );
      },
      array: array,
      nodelist: array,
      'arguments': array,
      scobj: function(obj) { return obj.toString(); },
      object:function( map ){
        
        var ret = [ ];
        this.up();
        for( var key in map ) {
          ret.push( this._parse(key,'key') + ': ' + this._parse(map[key]) );
        }
        this.down();
        return join( '{', ret, '}' );
      },
      node:function( node ){
        var open = this.HTML ? '&lt;' : '<',
          close = this.HTML ? '&gt;' : '>';
          
        var tag = node.nodeName.toLowerCase(),
          ret = open + tag;
          
        for( var a in this.DOMAttrs ){
          var val = node[this.DOMAttrs[a]];
          if( val ) {
            ret += ' ' + a + '=' + this._parse( val, 'attribute' );
          }
        }
        return ret + close + open + '/' + tag + close;
      },
      functionArgs:function( fn ){//function calls it internally, it's the arguments part of the function
        var l = fn.length;
        if( !l ) return '';       
        
        var args = new Array(l);
        while( l-- ) args[l] = String.fromCharCode(97+l);//97 is 'a'
        return ' ' + args.join(', ') + ' ';
      },
      key:quote, //object calls it internally, the key part of an item in a map
      functionCode:'[code]', //function calls it internally, it's the content of the function
      attribute:quote, //node calls it internally, it's an html attribute value
      string:quote,
      date:quote,
      regexp:literal, //regex
      number:literal,
      'boolean':literal
    },
    DOMAttrs:{//attributes to dump from nodes, name=>realName
      id:'id',
      name:'name',
      'class':'className'
    },
    HTML:true,//if true, entities are escaped ( <, >, \t, space and \n )
    indentChar:'   ',//indentation unit
    multiline:true //if true, items in a collection, are separated by a \n, else just a space.
  };
  
  CoreTest.dump = function dump(obj,type) {
    return CoreTest.jsDump.parse(obj, type);
  };

})();

/* >>>>>>>>>> BEGIN source/system/equiv.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals CoreTest */

/**
  Tests for equality any JavaScript type and structure without unexpected 
  results.

  Discussions and reference: http://philrathe.com/articles/equiv
  Test suites: http://philrathe.com/tests/equiv
  Author: Philippe Rathé <prathe@gmail.com>
*/
CoreTest.equiv = function () {

    var innerEquiv; // the real equiv function
    var callers = []; // stack to decide between skip/abort functions

    // Determine what is o.
    function hoozit(o) {
        if (typeof o === "string") {
            return "string";

        } else if (typeof o === "boolean") {
            return "boolean";

        } else if (typeof o === "number") {

            if (isNaN(o)) {
                return "nan";
            } else {
                return "number";
            }

        } else if (typeof o === "undefined") {
            return "undefined";

        // consider: typeof null === object
        } else if (o === null) {
            return "null";

        // consider: typeof [] === object
        } else if (o instanceof Array) {
            return "array";
        
        // consider: typeof new Date() === object
        } else if (o instanceof Date) {
            return "date";

        // consider: /./ instanceof Object;
        //           /./ instanceof RegExp;
        //          typeof /./ === "function"; // => false in IE and Opera,
        //                                          true in FF and Safari
        } else if (o instanceof RegExp) {
            return "regexp";

        } else if (typeof o === "object") {
            return "object";

        } else if (o instanceof Function) {
            return "function";
        }
    }

    // Call the o related callback with the given arguments.
    function bindCallbacks(o, callbacks, args) {
        var prop = hoozit(o);
        if (prop) {
            if (hoozit(callbacks[prop]) === "function") {
                return callbacks[prop].apply(callbacks, args);
            } else {
                return callbacks[prop]; // or undefined
            }
        }
    }

    var callbacks = function () {

        // for string, boolean, number and null
        function useStrictEquality(b, a) {
            return a === b;
        }

        return {
            "string": useStrictEquality,
            "boolean": useStrictEquality,
            "number": useStrictEquality,
            "null": useStrictEquality,
            "undefined": useStrictEquality,

            "nan": function (b) {
                return isNaN(b);
            },

            "date": function (b, a) {
                return hoozit(b) === "date" && a.valueOf() === b.valueOf();
            },

            "regexp": function (b, a) {
                return hoozit(b) === "regexp" &&
                    a.source === b.source && // the regex itself
                    a.global === b.global && // and its modifers (gmi) ...
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline;
            },

            // - skip when the property is a method of an instance (OOP)
            // - abort otherwise,
            //   initial === would have catch identical references anyway
            "function": function () {
                var caller = callers[callers.length - 1];
                return caller !== Object &&
                        typeof caller !== "undefined";
            },

            "array": function (b, a) {
                var i;
                var len;

                // b could be an object literal here
                if ( ! (hoozit(b) === "array")) {
                    return false;
                }

                len = a.length;
                if (len !== b.length) { // safe and faster
                    return false;
                }
                for (i = 0; i < len; i++) {
                    if( ! innerEquiv(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            },

            "object": function (b, a) {
                var i;
                var eq = true; // unless we can proove it
                var aProperties = [], bProperties = []; // collection of strings
                if (b===a) return true;
                
                // comparing constructors is more strict than using instanceof
                if ( a.constructor !== b.constructor) {
                    return false;
                }

                // stack constructor before traversing properties
                callers.push(a.constructor);

                for (i in a) { // be strict: don't ensures hasOwnProperty and go deep

                    aProperties.push(i); // collect a's properties

                    if ( ! innerEquiv(a[i], b[i])) {
                        eq = false;
                    }
                }

                callers.pop(); // unstack, we are done

                for (i in b) {
                    bProperties.push(i); // collect b's properties
                }

                // Ensures identical properties name
                return eq && innerEquiv(aProperties.sort(), bProperties.sort());
            }
        };
    }();

    innerEquiv = function () { // can take multiple arguments
        var args = Array.prototype.slice.apply(arguments);
        if (args.length < 2) {
            return true; // end transition
        }

        return (function (a, b) {
            if (a === b) {
                return true; // catch the most you can

            } else if (typeof a !== typeof b || a === null || b === null || typeof a === "undefined" || typeof b === "undefined") {
                return false; // don't lose time with error prone cases

            } else if (b && b.isEqual && b.isEqual instanceof Function) {
              return b.isEqual(a);
              
            } else {
                return bindCallbacks(a, callbacks, [b, a]);
            }

        // apply transition with (1..n) arguments
        })(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
    };

    return innerEquiv;
}(); // equiv

/* >>>>>>>>>> BEGIN source/system/plan.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals CoreTest Q$ */

var QUNIT_BREAK_ON_TEST_FAIL = false;

/** @class

  A test plan contains a set of functions that will be executed in order.  The
  results will be recorded into a results hash as well as calling a delegate.
  
  When you define tests and modules, you are adding to the active test plan.
  The test plan is then run when the page has finished loading.
  
  Normally you will not need to work with a test plan directly, though if you
  are writing a test runner application that needs to monitor test progress
  you may write a delegate to talk to the test plan.

  The CoreTest.Plan.fn hash contains functions that will be made global via
  wrapper methods.  The methods must accept a Plan object as their first 
  parameter.
  
  ## Results 
  
  The results hash contains a summary of the results of running the test 
  plan.  It includes the following properties:
  
   - *assertions* -- the total number of assertions
   - *tests* -- the total number of tests
   - *passed* -- number of assertions that passed
   - *failed* -- number of assertions that failed
   - *errors* -- number of assertions with errors
   - *warnings* -- number of assertions with warnings
  
  You can also consult the log property, which contains an array of hashes -
  one for each assertion - with the following properties:
  
   - *module* -- module descriptions
   - *test* -- test description
   - *message* -- assertion description
   - *result* -- CoreTest.OK, CoreTest.FAILED, CoreTest.ERROR, CoreTest.WARN
  
  @since SproutCore 1.0
*/
CoreTest.Plan = {
  
  /**
    Define a new test plan instance.  Optionally pass attributes to apply 
    to the new plan object.  Usually you will call this without arguments.
    
    @param {Hash} attrs plan arguments
    @returns {CoreTest.Plan} new instance/subclass
  */
  create: function(attrs) {
    var len = arguments.length,
        ret = CoreTest.beget(this),
        idx;
    for(idx=0;idx<len;idx++) CoreTest.mixin(ret, attrs);
    ret.queue = ret.queue.slice(); // want an independent queue
    return ret ;
  },

  // ..........................................................
  // RUNNING 
  // 
  
  /** @private - array of functions to execute in order. */
  queue: [],

  /**
    If true then the test plan is currently running and items in the queue
    will execute in order.
    
    @type {Boolean}
  */
  isRunning: false,

  /**
    Primitive used to add callbacks to the test plan queue.  Usually you will
    not want to call this method directly but instead use the module() or 
    test() methods.
    
    @returns {CoreTest.Plan} receiver
  */
  synchronize: function synchronize(callback) {
    this.queue.push(callback);
    if (this.isRunning) this.process(); // run queue    
    return this;
  },
  
  /**
    Processes items in the queue as long as isRunning remained true.  When
    no further items are left in the queue, calls finish().  Usually you will
    not call this method directly.  Instead call run().
    
    @returns {CoreTest.Plan} receiver
  */
  process: function process() {
    while(this.queue.length && this.isRunning) {
      this.queue.shift().call(this);
    }
    return this ;
  },
  
  /**
    Begins running the test plan after a slight delay to avoid interupting
    any current callbacks. 
  
    @returns {CoreTest.Plan} receiver
  */
  start: function() {
    var plan = this ;
    setTimeout(function() {
      if (plan.timeout) clearTimeout(plan.timeout);
      plan.timeout = null; 
      plan.isRunning = true;
      plan.process();
    }, 13);
    return this ;
  },
  
  /**
    Stops the test plan from running any further.  If you pass a timeout,
    it will raise an exception if the test plan does not begin executing 
    with the alotted timeout.
    
    @param {Number} timeout optional timeout in msec
    @returns {CoreTest.Plan} receiver
  */
  stop: function(timeout) {
    this.isRunning = false ;
    
    if (this.timeout) clearTimeout(this.timeout);
    if (timeout) {
      var plan = this;
      this.timeout = setTimeout(function() {
        plan.fail("Test timed out").start();
      }, timeout);
    } else this.timeout = null ;
    return this ;
  },
  
  /**
    Force the test plan to take a break.  Avoids slow script warnings.  This
    is called automatically after each test completes.
  */
  pause: function() {
    if (this.isRunning) {
      var del = this.delegate;
      if (del && del.planDidPause) del.planDidPause(this);
      
      this.isRunning = false ;
      this.start();
    }
    return this ;
  },
  
  /**
    Initiates running the tests for the first time.  This will add an item 
    to the queue to call finish() on the plan when the run completes.

    @returns {CoreTest.Plan} receiver
  */
  run: function() {
    this.isRunning = true;
    this.prepare();
    
    // initialize new results
    this.results = {
      start: new Date().getTime(),
      finish: null,
      runtime: 0,
      tests: 0,
      total: 0,
      passed: 0,
      failed: 0,
      errors: 0,
      warnings: 0,
      assertions: []
    };

    // add item to queue to finish running the test plan when finished.
    this.begin().synchronize(this.finish).process();
    
    return this ;
  },

  /**
    Called when the test plan begins running.  This method will notify the
    delegate.  You will not normally call this method directly.
    
    @returns {CoreTest.Plan} receiver
  */
  begin: function() {
    var del = this.delegate;
    if (del && del.planDidBegin) del.planDidBegin(this);
    return this ;
  },
  
  /**
    When the test plan finishes running, this method will be called to notify
    the delegate that the plan as finished.

    @returns {CoreTest.Plan} receiver
  */
  finish: function() {
    var r   = this.results,
        del = this.delegate;
        
    r.finish = new Date().getTime();
    r.runtime = r.finish - r.start;
    
    if (del && del.planDidFinish) del.planDidFinish(this, r);
    return this ;
  },

  /**
    Sets the current module information.  This will be used when a test is
    added under the module.

    @returns {CoreTest.Plan} receiver
  */
  module: function(desc, lifecycle) {
    if (typeof SC !== 'undefined' && SC.filename) {
      desc = SC.filename.replace(/^.+?\/current\/tests\//,'') + '\n' + desc;
    }
    
    this.currentModule = desc;

    if (!lifecycle) lifecycle = {};
    this.setup(lifecycle.setup).teardown(lifecycle.teardown);
    
    return this ;
  },
  
  /**
    Sets the current setup method.
    
    @returns {CoreTest.Plan} receiver
  */
  setup: function(func) {
    this.currentSetup = func || CoreTest.K;
    return this;
  },
  
  /**
    Sets the current teardown method

    @returns {CoreTest.Plan} receiver
  */
  teardown: function teardown(func) {
    this.currentTeardown = func || CoreTest.K ;
    return this;
  },
  
  now: function() { return new Date().getTime(); },
  
  /**
    Generates a unit test, adding it to the test plan.
  */
  test: function test(desc, func) {
    
    if (!this.enabled(this.currentModule, desc)) return this; // skip

    // base prototype describing test
    var working = {
      module: this.currentModule,
      test: desc,
      expected: 0,
      assertions: []
    };
    
    var msg;
    var name = desc ;
    if (this.currentModule) name = this.currentModule + " module: " + name;
    
    var setup = this.currentSetup || CoreTest.K;
    var teardown = this.currentTeardown || CoreTest.K;
    
    // add setup to queue
    this.synchronize(function() {

      // save main fixture...
      var mainEl = document.getElementById('main');
      this.fixture = mainEl ? mainEl.innerHTML : '';
      mainEl = null;

      this.working = working;
      
      try {
        working.total_begin = working.setup_begin = this.now();
        setup.call(this);
        working.setup_end = this.now();
      } catch(e) {
        msg = (e && e.toString) ? e.toString() : "(unknown error)";
        this.error("Setup exception on " + name + ": " + msg);
      }
    });
    
    // now actually invoke test
    this.synchronize(function() {
      if (!func) {
        this.warn("Test not yet implemented: " + name);
      } else {
        try {
          if (CoreTest.trace) console.log("run: " + name);
          this.working.test_begin = this.now();
          func.call(this);
          this.working.test_end = this.now();
        } catch(e) {
          msg = (e && e.toString) ? e.toString() : "(unknown error)";
          this.error("Died on test #" + (this.working.assertions.length + 1) + ": " + msg);
        }
      }
    });
    
    // cleanup
    this.synchronize(function() {
      try {
        this.working.teardown_begin = this.now();
        teardown.call(this);
        this.working.teardown_end = this.now();
      } catch(e) {
        msg = (e && e.toString) ? e.toString() : "(unknown error)";
        this.error("Teardown exception on " + name + ": " + msg);
      }
    });
    
    // finally, reset and report result
    this.synchronize(function() {
      
      if (this.reset) {
        try {
          this.working.reset_begin = this.now();
          this.reset();
          this.working.total_end = this.working.reset_end = this.now();
        } catch(ex) {
          msg = (ex && ex.toString) ? ex.toString() : "(unknown error)";
          this.error("Reset exception on " + name + ": " + msg) ;
        }
      }
      
      // check for expected assertions
      var w = this.working,
          exp = w.expected,
          len = w.assertions.length;
          
      if (exp && exp !== len) {
        this.fail("Expected " + exp + " assertions, but " + len + " were run");
      }
      
      // finally, record result
      this.working = null;
      this.record(w.module, w.test, w.assertions, w);

      if (!this.pauseTime) {
        this.pauseTime = new Date().getTime();
      } else {
        var now = new Date().getTime();
        if ((now - this.pauseTime) > 250) {
          this.pause();
          this.pauseTime = now ;
        }
      }
      
    });
  },

  clearHtmlbody: function(){
    var body = Q$('body')[0];

    // first, find the first element with id 'htmlbody-begin'  if exists,
    // remove everything after that to reset...
    var begin = Q$('body #htmlbody-begin')[0];
    if (!begin) {
      begin = Q$('<div id="htmlbody-begin"></div>')[0];
      body.appendChild(begin);
    } else {
      while(begin.nextSibling) body.removeChild(begin.nextSibling);
    }
    begin = null;
  },
  
  /**
    Converts the passed string into HTML and then appends it to the main body 
    element.  This is a useful way to automatically load fixture HTML into the
    main page.
  */
  htmlbody: function htmlbody(string) {
    var html = Q$(string) ;
    var body = Q$('body')[0];

    this.clearHtmlbody();

    // now append new content
    html.each(function() { body.appendChild(this); });
  },
  
  /**
    Records the results of a test.  This will add the results to the log
    and notify the delegate.  The passed assertions array should contain 
    hashes with the result and message.
  */
  record: function(module, test, assertions, timings) {
    var r   = this.results,
        len = assertions.length,
        del = this.delegate,
        idx, cur;
        
    r.tests++;
    for(idx=0;idx<len;idx++) {
      cur = assertions[idx];
      cur.module = module;
      cur.test = test ;

      r.total++;
      r[cur.result]++;
      r.assertions.push(cur);
    }
    
    if (del && del.planDidRecord) {
      del.planDidRecord(this, module, test, assertions, timings) ;
    }
    
  },
  
  /**
    Universal method can be called to reset the global state of the 
    application for each test.  The default implementation will reset any
    saved fixture.
  */
  reset: function() {
    if (this.fixture) {
      var mainEl = document.getElementById('main');
      if (mainEl) mainEl.innerHTML = this.fixture;
      mainEl = null;
    }  
    return this ;
  },
  
  /**
    Can be used to decide if a particular test should be enabled or not.  
    Current implementation allows a test to run.
    
    @returns {Boolean}
  */
  enabled: function(moduleName, testName) {
    return true;
  },
  
  // ..........................................................
  // MATCHERS
  // 
  
  /**
    Called by a matcher to record that a test has passed.  Requires a working
    test property.
  */
  pass: function(msg) {
    var w = this.working ;
    if (!w) throw "pass("+msg+") called outside of a working test";
    w.assertions.push({ message: msg, result: CoreTest.OK });
    return this ;
  },

  /**
    Called by a matcher to record that a test has failed.  Requires a working
    test property.
  */
  fail: function(msg) {
    var w = this.working ;
    if (!w) throw "fail("+msg+") called outside of a working test";
    w.assertions.push({ message: msg, result: CoreTest.FAIL });
    return this ;
  },

  /**
    Called by a matcher to record that a test issued a warning.  Requires a 
    working test property.
  */
  warn: function(msg) {
    var w = this.working ;
    if (!w) throw "warn("+msg+") called outside of a working test";
    w.assertions.push({ message: msg, result: CoreTest.WARN });
    return this ;
  },

  /**
    Called by a matcher to record that a test had an error.  Requires a 
    working test property.
  */
  error: function(msg, e) {
    var w = this.working ;
    if (!w) throw "error("+msg+") called outside of a working test";
    
    if(e && typeof console != "undefined" && console.error && console.warn ) {
      console.error(msg);
      console.error(e);
    }
    
    w.assertions.push({ message: msg, result: CoreTest.ERROR });
    return this ;
  },
  
  /**
    Any methods added to this hash will be made global just before the first
    test is run.  You can add new methods to this hash to use them in unit
    tests.  "this" will always be the test plan.
  */
  fn: {

    /**
      Primitive will pass or fail the test based on the first boolean.  If you
      pass an actual and expected value, then this will automatically log the
      actual and expected values.  Otherwise, it will expect the message to
      be passed as the second argument.

      @param {Boolean} pass true if pass
      @param {Object} actual optional actual
      @param {Object} expected optional expected
      @param {String} msg optional message
      @returns {CoreTest.Plan} receiver
    */
    ok: function ok(pass, actual, expected, msg) {
      if (msg === undefined) {
        msg = actual ;
        if (!msg) msg = pass ? "OK" : "failed";
      } else {
        if (!msg) msg = pass ? "OK" : "failed";
        if (pass) {
          msg = msg + ": " + CoreTest.dump(expected) ;
        } else {
          msg = msg + ", expected: " + CoreTest.dump(expected) + " result: " + CoreTest.dump(actual);
        }
      }

      if (QUNIT_BREAK_ON_TEST_FAIL & !pass) {
        throw msg;
      }

      return !!pass ? this.pass(msg) : this.fail(msg);
    },

    /**
      Primitive performs a basic equality test on the passed values.  Prints
      out both actual and expected values.
      
      Preferred to ok(actual === expected, message);
      
      @param {Object} actual tested object
      @param {Object} expected expected value
      @param {String} msg optional message
      @returns {CoreTest.Plan} receiver
    */
    equals: function equals(actual, expected, msg) {
      if (msg === undefined) msg = null; // make sure ok logs properly
      return this.ok(actual == expected, actual, expected, msg);
    },
    
    /**
      Expects the passed function call to throw an exception of the given
      type. If you pass null or Error for the expected exception, this will
      pass if any error is received.  If you pass a string, this will check 
      message property of the exception.
      
      @param {Function} callback the function to execute
      @param {Error} expected optional, the expected error
      @param {String} a description
      @returns {CoreTest.Plan} receiver
    */
    should_throw: function should_throw(callback, expected, msg) {
      var actual = false ;
      
      try {
        callback();
      } catch(e) {
        actual = (typeof expected === "string") ? e.message : e;        
      }
      
      if (expected===false) {
        ok(actual===false, CoreTest.fmt("%@ expected no exception, actual %@", msg, actual));
      } else if (expected===Error || expected===null || expected===true) {
        ok(!!actual, CoreTest.fmt("%@ expected exception, actual %@", msg, actual));
      } else {
        equals(actual, expected, msg);
      }
    },
    
    /**
      Specify the number of expected assertions to gaurantee that a failed 
      test (no assertions are run at all) don't slip through

      @returns {CoreTest.Plan} receiver
    */
    expect: function expect(asserts) {
      this.working.expected = asserts;
    },
    
    /**
      Verifies that two objects are actually the same.  This method will do
      a deep compare instead of a simple equivalence test.  You should use
      this instead of equals() when you expect the two object to be different 
      instances but to have the same content.
      
      @param {Object} value tested object
      @param {Object} actual expected value
      @param {String} msg optional message
      @returns {CoreTest.Plan} receiver
    */
    same: function(actual, expected, msg) {
      if (msg === undefined) msg = null ; // make sure ok logs properly
      return this.ok(CoreTest.equiv(actual, expected), actual, expected, msg);
    },
    
    /**
      Stops the current tests from running.  An optional timeout will 
      automatically fail the test if it does not restart within the specified
      period of time.
      
      @param {Number} timeout timeout in msec
      @returns {CoreTest.Plan} receiver
    */
    stop: function(timeout) {
      return this.stop(timeout);
    },
    
    /**
      Restarts tests running.  Use this to begin tests after you stop tests.
      
      @returns {CoreTest.Plan} receiver
    */
    start: function() {
      return this.start();
    },
    
    reset: function() { 
      return this.reset(); 
    }
  
  },
  
  /**
    Exports the comparison functions into the global namespace.  This will
    allow you to call these methods from within testing functions.  This 
    method is called automatically just before the first test is run.
    
    @returns {CoreTest.Plan} receiver
  */
  prepare: function() {
    var fn   = this.fn,
        plan = this,
        key, func;
        
    for(key in fn) {
      if (!fn.hasOwnProperty(key)) continue ;
      func = fn[key];
      if (typeof func !== "function") continue ;
      window[key] = this._bind(func);
      if (!plan[key]) plan[key] = func; 
    }
    return this ;
  },
  
  _bind: function(func) {
    var plan = this;
    return function() { return func.apply(plan, arguments); };
  }
  
};

// ..........................................................
// EXPORT BASIC API
// 

CoreTest.defaultPlan = function defaultPlan() {
  var plan = CoreTest.plan;
  if (!plan) {
    CoreTest.runner = CoreTest.Runner.create();
    plan = CoreTest.plan = CoreTest.runner.plan;
  }
  return plan;
};

// create a module.  If this is the first time, create the test plan and
// runner.  This will cause the test to run on page load
window.module = function(desc, l) {
  CoreTest.defaultPlan().module(desc, l); 
}; 

// create a test.  If this is the first time, create the test plan and
// runner.  This will cause the test to run on page load
window.test = function(desc, func) {
  CoreTest.defaultPlan().test(desc, func); 
}; 

// reset htmlbody for unit testing
window.clearHtmlbody = function() {
  CoreTest.defaultPlan().clearHtmlbody(); 
}; 

window.htmlbody = function(string) {
  CoreTest.defaultPlan().htmlbody(string); 
}; 

/* >>>>>>>>>> BEGIN source/system/runner.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals CoreTest Q$ */

sc_require('system/plan');

/** @static
  The runner will automatically run the default CoreTest.plan when the 
  document is fully loaded.  It will also act as a delegate on the plan, 
  logging the output to the screen or console.

  @since SproutCore 1.0
*/


CoreTest.Runner = {
  
  /**
    The CoreTest plan.  If not set, a default plan will be created.
  */
  plan: null,
  errors: null,

  showProgress: false,

  create: function() {
    var len = arguments.length,
        ret = CoreTest.beget(this),
        idx ;
        
    for(idx=0;idx<len;idx++) CoreTest.mixin(ret, arguments[len]);
    if (!ret.plan) ret.plan = CoreTest.Plan.create({ delegate: ret });
    window.resizeTo(1400, 800);
    Q$(window).load(function() { ret.begin(); });      
    return ret ;
  },
  
  begin: function() {
    var plan = CoreTest.plan;
    plan.delegate = this;
    plan.run();
  },
  
  planDidBegin: function(plan) {
    // setup the report DOM element.
    var str = [
      '<div class="core-test">',
        '<div class="useragent">UserAgent</div>',
        '<div class="testresult">',
          '<label class="hide-passed">',
            '<input type="checkbox" checked="checked" /> Hide passed tests',
          '</label>'
    ];

    if (navigator.userAgent.indexOf('MSIE')==-1) {
      str.push(
          '<label class="show-progress">',
            '<input type="checkbox"'+(this.showProgress?' checked="checked"':'')+'" /> Show progess (slower)',
          '</label>'
      );
    }

    str.push(
          '<label class="show-progress">',
            '<input type="checkbox"'+(this.showProgress?' checked="checked"':'')+'" /> Show progess (slower)',
          '</label>',
          '<span class="status">Running...</span>',
        '</div>',
        '<div class="detail">',
          '<table>',
            '<thead><tr>',
              '<th class="desc">Test</th><th>Result</th>',
            '</tr></thead>',
            '<tbody><tr></tr></tbody>',
          '</table>',
        '</div>',
      '</div>'
    );

    this.report = Q$(str.join(''));

    this.report.find('.useragent').html(navigator.userAgent);
    this.logq = this.report.find('tbody');
    this.testCount = 0 ;
    
    // listen to change event
    var runner = this;
    this.hidePassedCheckbox = this.report.find('.hide-passed input');
    this.hidePassedCheckbox.change(function() {
      runner.hidePassedTestsDidChange();
    });

    this.showProgressCheckbox = this.report.find('.show-progress input');
    this.showProgressCheckbox.change(function() {
      runner.showProgressCheckboxDidChange();
    });

    Q$('body').append(this.report);
  },
  
  hidePassedTestsDidChange: function() {
    var checked = this.hidePassedCheckbox.is(':checked');
        
    if (checked) {
      this.logq.addClass('hide-clean');
    } else {
      this.logq.removeClass('hide-clean');
    }
  },

  showProgressCheckboxDidChange: function(){
    this.showProgress = this.showProgressCheckbox.is(':checked');
    if (this.showProgress) { this.flush(); }
  },

  planDidFinish: function(plan, r) {
    this.flush();
    
    var result = this.report.find('.testresult .status');
    var str = CoreTest.fmt('<span>Completed %@ tests in %@ msec. </span>'
              +'<span class="total">%@</span> total assertions: ', r.tests, 
              r.runtime, r.total);
    
    if (r.passed > 0) {
      str += CoreTest.fmt('&nbsp;<span class="passed">%@ passed</span>', r.passed);
    }
    
    if (r.failed > 0) {
      str += CoreTest.fmt('&nbsp;<span class="failed">%@ failed</span>', r.failed);
    }

    if (r.errors > 0) {
      str += CoreTest.fmt('&nbsp;<span class="errors">%@ error%@</span>', 
            r.errors, (r.errors !== 1 ? 's' : ''));
    }

    if (r.warnings > 0) {
      str += CoreTest.fmt('&nbsp;<span class="warnings">%@ warning%@</span>',
            r.warnings, (r.warnings !== 1 ? 's' : ''));
    }

    // if all tests passed, disable hiding them.  if some tests failed, hide
    // them by default.
    if (this.errors) this.errors.push('</tr></tbody></table>');
    if ((r.failed + r.errors + r.warnings) > 0) {
      this.hidePassedTestsDidChange(); // should be checked by default
    } else {
      this.report.find('.hide-passed').addClass('disabled')
        .find('input').attr('disabled', true);
      if (this.errors) this.errors.length = 0;
    }     
    if(CoreTest.showUI) Q$('.core-test').css("right", "360px");
    result.html(str);
    
    CoreTest.finished = true;
    
    if (this.errors) CoreTest.errors=this.errors.join('');

    
    // Unload the SproutCore event system so that the user can select the text
    // of the various events.  (It is handy when looking at failed tests.)
    if (SC  &&  SC.Event  &&  SC.Event.unload) {
      try {
        SC.Event.unload();
      }
      catch (e) {}
    }
  },
  
  planDidRecord: function(plan, module, test, assertions, timings) {
    var name = test, 
        s    = { passed: 0, failed: 0, errors: 0, warnings: 0 }, 
        len  = assertions.length, 
        clean = '', 
        idx, cur, q;
    
    for(idx=0;idx<len;idx++) s[assertions[idx].result]++;
    if ((s.failed + s.errors + s.warnings) === 0) clean = "clean" ;
    
    if (module) name = module.replace(/\n/g, '<br />') + " module: " + test ;
    name = CoreTest.fmt('%@ - %@msec', name, timings.total_end - timings.total_begin);
    // place results into a single string to append all at once.
    var logstr = this.logstr ;
    var errors =this.errors;
    if (!logstr) logstr = this.logstr = [];
    if (!this.errors) {
      this.errors = ['<style type="text/css">* {font: 12px arial;}'+
                    '.passed { background-color: #80D175; color: white;}'+
                    '.failed { background-color: #ea4d4; color: black; }'+
                    '.errors { background-color: red; color: black; }'+
                    '.warnings { background-color: #E49723; color: black;}'+
                    '.desc { text-align: left;}'+
                    '</style><table style="border:1px solid"><thead>'+
                    '<tr><th class="desc">'+navigator.userAgent+
                    '</th><th>Result</th></tr>'+
                    '</thead><tbody><tr>'];
    }
    logstr.push(CoreTest.fmt('<tr class="test %@"><th class="desc" colspan="2">'+
          '%@ (<span class="passed">%@</span>, <span class="failed">%@</span>,'+
          ' <span class="errors">%@</span>, <span class="warnings">%@</span>)'+
          '</th></tr>', clean, name, s.passed, s.failed, s.errors, s.warnings));
    if(s.failed>0 || s.errors>0){
      this.errors.push(CoreTest.fmt('<tr class="test %@">'+
          '<th style="background:grey; color:white" class="desc" colspan="2">'+
          '%@ (<span class="passed">%@</span>, <span class="failed">%@</span>'+
          ', <span class="errors">%@</span>, <span class="warnings">%@</span>'+
          ')</th></tr>', clean, name, s.passed, s.failed, s.errors, s.warnings));  
    }
    
    len = assertions.length;
    for(idx=0;idx<len;idx++) {
      cur = assertions[idx];
      clean = cur.result === CoreTest.OK ? 'clean' : 'dirty';
      logstr.push(CoreTest.fmt('<tr class="%@"><td class="desc">%@</td>'
          +'<td class="action %@">%@</td></tr>', clean, cur.message, cur.result, 
          (cur.result || '').toUpperCase()));
      if(clean=='dirty'){
        this.errors.push(CoreTest.fmt('<tr class="%@"><td class="desc">%@</td>'
        +'<td class="action %@">%@</td></tr>', clean, cur.message, cur.result,
        (cur.result || '').toUpperCase()));
      }
    }
    
    this.testCount++;
    this.resultStr = CoreTest.fmt("Running – Completed %@ tests so far.", this.testCount);
  },
  
  // called when the plan takes a break.  Good time to flush HTML output.
  planDidPause: function(plan) {
    if(!this._cacheResultSelector){
      this._cacheResultSelector = this.report.find('.testresult .status');
    }
    var result = this._cacheResultSelector;

    if (this.resultStr && navigator.userAgent.indexOf('MSIE')==-1) result.html(this.resultStr);
    this.resultStr = null ;

    if (this.showProgress) { this.flush(); }
  },
  
  // flush any pending HTML changes...
  flush: function() {
    var logstr = this.logstr,
        resultStr = this.resultStr,
        result = this.report.find('.testresult .status');
        
    if (logstr) this.logq.append(this.logstr.join('')) ;
    
    if (resultStr) result.html(resultStr);
    this.resultStr = this.logstr = null ;
  }
  
};

/* >>>>>>>>>> BEGIN source/system/suite.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals CoreTest module */

/** @class

  A test Suite defines a group of reusable unit tests that can be added to a 
  test plan at any time by calling the generate() method.  Suites are most
  useful for defining groups of tests that validate compliance with a mixin.
  You can then generate customized versions of the test suite for different
  types of objects to ensure that both the mixin and the object implementing
  the mixin use the API properly.
  
  ## Using a Suite
  
  To use a Suite, call the generate() method on the suite inside on of your
  unit test files.  This will generate new modules and tests in the suite
  and add them to your test plan.
  
  Usually you will need to customize the suite to apply to a specific object.
  You can supply these customizations through an attribute hash passed to the
  generate() method.  See the documentation on the specific test suite for
  information on the kind of customizations you may need to provide.
  
  ### Example
  
      // generates the SC.ArrayTestSuite tests for a built-in array.
      SC.ArrayTests.generate('Array', {
        newObject: function() { return []; }
      });
  
  ## Defining a Suite
  
  To define a test suite, simply call the extend() method, passing any 
  attributs you want to define on the stuie along with this method.  You can
  then add functions that will define the test suite with the define() method.
  
  Functions you pass to define will have an instance of the test suite passed
  as their first parameter when invoked.

  ### Example 
  
      SC.ArrayTests = CoreTest.Suite.create("Verify SC.Array compliance", {
      
        // override to generate a new object that implements SC.Array
        newObject: function() { return null; }
      });
    
      SC.ArrayTests.define(function(T) {
        T.module("length tests");
      
        test("new length", function() {
          equals(T.object.get('length'), 0, 'array length');
        });
      
      });
  
  @since SproutCore 1.0
  
*/
CoreTest.Suite = /** @scope CoreTest.Suite.prototype */ {

  /**
    Call this method to define a new test suite.  Pass one or more hashes of
    properties you want added to the new suite.  
    
    @param {Hash} attrs one or more attribute hashes
    @returns {CoreTest.Suite} subclass of suite.
  */
  create: function(desc, attrs) {
    var len = arguments.length,
        ret = CoreTest.beget(this),
        idx;
        
    // copy any attributes
    for(idx=1;idx<len;idx++) CoreTest.mixin(ret, arguments[idx]);
    
    if (desc) ret.basedesc = desc;
    
    // clone so that new definitions will be kept separate
    ret.definitions = ret.definitions.slice();
    
    return ret ;
  },

  /**
    Generate a new test suite instance, adding the suite definitions to the 
    current test plan.  Pass a description of the test suite as well as one or
    more attribute hashes to apply to the test plan.
    
    The description you add will be prefixed in front of the 'desc' property
    on the test plan itself.
    
    @param {String} desc suite description
    @param {Hash} attrs one or more attribute hashes
    @returns {CoreTest.Suite} suite instance
  */
  generate: function(desc, attrs) {
    var len = arguments.length,
        ret = CoreTest.beget(this),
        idx, defs;
        
    // apply attributes - skip first argument b/c it is a string
    for(idx=1;idx<len;idx++) CoreTest.mixin(ret, arguments[idx]);    
    ret.subdesc = desc ;
    
    // invoke definitions
    defs = ret.definitions ;
    len = defs.length;
    for(idx=0;idx<len;idx++) defs[idx].call(ret, ret);
    
    return ret ;
  },
  
  /**
    Adds the passed function to the array of definitions that will be invoked
    when the suite is generated.
    
    The passed function should expect to have the TestSuite instance passed
    as the first and only parameter.  The function should actually define 
    a module and tests, which will be added to the test suite.
    
    @param {Function} func definition function
    @returns {CoreTest.Suite} receiver
  */
  define: function(func) {
    this.definitions.push(func);
    return this ;
  },
  
  /** 
    Definition functions.  These are invoked in order when  you generate a 
    suite to add unit tests and modules to the test plan.
  */
  definitions: [],
  
  /**
    Generates a module description by merging the based description, sub 
    description and the passed description.  This is usually used inside of 
    a suite definition function.
    
    @param {String} str detailed description for this module
    @returns {String} generated description
  */
  desc: function(str) {
    return this.basedesc.fmt(this.subdesc, str);
  },
  
  /**
    The base description string.  This should accept two formatting options,
    a sub description and a detailed description.  This is the description
    set when you call extend()
  */
  basedesc: "%@ > %@",
  
  /**
    Default setup method for use with modules.  This method will call the
    newObject() method and set its return value on the object property of 
    the receiver.
  */
  setup: function() {
    this.object = this.newObject();
  },
  
  /**
    Default teardown method for use with modules.  This method will call the
    destroyObejct() method, passing the current object property on the 
    receiver.  It will also clear the object property.
  */
  teardown: function() {
    if (this.object) this.destroyObject(this.object);
    this.object = null;
  },
  
  /**
    Default method to create a new object instance.  You will probably want
    to override this method when you generate() a suite with a function that
    can generate the type of object you want to test.
    
    @returns {Object} generated object
  */
  newObject: function() { return null; },
  
  /**
    Default method to destroy a generated object instance after a test has 
    completed.  If you override newObject() you can also overried this method
    to cleanup the object you just created.
    
    Default method does nothing.
  */
  destroyObject: function(obj) { 
    // do nothing.
  },
  
  /**
    Generates a default module with the description you provide.  This is 
    a convenience function for use inside of a definition function.  You could
    do the same thing by calling:
    
        var T = this ;
        module(T.desc(description), {
          setup: function() { T.setup(); },
          teardown: function() { T.teardown(); }
        }
    
    @param {String} desc detailed descrition
    @returns {CoreTest.Suite} receiver
  */
  module: function(desc) {
    var T = this ;
    module(T.desc(desc), {
      setup: function() { T.setup(); },
      teardown: function() { T.teardown(); }
    });
  }
  
};

