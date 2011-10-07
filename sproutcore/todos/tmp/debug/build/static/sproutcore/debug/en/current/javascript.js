/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// test
window.SC = window.SC || {};

// Note:  We won't use SC.T_* here because those constants might not yet be
//        defined.
SC._mapDisplayNamesUseHashForSeenTypes = ['object', 'number', 'boolean', 'array', 'string', 'function', 'class', 'undefined', 'error'];  // 'hash' causes problems


SC.mapDisplayNames = function(obj, level, path, seenHash, seenArray) {
  if (!SC.browser.webkit) return ;

  // Lazily instantiate the hash of types we'll use a hash for the "have we
  // seen this before?" structure.  (Some types are not safe to put in a hash
  // in this manner, so we'll use the hash for its algorithmic advantage when
  // possible, but fall back to an array using `indexOf()` when necessary.)
  if (!SC._mapDisplayNamesUseHashForSeenTypesHash) {
    var types = SC._mapDisplayNamesUseHashForSeenTypes ;
    var typesHash = {} ;
    var len = types.length ;
    for (var i = 0;  i < len;  ++i) {
      var type = types[i] ;
      typesHash[type] = true ;
    }
    SC._mapDisplayNamesUseHashForSeenTypesHash = typesHash ;
  }


  if (obj === undefined) obj = window ;
  if (level === undefined) level = 0 ;
  if (path === undefined) path = [] ;
  if (seenHash === undefined) seenHash = {} ;
  if (seenArray === undefined) seenArray = [] ;

  if (level > 5) return ;

  var useHash = !!SC._mapDisplayNamesUseHashForSeenTypesHash[SC.typeOf(obj)] ;

  var hash;
  var arrayToCheck;
  if (useHash) {
    hash = SC.hashFor(obj) ;
    arrayToCheck = seenHash[hash];
  }
  else {
    arrayToCheck = seenArray;
  }
  
  if (arrayToCheck  &&  arrayToCheck.indexOf(obj) !== -1) return ;
  
  if (arrayToCheck) {
    arrayToCheck.push(obj) ;
  }
  else if (useHash) {
    seenHash[hash] = [obj] ;
  }

  var loc = path.length, str, val, t;
  path[loc] = '';

  for(var key in obj) {
    if (obj.hasOwnProperty && !obj.hasOwnProperty(key)) continue ;
    if (!isNaN(Number(key))) continue ; // skip array indexes
    if (key === "constructor") continue ;
    if (key === "superclass") continue ;
    if (key === "document") continue ;

    // Avoid TypeError's in WebKit based browsers
    if (obj.type && obj.type === 'file') {
      if (key === 'selectionStart' || key === 'selectionEnd') continue;
    }

    try{
      val = obj[key];
    }catch(e){
      //This object might be special this get called when an app
     // using webView adds an static C object to JS.
      continue;
    }
    if (key === "SproutCore") key = "SC";
    t   = SC.typeOf(val);
    if (t === SC.T_FUNCTION) {
      if (!val.displayName) { // only name the first time it is encountered
        path[loc] = key ;
        str = path.join('.').replace('.prototype.', '#');
        val.displayName = str;
      }

      // handle constructor-style
      if (val.prototype) {
        path.push("prototype");
        SC.mapDisplayNames(val.prototype, level+1, path, seenHash, seenArray);
        path.pop();
      }

    } else if (t === SC.T_CLASS) {
      path[loc] = key ;
      SC.mapDisplayNames(val, level+1, path, seenHash, seenArray);

    } else if ((key.indexOf('_')!==0) && (t===SC.T_OBJECT || t===SC.T_HASH)) {
      path[loc] = key ;
      SC.mapDisplayNames(val, level+1, path, seenHash, seenArray);
    }
  }

  path.pop();
};


/* >>>>>>>>>> BEGIN source/invoke_once_last_debugging.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// When in debug mode, it’s useful for our observer sets (which are used by
// invokeOnce and invokeLast) to record which code scheduled the
// `invokeOnce`/`invokeLast` targets/methods.

window.SC = window.SC || {};


// Declaring the variable will make it easier for people who want to enter it
// inside consoles that auto-complete.
if (!SC.LOG_RUNLOOP_INVOCATIONS) SC.LOG_RUNLOOP_INVOCATIONS = false;


SC.addInvokeOnceLastDebuggingInfo = function() {
  return;
  
  SC.ObserverSet.add = function(target, method, context, originatingTarget, originatingMethod, originatingStack) {
    var targetGuid = (target) ? SC.guidFor(target) : "__this__";

    // get the set of methods
    var methods = this[targetGuid] ;
    if (!methods) {
      methods = this[targetGuid] = SC.CoreSet.create() ;
      methods.target = target ;
      methods.isTargetSet = YES ; // used for getMembers().
      this.targets++ ;
    }
    methods.add(method) ;

    // context is really useful sometimes but not used that often so this
    // implementation is intentionally lazy.
    if (context !== undefined) {
      var contexts = methods.contexts || (methods.contexts = {}) ;
      contexts[SC.guidFor(method)] = context ;
    }
    
    // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
    
    // Recording the calling object/function can be a useful debugging tool.
    // Since multiple object/functions can schedule the same target/method,
    // this value could either be a single value or an array.  (We won't
    // always use an array because that adds a certain debugging burden to the
    // "only one scheduled it" case.)
    if (originatingMethod !== undefined) {
      var originatingTargets = methods.originatingTargets;
      var originatingMethods = methods.originatingMethods;
      var originatingStacks  = methods.originatingStacks;
      if (!originatingTargets) originatingTargets = methods.originatingTargets = {};
      if (!originatingMethods) originatingMethods = methods.originatingMethods = {};
      if (!originatingStacks)  originatingStacks  = methods.originatingStacks  = {};
      
      var key = SC.guidFor(method);
      
      var existingMethod = originatingMethods[key];
      if (existingMethod  &&  SC.typeOf(existingMethod) !== SC.T_ARRAY) {
        // We previously had one entry and now we have two.  We need to
        // convert to an array!
        var existingTarget = originatingTargets[key];
        var existingStack  = originatingStacks[key];
        originatingTargets[key] = [existingTarget, originatingTarget];
        originatingMethods[key] = [existingMethod, originatingMethod];
        originatingStacks[key]  = [existingStack, originatingStack];
      }
      else {
        // We didn't previously have a value?  Then no need to use an
        // enclosing array.
        originatingTargets[key] = originatingTarget;
        originatingMethods[key] = originatingMethod;
        originatingStacks[key]  = originatingStack;
      }
    }
  };
  
  
  SC.ObserverSet.invokeMethods = function() {
    // iterate through the set, look for sets.
    for(var key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      var value = this[key] ;
      if (value && value.isTargetSet) {
        var idx = value.length;
        var target = value.target ;
        
        // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
        var m, log = SC.LOG_RUNLOOP_INVOCATIONS;
        while(--idx>=0) {
          m = value[idx];
          if (log) {
            var mName = m.displayName || m;
            
            var originatingKey     = SC.guidFor(m),
                originatingTargets = value.originatingTargets;
            if (!originatingTargets) {
              // If we didn't capture information for this invocation, just
              // report what we can.  (We assume we'll always have all three
              // hashes or none.)
              SC.Logger.log("Invoking runloop-scheduled method %@ on %@, but we didn’t capture information about who scheduled it…".fmt(mName, target));
            }
            else {
              originatingTargets = originatingTargets[originatingKey];             // Could be one target or an array of them
              var originatingMethods = value.originatingMethods[originatingKey];   // ditto
              var originatingStacks  = value.originatingStacks[originatingKey];    // ditto

              // Were there multiple originating target/method pairs that
              // scheduled this target/method?  If so, display them all nicely.
              // Otherwise, optimize our output for only one.
              if (originatingMethods  &&  SC.typeOf(originatingMethods) === SC.T_ARRAY) {
                SC.Logger.log("Invoking runloop-scheduled method %@ on %@, which was scheduled by multiple target/method pairs:".fmt(mName, target));
              
                var i, len,
                  originatingTarget,
                  originatingMethod,
                  originatingStack;
                for (i = 0, len = originatingMethods.length;  i < len;  ++i) {
                  originatingTarget = originatingTargets[i];
                  originatingMethod = originatingMethods[i];
                  originatingMethod = originatingMethod.displayName || originatingMethod;
                  originatingStack  = originatingStacks[i];
  
                  SC.Logger.log("[%@]  originated by target %@,  method %@,  stack:".fmt(i, originatingTarget, originatingMethod), originatingStack);
                }
              }
              else {
                var originatingMethodName = originatingMethods.displayName || originatingMethods;

                SC.Logger.log("Invoking runloop-scheduled method %@ on %@.  Originated by target %@,  method %@,  stack: ".fmt(mName, target, originatingTargets, originatingMethodName), originatingStacks);
              }
            }
          }
          m.call(target);
        }
        // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
      }
    }
  };
  
  
  SC.Object.prototype.invokeOnce = function(method) {
    var originatingTarget = this ;
    if (SC.LOG_RUNLOOP_INVOCATIONS) {
      originatingStack  = SC.getRecentStack();
      originatingMethod = originatingStack[0];
    }
    else {
      originatingStack  = null;
      originatingMethod = arguments.callee.caller;
    }    SC.RunLoop.currentRunLoop.invokeOnce(this, method, originatingTarget, originatingMethod, originatingStack) ;
    return this ;
  };
  
  
  SC.Object.prototype.invokeLast = function(method) {
    var originatingTarget = this ;
    var originatingStack, originatingMethod;
    if (SC.LOG_RUNLOOP_INVOCATIONS) {
      originatingStack  = SC.getRecentStack();
      originatingMethod = originatingStack[0];
    }
    else {
      originatingStack  = null;
      originatingMethod = arguments.callee.caller;
    }
    SC.RunLoop.currentRunLoop.invokeLast(this, method, originatingTarget, originatingMethod, originatingStack) ;
    return this ;
  };
  
  
  SC.RunLoop.prototype.invokeOnce = function(target, method, originatingTarget, originatingMethod, originatingStack) {
    // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
    
    // For debugging convenience, record the originating function if it was
    // not provided for us.
    if (!originatingTarget) originatingTarget = null;   // More obvious when debugging
    if (!originatingMethod) {
      if (SC.LOG_RUNLOOP_INVOCATIONS) {
        originatingStack  = SC.getRecentStack();
        originatingMethod = originatingStack[0];
      }
      else {
        originatingStack  = null;
        originatingMethod = arguments.callee.caller;
      }
    }
    // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
    
    
    // normalize
    if (method === undefined) { 
      method = target; target = this ;
    }
    if (SC.typeOf(method) === SC.T_STRING) method = target[method];
    if (!this._invokeQueue) this._invokeQueue = SC.ObserverSet.create();
    this._invokeQueue.add(target, method, null, originatingTarget, originatingMethod, originatingStack);  // differs from standard implementation
    return this ;
  };
  
  
  SC.RunLoop.prototype.invokeLast = function(target, method, originatingTarget, originatingMethod, originatingStack) {
    // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
    
    // For debugging convenience, record the originating function if it was
    // not provided for us.
    if (!originatingTarget) originatingTarget = null;   // More obvious when debugging
    if (!originatingMethod) {
      if (SC.LOG_RUNLOOP_INVOCATIONS) {
        originatingStack  = SC.getRecentStack();
        originatingMethod = originatingStack[0];
      }
      else {
        originatingStack  = null;
        originatingMethod = arguments.callee.caller;
      }
    }    
    // THIS IS THE PORTION THAT DIFFERS FROM THE STANDARD IMPLEMENTATION
    
    
    // normalize
    if (method === undefined) { 
      method = target; target = this ;
    }
    if (SC.typeOf(method) === SC.T_STRING) method = target[method];
    if (!this._invokeLastQueue) this._invokeLastQueue = SC.ObserverSet.create();
    this._invokeLastQueue.add(target, method, null, originatingTarget, originatingMethod, originatingStack);  // differs from standard implementation
    return this ;
  };
  
  
  // Will return the recent stack as a hash with numerical keys, for nice
  // output in some browser's debuggers.  The “recent” stack is capped at 6
  // entries.
  SC.getRecentStack = function() {
    var currentFunction = arguments.callee.caller,
        i = 0,
        stack = {},
        first = YES,
        functionName;

    while (currentFunction  &&  i < 6) {
      // Skip ourselves!
      if (first) {
        first = NO;
      }
      else {
        functionName = currentFunction.displayName || currentFunction.toString();
        stack[i++] = functionName;
      }
      currentFunction = currentFunction.caller;
    }
    
    return stack;
  };
  
};

