/* >>>>>>>>>> BEGIN source/license.js */
/**
 * @license
 * ==========================================================================
 * SproutCore Costello -- Property Observing Library
 * Copyright ©2006-2011, Strobe Inc. and contributors.
 * Portions copyright ©2008-2011 Apple Inc. All rights reserved.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a 
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 * For more information about SproutCore, visit http://www.sproutcore.com
 * 
 * ==========================================================================
 */

/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global NodeList */
// These commands are used by the build tools to control load order.  On the
// client side these are a no-op.
if (!window.require) { window.require = function require(){}; }
if (!window.sc_require) { window.sc_require = require; }
if (!window.sc_resource) {window.sc_resource = function sc_resource(){}; }
sc_require('license') ;

// ........................................
// GLOBAL CONSTANTS
//
// Most global constants should be defined inside of the SC namespace.
// However the following two are useful enough and generally benign enough
// to put into the global object.
window.YES = true ;
window.NO = false ;

// prevent a console.log from blowing things up if we are on a browser that
// does not support it
if (typeof console === 'undefined') {
  window.console = {} ;
  console.log = console.info = console.warn = console.error = function(){};
}

window.SC = window.SC || {} ;
window.SproutCore = window.SproutCore || SC ;

// ........................................
// BOOTSTRAP
//
// The root namespace and some common utility methods are defined here. The
// rest of the methods go into the mixin defined below.

/**
  @version 1.6.0
  @namespace

  All SproutCore methods and functions are defined
  inside of this namespace.  You generally should not add new properties to
  this namespace as it may be overwritten by future versions of SproutCore.

  You can also use the shorthand "SC" instead of "SproutCore".

  SproutCore-Base is a framework that provides core functions for SproutCore
  including cross-platform functions, support for property observing and
  objects.  It's focus is on small size and performance.  You can use this
  in place of or along-side other cross-platform libraries such as jQuery or
  Prototype.

  The core Base framework is based on the jQuery API with a number of
  performance optimizations.
*/
SC = window.SC; // This is dumb but necessary for jsdoc to get it right

SC.VERSION = '1.6.0';

/**
  @private

  Adds properties to a target object. You must specify whether
  to overwrite a value for a property or not.

  Used as a base function for the wrapper functions SC.mixin and SC.supplement.

  @param {Boolean} overwrite if a target has a value for a property, this specifies
                  whether or not to overwrite that value with the copyied object's
                  property value.
  @param {Object} target the target object to extend
  @param {Object} properties one or more objects with properties to copy.
  @returns {Object} the target object.
  @static
*/
SC._baseMixin = function (override) {
  var args = Array.prototype.slice.call(arguments, 1), src,
  // copy reference to target object
      target = args[0] || {},
      idx = 1,
      length = args.length ,
      options, copy , key;

  // Handle case where we have only one item...extend SC
  if (length === 1) {
    target = this || {};
    idx=0;
  }

  for ( ; idx < length; idx++ ) {
    if (!(options = args[idx])) continue ;
    for(key in options) {
      if (!options.hasOwnProperty(key)) continue ;
      copy = options[key] ;
      if (target===copy) continue ; // prevent never-ending loop
      if (copy !== undefined && ( override || (target[key] === undefined) )) target[key] = copy ;
    }
  }

  return target;
} ;

/**
  Adds properties to a target object.

  Takes the root object and adds the attributes for any additional
  arguments passed.

  @param {Object} target the target object to extend
  @param {Object} properties one or more objects with properties to copy.
  @returns {Object} the target object.
  @static
*/
SC.mixin = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(true);
  return SC._baseMixin.apply(this, args);
} ;

/**
  Adds properties to a target object.  Unlike SC.mixin, however, if the target
  already has a value for a property, it will not be overwritten.

  Takes the root object and adds the attributes for any additional
  arguments passed.

  @param {Object} target the target object to extend
  @param {Object} properties one or more objects with properties to copy.
  @returns {Object} the target object.
  @static
*/
SC.supplement = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(false);
  return SC._baseMixin.apply(this, args);
} ;

/**
  Alternative to mixin.  Provided for compatibility with jQuery.
  @function
*/
SC.extend = SC.mixin ;

// ..........................................................
// CORE FUNCTIONS
//
// Enough with the bootstrap code.  Let's define some core functions

SC.mixin(/** @scope window.SC.prototype */ {

  // ........................................
  // GLOBAL CONSTANTS
  //
  T_ERROR:     'error',
  T_OBJECT:    'object',
  T_NULL:      'null',
  T_CLASS:     'class',
  T_HASH:      'hash',
  T_FUNCTION:  'function',
  T_UNDEFINED: 'undefined',
  T_NUMBER:    'number',
  T_BOOL:      'boolean',
  T_ARRAY:     'array',
  T_STRING:    'string',

  // ........................................
  // TYPING & ARRAY MESSAGING
  //

  /**
    Returns a consistent type for the passed item.

    Use this instead of the built-in typeOf() to get the type of an item.
    It will return the same result across all browsers and includes a bit
    more detail. 

    @param {Object} item the item to check
    @returns {String} One of the following, depending on the type of the item<br>
            SC.T_STRING: String primitive,<br>
            SC.T_NUMBER: Number primitive,<br>
            SC.T_BOOLEAN: Boolean primitive,<br>
            SC.T_NULL: Null value,<br>
            SC.T_UNDEFINED: Undefined value,<br>
            SC.T_FUNCTION: A function,<br>
            SC.T_ARRAY: An instance of Array,<br>
            SC.T_CLASS: A SproutCore class (created using SC.Object.extend()),<br>
            SC.T_OBJECT: A SproutCore object instance,<br>
            SC.T_HASH: A JavaScript object not inheriting from SC.Object, <br>
            SC.T_ERROR: A SproutCore SC.Error object <br>
  */
  typeOf: function(item) {
    if (item === undefined) return SC.T_UNDEFINED ;
    if (item === null) return SC.T_NULL ;

    var nativeType = jQuery.type(item);

    if (nativeType === "function") {
      return item.isClass ? SC.T_CLASS : SC.T_FUNCTION;
    } else if (nativeType === "object") {
      
      // Note: typeOf() may be called before SC.Error has had a chance to load
      // so this code checks for the presence of SC.Error first just to make
      // sure.  No error instance can exist before the class loads anyway so
      // this is safe.
      if (SC.Error && (item instanceof SC.Error)) {
        return SC.T_ERROR;
      } else if (item instanceof SC.Object) {
        return SC.T_OBJECT;
      } else {
        return SC.T_HASH;
      }
    }

    return nativeType;
  },

  /**
    Returns YES if the passed value is null or undefined.  This avoids errors
    from JSLint complaining about use of ==, which can be technically
    confusing.

    @param {Object} obj value to test
    @returns {Boolean}
  */
  none: function(obj) {
    return obj == null;
  },

  /**
    Verifies that a value is either null or an empty string. Return false if
    the object is not a string.

    @param {Object} obj value to test
    @returns {Boolean}
  */
  empty: function(obj) {
    return obj === null || obj === undefined || obj === '';
  },

  /**
    Returns YES if the passed object is an array or Array-like.

    SproutCore Array Protocol:
    * the object has an objectAt property; or
    * the object is a native Array; or
    * the object is an Object, and has a length property

    Unlike SC.typeOf this method returns true even if the passed object is
    not formally array but appears to be array-like (i.e. has a length
    property, responds to .objectAt, etc.)

    @param {Object} obj the object to test
    @returns {Boolean}
  */
  isArray: function(obj) {
    if (!obj || obj.setInterval) { return false; }
    if (Array.isArray && Array.isArray(obj)) { return true; }
    if (obj.objectAt) { return true; }
    if (obj.length !== undefined && jQuery.type(obj) === "object") { return true; }

    return false;
  },

  /**
    Makes an object into an Array if it is not array or array-like already.
    Unlike SC.A(), this method will not clone the object if it is already
    an array.

    @param {Object} obj object to convert
    @returns {Array} Actual array
  */
  makeArray: function(obj) {
    return SC.isArray(obj) ? obj : SC.A(obj);
  },

  /**
    Converts the passed object to an Array.  If the object appears to be
    array-like, a new array will be cloned from it.  Otherwise, a new array
    will be created with the item itself as the only item in the array.

    @param {Object} object any enumerable or array-like object.
    @returns {Array} Array of items
  */
  A: function(obj) {
    // null or undefined -- fast path
    if ( obj === null || obj === undefined ) return [] ;

    // primitive -- fast path
    if ( obj.slice instanceof Function ) {
      // do we have a string?
      if ( typeof(obj) === 'string' ) return [obj] ;
      else return obj.slice() ;
    }

    // enumerable -- fast path
    if (obj.toArray) return obj.toArray() ;

    // if not array-like, then just wrap in array.
    if (!SC.isArray(obj)) return [obj];

    // when all else fails, do a manual convert...
    var ret = [], len = obj.length;
    while(--len >= 0) ret[len] = obj[len];
    return ret ;
  },

  //
  // GUIDS & HASHES
  //

  // Like jQuery.expando but without any risk of conflict
  guidKey: "SproutCore" + ( SC.VERSION + Math.random() ).replace( /\D/g, "" ),

  // Used for guid generation...
  _guidPrefixes: {"number": "nu", "string": "st"},
  _guidCaches:   {"number": {},   "string": {}},
  _numberGuids: [], _stringGuids: {}, _keyCache: {},

  /**"
    Returns a unique GUID for the object.  If the object does not yet have
    a guid, one will be assigned to it.  You can call this on any object,
    SC.Object-based or not, but be aware that it will add a _guid property.

    You can also use this method on DOM Element objects.

    @param {Object} obj any object, string, number, Element, or primitive
    @returns {String} the unique guid for this instance.
  */
  guidFor: function(obj) {
    var cache, ret,
        type = typeof obj;

    // special cases where we don't want to add a key to object
    if (obj === undefined) return "(undefined)";
    if (obj === null) return "(null)";

    // Don't allow prototype changes to String etc. to change the guidFor
    if (type === SC.T_NUMBER || type === SC.T_STRING) {
      cache = this._guidCaches[type];
      ret   = cache[obj];
      if(!ret) {
        ret        = "st" + (jQuery.uuid++);
        cache[obj] = ret;
      }
      return ret;
    } else if (type === SC.T_BOOL) {
      return (obj) ? "(true)" : "(false)";
    }

    var guidKey = this.guidKey;
    if (obj[guidKey]) return obj[guidKey];

    // More special cases; not as common, so we check for them after the cache
    // lookup
    if (obj === Object) return '(Object)';
    if (obj === Array) return '(Array)';

    return SC.generateGuid(obj, "sc");
  },

  /**
    Returns a key name that combines the named key + prefix.  This is more
    efficient than simply combining strings because it uses a cache
    internally for performance.

    @param {String} prefix the prefix to attach to the key
    @param {String} key The key
    @returns {String} result
  */
  keyFor: function(prefix, key) {
    var ret, pcache = this._keyCache[prefix];
    if (!pcache) pcache = this._keyCache[prefix] = {}; // get cache for prefix
    ret = pcache[key];
    if (!ret) ret = pcache[key] = prefix + '_' + key ;
    return ret ;
  },

  /**
    Generates a new guid, optionally saving the guid to the object that you
    pass in.  You will rarely need to use this method.  Instead you should
    call SC.guidFor(obj), which return an existing guid if available.

    @param {Object} obj the object to assign the guid to
    @param {String} prefix prefixes the generated guid
    @returns {String} the guid
  */
  generateGuid: function(obj, prefix) {
    var ret = (prefix + (jQuery.uuid++));
    if (obj) obj[this.guidKey] = ret ;
    return ret ;
  },

  /**
    Returns a unique hash code for the object. If the object implements
    a hash() method, the value of that method will be returned. Otherwise,
    this will return the same value as guidFor().

    If you pass multiple arguments, hashFor returns a string obtained by
    concatenating the hash code of each argument.

    Unlike guidFor(), this method allows you to implement logic in your
    code to cause two separate instances of the same object to be treated as
    if they were equal for comparisons and other functions.

    <b>IMPORTANT</b>: If you implement a hash() method, it MUST NOT return a
    number or a string that contains only a number. Typically hash codes
    are strings that begin with a "%".

    @param {Object...} objects the object(s)
    @returns {String} the hash code for this instance.
  */
  hashFor: function() {
    var l = arguments.length,
        h = '',
        obj, f, i;

    for (i=0 ; i<l; ++i) {
      obj = arguments[i];
      h += (obj && (f = obj.hash) && (typeof f === SC.T_FUNCTION)) ? f.call(obj) : this.guidFor(obj);
    }

    return h === '' ? null : h;
  },

  /**
    This will compare the two object values using their hash codes.

    @param {Object} a first value to compare
    @param {Object} b the second value to compare
    @returns {Boolean} YES if the two have equal hash code values.

  */
  isEqual: function(a,b) {
    // QUESTION: is there a compelling performance reason to special-case
    // undefined here?
    return this.hashFor(a) === this.hashFor(b) ;
  },

  /**
   This will compare two javascript values of possibly different types.
   It will tell you which one is greater than the other by returning
   -1 if the first is smaller than the second,
    0 if both are equal,
    1 if the first is greater than the second.

   The order is calculated based on SC.ORDER_DEFINITION , if types are different.
   In case they have the same type an appropriate comparison for this type is made.

   @param {Object} v first value to compare
   @param {Object} w the second value to compare
   @returns {NUMBER} -1 if v < w, 0 if v = w and 1 if v > w.

  */
  compare: function (v, w) {
    // Doing a '===' check is very cheap, so in the case of equality, checking
    // this up-front is a big win.
    if (v === w) return 0;

    var type1 = SC.typeOf(v);
    var type2 = SC.typeOf(w);

    // If we haven't yet generated a reverse-mapping of SC.ORDER_DEFINITION,
    // do so now.
    var mapping = SC.ORDER_DEFINITION_MAPPING;
    if (!mapping) {
      var order = SC.ORDER_DEFINITION;
      mapping = SC.ORDER_DEFINITION_MAPPING = {};
      var idx, len;
      for (idx = 0, len = order.length;  idx < len;  ++idx) {
        mapping[order[idx]] = idx;
      }

      // We no longer need SC.ORDER_DEFINITION.
      delete SC.ORDER_DEFINITION;
    }

    var type1Index = mapping[type1];
    var type2Index = mapping[type2];

    if (type1Index < type2Index) return -1;
    if (type1Index > type2Index) return 1;

    // ok - types are equal - so we have to check values now
    switch (type1) {
      case SC.T_BOOL:
      case SC.T_NUMBER:
        if (v<w) return -1;
        if (v>w) return 1;
        return 0;

      case SC.T_STRING:
        var comp = v.localeCompare(w);
        if (comp<0) return -1;
        if (comp>0) return 1;
        return 0;

      case SC.T_ARRAY:
        var vLen = v.length;
        var wLen = w.length;
        var l = Math.min(vLen, wLen);
        var r = 0;
        var i = 0;
        var thisFunc = arguments.callee;
        while (r===0 && i < l) {
          r = thisFunc(v[i],w[i]);
          i++;
        }
        if (r !== 0) return r;

        // all elements are equal now
        // shorter array should be ordered first
        if (vLen < wLen) return -1;
        if (vLen > wLen) return 1;
        // arrays are equal now
        return 0;

      case SC.T_OBJECT:
        if (v.constructor.isComparable === YES) return v.constructor.compare(v, w);
        return 0;

      default:
        return 0;
    }
  },

  // ..........................................................
  // OBJECT MANAGEMENT
  //

  /**
    Empty function.  Useful for some operations.

    @returns {Object}
  */
  K: function() { return this; },

  /**
    Empty array.  Useful for some optimizations.

    @type Array
  */
  EMPTY_ARRAY: [],

  /**
    Empty hash.  Useful for some optimizations.

    @type Hash
  */
  EMPTY_HASH: {},

  /**
    Empty range. Useful for some optimizations.

    @type Range
  */
  EMPTY_RANGE: {start: 0, length: 0},

  /**
    Creates a new object with the passed object as its prototype.

    This method uses JavaScript's native inheritence method to create a new
    object.

    You cannot use beget() to create new SC.Object-based objects, but you
    can use it to beget Arrays, Hashes, Sets and objects you build yourself.
    Note that when you beget() a new object, this method will also call the
    didBeget() method on the object you passed in if it is defined.  You can
    use this method to perform any other setup needed.

    In general, you will not use beget() often as SC.Object is much more
    useful, but for certain rare algorithms, this method can be very useful.

    For more information on using beget(), see the section on beget() in
    Crockford's JavaScript: The Good Parts.

    @param {Object} obj the object to beget
    @returns {Object} the new object.
  */
  beget: function(obj) {
    if (obj === null || obj === undefined) return null ;
    var K = SC.K; K.prototype = obj ;
    var ret = new K();
    K.prototype = null ; // avoid leaks
    if (typeof obj.didBeget === "function") ret = obj.didBeget(ret);
    return ret ;
  },

  /**
    Creates a clone of the passed object.  This function can take just about
    any type of object and create a clone of it, including primitive values
    (which are not actually cloned because they are immutable).

    If the passed object implements the clone() method, then this function
    will simply call that method and return the result.

    @param {Object} object the object to clone
    @param {Boolean} deep if true, a deep copy of the object is made
    @returns {Object} the cloned object
  */
  copy: function(object, deep) {
    var ret = object, idx ;

    // fast paths
    if ( object ) {
      if ( object.isCopyable ) return object.copy( deep );
      if ( object.clone )      return object.clone();
    }

    switch ( jQuery.type(object) ) {
    case "array":
      ret = object.slice();

      if ( deep ) {
        idx = ret.length;
        while ( idx-- ) { ret[idx] = SC.copy( ret[idx], true ); }
      }
      break ;

    case "object":
      ret = {} ;
      for(var key in object) { ret[key] = deep ? SC.copy(object[key], true) : object[key] ; }
    }

    return ret ;
  },

  /**
    Returns a new object combining the values of all passed hashes.

    @param {Object...} object one or more objects
    @returns {Object} new Object
  */
  merge: function() {
    var ret = {}, len = arguments.length, idx;
    for(idx=0; idx<len; idx++) SC.mixin(ret, arguments[idx]);
    return ret ;
  },

  /**
    Returns all of the keys defined on an object or hash.  This is useful
    when inspecting objects for debugging.

    @param {Object} obj The Object
    @returns {Array} array of keys
  */
  keys: function(obj) {
    var ret = [];
    for(var key in obj) ret.push(key);
    return ret;
  },

  /**
    Convenience method to inspect an object.  This method will attempt to
    convert the object into a useful string description.
    
    @param {Object} obj The object you want to inspec.
    
    @returns {String} A description of the object
  */
  inspect: function(obj) {
    var v, ret = [] ;
    for(var key in obj) {
      v = obj[key] ;
      if (v === 'toString') continue ; // ignore useless items
      if (SC.typeOf(v) === SC.T_FUNCTION) v = "function() { ... }" ;
      ret.push(key + ": " + v) ;
    }
    return "{" + ret.join(" , ") + "}" ;
  },

  /**
    Returns a tuple containing the object and key for the specified property
    path.  If no object could be found to match the property path, then
    returns null.

    This is the standard method used throughout SproutCore to resolve property
    paths.

    @param {String} path the property path
    @param {Object} root optional parameter specifying the place to start
    @returns {Array} array with [object, property] if found or null
  */
  tupleForPropertyPath: function(path, root) {

    // if the passed path is itself a tuple, return it
    if (typeof path === "object" && (path instanceof Array)) return path ;

    // find the key.  It is the last . or first *
    var key ;
    var stopAt = path.indexOf('*') ;
    if (stopAt < 0) stopAt = path.lastIndexOf('.') ;
    key = (stopAt >= 0) ? path.slice(stopAt+1) : path ;

    // convert path to object.
    var obj = this.objectForPropertyPath(path, root, stopAt) ;
    return (obj && key) ? [obj,key] : null ;
  },

  /**
    Finds the object for the passed path or array of path components.  This is
    the standard method used in SproutCore to traverse object paths.

    @param {String} path the path
    @param {Object} root optional root object.  window is used otherwise
    @param {Integer} stopAt optional point to stop searching the path.
    @returns {Object} the found object or undefined.
  */
  objectForPropertyPath: function(path, root, stopAt) {

    var loc, nextDotAt, key, max ;

    if (!root) root = window ;

    // faster method for strings
    if (SC.typeOf(path) === SC.T_STRING) {
      if (stopAt === undefined) stopAt = path.length ;
      loc = 0 ;
      while((root) && (loc < stopAt)) {
        nextDotAt = path.indexOf('.', loc) ;
        if ((nextDotAt < 0) || (nextDotAt > stopAt)) nextDotAt = stopAt;
        key = path.slice(loc, nextDotAt);
        root = root.get ? root.get(key) : root[key] ;
        loc = nextDotAt+1;
      }
      if (loc < stopAt) root = undefined; // hit a dead end. :(

    // older method using an array
    } else {

      loc = 0; max = path.length; key = null;
      while((loc < max) && root) {
        key = path[loc++];
        if (key) root = (root.get) ? root.get(key) : root[key] ;
      }
      if (loc < max) root = undefined ;
    }

    return root ;
  },

  /**
   Acts very similar to SC.objectForPropertyPath(), the only difference is
   that it will throw an error when object can't be found.

    @param {String} path the path
    @param {Object} root optional root object.  window is used otherwise
    @param {Integer} stopAt optional point to stop searching the path.
    @returns {Object} the found object or throws an error.
  */
  requiredObjectForPropertyPath: function(path, root, stopAt) {
    var o = SC.objectForPropertyPath(path, root, stopAt);
    if(!o) {
      throw path + " could not be found";
    }
    return o;
  }

}); // end mixin

/** @private Alias for SC.clone() */
SC.clone = SC.copy ;

/** @private Alias for SC.A() */
SC.$A = SC.A;

/** @private Provided for compatibility with old HTML templates. */
SC.didLoad = SC.K ;

/** @private Used by SC.compare */
SC.ORDER_DEFINITION = [ SC.T_ERROR,
                        SC.T_UNDEFINED,
                        SC.T_NULL,
                        SC.T_BOOL,
                        SC.T_NUMBER,
                        SC.T_STRING,
                        SC.T_ARRAY,
                        SC.T_HASH,
                        SC.T_OBJECT,
                        SC.T_FUNCTION,
                        SC.T_CLASS ];

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/base.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same SC */

/**
  Adds a new module of unit tests to verify that the passed object implements
  the SC.Array interface.  To generate, call the ArrayTests array with a 
  test descriptor.  Any properties you pass will be applied to the ArrayTests
  descendent created by the create method.
  
  You should pass at least a newObject() method, which should return a new 
  instance of the object you want to have tested.  You can also implement the
  destroyObject() method, which should destroy a passed object.
  
      SC.ArrayTests.generate("Array", {
        newObject:  function() { return []; }
      });
  
  newObject must accept an optional array indicating the number of items
  that should be in the array.  You should initialize the the item with 
  that many items.  The actual objects you add are up to you.
  
  Unit tests themselves can be added by calling the define() method.  The
  function you pass will be invoked whenever the ArrayTests are generated. The
  parameter passed will be the instance of ArrayTests you should work with.
  
      SC.ArrayTests.define(function(T) {
        T.module("length");
      
        test("verify length", function() {
          var ary = T.newObject();
          equals(ary.get('length'), 0, 'should have 0 initial length');
        });
      }
*/

SC.TestSuite = /** @scope SC.TestSuite.prototype */ {

  /**
    Call this method to define a new test suite.  Pass one or more hashes of
    properties you want added to the new suite.  
    
    @param {Hash} attrs one or more attribute hashes
    @returns {SC.TestSuite} subclass of suite.
  */
  create: function(desc, attrs) {
    var len = arguments.length,
        ret = SC.beget(this),
        idx;
        
    // copy any attributes
    for(idx=1;idx<len;idx++) SC.mixin(ret, arguments[idx]);
    
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
    @returns {SC.TestSuite} suite instance
  */
  generate: function(desc, attrs) {
    var len = arguments.length,
        ret = SC.beget(this),
        idx, defs;
        
    // apply attributes - skip first argument b/c it is a string
    for(idx=1;idx<len;idx++) SC.mixin(ret, arguments[idx]);    
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
    @returns {SC.TestSuite} receiver
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
    @returns {SC.TestSuite} receiver
  */
  module: function(desc) {
    var T = this ;
    module(T.desc(desc), {
      setup: function() { T.setup(); },
      teardown: function() { T.teardown(); }
    });
  }
  
};

SC.ArraySuite = SC.TestSuite.create("Verify SC.Array compliance: %@#%@", {
  
  /** 
    Override to return a set of simple values such as numbers or strings.
    Return null if your set does not support primitives.
  */
  simple: function(amt) {
    var ret = [];
    if (amt === undefined) amt = 0;
    while(--amt >= 0) ret[amt] = amt ;
    return ret ;
  },

  /**  Override with the name of the key we should get/set on hashes */
  hashValueKey: 'foo',
  
  /**
    Override to return hashes of values if supported.  Or return null.
  */
  hashes: function(amt) {
    var ret = [];  
    if (amt === undefined) amt = 0;
    while(--amt >= 0) {
      ret[amt] = {};
      ret[amt][this.hashValueKey] = amt ;
    }
    return ret ;
  },
  
  /** Override with the name of the key we should get/set on objects */
  objectValueKey: "foo",
  
  /**
    Override to return observable objects if supported.  Or return null.
  */
  objects: function(amt) {
    var ret = [];  
    if (amt === undefined) amt = 0;
    while(--amt >= 0) {
      var o = {};
      o[this.objectValueKey] = amt ;
      ret[amt] = SC.Object.create(o);
    }
    return ret ;
  },

  /**
    Returns an array of content items in your preferred format.  This will
    be used whenever the test does not care about the specific object content.
  */
  expected: function(amt) {
    return this.simple(amt);
  },
  
  /**
    Example of how to implement newObject
  */
  newObject: function(expected) {
    if (!expected || SC.typeOf(expected) === SC.T_NUMBER) {
      expected = this.expected(expected);
    }
    
    return expected.slice();
  },
  
  
  /**
    Creates an observer object for use when tracking object modifications.
  */
  observer: function(obj) {
    return SC.Object.create({

      // ..........................................................
      // NORMAL OBSERVER TESTING
      // 
      
      observer: function(target, key, value) {
        this.notified[key] = true ;
        this.notifiedValue[key] = value ;
      },

      resetObservers: function() {
        this.notified = {} ;
        this.notifiedValue = {} ;
      },

      observe: function() {
        var keys = SC.$A(arguments) ;
        var loc = keys.length ;
        while(--loc >= 0) {
          obj.addObserver(keys[loc], this, this.observer) ;
        }
        return this ;
      },

      didNotify: function(key) {
        return !!this.notified[key] ;
      },

      init: function() {
        arguments.callee.base.apply(this,arguments) ;
        this.resetObservers() ;
      },
      
      // ..........................................................
      // RANGE OBSERVER TESTING
      // 
      
      callCount: 0,

      // call afterward to verify
      expectRangeChange: function(source, object, key, indexes, context) {
        equals(this.callCount, 1, 'expects one callback');
        
        if (source !== undefined && source !== NO) {
          ok(this.source, source, 'source should equal array');
        }
        
        if (object !== undefined && object !== NO) {
          equals(this.object, object, 'object');
        }
        
        if (key !== undefined && key !== NO) {
          equals(this.key, key, 'key');
        }
        
        if (indexes !== undefined && indexes !== NO) {
          if (indexes.isIndexSet) {
            ok(this.indexes && this.indexes.isIndexSet, 'indexes should be index set');
            ok(indexes.isEqual(this.indexes), 'indexes should match %@ (actual: %@)'.fmt(indexes, this.indexes));
          } else equals(this.indexes, indexes, 'indexes');
        }
          
        if (context !== undefined && context !== NO) {
          equals(this.context, context, 'context should match');
        }
        
      },
      
      rangeDidChange: function(source, object, key, indexes, context) {
        this.callCount++ ;
        this.source = source ;
        this.object = object ;
        this.key    = key ;
        
        // clone this because the index set may be reused after this callback
        // runs.
        this.indexes = (indexes && indexes.isIndexSet) ? indexes.clone() : indexes;
        this.context = context ;          
      }
      
    });  
  },
  
  /**
    Verifies that the passed object matches the passed array.
  */
  validateAfter: function(obj, after, observer, lengthDidChange, enumerableDidChange) {
    var loc = after.length;
    equals(obj.get('length'), loc, 'length should update (%@)'.fmt(obj)) ;
    while(--loc >= 0) {
      equals(obj.objectAt(loc), after[loc], 'objectAt(%@)'.fmt(loc)) ;
    }

    // note: we only test that the length notification happens when we expect
    // it.  If we don't expect a length notification, it is OK for a class
    // to trigger a change anyway so we don't check for this case.
    if (enumerableDidChange !== NO) {
      equals(observer.didNotify("[]"), YES, 'should notify []') ;
    }
    
    if (lengthDidChange) {
      equals(observer.didNotify('length'), YES, 'should notify length change');
    }
  }
  
});

// Simple verfication of length
SC.ArraySuite.define(function(T) {
  T.module("length");
  
  test("should return 0 on empty array", function() {
    equals(T.object.get('length'), 0, 'should have empty length');
  });
  
  test("should return array length", function() {
    var obj = T.newObject(3);
    equals(obj.get('length'), 3, 'should return length');
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/indexOf.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  T.module("indexOf");
  
  test("should return index of object", function() {
    var expected = T.expected(3), 
        obj      = T.newObject(3), 
        len      = 3,
        idx;
        
    for(idx=0;idx<len;idx++) {
      equals(obj.indexOf(expected[idx]), idx, 'obj.indexOf(%@) should match idx'.fmt(expected[idx]));
    }
    
  });
  
  test("should return -1 when requesting object not in index", function() {
    var obj = T.newObject(3), foo = {};
    equals(obj.indexOf(foo), -1, 'obj.indexOf(foo) should be < 0');
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/insertAt.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("insertAt"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[].insertAt(0, X) => [X] + notify", function() {

    var after = T.expected(1);
    
    observer.observe('[]') ;
    obj.insertAt(0, after) ;
    T.validateAfter(obj, after, observer);
  });
  
  test("[].insertAt(200,X) => OUT_OF_RANGE_EXCEPTION exception", function() {
    var didThrow = NO ;
    try {
      obj.insertAt(200, T.expected(1));
    } catch (e) {
      equals(e, SC.OUT_OF_RANGE_EXCEPTION, 'should throw SC.OUT_OF_RANGE_EXCEPTION');
      didThrow = YES ;
    }
    ok(didThrow, 'should raise exception');
  });

  test("[A].insertAt(0, X) => [X,A] + notify", function() {
    var exp = T.expected(2), 
        before  = exp.slice(0,1),
        replace = exp[1],
        after   = [replace, before[0]];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(0, replace);
    T.validateAfter(obj, after, observer);
  });
  
  test("[A].insertAt(1, X) => [A,X] + notify", function() {
    var exp = T.expected(2), 
        before  = exp.slice(0,1),
        replace = exp[1],
        after   = [before[0], replace];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(1, replace);
    T.validateAfter(obj, after, observer);
  });

  test("[A].insertAt(200,X) => OUT_OF_RANGE exception", function() {
    obj.replace(0,0, T.expected(1)); // add an item
    
    var didThrow = NO ;
    try {
      obj.insertAt(200, T.expected(1));
    } catch (e) {
      equals(e, SC.OUT_OF_RANGE_EXCEPTION, 'should throw SC.OUT_OF_RANGE_EXCEPTION');
      didThrow = YES ;
    }
    ok(didThrow, 'should raise exception');
  });
  
  test("[A,B,C].insertAt(0,X) => [X,A,B,C] + notify", function() {
    var exp = T.expected(4), 
        before  = exp.slice(1),
        replace = exp[0],
        after   = [replace, before[0], before[1], before[2]];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(0, replace);
    T.validateAfter(obj, after, observer);
  });
  
  test("[A,B,C].insertAt(1,X) => [A,X,B,C] + notify", function() {
    var exp = T.expected(4), 
        before  = exp.slice(1),
        replace = exp[0],
        after   = [before[0], replace, before[1], before[2]];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(1, replace);
    T.validateAfter(obj, after, observer);
  });

  test("[A,B,C].insertAt(3,X) => [A,B,C,X] + notify", function() {
    var exp = T.expected(4), 
        before  = exp.slice(1),
        replace = exp[0],
        after   = [before[0], before[1], before[2], replace];
    
    obj.replace(0,0,before);
    observer.observe('[]');
    
    obj.insertAt(3, replace);
    T.validateAfter(obj, after, observer);
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/objectAt.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  T.module("objectAt");
  
  test("should return object at specified index", function() {
    var expected = T.expected(3), 
        obj      = T.newObject(3), 
        len      = 3,
        idx;
        
    for(idx=0;idx<len;idx++) {
      equals(obj.objectAt(idx), expected[idx], 'obj.objectAt(%@) should match'.fmt(idx));
    }
    
  });
  
  test("should return undefined when requesting objects beyond index", function() {
    var obj = T.newObject(3);
    equals(obj.objectAt(5), undefined, 'should return undefined for obj.objectAt(5) when len = 3');
    equals(T.object.objectAt(0), undefined, 'should return undefined for obj.objectAt(0) when len = 0');
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/popObject.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("popObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[].popObject() => [] + returns undefined + NO notify", function() {
    observer.observe('[]', 'length') ;
    equals(obj.popObject(), undefined, 'should return undefined') ;
    T.validateAfter(obj, [], observer, NO, NO);
  });

  test("[X].popObject() => [] + notify", function() {
    var exp = T.expected(1)[0];
    
    obj.replace(0,0, [exp]);
    observer.observe('[]', 'length') ;

    equals(obj.popObject(), exp, 'should return popped object') ;
    T.validateAfter(obj, [], observer, YES, YES);
  });

  test("[A,B,C].popObject() => [A,B] + notify", function() {
    var before  = T.expected(3),
        value   = before[2],
        after   = before.slice(0,2);
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    equals(obj.popObject(), value, 'should return popped object') ;
    T.validateAfter(obj, after, observer, YES);
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/pushObject.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("pushObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("returns pushed object", function() {
    var exp = T.expected(1)[0];
    equals(obj.pushObject(exp), exp, 'should return receiver');
  });
  
  test("[].pushObject(X) => [X] + notify", function() {
    var exp = T.expected(1);
    observer.observe('[]', 'length') ;
    obj.pushObject(exp[0]) ;
    T.validateAfter(obj, exp, observer, YES);
  });

  test("[A,B,C].pushObject(X) => [A,B,C,X] + notify", function() {
    var after  = T.expected(4),
        before = after.slice(0,3),
        value  = after[3];
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    obj.pushObject(value) ;
    T.validateAfter(obj, after, observer, YES);
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/rangeObserver.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {

  var expected, array, observer, rangeObserver ;

  // ..........................................................
  // MODULE: isDeep = YES
  //
  module(T.desc("RangeObserver Methods"), {
    setup: function() {
      expected = T.objects(10);
      array = T.newObject(expected);

      observer = T.observer();
      rangeObserver = array.addRangeObserver(SC.IndexSet.create(2,3),
                observer, observer.rangeDidChange, null, NO);

    },

    teardown: function() {
      T.destroyObject(array);
    }
  });

  test("returns RangeObserver object", function() {
    ok(rangeObserver && rangeObserver.isRangeObserver, 'returns a range observer object');
  });

  // NOTE: Deep Property Observing is disabled for SproutCore 1.0
  //
  // // ..........................................................
  // // EDIT PROPERTIES
  // //
  //
  // test("editing property on object in range should fire observer", function() {
  //   var obj = array.objectAt(3);
  //   obj.set('foo', 'BAR');
  //   observer.expectRangeChange(array, obj, 'foo', SC.IndexSet.create(3));
  // });
  //
  // test("editing property on object outside of range should NOT fire observer", function() {
  //   var obj = array.objectAt(0);
  //   obj.set('foo', 'BAR');
  //   equals(observer.callCount, 0, 'observer should not fire');
  // });
  //
  //
  // test("updating property after changing observer range", function() {
  //   array.updateRangeObserver(rangeObserver, SC.IndexSet.create(8,2));
  //   observer.callCount = 0 ;// reset b/c callback should happen here
  //
  //   var obj = array.objectAt(3);
  //   obj.set('foo', 'BAR');
  //   equals(observer.callCount, 0, 'modifying object in old range should not fire observer');
  //
  //   obj = array.objectAt(9);
  //   obj.set('foo', 'BAR');
  //   observer.expectRangeChange(array, obj, 'foo', SC.IndexSet.create(9));
  //
  // });
  //
  // test("updating a property after removing an range should not longer update", function() {
  //   array.removeRangeObserver(rangeObserver);
  //
  //   observer.callCount = 0 ;// reset b/c callback should happen here
  //
  //   var obj = array.objectAt(3);
  //   obj.set('foo', 'BAR');
  //   equals(observer.callCount, 0, 'modifying object in old range should not fire observer');
  //
  // });

  // ..........................................................
  // REPLACE
  //

  test("replacing object in range fires observer with index set covering only the effected item", function() {
    array.replace(2, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', SC.IndexSet.create(2,1));
  });

  test("replacing object before range", function() {
    array.replace(0, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');
  });

  test("replacing object after range", function() {
    array.replace(9, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');
  });

  test("updating range should be reflected by replace operations", function() {
    array.updateRangeObserver(rangeObserver, SC.IndexSet.create(9,1));

    observer.callCount = 0 ;
    array.replace(2, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(0, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(9, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', SC.IndexSet.create(9));
  });

  test("removing range should no longer fire observers", function() {
    array.removeRangeObserver(rangeObserver);

    observer.callCount = 0 ;
    array.replace(2, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(0, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(9, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');
  });

  // ..........................................................
  // GROUPED CHANGES
  //

  test("grouping property changes should notify observer only once at end with single IndexSet", function() {

    array.beginPropertyChanges();
    array.replace(2, 1, T.objects(1));
    array.replace(4, 1, T.objects(1));
    array.endPropertyChanges();

    var set = SC.IndexSet.create().add(2).add(4); // both edits
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("should notify observer when some but not all grouped changes are inside range", function() {

    array.beginPropertyChanges();
    array.replace(2, 1, T.objects(1));
    array.replace(9, 1, T.objects(1));
    array.endPropertyChanges();

    var set = SC.IndexSet.create().add(2).add(9); // both edits
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("should NOT notify observer when grouping changes all outside of observer", function() {

    array.beginPropertyChanges();
    array.replace(0, 1, T.objects(1));
    array.replace(9, 1, T.objects(1));
    array.endPropertyChanges();

    equals(observer.callCount, 0, 'observer should not fire');
  });

  // ..........................................................
  // INSERTING
  //

  test("insertAt in range fires observer with index set covering edit to end of array", function() {
    var newItem = T.objects(1)[0],
        set     = SC.IndexSet.create(3,array.get('length')-2);

    array.insertAt(3, newItem);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("insertAt BEFORE range fires observer with index set covering edit to end of array", function() {
    var newItem = T.objects(1)[0],
        set     = SC.IndexSet.create(0,array.get('length')+1);

    array.insertAt(0, newItem);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("insertAt AFTER range does not fire observer", function() {
    var newItem = T.objects(1)[0];

    array.insertAt(9, newItem);
    equals(observer.callCount, 0, 'observer should not fire');
  });

  // ..........................................................
  // REMOVING
  //

  test("removeAt IN range fires observer with index set covering edit to end of array plus delta", function() {
    var set     = SC.IndexSet.create(3,array.get('length')-3);
    array.removeAt(3);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("removeAt BEFORE range fires observer with index set covering edit to end of array plus delta", function() {
    var set     = SC.IndexSet.create(0,array.get('length'));
    array.removeAt(0);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("removeAt AFTER range does not fire observer", function() {
    array.removeAt(9);
    equals(observer.callCount, 0, 'observer should not fire');
  });




  // ..........................................................
  // MODULE: No explicit range
  //
  module(T.desc("RangeObserver Methods - No explicit range"), {
    setup: function() {
      expected = T.objects(10);
      array = T.newObject(expected);

      observer = T.observer();
      rangeObserver = array.addRangeObserver(null, observer,
                          observer.rangeDidChange, null, NO);

    },

    teardown: function() {
      T.destroyObject(array);
    }
  });

  test("returns RangeObserver object", function() {
    ok(rangeObserver && rangeObserver.isRangeObserver, 'returns a range observer object');
  });

  // ..........................................................
  // REPLACE
  //

  test("replacing object in range fires observer with index set covering only the effected item", function() {
    array.replace(2, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', SC.IndexSet.create(2,1));
  });

  test("replacing at start of array", function() {
    array.replace(0, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', SC.IndexSet.create(0,1));
  });

  test("replacing object at end of array", function() {
    array.replace(9, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', SC.IndexSet.create(9,1));
  });

  test("removing range should no longer fire observers", function() {
    array.removeRangeObserver(rangeObserver);

    observer.callCount = 0 ;
    array.replace(2, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(0, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');

    observer.callCount = 0 ;
    array.replace(9, 1, T.objects(1));
    equals(observer.callCount, 0, 'observer should not fire');
  });

  // ..........................................................
  // GROUPED CHANGES
  //

  test("grouping property changes should notify observer only once at end with single IndexSet", function() {

    array.beginPropertyChanges();
    array.replace(2, 1, T.objects(1));
    array.replace(4, 1, T.objects(1));
    array.endPropertyChanges();

    var set = SC.IndexSet.create().add(2).add(4); // both edits
    observer.expectRangeChange(array, null, '[]', set);
  });

  // ..........................................................
  // INSERTING
  //

  test("insertAt in range fires observer with index set covering edit to end of array", function() {
    var newItem = T.objects(1)[0],
        set     = SC.IndexSet.create(3,array.get('length')-2);

    array.insertAt(3, newItem);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("adding object fires observer", function() {
    var newItem = T.objects(1)[0];
    var set = SC.IndexSet.create(array.get('length'));

    array.pushObject(newItem);
    observer.expectRangeChange(array, null, '[]', set);
  });

  // ..........................................................
  // REMOVING
  //

  test("removeAt fires observer with index set covering edit to end of array", function() {
    var set     = SC.IndexSet.create(3,array.get('length')-3);
    array.removeAt(3);
    observer.expectRangeChange(array, null, '[]', set);
  });

  test("popObject fires observer with index set covering removed range", function() {
    var set = SC.IndexSet.create(array.get('length')-1);
    array.popObject();
    observer.expectRangeChange(array, null, '[]', set);
  });


  // ..........................................................
  // MODULE: isDeep = NO
  //
  module(T.desc("RangeObserver Methods - isDeep NO"), {
    setup: function() {
      expected = T.objects(10);
      array = T.newObject(expected);

      observer = T.observer();
      rangeObserver = array.addRangeObserver(SC.IndexSet.create(2,3),
                observer, observer.rangeDidChange, null, NO);

    },

    teardown: function() {
      T.destroyObject(array);
    }
  });

  test("editing property on object at any point should not fire observer", function() {

    var indexes = [0,3,9],
        loc     = 3,
        obj,idx;

    while(--loc>=0) {
      idx = indexes[loc];
      obj = array.objectAt(idx);
      obj.set('foo', 'BAR');
      equals(observer.callCount, 0, 'observer should not fire when editing object at index %@'.fmt(idx));
    }
  });

  test("replacing object in range fires observer with index set", function() {
    array.replace(2, 1, T.objects(1));
    observer.expectRangeChange(array, null, '[]', SC.IndexSet.create(2,1));
  });


});


/* >>>>>>>>>> BEGIN source/debug/test_suites/array/removeAt.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("removeAt"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[X].removeAt(0) => [] + notify", function() {

    var before = T.expected(1);
    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(0) ;
    T.validateAfter(obj, [], observer, YES);
  });
  
  test("[].removeAt(200) => OUT_OF_RANGE_EXCEPTION exception", function() {
    var didThrow = NO ;
    try {
      obj.removeAt(200);
    } catch (e) {
      equals(e, SC.OUT_OF_RANGE_EXCEPTION, 'should throw SC.OUT_OF_RANGE_EXCEPTION');
      didThrow = YES ;
    }
    ok(didThrow, 'should raise exception');
  });

  test("[A,B].removeAt(0) => [B] + notify", function() {
    var before = T.expected(2), 
        after   = [before[1]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(0);
    T.validateAfter(obj, after, observer, YES);
  });

  test("[A,B].removeAt(1) => [A] + notify", function() {
    var before = T.expected(2), 
        after   = [before[0]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(1);
    T.validateAfter(obj, after, observer, YES);
  });

  test("[A,B,C].removeAt(1) => [A,C] + notify", function() {
    var before = T.expected(3), 
        after   = [before[0], before[2]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(1);
    T.validateAfter(obj, after, observer, YES);
  });
  
  test("[A,B,C,D].removeAt(1,2) => [A,D] + notify", function() {
    var before = T.expected(4), 
        after   = [before[0], before[3]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(1,2);
    T.validateAfter(obj, after, observer, YES);
  });

  test("[A,B,C,D].removeAt(IndexSet<0,2-3>) => [B] + notify", function() {
    var before = T.expected(4), 
        after   = [before[1]];
    
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    
    obj.removeAt(SC.IndexSet.create(0).add(2,2));
    T.validateAfter(obj, after, observer, YES);
  });
  
});


/* >>>>>>>>>> BEGIN source/debug/test_suites/array/removeObject.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("removeObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("should return receiver", function() {
    obj = T.newObject(3);
    equals(obj.removeObject(obj.objectAt(0)), obj, 'should return receiver');
  });
  
  test("[A,B,C].removeObject(B) => [A,C] + notify", function() {

    var before = T.expected(3),
        after  = [before[0], before[2]];
    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
    
    obj.removeObject(before[1]) ;
    T.validateAfter(obj, after, observer, YES);
  });
  
  test("[A,B,C].removeObject(D) => [A,B,C]", function() {
    var exp = T.expected(4),
        extra = exp.pop();
    obj.replace(0,0,exp);
    observer.observe('[]', 'length') ;
    
    obj.removeObject(extra);
    T.validateAfter(obj, exp, observer, NO, NO);
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/replace.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("replace"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });
  
  test("[].replace(0,0,'X') => ['X'] + notify", function() {

    var exp = T.expected(1);
    
    observer.observe('[]', 'length') ;
    obj.replace(0,0,exp) ;

    T.validateAfter(obj, exp, observer, YES);
  });

  test("[A,B,C,D].replace(1,2,X) => [A,X,D] + notify", function() {
    
    var exp = T.expected(5), 
        before = exp.slice(0,4),
        replace = exp.slice(4),
        after = [before[0], replace[0], before[3]];
        
    obj.replace(0,0, before) ; // precond
    observer.observe('[]', 'length') ;

    obj.replace(1,2,replace) ;

    T.validateAfter(obj, after, observer, YES);
  });

  test("[A,B,C,D].replace(1,2,[X,Y]) => [A,X,Y,D] + notify", function() {
    
    // setup the before, after, and replace arrays.  Use generated objects
    var exp  = T.expected(6),
        before  = exp.slice(0, 4),
        replace = exp.slice(4),
        after   = [before[0], replace[0], replace[1], before[3]]; 
        
    obj.replace(0,0, before) ;
    observer.observe('[]', 'length') ;

    obj.replace(1,2, replace) ;

    T.validateAfter(obj, after, observer, YES);
  });
  
  test("[A,B].replace(1,0,[X,Y]) => [A,X,Y,B] + notify", function() {

    // setup the before, after, and replace arrays.  Use generated objects
    var exp  = T.expected(4),
        before  = exp.slice(0, 2),
        replace = exp.slice(2),
        after   = [before[0], replace[0], replace[1], before[1]] ;

    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
  
    obj.replace(1,0, replace) ;
    
    T.validateAfter(obj, after, observer, YES);
  });
  
  test("[A,B,C,D].replace(2,2) => [A,B] + notify", function() {

    // setup the before, after, and replace arrays.  Use generated objects
    var before  = T.expected(4),
        after   = [before[0], before[1]];

    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
  
    obj.replace(2,2) ;
    
    T.validateAfter(obj, after, observer, YES);
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/shiftObject.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("shiftObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[].shiftObject() => [] + returns undefined + NO notify", function() {
    observer.observe('[]', 'length') ;
    equals(obj.shiftObject(), undefined, 'should return undefined') ;
    T.validateAfter(obj, [], observer, NO, NO);
  });

  test("[X].shiftObject() => [] + notify", function() {
    var exp = T.expected(1)[0];
    
    obj.replace(0,0, [exp]);
    observer.observe('[]', 'length') ;

    equals(obj.shiftObject(), exp, 'should return shifted object') ;
    T.validateAfter(obj, [], observer, YES, YES);
  });

  test("[A,B,C].shiftObject() => [B,C] + notify", function() {
    var before  = T.expected(3),
        value   = before[0],
        after   = before.slice(1);
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    equals(obj.shiftObject(), value, 'should return shifted object') ;
    T.validateAfter(obj, after, observer, YES);
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/unshiftObject.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("unshiftObject"), {
    setup: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("returns unshifted object", function() {
    var exp = T.expected(1)[0];
    equals(obj.pushObject(exp), exp, 'should return receiver');
  });
  

  test("[].unshiftObject(X) => [X] + notify", function() {
    var exp = T.expected(1);
    observer.observe('[]', 'length') ;
    obj.unshiftObject(exp[0]) ;
    T.validateAfter(obj, exp, observer, YES);
  });

  test("[A,B,C].unshiftObject(X) => [X,A,B,C] + notify", function() {
    var after  = T.expected(4),
        before = after.slice(1),
        value  = after[0];
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    obj.unshiftObject(value) ;
    T.validateAfter(obj, after, observer, YES);
  });
  
});

/* >>>>>>>>>> BEGIN source/debug/test_suites/array.js */
// Convenience file for requiring all of the ArraySuite

sc_require('debug/test_suites/array/base');
sc_require('debug/test_suites/array/indexOf');
sc_require('debug/test_suites/array/insertAt');
sc_require('debug/test_suites/array/objectAt');
sc_require('debug/test_suites/array/popObject');
sc_require('debug/test_suites/array/pushObject');
sc_require('debug/test_suites/array/rangeObserver');
sc_require('debug/test_suites/array/removeAt');
sc_require('debug/test_suites/array/removeObject');
sc_require('debug/test_suites/array/replace');
sc_require('debug/test_suites/array/shiftObject');
sc_require('debug/test_suites/array/unshiftObject');

/* >>>>>>>>>> BEGIN source/debug/test_suites/array/flatten.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

sc_require('debug/test_suites/array/base');

SC.ArraySuite.define(function(T) {

  T.module("flatten");

  test("should return flattened arrays", function() {
    var expected = [1,2,3,4,'a'],
        obj      = T.newObject([1,2,[3,[4]],'a']);

    expected.forEach(function(i,idx) {
      equals(obj.flatten().objectAt(idx), i,'obj.flatten().objectAt(%@) should match %@'.fmt(idx,i));
    });
  });
});

/* >>>>>>>>>> BEGIN source/system/function.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
*/
SC.Function = /** @scope SC.Function.prototype */{

  /**
    @see Function.prototype.property
  */
  property: function(fn, keys) {
    fn.dependentKeys = SC.$A(keys) ;
    var guid = SC.guidFor(fn) ;
    fn.cacheKey = "__cache__" + guid ;
    fn.lastSetValueKey = "__lastValue__" + guid ;
    fn.isProperty = true ;
    return fn ;
  },

  /**
    @see Function.prototype.cacheable
  */
  cacheable: function(fn, aFlag) {
    fn.isProperty = true ;  // also make a property just in case
    if (!fn.dependentKeys) fn.dependentKeys = [] ;
    fn.isCacheable = (aFlag === undefined) ? true : aFlag ;
    return fn ;
  },

  /**
    @see Function.prototype.idempotent
  */
  idempotent: function(fn, aFlag) {
    fn.isProperty = true;  // also make a property just in case
    if (!fn.dependentKeys) this.dependentKeys = [] ;
    fn.isVolatile = (aFlag === undefined) ? true : aFlag ;
    return fn ;
  },

  /**
    @see Function.prototype.enhance
  */
  enhance: function(fn) {
    fn.isEnhancement = true;
    return fn ;
  },

  /**
    @see Function.prototype.observes
  */
  observes: function(fn, propertyPaths) {
    // sort property paths into local paths (i.e just a property name) and
    // full paths (i.e. those with a . or * in them)
    var loc = propertyPaths.length, local = null, paths = null ;
    while(--loc >= 0) {
      var path = propertyPaths[loc] ;
      // local
      if ((path.indexOf('.')<0) && (path.indexOf('*')<0)) {
        if (!local) local = fn.localPropertyPaths = [] ;
        local.push(path);

      // regular
      } else {
        if (!paths) paths = fn.propertyPaths = [] ;
        paths.push(path) ;
      }
    }
    return fn ;
  }

};

/* >>>>>>>>>> BEGIN source/ext/function.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/function');

SC.mixin(Function.prototype,
/** @lends Function.prototype */ {

  /**
    Indicates that the function should be treated as a computed property.

    Computed properties are methods that you want to treat as if they were
    static properties.  When you use get() or set() on a computed property,
    the object will call the property method and return its value instead of
    returning the method itself.  This makes it easy to create "virtual
    properties" that are computed dynamically from other properties.

    Consider the following example:

          contact = SC.Object.create({

            firstName: "Charles",
            lastName: "Jolley",

            // This is a computed property!
            fullName: function() {
              return this.getEach('firstName','lastName').compact().join(' ') ;
            }.property('firstName', 'lastName'),

            // this is not
            getFullName: function() {
              return this.getEach('firstName','lastName').compact().join(' ') ;
            }
          });

          contact.get('firstName') ;
          --> "Charles"

          contact.get('fullName') ;
          --> "Charles Jolley"

          contact.get('getFullName') ;
          --> function()

    Note that when you get the fullName property, SproutCore will call the
    fullName() function and return its value whereas when you get() a property
    that contains a regular method (such as getFullName above), then the
    function itself will be returned instead.

    Using Dependent Keys
    ----

    Computed properties are often computed dynamically from other member
    properties.  Whenever those properties change, you need to notify any
    object that is observing the computed property that the computed property
    has changed also.  We call these properties the computed property is based
    upon "dependent keys".

    For example, in the contact object above, the fullName property depends on
    the firstName and lastName property.  If either property value changes,
    any observer watching the fullName property will need to be notified as
    well.

    You inform SproutCore of these dependent keys by passing the key names
    as parameters to the property() function.  Whenever the value of any key
    you name here changes, the computed property will be marked as changed
    also.

    You should always register dependent keys for computed properties to
    ensure they update.

    Sometimes you may need to depend on keys that are several objects deep. In
    that case, you can provide a path to property():

        capitalizedName: function() {
          return this.getPath('person.fullName').toUpper();
        }.property('person.firstName')

    This will cause observers of +capitalizedName+ to be fired when either
    +fullName+ _or_ +person+ changes.

    Using Computed Properties as Setters
    ---

    Computed properties can be used to modify the state of an object as well
    as to return a value.  Unlike many other key-value system, you use the
    same method to both get and set values on a computed property.  To
    write a setter, simply declare two extra parameters: key and value.

    Whenever your property function is called as a setter, the value
    parameter will be set.  Whenever your property is called as a getter the
    value parameter will be undefined.

    For example, the following object will split any full name that you set
    into a first name and last name components and save them.

          contact = SC.Object.create({

            fullName: function(key, value) {
              if (value !== undefined) {
                var parts = value.split(' ') ;
                this.beginPropertyChanges()
                  .set('firstName', parts[0])
                  .set('lastName', parts[1])
                .endPropertyChanges() ;
              }
              return this.getEach('firstName', 'lastName').compact().join(' ');
            }.property('firstName','lastName')

          }) ;

    Why Use The Same Method for Getters and Setters?
    ---

    Most property-based frameworks expect you to write two methods for each
    property but SproutCore only uses one. We do this because most of the time
    when you write a setter is is basically a getter plus some extra work.
    There is little added benefit in writing both methods when you can
    conditionally exclude part of it. This helps to keep your code more
    compact and easier to maintain.

    @param {String...} dependentKeys optional set of dependent keys
    @returns {Function} the declared function instance
  */
  property: function() {
    return SC.Function.property(this, arguments);
  },

  /**
    You can call this method on a computed property to indicate that the
    property is cacheable (or not cacheable).  By default all computed
    properties are not cached.  Enabling this feature will allow SproutCore
    to cache the return value of your computed property and to use that
    value until one of your dependent properties changes or until you
    invoke propertyDidChange() and name the computed property itself.

    If you do not specify this option, computed properties are assumed to be
    not cacheable.

    @param {Boolean} aFlag optionally indicate cacheable or no, default YES
    @returns {Function} receiver, useful for chaining calls.
  */
  cacheable: function(aFlag) {
    return SC.Function.cacheable(this, aFlag);
  },

  /**
    Indicates that the computed property is volatile.  Normally SproutCore
    assumes that your computed property is idempotent.  That is, calling
    set() on your property more than once with the same value has the same
    effect as calling it only once.

    All non-computed properties are idempotent and normally you should make
    your computed properties behave the same way.  However, if you need to
    make your property change its return value everytime your method is
    called, you may chain this to your property to make it volatile.

    If you do not specify this option, properties are assumed to be
    non-volatile.

    @param {Boolean} aFlag optionally indicate state, default to YES
    @returns {Function} receiver, useful for chaining calls.
  */
  idempotent: function(aFlag) {
    return SC.Function.idempotent(this, aFlag);
  },

  enhance: function() {
    return SC.Function.enhance(this);
  },

  /**
    Declare that a function should observe an object or property at the named
    path.  Note that the path is used only to construct the observation one time.

    @param {String...} propertyPaths A list of strings which indicate the
      properties being observed

    @returns {Function} receiver, useful for chaining calls.
  */
  observes: function(propertyPaths) {
    return SC.Function.observes(this, arguments);
  }

});

/* >>>>>>>>>> BEGIN source/private/observer_set.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// ........................................................................
// ObserverSet
//

/**
  @namespace

  This private class is used to store information about obversers on a
  particular key.  Note that this object is not observable.  You create new
  instances by calling SC.beget(SC.ObserverSet) ;

  @private
  @since SproutCore 1.0
*/
SC.ObserverSet = {

  /**
    Adds the named target/method observer to the set.  The method must be
    a function, not a string.

    Note that in debugging mode only, this method is overridden to also record
    the name of the object and function that resulted in the target/method
    being added.
  */
  add: function(target, method, context) {
    var targetGuid = SC.guidFor(target), methodGuid = SC.guidFor(method);
    var targets = this._members, members = this.members;

    // get the set of methods
    var indexes = targets[targetGuid];
    if ( !indexes ) indexes = targets[targetGuid] = {};

    if (indexes[methodGuid] === undefined) indexes[methodGuid] = members.length;
    else return;

    members.push([target, method, context]);
  },

  /**
    removes the named target/method observer from the set.  If this is the
    last method for the named target, then the number of targets will also
    be reduced.

    returns YES if the items was removed, NO if it was not found.
  */
  remove: function(target, method) {
    var targetGuid = SC.guidFor(target), methodGuid = SC.guidFor(method);
    var indexes = this._members[targetGuid], members = this.members;

    if( !indexes ) return false;

    var index = indexes[methodGuid];
    if ( index === undefined) return false;

    if (index !== members.length - 1) {
      var entry = (members[index] = members[members.length - 1]);
      this._members[SC.guidFor(entry[0])][SC.guidFor(entry[1])] = index;
    }

    members.pop();
    delete this._members[targetGuid][methodGuid];

    return true;
  },

  /**
    Invokes the target/method pairs in the receiver.  Used by SC.RunLoop
    Note: does not support context
  */
  invokeMethods: function() {
    var members = this.members, member;

    for( var i=0, l=members.length; i<l; i++ ) {
      member = members[i];

      // method.call(target);
      member[1].call(member[0]);
    }
  },

  /**
    Returns a new instance of the set with the contents cloned.
  */
  clone: function() {
    var newSet = SC.ObserverSet.create(), memberArray = this.members;

    newSet._members = SC.clone(this._members);
    var newMembers = newSet.members;

    for( var i=0, l=memberArray.length; i<l; i++ ) {
      newMembers[i] = SC.clone(memberArray[i]);
      newMembers[i].length = 3;
    }

    return newSet;
  },

  /**
    Creates a new instance of the observer set.
  */
  create: function() {
    return new SC.ObserverSet.constructor();
  },

  getMembers: function() {
    return this.members.slice(0);
  },

  constructor: function() {
    this._members = {};
    this.members = [];
  }

} ;
SC.ObserverSet.constructor.prototype = SC.ObserverSet;
SC.ObserverSet.slice = SC.ObserverSet.clone ;


/* >>>>>>>>>> BEGIN source/private/chain_observer.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// ........................................................................
// CHAIN OBSERVER
//

// This is a private class used by the observable mixin to support chained
// properties.

// ChainObservers are used to automatically monitor a property several
// layers deep.
// org.plan.name = SC._ChainObserver.create({
//    target: this, property: 'org',
//    next: SC._ChainObserver.create({
//      property: 'plan',
//      next: SC._ChainObserver.create({
//        property: 'name', func: myFunc
//      })
//    })
//  })
//
SC._ChainObserver = function(property, root) {
  this.property = property ;
  this.root = root || this ;
} ;

// This is the primary entry point.  Configures the chain.
SC._ChainObserver.createChain = function(rootObject, path, target, method, context) {

  // First we create the chain.
  var parts = path.split('.'),
      root  = new SC._ChainObserver(parts[0]),
      tail  = root;

  for(var i=1, l=parts.length; i<l; i++) {
    tail = tail.next = new SC._ChainObserver(parts[i], root) ;
  }

  var tails = root.tails = [tail];

  // Now root has the first observer and tail has the last one.
  // Feed the rootObject into the front to setup the chain...
  // do this BEFORE we set the target/method so they will not be triggered.
  root.objectDidChange(rootObject);

  tails.forEach(function(tail) {
    // Finally, set the target/method on the tail so that future changes will
    // trigger.
    tail.target = target; tail.method = method ; tail.context = context ;
  });

  // no need to hold onto references to the tails; if the underlying
  // objects go away, let them get garbage collected
  root.tails = null;

  // and return the root to save
  return root ;
};

SC._ChainObserver.prototype = {
  isChainObserver: true,

  // the object this instance is observing
  object: null,

  // the property on the object this link is observing.
  property: null,

  // if not null, this is the next link in the chain.  Whenever the
  // current property changes, the next observer will be notified.
  next: null,

  root: null,

  // if not null, this is the final target observer.
  target: null,

  // if not null, this is the final target method
  method: null,

  // an accessor method that traverses the list and finds the tail
  tail: function() {
    if(this._tail) { return this._tail; }

    var tail = this;

    while(tail.next) {
      tail = tail.next;
    }

    this._tail = tail;
    return tail;
  },

  // invoked when the source object changes.  removes observer on old
  // object, sets up new observer, if needed.
  objectDidChange: function(newObject) {
    if (newObject === this.object) return; // nothing to do.

    // if an old object, remove observer on it.
    if (this.object) {
      if (this.property === '@each' && this.object._removeContentObserver) {
        this.object._removeContentObserver(this);
      } else if (this.object.removeObserver) {
        this.object.removeObserver(this.property, this, this.propertyDidChange);
      }
    }

    // if a new object, add observer on it...
    this.object = newObject ;

    // when [].propName is used, we will want to set up observers on each item
    // added to the Enumerable, and remove them when the item is removed from
    // the Enumerable.
    //
    // In this case, we invoke addEnumerableObserver, which handles setting up
    // and tearing down observers as items are added and removed from the
    // Enumerable.
    if (this.property === '@each' && this.next) {
      if (this.object && this.object._addContentObserver) {
        this.object._addContentObserver(this);
      }
    } else {
      if (this.object && this.object.addObserver) {
        this.object.addObserver(this.property, this, this.propertyDidChange);
      }

      // now, notify myself that my property value has probably changed.
      this.propertyDidChange() ;
    }
  },

  // the observer method invoked when the observed property changes.
  propertyDidChange: function() {
    // get the new value
    var object = this.object ;
    var property = this.property ;
    var value = (object && object.get) ? object.get(property) : null ;

    // if we have a next object in the chain, notify it that its object
    // did change...
    if (this.next) { this.next.objectDidChange(value) ; }

    // if we have a target/method, call it.
    var target  = this.target,
        method  = this.method,
        context = this.context ;

    if (target && method) {
      var rev = object ? object.propertyRevision : null ;
      if (context) {
        method.call(target, object, property, value, context, rev);
      } else {
        method.call(target, object, property, value, rev) ;
      }
    }
  },

  // teardown the chain...
  destroyChain: function() {

    // remove observer
    var obj = this.object ;
    if (obj && obj.removeObserver) {
      obj.removeObserver(this.property, this, this.propertyDidChange) ;
    }

    // destroy next item in chain
    if (this.next) this.next.destroyChain() ;

    // and clear left overs...
    this.next = this.target = this.method = this.object = this.context = null;
    return null ;
  }

} ;

/* >>>>>>>>>> BEGIN source/mixins/observable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('ext/function');
sc_require('private/observer_set');
sc_require('private/chain_observer');

/*globals logChange */

/**
  Set to YES to have all observing activity logged to the SC.Logger.  This
  should be used for debugging only.

  @property {Boolean}
*/
SC.LOG_OBSERVERS = NO ;

/**
  @class

  Key-Value-Observing (KVO) simply allows one object to observe changes to a
  property on another object. It is one of the fundamental ways that models,
  controllers and views communicate with each other in a SproutCore
  application.  Any object that has this module applied to it can be used in
  KVO-operations.

  This module is applied automatically to all objects that inherit from
  SC.Object, which includes most objects bundled with the SproutCore
  framework.  You will not generally apply this module to classes yourself,
  but you will use the features provided by this module frequently, so it is
  important to understand how to use it.

  Enabling Key Value Observing
  ---

  With KVO, you can write functions that will be called automatically whenever
  a property on a particular object changes.  You can use this feature to
  reduce the amount of "glue code" that you often write to tie the various
  parts of your application together.

  To use KVO, just use the KVO-aware methods get() and set() to access
  properties instead of accessing properties directly.  Instead of writing:

        var aName = contact.firstName ;
        contact.firstName = 'Charles' ;

  use:

        var aName = contact.get('firstName') ;
        contact.set('firstName', 'Charles') ;

  get() and set() work just like the normal "dot operators" provided by
  JavaScript but they provide you with much more power, including not only
  observing but computed properties as well.

  Observing Property Changes
  ---

  You typically observe property changes simply by adding the observes()
  call to the end of your method declarations in classes that you write.  For
  example:

        SC.Object.create({
          valueObserver: function() {
            // Executes whenever the "Value" property changes
          }.observes('value')
        }) ;

  Although this is the most common way to add an observer, this capability is
  actually built into the SC.Object class on top of two methods defined in
  this mixin called addObserver() and removeObserver().  You can use these two
  methods to add and remove observers yourself if you need to do so at run
  time.

  To add an observer for a property, just call:

        object.addObserver('propertyKey', targetObject, targetAction) ;

  This will call the 'targetAction' method on the targetObject to be called
  whenever the value of the propertyKey changes.

  Observer Parameters
  ---

  An observer function typically does not need to accept any parameters,
  however you can accept certain arguments when writing generic observers.
  An observer function can have the following arguments:

        propertyObserver(target, key, value, revision) ;

  - *target* - This is the object whose value changed.  Usually this.
  - *key* - The key of the value that changed
  - *value* - this property is no longer used.  It will always be null
  - *revision* - this is the revision of the target object

  Implementing Manual Change Notifications
  ---

  Sometimes you may want to control the rate at which notifications for
  a property are delivered, for example by checking first to make sure
  that the value has changed.

  To do this, you need to implement a computed property for the property
  you want to change and override automaticallyNotifiesObserversFor().

  The example below will only notify if the "balance" property value actually
  changes:


        automaticallyNotifiesObserversFor: function(key) {
          return (key === 'balance') ? NO : arguments.callee.base.apply(this,arguments) ;
        },

        balance: function(key, value) {
          var balance = this._balance ;
          if ((value !== undefined) && (balance !== value)) {
            this.propertyWillChange(key) ;
            balance = this._balance = value ;
            this.propertyDidChange(key) ;
          }
          return balance ;
        }


  Implementation Details
  ---

  Internally, SproutCore keeps track of observable information by adding a
  number of properties to the object adopting the observable.  All of these
  properties begin with "_kvo_" to separate them from the rest of your object.

  @since SproutCore 1.0
*/
SC.Observable = /** @scope SC.Observable.prototype */{

  /**
    Walk like that ol' duck

    @property {Boolean}
  */
  isObservable: YES,

  /**
    Determines whether observers should be automatically notified of changes
    to a key.

    If you are manually implementing change notifications for a property, you
    can override this method to return NO for properties you do not want the
    observing system to automatically notify for.

    The default implementation always returns YES.

    @param {String} key the key that is changing
    @returns {Boolean} YES if automatic notification should occur.
  */
  automaticallyNotifiesObserversFor: function(key) {
    return YES;
  },

  // ..........................................
  // PROPERTIES
  //
  // Use these methods to get/set properties.  This will handle observing
  // notifications as well as allowing you to define functions that can be
  // used as properties.

  /**
    Retrieves the value of key from the object.

    This method is generally very similar to using object[key] or object.key,
    however it supports both computed properties and the unknownProperty
    handler.

    Computed Properties
    ---

    Computed properties are methods defined with the property() modifier
    declared at the end, such as:

          fullName: function() {
            return this.getEach('firstName', 'lastName').compact().join(' ');
          }.property('firstName', 'lastName')

    When you call get() on a computed property, the property function will be
    called and the return value will be returned instead of the function
    itself.

    Unknown Properties
    ---

    Likewise, if you try to call get() on a property whose values is
    undefined, the unknownProperty() method will be called on the object.
    If this method reutrns any value other than undefined, it will be returned
    instead.  This allows you to implement "virtual" properties that are
    not defined upfront.

    @param {String} key the property to retrieve
    @returns {Object} the property value or undefined.

  */
  get: function(key) {
    var ret = this[key], cache ;
    if (ret === undefined) {
      return this.unknownProperty(key) ;
    } else if (ret && ret.isProperty) {
      if (ret.isCacheable) {
        cache = this._kvo_cache ;
        if (!cache) cache = this._kvo_cache = {};
        return (cache[ret.cacheKey] !== undefined) ? cache[ret.cacheKey] : (cache[ret.cacheKey] = ret.call(this,key)) ;
      } else return ret.call(this,key);
    } else return ret ;
  },

  /**
    Sets the key equal to value.

    This method is generally very similar to calling object[key] = value or
    object.key = value, except that it provides support for computed
    properties, the unknownProperty() method and property observers.

    Computed Properties
    ---

    If you try to set a value on a key that has a computed property handler
    defined (see the get() method for an example), then set() will call
    that method, passing both the value and key instead of simply changing
    the value itself.  This is useful for those times when you need to
    implement a property that is composed of one or more member
    properties.

    Unknown Properties
    ---

    If you try to set a value on a key that is undefined in the target
    object, then the unknownProperty() handler will be called instead.  This
    gives you an opportunity to implement complex "virtual" properties that
    are not predefined on the obejct.  If unknownProperty() returns
    undefined, then set() will simply set the value on the object.

    Property Observers
    ---

    In addition to changing the property, set() will also register a
    property change with the object.  Unless you have placed this call
    inside of a beginPropertyChanges() and endPropertyChanges(), any "local"
    observers (i.e. observer methods declared on the same object), will be
    called immediately.  Any "remote" observers (i.e. observer methods
    declared on another object) will be placed in a queue and called at a
    later time in a coelesced manner.

    Chaining
    ---

    In addition to property changes, set() returns the value of the object
    itself so you can do chaining like this:

          record.set('firstName', 'Charles').set('lastName', 'Jolley');

    @param {String|Hash} key the property to set
    @param {Object} value the value to set or null.
    @returns {SC.Observable}
  */
  set: function(key, value) {
    var func   = this[key],
        notify = this.automaticallyNotifiesObserversFor(key),
        ret    = value,
        cachedep, cache, idx, dfunc ;

    if(value === undefined && SC.typeOf(key) === SC.T_HASH) {
      var hash = key;

      for(key in hash) {
        if (!hash.hasOwnProperty(key)) continue;
        this.set(key, hash[key]);
      }

      return this;
    }

    // if there are any dependent keys and they use caching, then clear the
    // cache.  (If we're notifying, then propertyDidChange will do this for
    // us.)
    if (!notify && this._kvo_cacheable && (cache = this._kvo_cache)) {
      // lookup the cached dependents for this key.  if undefined, compute.
      // note that if cachdep is set to null is means we figure out it has no
      // cached dependencies already.  this is different from undefined.
      cachedep = this._kvo_cachedep;
      if (!cachedep || (cachedep = cachedep[key])===undefined) {
        cachedep = this._kvo_computeCachedDependentsFor(key);
      }

      if (cachedep) {
        idx = cachedep.length;
        while(--idx>=0) {
          dfunc = cachedep[idx];
          cache[dfunc.cacheKey] = cache[dfunc.lastSetValueKey] = undefined;
        }
      }
    }

    // set the value.
    if (func && func.isProperty) {
      cache = this._kvo_cache;
      if (func.isVolatile || !cache || (cache[func.lastSetValueKey] !== value)) {
        if (!cache) cache = this._kvo_cache = {};

        cache[func.lastSetValueKey] = value ;
        if (notify) this.propertyWillChange(key) ;
        ret = func.call(this,key,value) ;

        // update cached value
        if (func.isCacheable) cache[func.cacheKey] = ret ;
        if (notify) this.propertyDidChange(key, ret, YES) ;
      }

    } else if (func === undefined) {
      if (notify) this.propertyWillChange(key) ;
      this.unknownProperty(key,value) ;
      if (notify) this.propertyDidChange(key, ret) ;

    } else {
      if (this[key] !== value) {
        if (notify) this.propertyWillChange(key) ;
        ret = this[key] = value ;
        if (notify) this.propertyDidChange(key, ret) ;
      }
    }

    return this ;
  },

  /**
    Called whenever you try to get or set an undefined property.

    This is a generic property handler.  If you define it, it will be called
    when the named property is not yet set in the object.  The default does
    nothing.

    @param {String} key the key that was requested
    @param {Object} value The value if called as a setter, undefined if called as a getter.
    @returns {Object} The new value for key.
  */
  unknownProperty: function(key,value) {
    if (!(value === undefined)) { this[key] = value; }
    return value ;
  },

  /**
    Begins a grouping of property changes.

    You can use this method to group property changes so that notifications
    will not be sent until the changes are finished.  If you plan to make a
    large number of changes to an object at one time, you should call this
    method at the beginning of the changes to suspend change notifications.
    When you are done making changes, call endPropertyChanges() to allow
    notification to resume.

    @returns {SC.Observable}
  */
  beginPropertyChanges: function() {
    this._kvo_changeLevel = (this._kvo_changeLevel || 0) + 1;
    return this;
  },

  /**
    Ends a grouping of property changes.

    You can use this method to group property changes so that notifications
    will not be sent until the changes are finished.  If you plan to make a
    large number of changes to an object at one time, you should call
    beginPropertyChanges() at the beginning of the changes to suspend change
    notifications. When you are done making changes, call this method to allow
    notification to resume.

    @returns {SC.Observable}
  */
  endPropertyChanges: function() {
    this._kvo_changeLevel = (this._kvo_changeLevel || 1) - 1 ;
    var level = this._kvo_changeLevel, changes = this._kvo_changes;
    if ((level<=0) && changes && (changes.length>0) && !SC.Observers.isObservingSuspended) {
      this._notifyPropertyObservers() ;
    }
    return this ;
  },

  /**
    Notify the observer system that a property is about to change.

    Sometimes you need to change a value directly or indirectly without
    actually calling get() or set() on it.  In this case, you can use this
    method and propertyDidChange() instead.  Calling these two methods
    together will notify all observers that the property has potentially
    changed value.

    Note that you must always call propertyWillChange and propertyDidChange as
    a pair.  If you do not, it may get the property change groups out of order
    and cause notifications to be delivered more often than you would like.

    @param {String} key The property key that is about to change.
    @returns {SC.Observable}
  */
  propertyWillChange: function(key) {
    return this ;
  },

  /**
    Notify the observer system that a property has just changed.

    Sometimes you need to change a value directly or indirectly without
    actually calling get() or set() on it.  In this case, you can use this
    method and propertyWillChange() instead.  Calling these two methods
    together will notify all observers that the property has potentially
    changed value.

    Note that you must always call propertyWillChange and propertyDidChange as
    a pair. If you do not, it may get the property change groups out of order
    and cause notifications to be delivered more often than you would like.

    @param {String} key The property key that has just changed.
    @param {Object} value The new value of the key.  May be null.
    @param {Boolean} _keepCache Private property
    @returns {SC.Observable}
  */
  propertyDidChange: function(key,value, _keepCache) {
    this._kvo_revision = (this._kvo_revision || 0) + 1;
    var level = this._kvo_changeLevel || 0,
        cachedep, idx, dfunc, func,
        log = SC.LOG_OBSERVERS && (this.LOG_OBSERVING !== NO);

    // If any dependent keys contain this property in their path,
    // invalidate the cache of the computed property and re-setup chain with
    // new value.
    var chains = this._kvo_property_chains;
    if (chains) {
      var keyChains = chains[key];

      if (keyChains) {
        this.beginPropertyChanges();
        keyChains = SC.clone(keyChains);
        keyChains.forEach(function(chain) {
          // Invalidate the property that depends on the changed key.
          chain.notifyPropertyDidChange();
        });
        this.endPropertyChanges();
      }
    }

    var cache = this._kvo_cache;
    if (cache) {

      // clear any cached value
      if (!_keepCache) {
        func = this[key] ;
        if (func && func.isProperty) {
          cache[func.cacheKey] = cache[func.lastSetValueKey] = undefined ;
        }
      }

      if (this._kvo_cacheable) {
        // if there are any dependent keys and they use caching, then clear the
        // cache.  This is the same code as is in set.  It is inlined for perf.
        cachedep = this._kvo_cachedep;
        if (!cachedep || (cachedep = cachedep[key])===undefined) {
          cachedep = this._kvo_computeCachedDependentsFor(key);
        }

        if (cachedep) {
          idx = cachedep.length;
          while(--idx>=0) {
            dfunc = cachedep[idx];
            cache[dfunc.cacheKey] = cache[dfunc.lastSetValueKey] = undefined;
          }
        }
      }
    }

    // save in the change set if queuing changes
    var suspended = SC.Observers.isObservingSuspended;
    if ((level > 0) || suspended) {
      var changes = this._kvo_changes ;
      if (!changes) changes = this._kvo_changes = SC.CoreSet.create() ;
      changes.add(key) ;

      if (suspended) {
        if (log) SC.Logger.log("%@%@: will not notify observers because observing is suspended".fmt(SC.KVO_SPACES,this));
        SC.Observers.objectHasPendingChanges(this) ;
      }

    // otherwise notify property observers immediately
    } else this._notifyPropertyObservers(key) ;

    return this ;
  },

  // ..........................................
  // DEPENDENT KEYS
  //

  /**
    Use this to indicate that one key changes if other keys it depends on
    change.  Pass the key that is dependent and additional keys it depends
    upon.  You can either pass the additional keys inline as arguments or
    in a single array.

    You generally do not call this method, but instead pass dependent keys to
    your property() method when you declare a computed property.

    You can call this method during your init to register the keys that should
    trigger a change notification for your computed properties.

    @param {String} key the dependent key
    @param {Array|String} dependentKeys one or more dependent keys
    @returns {Object} this
  */
  registerDependentKey: function(key, dependentKeys) {
    var dependents      = this._kvo_dependents,
        chainDependents = this._kvo_chain_dependents,
        func            = this[key],
        keys, idx, lim, dep, queue;

      // normalize input.
      if (typeof dependentKeys === "object" && (dependentKeys instanceof Array)) {
        keys = dependentKeys;
        lim  = 0;
      } else {
        keys = arguments;
        lim  = 1;
      }
      idx  = keys.length;

      // define dependents if not defined already.
      if (!dependents) this._kvo_dependents = dependents = {} ;

      // for each key, build array of dependents, add this key...
      // note that we ignore the first argument since it is the key...
      while(--idx >= lim) {
        dep = keys[idx] ;

        if (dep.indexOf('.') >= 0) {
          SC._PropertyChain.createChain(dep, this, key).activate();
        } else {
          // add dependent key to dependents array of key it depends on
          queue = dependents[dep] ;
          if (!queue) { queue = dependents[dep] = [] ; }
          queue.push(key) ;
        }
      }
    },

    /** @private
      Register a property chain so that dependent keys can be invalidated
      when a property on this object changes.

      @param {String} property the property on this object that invalidates the chain
      @param {SC._PropertyChain} chain the chain to notify
    */
    registerDependentKeyWithChain: function(property, chain) {
      var chains = this._chainsFor(property), next;
      chains.add(chain);
    },

    /** @private
      Removes a property chain from the object.

      @param {String} property the property on this object that invalidates the chain
      @param {SC._PropertyChain} chain the chain to notify
    */
    removeDependentKeyWithChain: function(property, chain) {
      var chains = this._chainsFor(property), next;
      chains.remove(chain);

      if (chains.get('length') === 0) {
        delete this._kvo_property_chains[property];
      }
    },

    /** @private
      Returns an instance of SC.CoreSet in which to save SC._PropertyChains.

      @param {String} property the property associated with the SC._PropertyChain
      @returns {SC.CoreSet}
    */
    _chainsFor: function(property) {
      this._kvo_property_chains = this._kvo_property_chains || {};
      var chains = this._kvo_property_chains[property] || SC.CoreSet.create();
      this._kvo_property_chains[property] = chains;

      return chains;
    },

    /** @private

      Helper method used by computeCachedDependents.  Just loops over the
      array of dependent keys.  If the passed function is cacheable, it will
      be added to the queue.  Also, recursively call on each keys dependent
      keys.

      @param {Array} queue the queue to add functions to
      @param {Array} keys the array of dependent keys for this key
      @param {Hash} dependents the _kvo_dependents cache
      @param {SC.Set} seen already seen keys
      @returns {void}
    */
    _kvo_addCachedDependents: function(queue, keys, dependents, seen) {
      var idx = keys.length,
          func, key, deps ;

      while(--idx >= 0) {
        key  = keys[idx];
        seen.add(key);

        // if the value for this key is a computed property, then add it to the
        // set if it is cacheable, and process any of its dependent keys also.
        func = this[key];
        if (func && (func instanceof Function) && func.isProperty) {
          if (func.isCacheable) queue.push(func); // handle this func
          if ((deps = dependents[key]) && deps.length>0) { // and any dependents
            this._kvo_addCachedDependents(queue, deps, dependents, seen);
          }
        }
      }

    },

    /** @private

      Called by set() whenever it needs to determine which cached dependent
      keys to clear.  Recursively searches dependent keys to determine all
      cached property direcly or indirectly affected.

      The return value is also saved for future reference

      @param {String} key the key to compute
      @returns {Array}
    */
    _kvo_computeCachedDependentsFor: function(key) {
      var cached     = this._kvo_cachedep,
          dependents = this._kvo_dependents,
          keys       = dependents ? dependents[key] : null,
          queue, seen ;
      if (!cached) cached = this._kvo_cachedep = {};

      // if there are no dependent keys, then just set and return null to avoid
      // this mess again.
      if (!keys || keys.length===0) return cached[key] = null;

      // there are dependent keys, so we need to do the work to find out if
      // any of them or their dependent keys are cached.
      queue = cached[key] = [];
      seen  = SC._TMP_SEEN_SET = (SC._TMP_SEEN_SET || SC.CoreSet.create());
      seen.add(key);
      this._kvo_addCachedDependents(queue, keys, dependents, seen);
      seen.clear(); // reset

      if (queue.length === 0) queue = cached[key] = null ; // turns out nothing
      return queue ;
    },

    // ..........................................
    // OBSERVERS
    //

    _kvo_for: function(kvoKey, type) {
      var ret = this[kvoKey] ;

      if (!this._kvo_cloned) this._kvo_cloned = {} ;

      // if the item does not exist, create it.  Unless type is passed,
      // assume array.
      if (!ret) {
        ret = this[kvoKey] = (type === undefined) ? [] : type.create();
        this._kvo_cloned[kvoKey] = YES ;

      // if item does exist but has not been cloned, then clone it.  Note
      // that all types must implement copy().0
      } else if (!this._kvo_cloned[kvoKey]) {
        ret = this[kvoKey] = ret.copy();
        this._kvo_cloned[kvoKey] = YES;
      }

      return ret ;
    },

    /**
      Adds an observer on a property.

      This is the core method used to register an observer for a property.

      Once you call this method, anytime the key's value is set, your observer
      will be notified.  Note that the observers are triggered anytime the
      value is set, regardless of whether it has actually changed.  Your
      observer should be prepared to handle that.

      You can also pass an optional context parameter to this method.  The
      context will be passed to your observer method whenever it is triggered.
      Note that if you add the same target/method pair on a key multiple times
      with different context parameters, your observer will only be called once
      with the last context you passed.

      Observer Methods
      ---

      Observer methods you pass should generally have the following signature if
      you do not pass a "context" parameter:

            fooDidChange: function(sender, key, value, rev);

      The sender is the object that changed.  The key is the property that
      changes.  The value property is currently reserved and unused.  The rev
      is the last property revision of the object when it changed, which you can
      use to detect if the key value has really changed or not.

      If you pass a "context" parameter, the context will be passed before the
      revision like so:

            fooDidChange: function(sender, key, value, context, rev);

      Usually you will not need the value, context or revision parameters at
      the end.  In this case, it is common to write observer methods that take
      only a sender and key value as parameters or, if you aren't interested in
      any of these values, to write an observer that has no parameters at all.

      @param {String} key the key to observer
      @param {Object} target the target object to invoke
      @param {String|Function} method the method to invoke.
      @param {Object} context optional context
      @returns {SC.Object} self
    */
    addObserver: function(key, target, method, context) {
      var kvoKey, chain, chains, observers;

      // normalize.  if a function is passed to target, make it the method.
      if (method === undefined) {
        method = target; target = this ;
      }
      if (!target) target = this ;

      if (typeof method === "string") method = target[method] ;
      if (!method) throw "You must pass a method to addObserver()" ;

      // Normalize key...
      key = key.toString() ;
      if (key.indexOf('.') >= 0) {

        // create the chain and save it for later so we can tear it down if
        // needed.
        chain = SC._ChainObserver.createChain(this, key, target, method, context);
        chain.masterTarget = target;
        chain.masterMethod = method ;

        // Save in set for chain observers.
        this._kvo_for(SC.keyFor('_kvo_chains', key)).push(chain);

      // Create observers if needed...
      } else {

        // Special case to support reduced properties.  If the property
        // key begins with '@' and its value is unknown, then try to get its
        // value.  This will configure the dependent keys if needed.
        if ((this[key] === undefined) && (key.indexOf('@') === 0)) {
          this.get(key) ;
        }

        if (target === this) target = null ; // use null for observers only.
        kvoKey = SC.keyFor('_kvo_observers', key);
        this._kvo_for(kvoKey, SC.ObserverSet).add(target, method, context);
        this._kvo_for('_kvo_observed_keys', SC.CoreSet).add(key) ;
      }

      if (this.didAddObserver) this.didAddObserver(key, target, method);
      return this;
    },

    /**
      Remove an observer you have previously registered on this object.  Pass
      the same key, target, and method you passed to addObserver() and your
      target will no longer receive notifications.

      @param {String} key the key to observer
      @param {Object} target the target object to invoke
      @param {String|Function} method the method to invoke.
      @returns {SC.Observable} receiver
    */
    removeObserver: function(key, target, method) {

      var kvoKey, chains, chain, observers, idx ;

      // normalize.  if a function is passed to target, make it the method.
      if (method === undefined) {
        method = target; target = this ;
      }
      if (!target) target = this ;

      if (typeof method === "string") method = target[method] ;
      if (!method) throw "You must pass a method to removeObserver()" ;

      // if the key contains a '.', this is a chained observer.
      key = key.toString() ;
      if (key.indexOf('.') >= 0) {

        // try to find matching chains
        kvoKey = SC.keyFor('_kvo_chains', key);
        if (chains = this[kvoKey]) {

          // if chains have not been cloned yet, do so now.
          chains = this._kvo_for(kvoKey) ;

          // remove any chains
          idx = chains.length;
          while(--idx >= 0) {
            chain = chains[idx];
            if (chain && (chain.masterTarget===target) && (chain.masterMethod===method)) {
              chains[idx] = chain.destroyChain() ;
            }
          }
        }

      // otherwise, just like a normal observer.
      } else {
        if (target === this) target = null ; // use null for observers only.
        kvoKey = SC.keyFor('_kvo_observers', key) ;
        if (observers = this[kvoKey]) {
          // if observers have not been cloned yet, do so now
          observers = this._kvo_for(kvoKey) ;
          observers.remove(target, method) ;
          if (observers.getMembers().length === 0) {
            this._kvo_for('_kvo_observed_keys', SC.CoreSet).remove(key);
          }
        }
      }

      if (this.didRemoveObserver) this.didRemoveObserver(key, target, method);
      return this;
    },

    /**
      Returns YES if the object currently has observers registered for a
      particular key.  You can use this method to potentially defer performing
      an expensive action until someone begins observing a particular property
      on the object.

      @param {String} key key to check
      @returns {Boolean}
    */
    hasObserverFor: function(key) {
      SC.Observers.flush(this) ; // hookup as many observers as possible.

      var observers = this[SC.keyFor('_kvo_observers', key)],
          locals    = this[SC.keyFor('_kvo_local', key)],
          members ;

      if (locals && locals.length>0) return YES ;
      if (observers && observers.getMembers().length > 0) return YES ;
      return NO ;
    },

    /**
      This method will register any observers and computed properties saved on
      the object.  Normally you do not need to call this method youself.  It
      is invoked automatically just before property notifications are sent and
      from the init() method of SC.Object.  You may choose to call this
      from your own initialization method if you are using SC.Observable in
      a non-SC.Object-based object.

      This method looks for several private variables, which you can setup,
      to initialize:

        - _observers: this should contain an array of key names for observers
          you need to configure.

        - _bindings: this should contain an array of key names that configure
          bindings.

        - _properties: this should contain an array of key names for computed
          properties.

      @returns {Object} this
    */
    initObservable: function() {
      if (this._observableInited) return ;
      this._observableInited = YES ;

      var loc, keys, key, value, observer, propertyPaths, propertyPathsLength,
          len, ploc, path, dotIndex, root, propertyKey, keysLen;

      // Loop through observer functions and register them
      if (keys = this._observers) {
        len = keys.length ;
        for(loc=0;loc<len;loc++) {
          key = keys[loc]; observer = this[key] ;
          propertyPaths = observer.propertyPaths ;
          propertyPathsLength = (propertyPaths) ? propertyPaths.length : 0 ;
          for(ploc=0;ploc<propertyPathsLength;ploc++) {
            path = propertyPaths[ploc] ;
            dotIndex = path.indexOf('.') ;
            // handle most common case, observing a local property
            if (dotIndex < 0) {
              this.addObserver(path, this, observer) ;

            // next most common case, use a chained observer
            } else if (path.indexOf('*') === 0) {
              this.addObserver(path.slice(1), this, observer) ;

            // otherwise register the observer in the observers queue.  This
            // will add the observer now or later when the named path becomes
            // available.
            } else {
              root = null ;

              // handle special cases for observers that look to the local root
              if (dotIndex === 0) {
                root = this; path = path.slice(1) ;
              } else if (dotIndex===4 && path.slice(0,5) === 'this.') {
                root = this; path = path.slice(5) ;
              } else if (dotIndex<0 && path.length===4 && path === 'this') {
                root = this; path = '';
              }

              SC.Observers.addObserver(path, this, observer, root);
            }
          }
        }
      }

      // Add Bindings
      this.bindings = []; // will be filled in by the bind() method.
      if (keys = this._bindings) {
        for(loc=0, keysLen = keys.length; loc < keysLen;loc++) {
          // get propertyKey
          key = keys[loc] ; value = this[key] ;
          propertyKey = key.slice(0,-7) ; // contentBinding => content
          this[key] = this.bind(propertyKey, value) ;
        }
      }

      // Add Properties
      if (keys = this._properties) {
        for(loc=0, keysLen = keys.length; loc<keysLen;loc++) {
          key = keys[loc];
          if (value = this[key]) {

            // activate cacheable only if needed for perf reasons
            if (value.isCacheable) this._kvo_cacheable = YES;

            // register dependent keys
            if (value.dependentKeys && (value.dependentKeys.length>0)) {
              this.registerDependentKey(key, value.dependentKeys) ;
            }
          }
        }
      }

    },

    // ..........................................
    // NOTIFICATION
    //

    /**
      Returns an array with all of the observers registered for the specified
      key.  This is intended for debugging purposes only.  You generally do not
      want to rely on this method for production code.

    @param {String} key the key to evaluate
    @returns {Array} array of Observer objects, describing the observer.
  */
  observersForKey: function(key) {
    SC.Observers.flush(this) ; // hookup as many observers as possible.

    var observers = this[SC.keyFor('_kvo_observers', key)];
    return observers ? observers.getMembers() : [];
  },

    // this private method actually notifies the observers for any keys in the
    // observer queue.  If you pass a key it will be added to the queue.
    _notifyPropertyObservers: function(key) {
      if (!this._observableInited) this.initObservable() ;

      SC.Observers.flush(this) ; // hookup as many observers as possible.

      var log = SC.LOG_OBSERVERS && !(this.LOG_OBSERVING===NO),
          observers, changes, dependents, starObservers, idx, keys, rev,
          members, membersLength, member, memberLoc, target, method, loc, func,
          context, spaces, cache ;

      if (log) {
        spaces = SC.KVO_SPACES = (SC.KVO_SPACES || '') + '  ';
        SC.Logger.log('%@%@: notifying observers after change to key "%@"'.fmt(spaces, this, key));
      }

      // Get any starObservers -- they will be notified of all changes.
      starObservers =  this['_kvo_observers_*'] ;

      // prevent notifications from being sent until complete
      this._kvo_changeLevel = (this._kvo_changeLevel || 0) + 1;

      // keep sending notifications as long as there are changes
      while(((changes = this._kvo_changes) && (changes.length > 0)) || key) {

        // increment revision
        rev = ++this.propertyRevision ;

        // save the current set of changes and swap out the kvo_changes so that
        // any set() calls by observers will be saved in a new set.
        if (!changes) changes = SC.CoreSet.create() ;
        this._kvo_changes = null ;

        // Add the passed key to the changes set.  If a '*' was passed, then
        // add all keys in the observers to the set...
        // once finished, clear the key so the loop will end.
        if (key === '*') {
          changes.add('*') ;
          changes.addEach(this._kvo_for('_kvo_observed_keys', SC.CoreSet));

        } else if (key) changes.add(key) ;

        // Now go through the set and add all dependent keys...
        if (dependents = this._kvo_dependents) {

          // NOTE: each time we loop, we check the changes length, this
          // way any dependent keys added to the set will also be evaluated...
          for(idx=0;idx<changes.length;idx++) {
            key = changes[idx] ;
            keys = dependents[key] ;

            // for each dependent key, add to set of changes.  Also, if key
            // value is a cacheable property, clear the cached value...
            if (keys && (loc = keys.length)) {
              if (log) {
                SC.Logger.log("%@...including dependent keys for %@: %@".fmt(spaces, key, keys));
              }
              cache = this._kvo_cache;
              if (!cache) cache = this._kvo_cache = {};
              while(--loc >= 0) {
                changes.add(key = keys[loc]);
                if (func = this[key]) {
                  this[func.cacheKey] = undefined;
                  cache[func.cacheKey] = cache[func.lastSetValueKey] = undefined;
                } // if (func=)
              } // while (--loc)
            } // if (keys &&
          } // for(idx...
        } // if (dependents...)

        // now iterate through all changed keys and notify observers.
        while(changes.length > 0) {
          key = changes.pop() ; // the changed key

          // find any observers and notify them...
          observers = this[SC.keyFor('_kvo_observers', key)];

          if (observers) {
            // We need to clone the 'members' structure here in case any of the
            // observers we're about to notify happen to remove observers for
            // this key, which would mutate the structure underneath us.
            // (Cloning it rather than mutating gives us a clear policy:  if you
            // were registered as an observer at the time notification begins,
            // you will be notified, regardless of whether you're removed as an
            // observer during that round of notification.  Similarly, if you're
            // added as an observer during the notification round by another
            // observer, you will not be notified until the next time.)
            members = SC.clone(observers.getMembers()) ;
            membersLength = members.length ;
            for(memberLoc=0;memberLoc < membersLength; memberLoc++) {
              member = members[memberLoc] ;

              if (member[3] === rev) continue ; // skip notified items.

              if(!member[1]) SC.Logger.log(member);

              target = member[0] || this;
              method = member[1] ;
              context = member[2];
              member[3] = rev;

              if (log) SC.Logger.log('%@...firing observer on %@ for key "%@"'.fmt(spaces, target, key));
              if (context !== undefined) {
                method.call(target, this, key, null, context, rev);
              } else {
                method.call(target, this, key, null, rev) ;
              }
            }
          }

          // look for local observers.  Local observers are added by SC.Object
          // as an optimization to avoid having to add observers for every
          // instance when you are just observing your local object.
          members = this[SC.keyFor('_kvo_local', key)];
          if (members) {
            // Note:  Since, unlike above, we don't expect local observers to be
            //        removed in general, we will not clone 'members'.
            membersLength = members.length ;
            for(memberLoc=0;memberLoc<membersLength;memberLoc++) {
              member = members[memberLoc];
              method = this[member] ; // try to find observer function
              if (method) {
                if (log) SC.Logger.log('%@...firing local observer %@.%@ for key "%@"'.fmt(spaces, this, member, key));
                method.call(this, this, key, null, rev);
              }
            }
          }

          // if there are starObservers, do the same thing for them
          if (starObservers && key !== '*') {
            // We clone the structure per the justification, above, for regular
            // observers.
            members = SC.clone(starObservers.getMembers()) ;
            membersLength = members.length ;
            for(memberLoc=0;memberLoc < membersLength; memberLoc++) {
              member = members[memberLoc] ;
              target = member[0] || this;
              method = member[1] ;
              context = member[2] ;

              if (log) SC.Logger.log('%@...firing * observer on %@ for key "%@"'.fmt(spaces, target, key));
              if (context !== undefined) {
                method.call(target, this, key, null, context, rev);
              } else {
                method.call(target, this, key, null, rev) ;
              }
            }
          }

          // if there is a default property observer, call that also
          if (this.propertyObserver) {
            if (log) SC.Logger.log('%@...firing %@.propertyObserver for key "%@"'.fmt(spaces, this, key));
            this.propertyObserver(this, key, null, rev);
          }
        } // while(changes.length>0)

        // changes set should be empty. release it for reuse
        if (changes) changes.destroy() ;

        // key is no longer needed; clear it to avoid infinite loops
        key = null ;

      } // while (changes)

      // done with loop, reduce change level so that future sets can resume
      this._kvo_changeLevel = (this._kvo_changeLevel || 1) - 1;

      if (log) SC.KVO_SPACES = spaces.slice(0, -2);

      return YES ; // finished successfully
    },

    // ..........................................
    // BINDINGS
    //

    /**
      Manually add a new binding to an object.  This is the same as doing
      the more familiar propertyBinding: 'property.path' approach.

      @param {String} toKey the key to bind to
      @param {Object} target target or property path to bind from
      @param {String|Function} method method for target to bind from
      @returns {SC.Binding} new binding instance
    */
    bind: function(toKey, target, method) {

      var binding , pathType;

      // normalize...
      if (method !== undefined) target = [target, method];

      pathType = typeof target;

      // if a string or array (i.e. tuple) is passed, convert this into a
      // binding.  If a binding default was provided, use that.
      if (pathType === "string" || (pathType === "object" && (target instanceof Array))) {
        binding = this[toKey + 'BindingDefault'] || SC.Binding;
        binding = binding.beget().from(target) ;
      } else {
        // If a binding object was provided, clone it so that it gets
        // connected again if the original example binding was already
        // connected.
        binding = target.beget() ;
      }

      // finish configuring the binding and then connect it.
      binding = binding.to(toKey, this).connect() ;
      this.bindings.push(binding) ;

      return binding ;
    },

    /**
      didChangeFor allows you to determine if a property has changed since the
      last time the method was called. You must pass a unique context as the
      first parameter (so didChangeFor can identify which method is calling it),
      followed by a list of keys that should be checked for changes.

      For example, in your render method you might pass the following context:
      if (this.didChangeFor('render','height','width')) {
         // Only render if changed
      }

      In your view's update method, you might instead pass 'update':

      if (this.didChangeFor('update', 'height', 'width')) {
        // Only update height and width properties
      }

      This method works by comparing property revision counts. Every time a
      property changes, an internal counter is incremented. When didChangeFor is
      invoked, the current revision count of the property is compared to the
      revision count from the last time this method was called.

      @param {String|Object} context a unique identifier
      @param {String…} propertyNames one or more property names
    */
    didChangeFor: function(context) {
      var valueCache, revisionCache, seenValues, seenRevisions, ret,
          currentRevision, idx, key, value;
      context = SC.hashFor(context) ; // get a hash key we can use in caches.

      // setup caches...
      valueCache = this._kvo_didChange_valueCache ;
      if (!valueCache) valueCache = this._kvo_didChange_valueCache = {};
      revisionCache = this._kvo_didChange_revisionCache;
      if (!revisionCache) revisionCache=this._kvo_didChange_revisionCache={};

      // get the cache of values and revisions already seen in this context
      seenValues = valueCache[context] || {} ;
      seenRevisions = revisionCache[context] || {} ;

      // prepare too loop!
      ret = false ;
      currentRevision = this._kvo_revision || 0  ;
      idx = arguments.length ;
      while(--idx >= 1) {  // NB: loop only to 1 to ignore context arg.
        key = arguments[idx];

        // has the kvo revision changed since the last time we did this?
        if (seenRevisions[key] != currentRevision) {
          // yes, check the value with the last seen value
          value = this.get(key) ;
          if (seenValues[key] !== value) {
            ret = true ; // did change!
            seenValues[key] = value;
          }
        }
        seenRevisions[key] = currentRevision;
      }

      valueCache[context] = seenValues ;
      revisionCache[context] = seenRevisions ;
      return ret ;
    },

    /**
      Sets the property only if the passed value is different from the
      current value.  Depending on how expensive a get() is on this property,
      this may be more efficient.

      NOTE: By default, the set() method will not set the value unless it has
      changed. However, this check can skipped by setting .property().idempotent(NO)
      setIfChanged() may be useful in this case.

      @param {String|Hash} key the key to change
      @param {Object} value the value to change
      @returns {SC.Observable}
    */
    setIfChanged: function(key, value) {
      if(value === undefined && SC.typeOf(key) === SC.T_HASH) {
        var hash = key;

        for(key in hash) {
          if (!hash.hasOwnProperty(key)) continue;
          this.setIfChanged(key, hash[key]);
        }

        return this;
      }

      return (this.get(key) !== value) ? this.set(key, value) : this ;
    },

    /**
      Navigates the property path, returning the value at that point.

      If any object in the path is undefined, returns undefined.
      @param {String} path The property path you want to retrieve
    */
    getPath: function(path) {
      var tuple = SC.tupleForPropertyPath(path, this) ;
      if (tuple === null || tuple[0] === null) return undefined ;
      return SC.get(tuple[0], tuple[1]) ;
    },

    /**
      Navigates the property path, finally setting the value.

      @param {String} path the property path to set
      @param {Object} value the value to set
      @returns {SC.Observable}
    */
    setPath: function(path, value) {
      if (path.indexOf('.') >= 0) {
        var tuple = SC.tupleForPropertyPath(path, this) ;
        if (!tuple || !tuple[0]) return null ;
        tuple[0].set(tuple[1], value) ;
      } else this.set(path, value) ; // shortcut
      return this;
    },

    /**
      Navigates the property path, finally setting the value but only if
      the value does not match the current value.  This will avoid sending
      unecessary change notifications.

      @param {String} path the property path to set
      @param {Object} value the value to set
      @returns {Object} this
    */
    setPathIfChanged: function(path, value) {
      if (path.indexOf('.') >= 0) {
        var tuple = SC.tupleForPropertyPath(path, this) ;
        if (!tuple || !tuple[0]) return null ;
        if (tuple[0].get(tuple[1]) !== value) {
          tuple[0].set(tuple[1], value) ;
        }
      } else this.setIfChanged(path, value) ; // shortcut
      return this;
    },

    /**
      Convenience method to get an array of properties.

      Pass in multiple property keys or an array of property keys.  This
      method uses getPath() so you can also pass key paths.

      @returns {Array} Values of property keys.
    */
    getEach: function() {
      var keys = SC.A(arguments),
          ret = [], idx, idxLen;
      for(idx=0, idxLen = keys.length; idx < idxLen;idx++) {
        ret[ret.length] = this.getPath(keys[idx]);
      }
      return ret ;
    },


    /**
      Increments the value of a property.

      @param {String} key property name
      @param {Number} increment the amount to increment (optional)
      @returns {Number} new value of property
    */
    incrementProperty: function(key,increment) {
      if (!increment) increment = 1;
      this.set(key,(this.get(key) || 0)+increment);
      return this.get(key) ;
    },

    /**
      Decrements the value of a property.

      @param {String} key property name
      @param {Number} increment the amount to decrement (optional)
      @returns {Number} new value of property
    */
    decrementProperty: function(key,increment) {
      if (!increment) increment = 1;
      this.set(key,(this.get(key) || 0) - increment) ;
      return this.get(key) ;
    },

    /**
      Inverts a property.  Property should be a bool.

      @param {String} key property name
      @param {Object} value optional parameter for "true" value
      @param {Object} alt optional parameter for "false" value
      @returns {Object} new value
    */
    toggleProperty: function(key,value,alt) {
      if (value === undefined) value = true ;
      if (alt === undefined) alt = false ;
      value = (this.get(key) == value) ? alt : value ;
      this.set(key,value);
      return this.get(key) ;
    },

    /**
      Convenience method to call propertyWillChange/propertyDidChange.

      Sometimes you need to notify observers that a property has changed value
      without actually changing this value.  In those cases, you can use this
      method as a convenience instead of calling propertyWillChange() and
      propertyDidChange().

      @param {String} key The property key that has just changed.
      @param {Object} value The new value of the key.  May be null.
      @returns {SC.Observable}
    */
    notifyPropertyChange: function(key, value) {
      this.propertyWillChange(key) ;
      this.propertyDidChange(key, value) ;
      return this;
    },

    /**
      Notifies observers of all possible property changes.

      Sometimes when you make a major update to your object, it is cheaper to
      simply notify all observers that their property might have changed than
      to figure out specifically which properties actually did change.

      In those cases, you can simply call this method to notify all property
      observers immediately.  Note that this ignores property groups.

      @returns {SC.Observable}
    */
    allPropertiesDidChange: function() {
      this._kvo_cache = null; //clear cached props
      this._notifyPropertyObservers('*') ;
      return this ;
    },

    /**
      Allows you to inspect a property for changes. Whenever the named property
      changes, a log will be printed to the console. This (along with removeProbe)
      are convenience methods meant for debugging purposes.

      @param {String} key The name of the property you want probed for changes
    */
    addProbe: function(key) { this.addObserver(key,SC.logChange); },

    /**
      Stops a running probe from observing changes to the observer.

      @param {String} key The name of the property you want probed for changes
    */
    removeProbe: function(key) { this.removeObserver(key,SC.logChange); },

    /**
      Logs the named properties to the SC.Logger.

      @param {String...} propertyNames one or more property names
    */
    logProperty: function() {
      var props = SC.$A(arguments),
          prop, propsLen, idx;
      for(idx=0, propsLen = props.length; idx<propsLen; idx++) {
        prop = props[idx] ;
        SC.Logger.log('%@:%@: '.fmt(SC.guidFor(this), prop), this.get(prop)) ;
      }
    },

    propertyRevision: 1

  } ;

  /** @private used by addProbe/removeProbe */
  SC.logChange = function logChange(target, key, value) {
    SC.Logger.log("CHANGE: %@[%@] => %@".fmt(target, key, target.get(key)));
  };

  /**
    Retrieves a property from an object, using get() if the
    object implements SC.Observable.

    @param  {Object}  object  the object to query
    @param  {String}  key the property to retrieve
  */
  SC.mixin(SC, {
    get: function(object, key) {
      if (!object) return undefined;
      if (key === undefined) return this[object];
      if (object.get) return object.get(key);
      return object[key];
    },

    /**
      Retrieves a property from an object at a specified path, using get() if
      the object implements SC.Observable.

      @param  {Object}  object  the object to query
      @param  {String}  path the path to the property to retrieve
    */
    getPath: function(object, path) {
      if (path === undefined) {
        path = object;
        object = window;
      }
      return SC.objectForPropertyPath(path, object);
    }
  });

  // Make all Array's observable
  SC.mixin(Array.prototype, SC.Observable) ;

/* >>>>>>>>>> BEGIN source/system/enumerator.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  An object that iterates over all of the values in an object.

  An instance of this object is returned everytime you call the
  enumerator() method on an object that implements the SC.Enumerable mixin.

  Once you create an enumerator instance, you can call nextObject() on it
  until you can iterated through the entire collection.  Once you have
  exhausted the enumerator, you can reuse it if you want by calling reset().

  @since SproutCore 1.0
*/
SC.Enumerator = function(enumerableObject) {
  this.enumerable = enumerableObject ;
  this.reset() ;
  return this ;
} ;

SC.Enumerator.prototype = /** @scope SC.Enumerator.prototype */{

  /**
    Returns the next object in the enumeration or undefined when complete.

    @returns {Object} the next object or undefined
  */
  nextObject: function() {
    var index = this._index ;
    var len = this._length;
    if (index >= len) return undefined ; // nothing to do

    // get the value
    var ret = this.enumerable.nextObject(index, this._previousObject, this._context) ;
    this._previousObject = ret ;
    this._index = index + 1 ;

    if (index >= len) {
      this._context = SC.Enumerator._pushContext(this._context);
    }

    return ret ;
  },

  /**
    Resets the enumerator to the beginning.  This is a nice way to reuse
    an existing enumerator.

    @returns {Object} this
  */
  reset: function() {
    var e = this.enumerable ;
    if (!e) throw SC.$error("Enumerator has been destroyed");
    this._length = e.get ? e.get('length') : e.length ;
    var len = this._length;
    this._index = 0;
    this._previousObject = null ;
    this._context = (len > 0) ? SC.Enumerator._popContext() : null;
  },

  /**
    Releases the enumerators enumerable object.  You cannot use this object
    anymore.  This is not often needed but it is useful when you need to
    make sure memory gets cleared.

    @returns {Object} null
  */
  destroy: function() {
    this.enumerable = this._length = this._index = this._previousObject = this._context = null;
  }

} ;

/**
  Use this method to manually create a new Enumerator object.  Usually you
  will not access this method directly but instead call enumerator() on the
  item you want to enumerate.

  @param {SC.Enumerable}  enumerableObject enumerable object.
  @returns {SC.Enumerator} the enumerator
*/
SC.Enumerator.create = function(enumerableObject) {
  return new SC.Enumerator(enumerableObject) ;
};

// Private context caching methods.  This avoids recreating lots of context
// objects.

SC.Enumerator._popContext = function() {
  var ret = this._contextCache ? this._contextCache.pop() : null ;
  return ret || {} ;
} ;

SC.Enumerator._pushContext = function(context) {
  this._contextCache = this._contextCache || [] ;
  var cache = this._contextCache;
  cache.push(context);
  return null ;
};


/* >>>>>>>>>> BEGIN source/mixins/enumerable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('core') ;
sc_require('ext/function');
sc_require('system/enumerator');

/*globals Prototype */

/**
  @class

  This mixin defines the common interface implemented by enumerable objects
  in SproutCore.  Most of these methods follow the standard Array iteration
  API defined up to JavaScript 1.8 (excluding language-specific features that
  cannot be emulated in older versions of JavaScript).

  This mixin is applied automatically to the Array class on page load, so you
  can use any of these methods on simple arrays.  If Array already implements
  one of these methods, the mixin will not override them.

  Writing Your Own Enumerable
  -----

  To make your own custom class enumerable, you need two items:

  1. You must have a length property.  This property should change whenever
     the number of items in your enumerable object changes.  If you using this
     with an SC.Object subclass, you should be sure to change the length
     property using set().

  2. You must implement nextObject().  See documentation.

  Once you have these two methods implemented, apply the SC.Enumerable mixin
  to your class and you will be able to enumerate the contents of your object
  like any other collection.

  Using SproutCore Enumeration with Other Libraries
  -----

  Many other libraries provide some kind of iterator or enumeration like
  facility.  This is often where the most common API conflicts occur.
  SproutCore's API is designed to be as friendly as possible with other
  libraries by implementing only methods that mostly correspond to the
  JavaScript 1.8 API.

  @since SproutCore 1.0
*/
SC.Enumerable = /** @scope SC.Enumerable.prototype */{

  /**
    Walk like a duck.

    @type Boolean
  */
  isEnumerable: YES,

  /**
    Implement this method to make your class enumerable.

    This method will be called repeatedly during enumeration.  The index value
    will always begin with 0 and increment monotonically.  You don't have to
    rely on the index value to determine what object to return, but you should
    always check the value and start from the beginning when you see the
    requested index is 0.

    The previousObject is the object that was returned from the last call
    to nextObject for the current iteration.  This is a useful way to
    manage iteration if you are tracing a linked list, for example.

    Finally the context parameter will always contain a hash you can use as
    a "scratchpad" to maintain any other state you need in order to iterate
    properly.  The context object is reused and is not reset between
    iterations so make sure you setup the context with a fresh state whenever
    the index parameter is 0.

    Generally iterators will continue to call nextObject until the index
    reaches the your current length-1.  If you run out of data before this
    time for some reason, you should simply return undefined.

    The default implementation of this method simply looks up the index.
    This works great on any Array-like objects.

    @param {Number} index the current index of the iteration
    @param {Object} previousObject the value returned by the last call to nextObject.
    @param {Object} context a context object you can use to maintain state.
    @returns {Object} the next object in the iteration or undefined
  */
  nextObject: function(index, previousObject, context) {
    return this.objectAt ? this.objectAt(index) : this[index] ;
  },

  /**
    Helper method returns the first object from a collection.  This is usually
    used by bindings and other parts of the framework to extract a single
    object if the enumerable contains only one item.

    If you override this method, you should implement it so that it will
    always return the same value each time it is called.  If your enumerable
    contains only one object, this method should always return that object.
    If your enumerable is empty, this method should return undefined.

    @returns {Object} the object or undefined
  */
  firstObject: function() {
    if (this.get('length')===0) return undefined ;
    if (this.objectAt) return this.objectAt(0); // support arrays out of box

    // handle generic enumerables
    var context = SC.Enumerator._popContext(), ret;
    ret = this.nextObject(0, null, context);
    context = SC.Enumerator._pushContext(context);
    return ret ;
  }.property(),

  /**
    Helper method returns the last object from a collection.

    @returns {Object} the object or undefined
  */
  lastObject: function() {
    var len = this.get('length');
    if (len===0) return undefined ;
    if (this.objectAt) return this.objectAt(len-1); // support arrays out of box
  }.property(),

  /**
    Returns a new enumerator for this object.  See SC.Enumerator for
    documentation on how to use this object.  Enumeration is an alternative
    to using one of the other iterators described here.

    @returns {SC.Enumerator} an enumerator for the receiver
  */
  enumerator: function() { return SC.Enumerator.create(this); },

  /**
    Iterates through the enumerable, calling the passed function on each
    item.  This method corresponds to the forEach() method defined in
    JavaScript 1.6.

    The callback method you provide should have the following signature (all
    parameters are optional):

          function(item, index, enumerable) ;

    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.

    @param {Function} callback the callback to execute
    @param {Object} target the target object to use
    @returns {Object} this
  */
  forEach: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;

    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      callback.call(target, next, idx, this);
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return this ;
  },

  /**
    Retrieves the named value on each member object.  This is more efficient
    than using one of the wrapper methods defined here.  Objects that
    implement SC.Observable will use the get() method, otherwise the property
    will be accessed directly.

    @param {String} key the key to retrieve
    @returns {Array} extracted values
  */
  getEach: function(key) {
    return this.map(function(next) {
      return next ? (next.get ? next.get(key) : next[key]) : null;
    }, this);
  },

  /**
    Sets the value on the named property for each member.  This is more
    efficient than using other methods defined on this helper.  If the object
    implements SC.Observable, the value will be changed to set(), otherwise
    it will be set directly.  null objects are skipped.

    @param {String} key the key to set
    @param {Object} value the object to set
    @returns {Object} receiver
  */
  setEach: function(key, value) {
    this.forEach(function(next) {
      if (next) {
        if (next.set) next.set(key, value) ;
        else next[key] = value ;
      }
    }, this);
    return this ;
  },

  /**
    Maps all of the items in the enumeration to another value, returning
    a new array.  This method corresponds to map() defined in JavaScript 1.6.

    The callback method you provide should have the following signature (all
    parameters are optional):

        function(item, index, enumerable) ;

    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.

    It should return the mapped value.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.

    @param {Function} callback the callback to execute
    @param {Object} target the target object to use
    @returns {Array} The mapped array.
  */
  map: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;

    var ret  = [];
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      ret[idx] = callback.call(target, next, idx, this) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Similar to map, this specialized function returns the value of the named
    property on all items in the enumeration.

    @param {String} key name of the property
    @returns {Array} The mapped array.
  */
  mapProperty: function(key) {
    return this.map(function(next) {
      return next ? (next.get ? next.get(key) : next[key]) : null;
    });
  },

  /**
    Returns an array with all of the items in the enumeration that the passed
    function returns YES for. This method corresponds to filter() defined in
    JavaScript 1.6.

    The callback method you provide should have the following signature (all
    parameters are optional):

          function(item, index, enumerable) ;

    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.

    It should return the YES to include the item in the results, NO otherwise.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.

    @param {Function} callback the callback to execute
    @param {Object} target the target object to use
    @returns {Array} A filtered array.
  */
  filter: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;

    var ret  = [];
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      if(callback.call(target, next, idx, this)) ret.push(next) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Returns an array sorted by the value of the passed key parameters.
    null objects will be sorted first.  You can pass either an array of keys
    or multiple parameters which will act as key names

    @param {String} key one or more key names
    @returns {Array}
  */
  sortProperty: function(key) {
    var keys = (typeof key === SC.T_STRING) ? arguments : key,
        len  = keys.length,
        src;

    // get the src array to sort
    if (this instanceof Array) src = this;
    else {
      src = [];
      this.forEach(function(i) { src.push(i); });
    }

    if (!src) return [];
    return src.sort(function(a,b) {
      var idx, key, aValue, bValue, ret = 0;

      for(idx=0;ret===0 && idx<len;idx++) {
        key = keys[idx];
        aValue = a ? (a.get ? a.get(key) : a[key]) : null;
        bValue = b ? (b.get ? b.get(key) : b[key]) : null;
        ret = SC.compare(aValue, bValue);
      }
      return ret ;
    });
  },


  /**
    Returns an array with just the items with the matched property.  You
    can pass an optional second argument with the target value.  Otherwise
    this will match any property that evaluates to true.

    @param {String} key the property to test
    @param {String} value optional value to test against.
    @returns {Array} filtered array
  */
  filterProperty: function(key, value) {
    var len = this.get ? this.get('length') : this.length ;
    var ret  = [];
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      var cur = next ? (next.get ? next.get(key) : next[key]) : null;
      var matched = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      if (matched) ret.push(next) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Returns the first item in the array for which the callback returns YES.
    This method works similar to the filter() method defined in JavaScript 1.6
    except that it will stop working on the array once a match is found.

    The callback method you provide should have the following signature (all
    parameters are optional):

          function(item, index, enumerable) ;

    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.

    It should return the YES to include the item in the results, NO otherwise.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.

    @param {Function} callback the callback to execute
    @param {Object} target the target object to use
    @returns {Object} Found item or null.
  */
  find: function(callback, target) {
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;

    var last = null, next, found = NO, ret = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len && !found;idx++) {
      next = this.nextObject(idx, last, context) ;
      if (found = callback.call(target, next, idx, this)) ret = next ;
      last = next ;
    }
    next = last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Returns an the first item with a property matching the passed value.  You
    can pass an optional second argument with the target value.  Otherwise
    this will match any property that evaluates to true.

    This method works much like the more generic find() method.

    @param {String} key the property to test
    @param {String} value optional value to test against.
    @returns {Object} found item or null
  */
  findProperty: function(key, value) {
    var len = this.get ? this.get('length') : this.length ;
    var found = NO, ret = null, last = null, next, cur ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len && !found;idx++) {
      next = this.nextObject(idx, last, context) ;
      cur = next ? (next.get ? next.get(key) : next[key]) : null;
      found = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      if (found) ret = next ;
      last = next ;
    }
    last = next = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Returns YES if the passed function returns YES for every item in the
    enumeration.  This corresponds with the every() method in JavaScript 1.6.

    The callback method you provide should have the following signature (all
    parameters are optional):

          function(item, index, enumerable) ;

    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.

    It should return the YES or NO.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.

    Example Usage:

          if (people.every(isEngineer)) { Paychecks.addBigBonus(); }

    @param {Function} callback the callback to execute
    @param {Object} target the target object to use
    @returns {Boolean}
  */
  every: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;

    var ret  = YES;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;ret && (idx<len);idx++) {
      var next = this.nextObject(idx, last, context) ;
      if(!callback.call(target, next, idx, this)) ret = NO ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Returns YES if the passed property resolves to true for all items in the
    enumerable.  This method is often simpler/faster than using a callback.

    @param {String} key the property to test
    @param {String} value optional value to test against.
    @returns {Array} filtered array
  */
  everyProperty: function(key, value) {
    var len = this.get ? this.get('length') : this.length ;
    var ret  = YES;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;ret && (idx<len);idx++) {
      var next = this.nextObject(idx, last, context) ;
      var cur = next ? (next.get ? next.get(key) : next[key]) : null;
      ret = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },


  /**
    Returns YES if the passed function returns true for any item in the
    enumeration. This corresponds with the every() method in JavaScript 1.6.

    The callback method you provide should have the following signature (all
    parameters are optional):

          function(item, index, enumerable) ;

    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.

    It should return the YES to include the item in the results, NO otherwise.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context.  This is a good way
    to give your iterator function access to the current object.

    Usage Example:

          if (people.some(isManager)) { Paychecks.addBiggerBonus(); }

    @param {Function} callback the callback to execute
    @param {Object} target the target object to use
    @returns {Array} A filtered array.
  */
  some: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;
    if (target === undefined) target = null;

    var ret  = NO;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;(!ret) && (idx<len);idx++) {
      var next = this.nextObject(idx, last, context) ;
      if(callback.call(target, next, idx, this)) ret = YES ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Returns YES if the passed property resolves to true for any item in the
    enumerable.  This method is often simpler/faster than using a callback.

    @param {String} key the property to test
    @param {String} value optional value to test against.
    @returns {Boolean} YES
  */
  someProperty: function(key, value) {
    var len = this.get ? this.get('length') : this.length ;
    var ret  = NO;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0; !ret && (idx<len); idx++) {
      var next = this.nextObject(idx, last, context) ;
      var cur = next ? (next.get ? next.get(key) : next[key]) : null;
      ret = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;  // return the invert
  },

  /**
    This will combine the values of the enumerator into a single value. It
    is a useful way to collect a summary value from an enumeration.  This
    corresponds to the reduce() method defined in JavaScript 1.8.

    The callback method you provide should have the following signature (all
    parameters are optional):

          function(previousValue, item, index, enumerable) ;

    - *previousValue* is the value returned by the last call to the iterator.
    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.

    Return the new cumulative value.

    In addition to the callback you can also pass an initialValue.  An error
    will be raised if you do not pass an initial value and the enumerator is
    empty.

    Note that unlike the other methods, this method does not allow you to
    pass a target object to set as this for the callback.  It's part of the
    spec. Sorry.

    @param {Function} callback the callback to execute
    @param {Object} initialValue initial value for the reduce
    @param {String} reducerProperty internal use only.  May not be available.
    @returns {Object} The reduced value.
  */
  reduce: function(callback, initialValue, reducerProperty) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = this.get ? this.get('length') : this.length ;

    // no value to return if no initial value & empty
    if (len===0 && initialValue === undefined) throw new TypeError();

    var ret  = initialValue;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;

      // while ret is still undefined, just set the first value we get as ret.
      // this is not the ideal behavior actually but it matches the FireFox
      // implementation... :(
      if (next !== null) {
        if (ret === undefined) {
          ret = next ;
        } else {
          ret = callback.call(null, ret, next, idx, this, reducerProperty);
        }
      }
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);

    // uh oh...we never found a value!
    if (ret === undefined) throw new TypeError() ;
    return ret ;
  },

  /**
    Invokes the named method on every object in the receiver that
    implements it.  This method corresponds to the implementation in
    Prototype 1.6.

    @param {String} methodName the name of the method
    @param {Object...} args optional arguments to pass as well.
    @returns {Array} return values from calling invoke.
  */
  invoke: function(methodName) {
    var len = this.get ? this.get('length') : this.length ;
    if (len <= 0) return [] ; // nothing to invoke....

    var idx;

    // collect the arguments
    var args = [] ;
    var alen = arguments.length ;
    if (alen > 1) {
      for(idx=1;idx<alen;idx++) args.push(arguments[idx]) ;
    }

    // call invoke
    var ret = [] ;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      var method = next ? next[methodName] : null ;
      if (method) ret[idx] = method.apply(next, args) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Invokes the passed method and optional arguments on the receiver elements
    as long as the methods return value matches the target value.  This is
    a useful way to attempt to apply changes to a collection of objects unless
    or until one fails.

    @param {Object} targetValue the target return value
    @param {String} methodName the name of the method
    @param {Object...} args optional arguments to pass as well.
    @returns {Array} return values from calling invoke.
  */
  invokeWhile: function(targetValue, methodName) {
    var len = this.get ? this.get('length') : this.length ;
    if (len <= 0) return null; // nothing to invoke....

    var idx;

    // collect the arguments
    var args = [] ;
    var alen = arguments.length ;
    if (alen > 2) {
      for(idx=2;idx<alen;idx++) args.push(arguments[idx]) ;
    }

    // call invoke
    var ret = targetValue ;
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(idx=0;(ret === targetValue) && (idx<len);idx++) {
      var next = this.nextObject(idx, last, context) ;
      var method = next ? next[methodName] : null ;
      if (method) ret = method.apply(next, args) ;
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return ret ;
  },

  /**
    Simply converts the enumerable into a genuine array.  The order, of
    course, is not gauranteed.  Corresponds to the method implemented by
    Prototype.

    @returns {Array} the enumerable as an array.
  */
  toArray: function() {
    var ret = [];
    this.forEach(function(o) { ret.push(o); }, this);
    return ret ;
  },

  /**
    Converts an enumerable into a matrix, with inner arrays grouped based
    on a particular property of the elements of the enumerable.

    @param {String} key the property to test
    @returns {Array} matrix of arrays
  */
  groupBy: function(key){
    var len = this.get ? this.get('length') : this.length,
        ret = [],
        last = null,
        context = SC.Enumerator._popContext(),
        grouped = [],
        keyValues = [],
        idx, next, cur;

    for(idx=0;idx<len;idx++) {
      next = this.nextObject(idx, last, context) ;
      cur = next ? (next.get ? next.get(key) : next[key]) : null;
      if(SC.none(grouped[cur])) {
        grouped[cur] = []; keyValues.push(cur);
      }
      grouped[cur].push(next);
      last = next;
    }
    last = null;
    context = SC.Enumerator._pushContext(context);

    for(idx=0,len=keyValues.length; idx < len; idx++){
      ret.push(grouped[keyValues[idx]]);
    }
    return ret ;
  }

} ;

// Build in a separate function to avoid unintential leaks through closures...
SC._buildReducerFor = function(reducerKey, reducerProperty) {
  return function(key, value) {
    var reducer = this[reducerKey] ;
    if (SC.typeOf(reducer) !== SC.T_FUNCTION) {
      return this.unknownProperty ? this.unknownProperty(key, value) : null;
    } else {
      // Invoke the reduce method defined in enumerable instead of using the
      // one implemented in the receiver.  The receiver might be a native
      // implementation that does not support reducerProperty.
      var ret = SC.Enumerable.reduce.call(this, reducer, null, reducerProperty) ;
      return ret ;
    }
  }.property('[]') ;
};

/** @class */
SC.Reducers = /** @scope SC.Reducers.prototype */ {
  /**
    This property will trigger anytime the enumerable's content changes.
    You can observe this property to be notified of changes to the enumerables
    content.

    For plain enumerables, this property is read only.  SC.Array overrides
    this method.

    @property {SC.Array}
  */
  '[]': function(key, value) { return this ; }.property(),

  /**
    Invoke this method when the contents of your enumerable has changed.
    This will notify any observers watching for content changes.  If your are
    implementing an ordered enumerable (such as an array), also pass the
    start and end values where the content changed so that it can be used to
    notify range observers.

    @param {Number} start optional start offset for the content change
    @param {Number} length optional length of change
    @param {Number} delta if you added or removed objects, the delta change
    @param {Array} addedObjects the objects that were added
    @param {Array} removedObjects the objects that were removed
    @returns {Object} receiver
  */
  enumerableContentDidChange: function(start, length, deltas) {
    this.notifyPropertyChange('[]') ;
  },

  /**
    Call this method from your unknownProperty() handler to implement
    automatic reduced properties.  A reduced property is a property that
    collects its contents dynamically from your array contents.  Reduced
    properties always begin with "@".  Getting this property will call
    reduce() on your array with the function matching the key name as the
    processor.

    The return value of this will be either the return value from the
    reduced property or undefined, which means this key is not a reduced
    property.  You can call this at the top of your unknownProperty handler
    like so:

      unknownProperty: function(key, value) {
        var ret = this.handleReduceProperty(key, value) ;
        if (ret === undefined) {
          // process like normal
        }
      }

    @param {String} key the reduce property key

    @param {Object} value a value or undefined.

    @param {Boolean} generateProperty only set to false if you do not want
      an optimized computed property handler generated for this.  Not common.

    @returns {Object} the reduced property or undefined
  */
  reducedProperty: function(key, value, generateProperty) {

    if (!key || typeof key !== SC.T_STRING || key.charAt(0) !== '@') return undefined ; // not a reduced property

    // get the reducer key and the reducer
    var matches = key.match(/^@([^(]*)(\(([^)]*)\))?$/) ;
    if (!matches || matches.length < 2) return undefined ; // no match

    var reducerKey = matches[1]; // = 'max' if key = '@max(balance)'
    var reducerProperty = matches[3] ; // = 'balance' if key = '@max(balance)'
    reducerKey = "reduce" + reducerKey.slice(0,1).toUpperCase() + reducerKey.slice(1);
    var reducer = this[reducerKey] ;

    // if there is no reduce function defined for this key, then we can't
    // build a reducer for it.
    if (SC.typeOf(reducer) !== SC.T_FUNCTION) return undefined;

    // if we can't generate the property, just run reduce
    if (generateProperty === NO) {
      return SC.Enumerable.reduce.call(this, reducer, null, reducerProperty) ;
    }

    // ok, found the reducer.  Let's build the computed property and install
    var func = SC._buildReducerFor(reducerKey, reducerProperty);
    var p = this.constructor.prototype ;

    if (p) {
      p[key] = func ;

      // add the function to the properties array so that new instances
      // will have their dependent key registered.
      var props = p._properties || [] ;
      props.push(key) ;
      p._properties = props ;
      this.registerDependentKey(key, '[]') ;
    }

    // and reduce anyway...
    return SC.Enumerable.reduce.call(this, reducer, null, reducerProperty) ;
  },

  /**
    Reducer for @max reduced property.

    @param {Object} previousValue The previous value in the enumerable
    @param {Object} item The current value in the enumerable
    @param {Number} index The index of the current item in the enumerable
    @param {String} reducerProperty (Optional) The property in the enumerable being reduced

    @returns {Object} reduced value
  */
  reduceMax: function(previousValue, item, index, e, reducerProperty) {
    if (reducerProperty && item) {
      item = item.get ? item.get(reducerProperty) : item[reducerProperty];
    }
    if (previousValue === null) return item ;
    return (item > previousValue) ? item : previousValue ;
  },

  /**
    Reduces an enumberable to the max of the items in the enumerable. If
    reducerProperty is passed, it will reduce that property. Otherwise, it will
    reduce the item itself.

    @param {Object} previousValue The previous value in the enumerable
    @param {Object} item The current value in the enumerable
    @param {Number} index The index of the current item in the enumerable
    @param {String} reducerProperty (Optional) The property in the enumerable being reduced

    @returns {Object} reduced value
  */
  reduceMaxObject: function(previousItem, item, index, e, reducerProperty) {

    // get the value for both the previous and current item.  If no
    // reducerProperty was supplied, use the items themselves.
    var previousValue = previousItem, itemValue = item ;
    if (reducerProperty) {
      if (item) {
        itemValue = item.get ? item.get(reducerProperty) : item[reducerProperty] ;
      }

      if (previousItem) {
        previousValue = previousItem.get ? previousItem.get(reducerProperty) : previousItem[reducerProperty] ;
      }
    }
    if (previousValue === null) return item ;
    return (itemValue > previousValue) ? item : previousItem ;
  },

  /**
    Reduces an enumberable to the min of the items in the enumerable. If
    reducerProperty is passed, it will reduce that property. Otherwise, it will
    reduce the item itself.

    @param {Object} previousValue The previous value in the enumerable
    @param {Object} item The current value in the enumerable
    @param {Number} index The index of the current item in the enumerable
    @param {String} reducerProperty (Optional) The property in the enumerable being reduced

    @returns {Object} reduced value
  */
  reduceMin: function(previousValue, item, index, e, reducerProperty) {
    if (reducerProperty && item) {
      item = item.get ? item.get(reducerProperty) : item[reducerProperty];
    }
    if (previousValue === null) return item ;
    return (item < previousValue) ? item : previousValue ;
  },

  /**
    Reduces an enumberable to the max of the items in the enumerable. If
    reducerProperty is passed, it will reduce that property. Otherwise, it will
    reduce the item itself.

    @param {Object} previousValue The previous value in the enumerable
    @param {Object} item The current value in the enumerable
    @param {Number} index The index of the current item in the enumerable
    @param {String} reducerProperty (Optional) The property in the enumerable being reduced

    @returns {Object} reduced value
  */
  reduceMinObject: function(previousItem, item, index, e, reducerProperty) {

    // get the value for both the previous and current item.  If no
    // reducerProperty was supplied, use the items themselves.
    var previousValue = previousItem, itemValue = item ;
    if (reducerProperty) {
      if (item) {
        itemValue = item.get ? item.get(reducerProperty) : item[reducerProperty] ;
      }

      if (previousItem) {
        previousValue = previousItem.get ? previousItem.get(reducerProperty) : previousItem[reducerProperty] ;
      }
    }
    if (previousValue === null) return item ;
    return (itemValue < previousValue) ? item : previousItem ;
  },

  /**
    Reduces an enumberable to the average of the items in the enumerable. If
    reducerProperty is passed, it will reduce that property. Otherwise, it will
    reduce the item itself.

    @param {Object} previousValue The previous value in the enumerable
    @param {Object} item The current value in the enumerable
    @param {Number} index The index of the current item in the enumerable
    @param {String} reducerProperty (Optional) The property in the enumerable being reduced

    @returns {Object} reduced value
  */
  reduceAverage: function(previousValue, item, index, e, reducerProperty) {
    if (reducerProperty && item) {
      item = item.get ? item.get(reducerProperty) : item[reducerProperty];
    }
    var ret = (previousValue || 0) + item ;
    var len = e.get ? e.get('length') : e.length;
    if (index >= len-1) ret = ret / len; //avg after last item.
    return ret ;
  },

  /**
    Reduces an enumberable to the sum of the items in the enumerable. If
    reducerProperty is passed, it will reduce that property. Otherwise, it will
    reduce the item itself.

    @param {Object} previousValue The previous value in the enumerable
    @param {Object} item The current value in the enumerable
    @param {Number} index The index of the current item in the enumerable
    @param {String} reducerProperty (Optional) The property in the enumerable being reduced

    @returns {Object} reduced value
  */
  reduceSum: function(previousValue, item, index, e, reducerProperty) {
    if (reducerProperty && item) {
      item = item.get ? item.get(reducerProperty) : item[reducerProperty];
    }
    return (previousValue === null) ? item : previousValue + item ;
  }
} ;

// Apply reducers...
SC.mixin(SC.Enumerable, SC.Reducers) ;
SC.mixin(Array.prototype, SC.Reducers) ;
Array.prototype.isEnumerable = YES ;

// ......................................................
// ARRAY SUPPORT
//

// Implement the same enhancements on Array.  We use specialized methods
// because working with arrays are so common.
(function() {

  // These methods will be applied even if they already exist b/c we do it
  // better.
  var alwaysMixin = {

    // this is supported so you can get an enumerator.  The rest of the
    // methods do not use this just to squeeze every last ounce of perf as
    // possible.
    nextObject: SC.Enumerable.nextObject,
    enumerator: SC.Enumerable.enumerator,
    firstObject: SC.Enumerable.firstObject,
    lastObject: SC.Enumerable.lastObject,
    sortProperty: SC.Enumerable.sortProperty,

    // see above...
    mapProperty: function(key) {
      var len = this.length ;
      var ret  = [];
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        ret[idx] = next ? (next.get ? next.get(key) : next[key]) : null;
      }
      return ret ;
    },

    filterProperty: function(key, value) {
      var len = this.length ;
      var ret  = [];
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        var cur = next ? (next.get ? next.get(key) : next[key]) : null;
        var matched = (value === undefined) ? !!cur : SC.isEqual(cur, value);
        if (matched) ret.push(next) ;
      }
      return ret ;
    },

    //returns a matrix
    groupBy: function(key) {
      var len = this.length,
          ret = [],
          grouped = [],
          keyValues = [],
          idx, next, cur;

      for(idx=0;idx<len;idx++) {
        next = this[idx] ;
        cur = next ? (next.get ? next.get(key) : next[key]) : null;
        if(SC.none(grouped[cur])){ grouped[cur] = []; keyValues.push(cur); }
        grouped[cur].push(next);
      }

      for(idx=0,len=keyValues.length; idx < len; idx++){
        ret.push(grouped[keyValues[idx]]);
      }
      return ret ;
    },

    find: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      var next, ret = null, found = NO;
      for(var idx=0;idx<len && !found;idx++) {
        next = this[idx] ;
        if(found = callback.call(target, next, idx, this)) ret = next ;
      }
      next = null;
      return ret ;
    },

    findProperty: function(key, value) {
      var len = this.length ;
      var next, cur, found=NO, ret=null;
      for(var idx=0;idx<len && !found;idx++) {
        cur = (next=this[idx]) ? (next.get ? next.get(key): next[key]):null;
        found = (value === undefined) ? !!cur : SC.isEqual(cur, value);
        if (found) ret = next ;
      }
      next=null;
      return ret ;
    },

    everyProperty: function(key, value) {
      var len = this.length ;
      var ret  = YES;
      for(var idx=0;ret && (idx<len);idx++) {
        var next = this[idx] ;
        var cur = next ? (next.get ? next.get(key) : next[key]) : null;
        ret = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      }
      return ret ;
    },

    someProperty: function(key, value) {
      var len = this.length ;
      var ret  = NO;
      for(var idx=0; !ret && (idx<len); idx++) {
        var next = this[idx] ;
        var cur = next ? (next.get ? next.get(key) : next[key]) : null;
        ret = (value === undefined) ? !!cur : SC.isEqual(cur, value);
      }
      return ret ;  // return the invert
    },

    invoke: function(methodName) {
      var len = this.length ;
      if (len <= 0) return [] ; // nothing to invoke....

      var idx;

      // collect the arguments
      var args = [] ;
      var alen = arguments.length ;
      if (alen > 1) {
        for(idx=1;idx<alen;idx++) args.push(arguments[idx]) ;
      }

      // call invoke
      var ret = [] ;
      for(idx=0;idx<len;idx++) {
        var next = this[idx] ;
        var method = next ? next[methodName] : null ;
        if (method) ret[idx] = method.apply(next, args) ;
      }
      return ret ;
    },

    invokeWhile: function(targetValue, methodName) {
      var len = this.length ;
      if (len <= 0) return null ; // nothing to invoke....

      var idx;

      // collect the arguments
      var args = [] ;
      var alen = arguments.length ;
      if (alen > 2) {
        for(idx=2;idx<alen;idx++) args.push(arguments[idx]) ;
      }

      // call invoke
      var ret = targetValue ;
      for(idx=0;(ret === targetValue) && (idx<len);idx++) {
        var next = this[idx] ;
        var method = next ? next[methodName] : null ;
        if (method) ret = method.apply(next, args) ;
      }
      return ret ;
    },

    toArray: function() {
      var len = this.length ;
      if (len <= 0) return [] ; // nothing to invoke....

      // call invoke
      var ret = [] ;
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;
        ret.push(next) ;
      }
      return ret ;
    },

    getEach: function(key) {
      var ret = [];
      var len = this.length ;
      for(var idx=0;idx<len;idx++) {
        var obj = this[idx];
        ret[idx] = obj ? (obj.get ? obj.get(key) : obj[key]) : null;
      }
      return ret ;
    },

    setEach: function(key, value) {
      var len = this.length;
      for(var idx=0;idx<len;idx++) {
        var obj = this[idx];
        if (obj) {
          if (obj.set) {
            obj.set(key, value);
          } else obj[key] = value ;
        }
      }
      return this ;
    }

  };

  // These methods will only be applied if they are not already defined b/c
  // the browser is probably getting it.
  var mixinIfMissing = {

    // QUESTION: The lack of DRY is burning my eyes [YK]
    forEach: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;

      // QUESTION: Is this necessary?
      if (target === undefined) target = null;

      for(var i=0, l=this.length; i<l; i++) {
        var next = this[i] ;
        callback.call(target, next, i, this);
      }
      return this ;
    },

    map: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;

      if (target === undefined) target = null;

      var ret  = [];
      for(var i=0, l=this.length; i<l; i++) {
        var next = this[i] ;
        ret[i] = callback.call(target, next, i, this) ;
      }
      return ret ;
    },

    filter: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;

      if (target === undefined) target = null;

      var ret  = [];
      for(var i=0, l=this.length; i<l; i++) {
        var next = this[i] ;
        if(callback.call(target, next, i, this)) ret.push(next) ;
      }
      return ret ;
    },

    every: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      var ret  = YES;
      for(var idx=0;ret && (idx<len);idx++) {
        var next = this[idx] ;
        if(!callback.call(target, next, idx, this)) ret = NO ;
      }
      return ret ;
    },

    some: function(callback, target) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;
      if (target === undefined) target = null;

      var ret  = NO;
      for(var idx=0;(!ret) && (idx<len);idx++) {
        var next = this[idx] ;
        if(callback.call(target, next, idx, this)) ret = YES ;
      }
      return ret ;
    },

    reduce: function(callback, initialValue, reducerProperty) {
      if (typeof callback !== "function") throw new TypeError() ;
      var len = this.length ;

      // no value to return if no initial value & empty
      if (len===0 && initialValue === undefined) throw new TypeError();

      var ret  = initialValue;
      for(var idx=0;idx<len;idx++) {
        var next = this[idx] ;

        // while ret is still undefined, just set the first value we get as
        // ret. this is not the ideal behavior actually but it matches the
        // FireFox implementation... :(
        if (next !== null) {
          if (ret === undefined) {
            ret = next ;
          } else {
            ret = callback.call(null, ret, next, idx, this, reducerProperty);
          }
        }
      }

      // uh oh...we never found a value!
      if (ret === undefined) throw new TypeError() ;
      return ret ;
    }
  };

  // Apply methods if missing...
  for(var key in mixinIfMissing) {
    if (!mixinIfMissing.hasOwnProperty(key)) continue ;

    // The mixinIfMissing methods should be applied if they are not defined.
    // If Prototype 1.6 is included, some of these methods will be defined
    // already, but we want to override them anyway in this special case
    // because our version is faster and functionally identitical.
    if (!Array.prototype[key] || ((typeof Prototype === 'object') && Prototype.Version.match(/^1\.6/))) {
      Array.prototype[key] = mixinIfMissing[key] ;
    }
  }

  // Apply other methods...
  SC.mixin(Array.prototype, alwaysMixin) ;

})() ;


/* >>>>>>>>>> BEGIN source/system/range_observer.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** @class

  A RangeObserver is used by Arrays to automatically observe all of the
  objects in a particular range on the array.  Whenever any property on one
  of those objects changes, it will notify its delegate.  Likewise, whenever
  the contents of the array itself changes, it will notify its delegate and
  possibly update its own registration.

  This implementation uses only SC.Array methods.  It can be used on any
  object that complies with SC.Array.  You may, however, choose to subclass
  this object in a way that is more optimized for your particular design.

  @since SproutCore 1.0
*/
SC.RangeObserver = /** @scope SC.RangeObserver.prototype */{

  /**
    Walk like a duck.

    @property {Boolean}
  */
  isRangeObserver: YES,

  /** @private */
  toString: function() {
    var base = this.indexes ? this.indexes.toString() : "SC.IndexSet<..>";
    return base.replace('IndexSet', 'RangeObserver(%@)'.fmt(SC.guidFor(this)));
  },

  /**
    Creates a new range observer owned by the source.  The indexSet you pass
    must identify the indexes you are interested in observing.  The passed
    target/method will be invoked whenever the observed range changes.

    Note that changes to a range are buffered until the end of a run loop
    unless a property on the record itself changes.

    @param {SC.Array} source the source array
    @param {SC.IndexSet} indexSet set of indexes to observer
    @param {Object} target the target
    @param {Function|String} method the method to invoke
    @param {Object} context optional context to include in callback
    @param {Boolean} isDeep if YES, observe property changes as well
    @returns {SC.RangeObserver} instance
  */
  create: function(source, indexSet, target, method, context, isDeep) {
    var ret = SC.beget(this);
    ret.source = source;
    ret.indexes = indexSet ? indexSet.frozenCopy() : null;
    ret.target = target;
    ret.method = (typeof method === 'string') ? target[method] : method;
    ret.context = context ;
    ret.isDeep  = isDeep || false ;
    ret.beginObserving();
    return ret ;
  },

  /**
    Create subclasses for the RangeObserver.  Pass one or more attribute
    hashes.  Use this to create customized RangeObservers if needed for your
    classes.

    @param {Hash} attrs one or more attribute hashes
    @returns {SC.RangeObserver} extended range observer class
  */
  extend: function(attrs) {
    var ret = SC.beget(this), args = arguments;
    for(var i=0, l=args.length; i<l; i++) { SC.mixin(ret, args[i]); }
    return ret ;
  },

  /**
    Destroys an active ranger observer, cleaning up first.

    @param {SC.Array} source the source array
    @returns {SC.RangeObserver} receiver
  */
  destroy: function(source) {
    this.endObserving();
    return this;
  },

  /**
    Updates the set of indexes the range observer applies to.  This will
    stop observing the old objects for changes and start observing the
    new objects instead.

    @param {SC.Array} source the source array
    @param {SC.IndexSet} indexSet The index set representing the change
    @returns {SC.RangeObserver} receiver
  */
  update: function(source, indexSet) {
    if (this.indexes && this.indexes.isEqual(indexSet)) { return this ; }

    this.indexes = indexSet ? indexSet.frozenCopy() : null ;
    this.endObserving().beginObserving();
    return this;
  },

  /**
    Configures observing for each item in the current range.  Should update
    the observing array with the list of observed objects so they can be
    torn down later

    @returns {SC.RangeObserver} receiver
  */
  beginObserving: function() {
    if ( !this.isDeep ) { return this; } // nothing to do

    var observing = this.observing = this.observing || SC.CoreSet.create();

    // cache iterator function to keep things fast
    var func = this._beginObservingForEach, source = this.source;

    if( !func ) {
      func = this._beginObservingForEach = function(idx) {
        var obj = source.objectAt(idx);
        if (obj && obj.addObserver) {
          observing.push(obj);
          obj._kvo_needsRangeObserver = true ;
        }
      };
    }

    this.indexes.forEach(func);

    // add to pending range observers queue so that if any of these objects
    // change we will have a chance to setup observing on them.
    this.isObserving = false ;
    SC.Observers.addPendingRangeObserver(this);

    return this;
  },

  /** @private
    Called when an object that appears to need range observers has changed.
    Check to see if the range observer contains this object in its list.  If
    it does, go ahead and setup observers on all objects and remove ourself
    from the queue.
  */
  setupPending: function(object) {
    var observing = this.observing ;

    if ( this.isObserving || !observing || (observing.get('length')===0) ) {
      return true ;
    }

    if (observing.contains(object)) {
      this.isObserving = true ;

      // cache iterator function to keep things fast
      var func = this._setupPendingForEach;
      if (!func) {
        var source = this.source,
            method = this.objectPropertyDidChange,
            self   = this;

        func = this._setupPendingForEach = function(idx) {
          var obj = source.objectAt(idx),
              guid = SC.guidFor(obj),
              key ;

          if (obj && obj.addObserver) {
            observing.push(obj);
            obj.addObserver('*', self, method);

            // also save idx of object on range observer itself.  If there is
            // more than one idx, convert to IndexSet.
            key = self[guid];
            if ( key == null ) {
              self[guid] = idx ;
            } else if (key.isIndexSet) {
              key.add(idx);
            } else {
              self[guid] = SC.IndexSet.create(key).add(idx);
            }

          }
        };
      }
      this.indexes.forEach(func);
      return true ;
    } else {
      return false ;
    }
  },

  /**
    Remove observers for any objects currently begin observed.  This is
    called whenever the observed range changes due to an array change or
    due to destroying the observer.

    @returns {SC.RangeObserver} receiver
  */
  endObserving: function() {
    if ( !this.isDeep ) return this; // nothing to do

    var observing = this.observing;

    if (this.isObserving) {
      var meth      = this.objectPropertyDidChange,
          source    = this.source,
          idx, lim, obj;

      if (observing) {
        lim = observing.length;
        for(idx=0;idx<lim;idx++) {
          obj = observing[idx];
          obj.removeObserver('*', this, meth);
          this[SC.guidFor(obj)] = null;
        }
        observing.length = 0 ; // reset
      }

      this.isObserving = false ;
    }

    if (observing) { observing.clear(); } // empty set.
    return this ;
  },

  /**
    Whenever the actual objects in the range changes, notify the delegate
    then begin observing again.  Usually this method will be passed an
    IndexSet with the changed indexes.  The range observer will only notify
    its delegate if the changed indexes include some of all of the indexes
    this range observer is monitoring.

    @param {SC.IndexSet} changes optional set of changed indexes
    @returns {SC.RangeObserver} receiver
  */
  rangeDidChange: function(changes) {
    var indexes = this.indexes;
    if ( !changes || !indexes || indexes.intersects(changes) ) {
      this.endObserving(); // remove old observers
      this.method.call(this.target, this.source, null, '[]', changes, this.context);
      this.beginObserving(); // setup new ones
    }
    return this ;
  },

  /**
    Whenever an object changes, notify the delegate

    @param {Object} the object that changed
    @param {String} key the property that changed
    @param {Null} value No longer used
    @param {Number} rev The revision of the change
    @returns {SC.RangeObserver} receiver
  */
  objectPropertyDidChange: function(object, key, value, rev) {
    var context = this.context,
        method  = this.method,
        guid    = SC.guidFor(object),
        index   = this[guid];

    // lazily convert index to IndexSet.
    if ( index && !index.isIndexSet ) {
      index = this[guid] = SC.IndexSet.create(index).freeze();
    }

    method.call(this.target, this.source, object, key, index, context || rev, rev);
  }

};

/* >>>>>>>>>> BEGIN source/mixins/array.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// note: SC.Observable also enhances array.  make sure we are called after
// SC.Observable so our version of unknownProperty wins.
sc_require('ext/function');
sc_require('mixins/observable');
sc_require('mixins/enumerable');
sc_require('system/range_observer');

SC.OUT_OF_RANGE_EXCEPTION = "Index out of range";

SC.CoreArray = /** @lends SC.Array.prototype */ {

  /**
    Walk like a duck - use isSCArray to avoid conflicts
    @type Boolean
  */
  isSCArray: YES,

  /**
    @field {Number} length

    Your array must support the length property.  Your replace methods should
    set this property whenever it changes.
  */
  // length: 0,

  /**
    This is one of the primitves you must implement to support SC.Array.  You
    should replace amt objects started at idx with the objects in the passed
    array.

    Before mutating the underlying data structure, you must call
    this.arrayContentWillChange(). After the mutation is complete, you must
    call arrayContentDidChange() and enumerableContentDidChange().

    NOTE: JavaScript arrays already implement SC.Array and automatically call
    the correct callbacks.

    @param {Number} idx
      Starting index in the array to replace.  If idx >= length, then append to
      the end of the array.

    @param {Number} amt
      Number of elements that should be removed from the array, starting at
      *idx*.

    @param {Array} objects
      An array of zero or more objects that should be inserted into the array at
      *idx*
  */
  replace: function(idx, amt, objects) {
    throw "replace() must be implemented to support SC.Array" ;
  },

  /**
    Returns the index for a particular object in the index.

    @param {Object} object the item to search for
    @param {Number} startAt optional starting location to search, default 0
    @returns {Number} index of -1 if not found
  */
  indexOf: function(object, startAt) {
    var idx, len = this.get('length');

    if (startAt === undefined) startAt = 0;
    else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
    if (startAt < 0) startAt += len;

    for(idx=startAt;idx<len;idx++) {
      if (this.objectAt(idx, YES) === object) return idx ;
    }
    return -1;
  },

  /**
    Returns the last index for a particular object in the index.

    @param {Object} object the item to search for
    @param {Number} startAt optional starting location to search, default 0
    @returns {Number} index of -1 if not found
  */
  lastIndexOf: function(object, startAt) {
    var idx, len = this.get('length');

    if (startAt === undefined) startAt = len-1;
    else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
    if (startAt < 0) startAt += len;

    for(idx=startAt;idx>=0;idx--) {
      if (this.objectAt(idx) === object) return idx ;
    }
    return -1;
  },

  /**
    This is one of the primitives you must implement to support SC.Array.
    Returns the object at the named index.  If your object supports retrieving
    the value of an array item using get() (i.e. myArray.get(0)), then you do
    not need to implement this method yourself.

    @param {Number} idx
      The index of the item to return.  If idx exceeds the current length,
      return null.
  */
  objectAt: function(idx) {
    if (idx < 0) return undefined ;
    if (idx >= this.get('length')) return undefined;
    return this.get(idx);
  },

  /**
    @field []

    This is the handler for the special array content property.  If you get
    this property, it will return this.  If you set this property it a new
    array, it will replace the current content.

    This property overrides the default property defined in SC.Enumerable.
  */
  '[]': function(key, value) {
    if (value !== undefined) {
      this.replace(0, this.get('length'), value) ;
    }
    return this ;
  }.property(),

  /**
    This will use the primitive replace() method to insert an object at the
    specified index.

    @param {Number} idx index of insert the object at.
    @param {Object} object object to insert
  */
  insertAt: function(idx, object) {
    if (idx > this.get('length')) throw SC.OUT_OF_RANGE_EXCEPTION ;
    this.replace(idx,0,[object]) ;
    return this ;
  },

  /**
    Remove an object at the specified index using the replace() primitive
    method.  You can pass either a single index, a start and a length or an
    index set.

    If you pass a single index or a start and length that is beyond the
    length this method will throw an SC.OUT_OF_RANGE_EXCEPTION

    @param {Number|SC.IndexSet} start index, start of range, or index set
    @param {Number} length length of passing range
    @returns {Object} receiver
  */
  removeAt: function(start, length) {

    var delta = 0, // used to shift range
        empty = [];

    if (typeof start === SC.T_NUMBER) {

      if ((start < 0) || (start >= this.get('length'))) {
        throw SC.OUT_OF_RANGE_EXCEPTION;
      }

      // fast case
      if (length === undefined) {
        this.replace(start,1,empty);
        return this ;
      } else {
        start = SC.IndexSet.create(start, length);
      }
    }

    this.beginPropertyChanges();
    start.forEachRange(function(start, length) {
      start -= delta ;
      delta += length ;
      this.replace(start, length, empty); // remove!
    }, this);
    this.endPropertyChanges();

    return this ;
  },

  /**
    Search the array of this object, removing any occurrences of it.
    @param {object} obj object to remove
  */
  removeObject: function(obj) {
    var loc = this.get('length') || 0;
    while(--loc >= 0) {
      var curObject = this.objectAt(loc) ;
      if (curObject == obj) this.removeAt(loc) ;
    }
    return this ;
  },

  /**
    Search the array for the passed set of objects and remove any occurrences
    of the.

    @param {SC.Enumerable} objects the objects to remove
    @returns {SC.Array} receiver
  */
  removeObjects: function(objects) {
    this.beginPropertyChanges();
    objects.forEach(function(obj) { this.removeObject(obj); }, this);
    this.endPropertyChanges();
    return this;
  },

  /**
    Returns a new array that is a slice of the receiver.  This implementation
    uses the observable array methods to retrieve the objects for the new
    slice.

    If you don't pass in beginIndex and endIndex, it will act as a copy of the
    array.

    @param beginIndex {Integer} (Optional) index to begin slicing from.
    @param endIndex {Integer} (Optional) index to end the slice at.
    @returns {Array} New array with specified slice
  */
  slice: function(beginIndex, endIndex) {
    var ret = [];
    var length = this.get('length') ;
    if (SC.none(beginIndex)) beginIndex = 0 ;
    if (SC.none(endIndex) || (endIndex > length)) endIndex = length ;
    while(beginIndex < endIndex) ret[ret.length] = this.objectAt(beginIndex++) ;
    return ret ;
  },

  /**
    Push the object onto the end of the array.  Works just like push() but it
    is KVO-compliant.

    @param {Object} object the objects to push

    @return {Object} The passed object
  */
  pushObject: function(obj) {
    this.insertAt(this.get('length'), obj) ;
    return obj ;
  },


  /**
    Add the objects in the passed numerable to the end of the array.  Defers
    notifying observers of the change until all objects are added.

    @param {SC.Enumerable} objects the objects to add
    @returns {SC.Array} receiver
  */
  pushObjects: function(objects) {
    this.beginPropertyChanges();
    objects.forEach(function(obj) { this.pushObject(obj); }, this);
    this.endPropertyChanges();
    return this;
  },

  /**
    Pop object from array or nil if none are left.  Works just like pop() but
    it is KVO-compliant.

    @return {Object} The popped object
  */
  popObject: function() {
    var len = this.get('length') ;
    if (len === 0) return null ;

    var ret = this.objectAt(len-1) ;
    this.removeAt(len-1) ;
    return ret ;
  },

  /**
    Shift an object from start of array or nil if none are left.  Works just
    like shift() but it is KVO-compliant.

    @return {Object} The shifted object
  */
  shiftObject: function() {
    if (this.get('length') === 0) return null ;
    var ret = this.objectAt(0) ;
    this.removeAt(0) ;
    return ret ;
  },

  /**
    Unshift an object to start of array.  Works just like unshift() but it is
    KVO-compliant.

    @param {Object} obj the object to add
    @return {Object} The passed object
  */
  unshiftObject: function(obj) {
    this.insertAt(0, obj) ;
    return obj ;
  },

  /**
    Adds the named objects to the beginning of the array.  Defers notifying
    observers until all objects have been added.

    @param {SC.Enumerable} objects the objects to add
    @returns {SC.Array} receiver
  */
  unshiftObjects: function(objects) {
    this.beginPropertyChanges();
    objects.forEach(function(obj) { this.unshiftObject(obj); }, this);
    this.endPropertyChanges();
    return this;
  },

  /**
    Compares each item in the passed array to this one.

    @param {Array} ary The array you want to compare to
    @returns {Boolean} true if they are equal.
  */
  isEqual: function(ary) {
    if (!ary) return false ;
    if (ary == this) return true;

    var loc = ary.get('length') ;
    if (loc != this.get('length')) return false ;

    while(--loc >= 0) {
      if (!SC.isEqual(ary.objectAt(loc), this.objectAt(loc))) return false ;
    }
    return true ;
  },

  /**
    Generates a new array with the contents of the old array, sans any null
    values.

    @returns {Array} The new, compact array
  */
  compact: function() { return this.without(null); },

  /**
    Generates a new array with the contents of the old array, sans the passed
    value.

    @param {Object} value The value you want to be removed
    @returns {Array} The new, filtered array
  */
  without: function(value) {
    if (this.indexOf(value)<0) return this; // value not present.
    var ret = [] ;
    this.forEach(function(k) {
      if (k !== value) ret[ret.length] = k;
    }) ;
    return ret ;
  },

  /**
    Generates a new array with only unique values from the contents of the
    old array.

    @returns {Array} The new, de-duped array
  */
  uniq: function() {
    var ret = [] ;
    this.forEach(function(k){
      if (ret.indexOf(k)<0) ret[ret.length] = k;
    });
    return ret ;
  },

  /**
    Returns a new array that is a one-dimensional flattening of this array,
    i.e. for every element of this array extract that and it's elements into
    a new array.

    @returns {Array}
   */
  flatten: function() {
    var ret = [];
    this.forEach(function(k) {
      if (k && k.isEnumerable) {
        ret = ret.pushObjects(k.flatten());
      } else {
        ret.pushObject(k);
      }
    });
    return ret;
  },

  /**
    Returns the largest Number in an array of Numbers. Make sure the array
    only contains values of type Number to get expected result.

    Note: This only works for dense arrays.

    @returns {Number}
  */
  max: function() {
    return Math.max.apply(Math, this);
  },

  /**
    Returns the smallest Number in an array of Numbers. Make sure the array
    only contains values of type Number to get expected result.

    Note: This only works for dense arrays.

    @returns {Number}
  */
  min: function() {
    return Math.min.apply(Math, this);
  },

  rangeObserverClass: SC.RangeObserver,

  /**
    Returns YES if object is in the array

    @param {Object} object to look for
    @returns {Boolean}
  */
  contains: function(obj){
    return this.indexOf(obj) >= 0;
  },

  /**
    Creates a new range observer on the receiver.  The target/method callback
    you provide will be invoked anytime any property on the objects in the
    specified range changes.  It will also be invoked if the objects in the
    range itself changes also.

    The callback for a range observer should have the signature:

          function rangePropertyDidChange(array, objects, key, indexes, context)

    If the passed key is '[]' it means that the object itself changed.

    The return value from this method is an opaque reference to the
    range observer object.  You can use this reference to destroy the
    range observer when you are done with it or to update its range.

    @param {SC.IndexSet} indexes indexes to observe
    @param {Object} target object to invoke on change
    @param {String|Function} method the method to invoke
    @param {Object} context optional context
    @returns {SC.RangeObserver} range observer
  */
  addRangeObserver: function(indexes, target, method, context) {
    var rangeob = this._array_rangeObservers;
    if (!rangeob) rangeob = this._array_rangeObservers = SC.CoreSet.create() ;

    // The first time a range observer is added, cache the current length so
    // we can properly notify observers the first time through
    if (this._array_oldLength===undefined) {
      this._array_oldLength = this.get('length') ;
    }

    var C = this.rangeObserverClass ;
    var isDeep = NO; //disable this feature for now
    var ret = C.create(this, indexes, target, method, context, isDeep) ;
    rangeob.add(ret);

    // first time a range observer is added, begin observing the [] property
    if (!this._array_isNotifyingRangeObservers) {
      this._array_isNotifyingRangeObservers = YES ;
      this.addObserver('[]', this, this._array_notifyRangeObservers);
    }

    return ret ;
  },

  /**
    Moves a range observer so that it observes a new range of objects on the
    array.  You must have an existing range observer object from a call to
    addRangeObserver().

    The return value should replace the old range observer object that you
    pass in.

    @param {SC.RangeObserver} rangeObserver the range observer
    @param {SC.IndexSet} indexes new indexes to observe
    @returns {SC.RangeObserver} the range observer (or a new one)
  */
  updateRangeObserver: function(rangeObserver, indexes) {
    return rangeObserver.update(this, indexes);
  },

  /**
    Removes a range observer from the receiver.  The range observer must
    already be active on the array.

    The return value should replace the old range observer object.  It will
    usually be null.

    @param {SC.RangeObserver} rangeObserver the range observer
    @returns {SC.RangeObserver} updated range observer or null
  */
  removeRangeObserver: function(rangeObserver) {
    var ret = rangeObserver.destroy(this);
    var rangeob = this._array_rangeObservers;
    if (rangeob) rangeob.remove(rangeObserver) ; // clear
    return ret ;
  },

  addArrayObservers: function(options) {
    this._modifyObserverSet('add', options);
  },

  removeArrayObservers: function(options) {
    this._modifyObserverSet('remove', options);
  },

  _modifyObserverSet: function(method, options) {
    var willChangeObservers, didChangeObservers;

    var target     = options.target || this;
    var willChange = options.willChange || 'arrayWillChange';
    var didChange  = options.didChange || 'arrayDidChange';
    var context    = options.context;

    if (typeof willChange === "string") {
      willChange = target[willChange];
    }

    if (typeof didChange === "string") {
      didChange = target[didChange];
    }

    willChangeObservers = this._kvo_for('_kvo_array_will_change', SC.ObserverSet);
    didChangeObservers  = this._kvo_for('_kvo_array_did_change', SC.ObserverSet);

    willChangeObservers[method](target, willChange, context);
    didChangeObservers[method](target, didChange, context);
  },

  arrayContentWillChange: function(start, removedCount, addedCount) {
    this._teardownContentObservers(start, removedCount);

    var member, members, membersLen, idx;
    var target, action;
    var willChangeObservers = this._kvo_array_will_change;
    if (willChangeObservers) {
      members = willChangeObservers.members;
      membersLen = members.length;

      for (idx = 0; idx < membersLen; idx++) {
        member = members[idx];
        target = member[0];
        action = member[1];
        action.call(target, start, removedCount, addedCount, this);
      }
    }
  },

  arrayContentDidChange: function(start, removedCount, addedCount) {
    var rangeob = this._array_rangeObservers,
        newlen, length, changes ;

    this.beginPropertyChanges();
    this.notifyPropertyChange('length'); // flush caches

    // schedule info for range observers
    if (rangeob && rangeob.length>0) {
      changes = this._array_rangeChanges;
      if (!changes) { changes = this._array_rangeChanges = SC.IndexSet.create(); }
      if (removedCount === addedCount) {
        length = removedCount;
      } else {
        length = this.get('length') - start;

        if (removedCount > addedCount) {
          length += (removedCount - addedCount);
        }
      }
      changes.add(start, length);
    }

    this._setupContentObservers(start, addedCount);

    var member, members, membersLen, idx;
    var target, action;
    var didChangeObservers = this._kvo_array_did_change;
    if (didChangeObservers) {
      // If arrayContentDidChange is called with no parameters, assume the
      // entire array has changed.
      if (start === undefined) {
        start = 0;
        removedCount = this.get('length');
        addedCount = 0;
      }

      members = didChangeObservers.members;
      membersLen = members.length;

      for (idx = 0; idx < membersLen; idx++) {
        member = members[idx];
        target = member[0];
        action = member[1];
        action.call(target, start, removedCount, addedCount, this);
      }
    }

    this.notifyPropertyChange('[]') ;
    this.endPropertyChanges();

    return this ;
  },

  /**
    @private

    When enumerable content has changed, remove enumerable observers from
    items that are no longer in the enumerable, and add observers to newly
    added items.

    @param {Array} addedObjects the array of objects that have been added
    @param {Array} removedObjects the array of objects that have been removed
  */
  _setupContentObservers: function(start, addedCount) {
    var observedKeys = this._kvo_for('_kvo_content_observed_keys', SC.CoreSet);
    var addedObjects;
    var kvoKey;

    // Only setup and teardown enumerable observers if we have keys to observe
    if (observedKeys.get('length') > 0) {
      addedObjects = this.slice(start, start+addedCount);

      var self = this;
      // added and resume the chain observer.
      observedKeys.forEach(function(key) {
        kvoKey = SC.keyFor('_kvo_content_observers', key);

        // Get all original ChainObservers associated with the key
        self._kvo_for(kvoKey).forEach(function(observer) {
          addedObjects.forEach(function(item) {
            self._resumeChainObservingForItemWithChainObserver(item, observer);
          });
        });
      });
    }
  },

  _teardownContentObservers: function(start, removedCount) {
    var observedKeys = this._kvo_for('_kvo_content_observed_keys', SC.CoreSet);
    var removedObjects;
    var kvoKey;

    // Only setup and teardown enumerable observers if we have keys to observe
    if (observedKeys.get('length') > 0) {
      removedObjects = this.slice(start, start+removedCount);

      // added and resume the chain observer.
      observedKeys.forEach(function(key) {
        kvoKey = SC.keyFor('_kvo_content_observers', key);

        // Loop through removed objects and remove any enumerable observers that
        // belong to them.
        removedObjects.forEach(function(item) {
          item._kvo_for(kvoKey).forEach(function(observer) {
            observer.destroyChain();
          });
        });
      });
    }
  },

  teardownEnumerablePropertyChains: function(removedObjects) {
    var chains = this._kvo_enumerable_property_chains;

    if (chains) {
      chains.forEach(function(chain) {
        var idx, len = removedObjects.get('length'),
            chainGuid = SC.guidFor(chain),
            clonedChain, item, kvoChainList = '_kvo_enumerable_property_clones';

        chain.notifyPropertyDidChange();

        for (idx = 0; idx < len; idx++) {
          item = removedObjects.objectAt(idx);
          clonedChain = item[kvoChainList][chainGuid];
          clonedChain.deactivate();
          delete item[kvoChainList][chainGuid];
        }
      }, this);
    }
    return this ;
  },

  /**
    For all registered property chains on this object, removed them from objects
    being removed from the enumerable, and clone them onto newly added objects.

    @param {Object[]} addedObjects the objects being added to the enumerable
    @param {Object[]} removedObjects the objected being removed from the enumerable
    @returns {Object} receiver
  */
  setupEnumerablePropertyChains: function(addedObjects) {
    var chains = this._kvo_enumerable_property_chains;

    if (chains) {
      chains.forEach(function(chain) {
        var idx, len = addedObjects.get('length');

        chain.notifyPropertyDidChange();

        len = addedObjects.get('length');
        for (idx = 0; idx < len; idx++) {
          this._clonePropertyChainToItem(chain, addedObjects.objectAt(idx));
        }
      }, this);
    }
    return this ;
  },

  /**
    Register a property chain to propagate to enumerable content.

    This will clone the property chain to each item in the enumerable,
    then save it so that it is automatically set up and torn down when
    the enumerable content changes.

    @param {String} property the property being listened for on this object
    @param {SC._PropertyChain} chain the chain to clone to items
  */
  registerDependentKeyWithChain: function(property, chain) {
    // Get the set of all existing property chains that should
    // be propagated to enumerable contents. If that set doesn't
    // exist yet, _kvo_for() will create it.
    var kvoChainList = '_kvo_enumerable_property_chains',
        chains, item, clone, cloneList;

    chains = this._kvo_for(kvoChainList, SC.CoreSet);

    // Save a reference to the chain on this object. If new objects
    // are added to the enumerable, we will clone this chain and add
    // it to the new object.
    chains.add(chain);

    this.forEach(function(item) {
      this._clonePropertyChainToItem(chain, item);
    }, this);
  },

  /**
    Clones an SC._PropertyChain to a content item.

    @param {SC._PropertyChain} chain
    @param {Object} item
  */
  _clonePropertyChainToItem: function(chain, item) {
    var clone        = SC.clone(chain),
        kvoCloneList = '_kvo_enumerable_property_clones',
        cloneList;

    clone.object = item;

    cloneList = item[kvoCloneList] = item[kvoCloneList] || {};
    cloneList[SC.guidFor(chain)] = clone;

    clone.activate(item);
  },

  /**
    Removes a dependent key from the enumerable, and tears it down on
    all content objects.

    @param {String} property
    @param {SC._PropertyChain} chain
  */
  removeDependentKeyWithChain: function(property, chain) {
    var kvoChainList = '_kvo_enumerable_property_chains',
        kvoCloneList = '_kvo_enumerable_property_clones',
        chains, item, clone, cloneList;

    this.forEach(function(item) {
      item.removeDependentKeyWithChain(property, chain);

      cloneList = item[kvoCloneList];
      clone = cloneList[SC.guidFor(chain)];

      clone.deactivate(item);
    }, this);
  },

  /**
    @private

    Clones a segment of an observer chain and applies it
    to an element of this Enumerable.

    @param {Object} item The element
    @param {SC._ChainObserver} chainObserver the chain segment to begin from
  */
  _resumeChainObservingForItemWithChainObserver: function(item, chainObserver) {
    var observer = SC.clone(chainObserver.next);
    var key = observer.property;

    // The chain observer should create new observers on the child object
    observer.object = item;
    item.addObserver(key, observer, observer.propertyDidChange);

    // if we're in the initial chained observer setup phase, add the tail
    // of the current observer segment to the list of tracked tails.
    if(chainObserver.root.tails) {
      chainObserver.root.tails.pushObject(observer.tail());
    }

    observer.propertyDidChange();

    // Maintain a list of observers on the item so we can remove them
    // if it is removed from the enumerable.
    item._kvo_for(SC.keyFor('_kvo_content_observers', key)).push(observer);
  },

  /**
    @private

    Adds a content observer. Content observers are able to
    propagate chain observers to each member item in the enumerable,
    so that the observer is fired whenever a single item changes.

    You should never call this method directly. Instead, you should
    call addObserver() with the special '@each' property in the path.

    For example, if you wanted to observe changes to each item's isDone
    property, you could call:

        arrayController.addObserver('@each.isDone');

    @param {SC._ChainObserver} chainObserver the chain observer to propagate
  */
  _addContentObserver: function(chainObserver) {
    var key = chainObserver.next.property;

    // Add the key to a set so we know what we are observing
    this._kvo_for('_kvo_content_observed_keys', SC.CoreSet).push(key);

    // Add the passed ChainObserver to an ObserverSet for that key
    var kvoKey = SC.keyFor('_kvo_content_observers', key);
    this._kvo_for(kvoKey).push(chainObserver);

    // set up chained observers on the initial content
    this._setupContentObservers(0, chainObserver.object.get('length'));
  },

  /**
    @private

    Removes a content observer. Pass the same chain observer
    that was used to add the content observer.

    @param {SC._ChainObserver} chainObserver the chain observer to propagate
  */

  _removeContentObserver: function(chainObserver) {
    var observers, kvoKey;
    var observedKeys = this._kvo_content_observed_keys;
    var key = chainObserver.next.property;

    if (observedKeys.contains(key)) {

      kvoKey = SC.keyFor('_kvo_content_observers', key);
      observers = this._kvo_for(kvoKey);

      observers.removeObject(chainObserver);

      this._teardownContentObservers(0, chainObserver.object.get('length'));

      if (observers.length === 0) {
        this._kvo_for('_kvo_content_observed_keys').remove(key);
      }
    }
  },

  /**  @private
    Observer fires whenever the '[]' property changes.  If there are
    range observers, will notify observers of change.
  */
  _array_notifyRangeObservers: function() {
    var rangeob = this._array_rangeObservers,
        changes = this._array_rangeChanges,
        len     = rangeob ? rangeob.length : 0,
        idx, cur;

    if (len > 0 && changes && changes.length > 0) {
      for(idx=0;idx<len;idx++) rangeob[idx].rangeDidChange(changes);
      changes.clear(); // reset for later notifications
    }
  }

} ;

/**
  @namespace

  This module implements Observer-friendly Array-like behavior.  This mixin is
  picked up by the Array class as well as other controllers, etc. that want to
  appear to be arrays.

  Unlike SC.Enumerable, this mixin defines methods specifically for
  collections that provide index-ordered access to their contents.  When you
  are designing code that needs to accept any kind of Array-like object, you
  should use these methods instead of Array primitives because these will
  properly notify observers of changes to the array.

  Although these methods are efficient, they do add a layer of indirection to
  your application so it is a good idea to use them only when you need the
  flexibility of using both true JavaScript arrays and "virtual" arrays such
  as controllers and collections.

  You can use the methods defined in this module to access and modify array
  contents in a KVO-friendly way.  You can also be notified whenever the
  membership if an array changes by changing the syntax of the property to
  .observes('*myProperty.[]') .

  To support SC.Array in your own class, you must override two
  primitives to use it: replace() and objectAt().

  Note that the SC.Array mixin also incorporates the SC.Enumerable mixin.  All
  SC.Array-like objects are also enumerable.

  @extends SC.Enumerable
  @since SproutCore 0.9.0
*/
SC.Array = SC.mixin({}, SC.Enumerable, SC.CoreArray);

/* >>>>>>>>>> BEGIN source/ext/array.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/array');

SC.supplement(Array.prototype, SC.CoreArray);

// Because Arrays are dealt with so much, we add specialized functions.

SC.mixin(Array.prototype,
  /** @lends Array.prototype */ {

  // primitive for array support.
  replace: function(idx, amt, objects) {
    if (this.isFrozen) { throw SC.FROZEN_ERROR ; }

    var args;
    var len = objects ? (objects.get ? objects.get('length') : objects.length) : 0;

    // Notify that array content is about to mutate.
    this.arrayContentWillChange(idx, amt, len);

    if (len === 0) {
      this.splice(idx, amt) ;
    } else {
      args = [idx, amt].concat(objects) ;
      this.splice.apply(this,args) ;
    }

    this.arrayContentDidChange(idx, amt, len);
    this.enumerableContentDidChange(idx, amt, len - amt) ;
    return this ;
  },

  // If you ask for an unknown property, then try to collect the value
  // from member items.
  unknownProperty: function(key, value) {
    var ret = this.reducedProperty(key, value) ;
    if ((value !== undefined) && ret === undefined) {
      ret = this[key] = value;
    }
    return ret ;
  }

});

if (Array.prototype.indexOf === SC.CoreArray.indexOf) {
  /**
    Returns the index for a particular object in the index.

    @param {Object} object the item to search for
    @param {Number} startAt optional starting location to search, default 0
    @returns {Number} index of -1 if not found
  */
  Array.prototype.indexOf = function(object, startAt) {
    var idx, len = this.length;

    if (startAt === undefined) startAt = 0;
    else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
    if (startAt < 0) startAt += len;

    for(idx=startAt;idx<len;idx++) {
      if (this[idx] === object) return idx ;
    }
    return -1;
  } ;
}

if (Array.prototype.lastIndexOf === SC.CoreArray.lastIndexOf) {
  /**
    Returns the last index for a particular object in the index.

    @param {Object} object the item to search for
    @param {Number} startAt optional starting location to search, default 0
    @returns {Number} index of -1 if not found
  */
  Array.prototype.lastIndexOf = function(object, startAt) {
    var idx, len = this.length;

    if (startAt === undefined) startAt = len-1;
    else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
    if (startAt < 0) startAt += len;

    for(idx=startAt;idx>=0;idx--) {
      if (this[idx] === object) return idx ;
    }
    return -1;
  };
}

/* >>>>>>>>>> BEGIN source/ext/date.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

if (!Date.now) {
  /**
    @ignore
  */
  Date.now = function() {
    return new Date().getTime() ;
  };
}

/* >>>>>>>>>> BEGIN source/system/string.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  Implements support methods useful when working with strings in SproutCore
  applications.
*/
SC.String = /** @scope SC.String.prototype */ {

  // Interpolate string. looks for %@ or %@1; to control the order of params.
  /**
    Apply formatting options to the string.  This will look for occurrences
    of %@ in your string and substitute them with the arguments you pass into
    this method.  If you want to control the specific order of replacement,
    you can add a number after the key as well to indicate which argument
    you want to insert.

    Ordered insertions are most useful when building loc strings where values
    you need to insert may appear in different orders.

    Examples
    -----

        "Hello %@ %@".fmt('John', 'Doe') => "Hello John Doe"
        "Hello %@2, %@1".fmt('John', 'Doe') => "Hello Doe, John"

    @param {Object...} args optional arguments
    @returns {String} formatted string
  */
  fmt: function(str, formats) {
    // first, replace any ORDERED replacements.
    var idx  = 0; // the current index for non-numerical replacements
    return str.replace(/%@([0-9]+)?/g, function(s, argIndex) {
      argIndex = (argIndex) ? parseInt(argIndex,0) - 1 : idx++ ;
      s = formats[argIndex];
      return ((s === null) ? '(null)' : (s === undefined) ? '' : s).toString();
    }) ;
  },
  
  /**
    Splits the string into words, separated by spaces. Empty strings are
    removed from the results.

    @returns {Array} An array of non-empty strings
  */
  w: function(str) {
    var ary = [], ary2 = str.split(' '), len = ary2.length, string, idx=0;
    for (idx=0; idx<len; ++idx) {
      string = ary2[idx] ;
      if (string.length !== 0) ary.push(string) ; // skip empty strings
    }
    return ary ;
  }
};

/* >>>>>>>>>> BEGIN source/ext/string.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/string');

/** 
  @namespace
  Extends String by adding a few helpful methods.
*/
SC.mixin(String.prototype,
/** @scope String.prototype */ {

  /**
    @see SC.String.fmt
  */
  fmt: function() {
    return SC.String.fmt(this, arguments);
  },

  /**
    @see SC.String.w
  */
  w: function() {
    return SC.String.w(this);
  }

});

/* >>>>>>>>>> BEGIN source/mixins/comparable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  Implements some standard methods for comparing objects. Add this mixin to
  any class you create that can compare its instances.

  You should implement the compare() method.

  @since SproutCore 1.0
*/
SC.Comparable = {

  /**
    walk like a duck. Indicates that the object can be compared.

    @type Boolean
  */
  isComparable: YES,

  /**
    Override to return the result of the comparison of the two parameters. The
    compare method should return
    
    <pre>
      -1 if a < b
       0 if a == b
       1 if a > b
    </pre>


    Default implementation raises an exception.

    @param a {Object} the first object to compare
    @param b {Object} the second object to compare
    @returns {Integer} the result of the comparison
  */
  compare: function(a, b) {
    throw "%@.compare() is not implemented".fmt(this.toString());
  }

};

/* >>>>>>>>>> BEGIN source/mixins/copyable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  Impelements some standard methods for copying an object.  Add this mixin to
  any object you create that can create a copy of itself.  This mixin is
  added automatically to the built-in array.

  You should generally implement the copy() method to return a copy of the
  receiver.

  Note that frozenCopy() will only work if you also implement SC.Freezable.

  @since SproutCore 1.0
*/
SC.Copyable = /** @scope SC.Copyable.prototype */{

  /**
    Walk like a duck.  Indicates that the object can be copied.

    @type Boolean
  */
  isCopyable: YES,

  /**
    Override to return a copy of the receiver.  Default implementation raises
    an exception.

    @param deep {Boolean} if true, a deep copy of the object should be made
    @returns {Object} copy of receiver
  */
  copy: function(deep) {
    var className = SC._object_className(this.constructor);
    throw "%@.copy() is not implemented".fmt(className);
  },

  /**
    If the object implements SC.Freezable, then this will return a new copy
    if the object is not frozen and the receiver if the object is frozen.

    Raises an exception if you try to call this method on a object that does
    not support freezing.

    You should use this method whenever you want a copy of a freezable object
    since a freezable object can simply return itself without actually
    consuming more memory.

    @returns {Object} copy of receiver or receiver
  */
  frozenCopy: function() {
    var isFrozen = this.get ? this.get('isFrozen') : this.isFrozen;
    if (isFrozen === YES) return this;
    else if (isFrozen === undefined) throw "%@ does not support freezing".fmt(this);
    else return this.copy().freeze();
  }
};

// Make Array copyable
SC.mixin(Array.prototype, SC.Copyable);
/**
  Override to return a copy of the receiver.  Default implementation raises
  an exception.

  @param deep {Boolean} if true, a deep copy of the object should be made
  @returns {Object} copy of receiver
*/
Array.prototype.copy = function(deep) {
	var ret = this.slice(), idx;
	if (deep) {
      idx = ret.length;
	  while (idx--) ret[idx] = SC.copy(ret[idx], true);
	}
	return ret;
};

/* >>>>>>>>>> BEGIN source/mixins/freezable.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**
  Standard Error that should be raised when you try to modify a frozen object.

  @property {Error}
*/
SC.FROZEN_ERROR = new Error("Cannot modify a frozen object");

/**
  @class

  The SC.Freezable mixin implements some basic methods for marking an object
  as frozen.  Once an object is frozen it should be read only.  No changes
  may be made the internal state of the object.

  Enforcement
  ---

  To fully support freezing in your subclass, you must include this mixin and
  override any method that might alter any property on the object to instead
  raise an exception.  You can check the state of an object by checking the
  isFrozen property.

  Although future versions of JavaScript may support language-level freezing
  object objects, that is not the case today.  Even if an object is freezable,
  it is still technically possible to modify the object, even though it could
  break other parts of your application that do not expect a frozen object to
  change.  It is, therefore, very important that you always respect the
  isFrozen property on all freezable objects.

  Example

  The example below shows a simple object that implement the SC.Freezable
  protocol.

        Contact = SC.Object.extend(SC.Freezable, {

          firstName: null,

          lastName: null,

          // swaps the names
          swapNames: function() {
            if (this.get('isFrozen')) throw SC.FROZEN_ERROR;
            var tmp = this.get('firstName');
            this.set('firstName', this.get('lastName'));
            this.set('lastName', tmp);
            return this;
          }

        });

        c = Context.create({ firstName: "John", lastName: "Doe" });
        c.swapNames();  => returns c
        c.freeze();
        c.swapNames();  => EXCEPTION

  Copying
  ---

  Usually the SC.Freezable protocol is implemented in cooperation with the
  SC.Copyable protocol, which defines a frozenCopy() method that will return
  a frozen object, if the object implements this method as well.

*/
SC.Freezable = /** @scope SC.Freezable.prototype */ {

  /**
    Walk like a duck.

    @property {Boolean}
  */
  isFreezable: YES,

  /**
    Set to YES when the object is frozen.  Use this property to detect whether
    your object is frozen or not.

    @property {Boolean}
  */
  isFrozen: NO,

  /**
    Freezes the object.  Once this method has been called the object should
    no longer allow any properties to be edited.

    @returns {Object} receiver
  */
  freeze: function() {
    // NOTE: Once someone actually implements Object.freeze() in the browser,
    // add a call to that here also.

    if (this.set) this.set('isFrozen', YES);
    else this.isFrozen = YES;
    return this;
  }

};


// Add to Array
SC.mixin(Array.prototype, SC.Freezable);

/* >>>>>>>>>> BEGIN source/system/set.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/enumerable') ;
sc_require('mixins/observable') ;
sc_require('mixins/freezable');
sc_require('mixins/copyable');

// IMPORTANT NOTE:  This file actually defines two classes:
// SC.Set is a fully observable set class documented below.
// SC._CoreSet is just like SC.Set but is not observable.  This is required
// because SC.Observable is built on using sets and requires sets without
// observability.
//
// We use pointer swizzling below to swap around the actual definitions so
// that the documentation will turn out right.  (The docs should only
// define SC.Set - not SC._CoreSet)

/**
  @class

  An unordered collection of objects.

  A Set works a bit like an array except that its items are not ordered.
  You can create a set to efficiently test for membership for an object. You
  can also iterate through a set just like an array, even accessing objects
  by index, however there is no gaurantee as to their order.

  Whether or not property observing is enabled, sets offer very powerful
  notifications of items being added and removed, through the
  `:addSetObserver` and `:removeSetObserver` methods; this can be
  very useful, for instance, for filtering or mapping sets.

  Note that SC.Set is a primitive object, like an array.  It does implement
  limited key-value observing support, but it does not extend from SC.Object
  so you should not subclass it.

  Creating a Set
  --------------
  You can create a set like you would most objects using SC.Set.create().
  Most new sets you create will be empty, but you can also initialize the set
  with some content by passing an array or other enumerable of objects to the
  constructor.

  Finally, you can pass in an existing set and the set will be copied.  You
  can also create a copy of a set by calling SC.Set#clone().

        // creates a new empty set
        var foundNames = SC.Set.create();

        // creates a set with four names in it.
        var names = SC.Set.create(["Charles", "Tom", "Juan", "Alex"]) ; // :P

        // creates a copy of the names set.
        var namesCopy = SC.Set.create(names);

        // same as above.
        var anotherNamesCopy = names.clone();

  Adding/Removing Objects
  -----------------------
  You generally add or remove objects from a set using add() or remove().
  You can add any type of object including primitives such as numbers,
  strings, and booleans.

  Note that objects can only exist one time in a set.  If you call add() on
  a set with the same object multiple times, the object will only be added
  once.  Likewise, calling remove() with the same object multiple times will
  remove the object the first time and have no effect on future calls until
  you add the object to the set again.

  Note that you cannot add/remove null or undefined to a set.  Any attempt to
  do so will be ignored.

  In addition to add/remove you can also call push()/pop().  Push behaves just
  like add() but pop(), unlike remove() will pick an arbitrary object, remove
  it and return it.  This is a good way to use a set as a job queue when you
  don't care which order the jobs are executed in.

  Testing for an Object
  ---------------------
  To test for an object's presence in a set you simply call SC.Set#contains().
  This method tests for the object's hash, which is generally the same as the
  object's guid; however, if you implement the hash() method on the object, it will
  use the return value from that method instead.

  Observing changes
  -----------------
  When using `:SC.Set` (rather than `:SC.CoreSet`), you can observe the
  `:"[]"` property to be alerted whenever the content changes.

  This is often unhelpful. If you are filtering sets of objects, for instance,
  it is very inefficient to re-filter all of the items each time the set changes.
  It would be better if you could just adjust the filtered set based on what
  was changed on the original set. The same issue applies to merging sets,
  as well.

  `:SC.Set` and `:SC.CoreSet` both offer another method of being observed:
  `:addSetObserver` and `:removeSetObserver`. These take a single parameter:
  an object which implements `:didAddItem(set, item)` and
  `:didRemoveItem(set, item)`.

  Whenever an item is added or removed from the set, all objects in the set
  (a SC.CoreSet, actually) of observing objects will be alerted appropriately.

  BIG WARNING
  ===========
  SetObservers are not intended to be used "_creatively_"; for instance, do
  not expect to be alerted immediately to any changes. **While the notifications
  are currently sent out immediately, if we find a fast way to send them at end
  of run loop, we most likely will do so.**

  @extends SC.Enumerable
  @extends SC.Observable
  @extends SC.Copyable
  @extends SC.Freezable

  @since SproutCore 1.0
*/
SC.Set = SC.mixin({},
  SC.Enumerable,
  SC.Observable,
  SC.Freezable,
/** @scope SC.Set.prototype */ {

  /**
    Creates a new set, with the optional array of items included in the
    return set.

    @param {SC.Enumerable} items items to add
    @return {SC.Set}
  */
  create: function(items) {
    var ret, idx, pool = SC.Set._pool, isObservable = this.isObservable, len;
    if (!isObservable && items===undefined && pool.length>0) {
      return pool.pop();
    } else {
      ret = SC.beget(this);
      if (isObservable) ret.initObservable();

      if (items && items.isEnumerable && items.get('length') > 0) {

        ret.isObservable = NO; // suspend change notifications

        // arrays and sets get special treatment to make them a bit faster
        if (items.isSCArray) {
          len = items.get('length');
          for(idx = 0; idx < len; idx++) ret.add(items.objectAt(idx));

        } else if (items.isSet) {
          len = items.length;
          for(idx = 0; idx < len; idx++) ret.add(items[idx]);

        // otherwise use standard SC.Enumerable API
        } else {
          items.forEach(function(i) { ret.add(i); }, this);
        }

        ret.isObservable = isObservable;
      }
    }
    return ret ;
  },

  /**
    Walk like a duck

    @property {Boolean}
  */
  isSet: YES,

  /**
    This property will change as the number of objects in the set changes.

    @property {Number}
  */
  length: 0,

  /**
    Returns the first object in the set or null if the set is empty

    @property {Object}
  */
  firstObject: function() {
    return (this.length > 0) ? this[0] : undefined ;
  }.property(),

  /**
    Clears the set

    @returns {SC.Set}
  */
  clear: function() {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    this.length = 0;
    return this ;
  },

  /**
    Call this method to test for membership.

    @returns {Boolean}
  */
  contains: function(obj) {

    // because of the way a set is "reset", the guid for an object may
    // still be stored as a key, but points to an index that is beyond the
    // length.  Therefore the found idx must both be defined and less than
    // the current length.
    if (obj === null) return NO ;
    var idx = this[SC.hashFor(obj)] ;
    return (!SC.none(idx) && (idx < this.length) && (this[idx]===obj)) ;
  },

  /**
    Returns YES if the passed object is also a set that contains the same
    objects as the receiver.

    @param {SC.Set} obj the other object
    @returns {Boolean}
  */
  isEqual: function(obj) {
    // fail fast
    if (!obj || !obj.isSet || (obj.get('length') !== this.get('length'))) {
      return NO ;
    }

    var loc = this.get('length');
    while(--loc>=0) {
      if (!obj.contains(this[loc])) return NO ;
    }

    return YES;
  },

  /**
    Adds a set observers. Set observers must implement two methods:

    - didAddItem(set, item)
    - didRemoveItem(set, item)

    Set observers are, in fact, stored in another set (a CoreSet).
  */
  addSetObserver: function(setObserver) {
    // create set observer set if needed
    if (!this.setObservers) {
      this.setObservers = SC.CoreSet.create();
    }

    // add
    this.setObservers.add(setObserver);
  },

  /**
    Removes a set observer.
  */
  removeSetObserver: function(setObserver) {
    // if there is no set, there can be no currently observing set observers
    if (!this.setObservers) return;

    // remove the set observer. Pretty simple, if you think about it. I mean,
    // honestly.
    this.setObservers.remove(setObserver);
  },

  /**
    Call this method to add an object. performs a basic add.

    If the object is already in the set it will not be added again.

    @param {Object} obj the object to add
    @returns {SC.Set} receiver
  */
  add: function(obj) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;

    // cannot add null to a set.
    if (SC.none(obj)) return this;

    // Implementation note:  SC.hashFor() is inlined because sets are
    // fundamental in SproutCore, and the inlined code is ~ 25% faster than
    // calling SC.hashFor() in IE8.
    var hashFunc,
        guid = ((hashFunc = obj.hash) && (typeof hashFunc === "function")) ? hashFunc.call(obj) : SC.guidFor(obj),
        idx  = this[guid],
        len  = this.length;
    if ((idx >= len) || (this[idx] !== obj)) {
      this[len] = obj;
      this[guid] = len;
      this.length = len + 1;
      if (this.setObservers) this.didAddItem(obj);
    }

    if (this.isObservable) this.enumerableContentDidChange();

    return this ;
  },

  /**
    Add all the items in the passed array or enumerable

    @param {Array} objects
    @returns {SC.Set} receiver
  */
  addEach: function(objects) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    if (!objects || !objects.isEnumerable) {
      throw "%@.addEach must pass enumerable".fmt(this);
    }

    var idx, isObservable = this.isObservable ;

    if (isObservable) this.beginPropertyChanges();
    if (objects.isSCArray) {
      idx = objects.get('length');
      while(--idx >= 0) this.add(objects.objectAt(idx)) ;
    } else if (objects.isSet) {
      idx = objects.length;
      while(--idx>=0) this.add(objects[idx]);

    } else objects.forEach(function(i) { this.add(i); }, this);
    if (isObservable) this.endPropertyChanges();

    return this ;
  },

  /**
    Removes the object from the set if it is found.

    If the object is not in the set, nothing will be changed.

    @param {Object} obj the object to remove
    @returns {SC.Set} receiver
  */
  remove: function(obj) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;

    // Implementation note:  SC.none() and SC.hashFor() are inlined because
    // sets are fundamental in SproutCore, and the inlined code is ~ 25%
    // faster than calling them "normally" in IE8.
    if (obj === null || obj === undefined) return this ;

    var hashFunc,
        guid = (obj && (hashFunc = obj.hash) && (typeof hashFunc === SC.T_FUNCTION)) ? hashFunc.call(obj) : SC.guidFor(obj),
        idx  = this[guid],
        len  = this.length,
        tmp;

    // not in set.
    // (SC.none is inlined for the reasons given above)
    if ((idx === null || idx === undefined) || (idx >= len) || (this[idx] !== obj)) return this;

    // clear the guid key
    delete this[guid];

    // to clear the index, we will swap the object stored in the last index.
    // if this is the last object, just reduce the length.
    if (idx < (len-1)) {
      // we need to keep a reference to "obj" so we can alert others below;
      // so, no changing it. Instead, create a temporary variable.
      tmp = this[idx] = this[len-1];
      guid = (tmp && (hashFunc = tmp.hash) && (typeof hashFunc === SC.T_FUNCTION)) ? hashFunc.call(tmp) : SC.guidFor(tmp);
      this[guid] = idx;
    }

    // reduce the length
    this.length = len-1;
    if (this.isObservable) this.enumerableContentDidChange();
    if (this.setObservers) this.didRemoveItem(obj);
    return this ;
  },

  /**
    Removes an arbitrary object from the set and returns it.

    @returns {Object} an object from the set or null
  */
  pop: function() {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    var obj = (this.length > 0) ? this[this.length-1] : null ;
    this.remove(obj) ;
    return obj ;
  },

  /**
    Removes all the items in the passed array.

    @param {Array} objects
    @returns {SC.Set} receiver
  */
  removeEach: function(objects) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    if (!objects || !objects.isEnumerable) {
      throw "%@.addEach must pass enumerable".fmt(this);
    }

    var idx, isObservable = this.isObservable ;

    if (isObservable) this.beginPropertyChanges();
    if (objects.isSCArray) {
      idx = objects.get('length');
      while(--idx >= 0) this.remove(objects.objectAt(idx)) ;
    } else if (objects.isSet) {
      idx = objects.length;
      while(--idx>=0) this.remove(objects[idx]);
    } else objects.forEach(function(i) { this.remove(i); }, this);
    if (isObservable) this.endPropertyChanges();

    return this ;
  },

  /**
   Clones the set into a new set.

    @returns {SC.Set} new copy
  */
  copy: function() {
    return this.constructor.create(this);
  },

  /**
    Return a set to the pool for reallocation.

    @returns {SC.Set} receiver
  */
  destroy: function() {
    this.isFrozen = NO ; // unfreeze to return to pool
    if (!this.isObservable) SC.Set._pool.push(this.clear());
    return this;
  },

  // .......................................
  // PRIVATE
  //

  /** @private - optimized */
  forEach: function(iterator, target) {
    var len = this.length;
    if (!target) target = this ;
    for(var idx=0;idx<len;idx++) iterator.call(target, this[idx], idx, this);
    return this ;
  },

  /** @private */
  toString: function() {
    var len = this.length, idx, ary = [];
    for(idx=0;idx<len;idx++) ary[idx] = this[idx];
    return "SC.Set<%@>".fmt(ary.join(',')) ;
  },

  /**
    @private
    Alerts set observers that an item has been added.
  */
  didAddItem: function(item) {
    // get the set observers
    var o = this.setObservers;

    // return if there aren't any
    if (!o) return;

    // loop through and call didAddItem.
    var len = o.length, idx;
    for (idx = 0; idx < len; idx++) o[idx].didAddItem(this, item);
  },

  /**
    @private
    Alerts set observers that an item has been removed.
  */
  didRemoveItem: function(item) {
    // get the set observers
    var o = this.setObservers;

    // return if there aren't any
    if (!o) return;

    // loop through and call didAddItem.
    var len = o.length, idx;
    for (idx = 0; idx < len; idx++) o[idx].didRemoveItem(this, item);
  },

  // the pool used for non-observable sets
  _pool: [],

  /** @private */
  isObservable: YES

}) ;

SC.Set.constructor = SC.Set;

// Make SC.Set look a bit more like other enumerables

/** @private */
SC.Set.clone = SC.Set.copy ;

/** @private */
SC.Set.push = SC.Set.unshift = SC.Set.add ;

/** @private */
SC.Set.shift = SC.Set.pop ;

// add generic add/remove enumerable support

/** @private */
SC.Set.addObject = SC.Set.add ;

/** @private */
SC.Set.removeObject = SC.Set.remove;

SC.Set._pool = [];

// ..........................................................
// CORE SET
//

/** @class

  CoreSet is just like set but not observable.  If you want to use the set
  as a simple data structure with no observing, CoreSet is slightly faster
  and more memory efficient.

  @extends SC.Set
  @since SproutCore 1.0
*/
SC.CoreSet = SC.beget(SC.Set);

/** @private */
SC.CoreSet.isObservable = NO ;

/** @private */
SC.CoreSet.constructor = SC.CoreSet;

/* >>>>>>>>>> BEGIN source/private/observer_queue.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/observable');
sc_require('system/set');

// ........................................................................
// OBSERVER QUEUE
//
// This queue is used to hold observers when the object you tried to observe
// does not exist yet.  This queue is flushed just before any property
// notification is sent.

/**
  @namespace

  The private ObserverQueue is used to maintain a set of pending observers.
  This allows you to setup an observer on an object before the object exists.

  Whenever the observer fires, the queue will be flushed to connect any
  pending observers.

  @private
  @since SproutCore 1.0
*/
SC.Observers = {

  queue: [],

  /**
   @private

   Attempt to add the named observer.  If the observer cannot be found, put
   it into a queue for later.
  */
  addObserver: function(propertyPath, target, method, pathRoot) {
    var tuple ;

    // try to get the tuple for this.
    if (typeof propertyPath === "string") {
      tuple = SC.tupleForPropertyPath(propertyPath, pathRoot) ;
    } else {
      tuple = propertyPath;
    }

    // if a tuple was found and is observable, add the observer immediately...
    if (tuple && tuple[0].addObserver) {
      tuple[0].addObserver(tuple[1],target, method) ;

    // otherwise, save this in the queue.
    } else {
      this.queue.push([propertyPath, target, method, pathRoot]) ;
    }
  },

  /**
    @private

    Remove the observer.  If it is already in the queue, remove it.  Also
    if already found on the object, remove that.
  */
  removeObserver: function(propertyPath, target, method, pathRoot) {
    var idx, queue, tuple, item;

    tuple = SC.tupleForPropertyPath(propertyPath, pathRoot) ;
    if (tuple) {
      tuple[0].removeObserver(tuple[1], target, method) ;
    }

    idx = this.queue.length; queue = this.queue ;
    while(--idx >= 0) {
      item = queue[idx] ;
      if ((item[0] === propertyPath) && (item[1] === target) && (item[2] == method) && (item[3] === pathRoot)) queue[idx] = null ;
    }
  },

  /**
    @private

    Range Observers register here to indicate that they may potentially
    need to start observing.
  */
  addPendingRangeObserver: function(observer) {
    var ro = this.rangeObservers;
    if (!ro) ro = this.rangeObservers = SC.CoreSet.create();
    ro.add(observer);
    return this ;
  },

  _TMP_OUT: [],

  /**
    Flush the queue.  Attempt to add any saved observers.
  */
  flush: function(object) {

    // flush any observers that we tried to setup but didn't have a path yet
    var oldQueue = this.queue, i,
        queueLen = oldQueue.length;
    
    if (oldQueue && queueLen > 0) {
      var newQueue = (this.queue = []) ;

      for (i=0; i<queueLen; i++ ) {
        var item = oldQueue[i];
        if ( !item ) continue;
        
        var tuple = SC.tupleForPropertyPath( item[0], item[3] );
        // check if object is observable (yet) before adding an observer
        if( tuple && tuple[0].addObserver ) {
          tuple[0].addObserver( tuple[1], item[1], item[2] );
        } else {
          newQueue.push( item );
        }
      }
    }
    
    // if this object needsRangeObserver then see if any pending range
    // observers need it.
    if ( object._kvo_needsRangeObserver ) {
      var set = this.rangeObservers,
          len = set ? set.get('length') : 0,
          out = this._TMP_OUT,
          ro;

      for ( i=0; i<len; i++ ) {
        ro = set[i]; // get the range observer
        if ( ro.setupPending(object) ) {
          out.push(ro); // save to remove later
        }
      }

      // remove any that have setup
      if ( out.length > 0 ) set.removeEach(out);
      out.length = 0; // reset
      object._kvo_needsRangeObserver = false ;
    }

  },

  /** @private */
  isObservingSuspended: 0,

  _pending: SC.CoreSet.create(),

  /** @private */
  objectHasPendingChanges: function(obj) {
    this._pending.add(obj) ; // save for later
  },

  /** @private */
  // temporarily suspends all property change notifications.
  suspendPropertyObserving: function() {
    this.isObservingSuspended++ ;
  },

  // resume change notifications.  This will call notifications to be
  // delivered for all pending objects.
  /** @private */
  resumePropertyObserving: function() {
    var pending ;
    if(--this.isObservingSuspended <= 0) {
      pending = this._pending ;
      this._pending = SC.CoreSet.create() ;

      var idx, len = pending.length;
      for(idx=0;idx<len;idx++) {
        pending[idx]._notifyPropertyObservers() ;
      }
      pending.clear();
      pending = null ;
    }
  }

} ;

/* >>>>>>>>>> BEGIN source/system/object.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('core') ;
sc_require('mixins/observable') ;
sc_require('private/observer_queue');
sc_require('mixins/array') ;
sc_require('system/set');

/*globals $$sel */

SC.BENCHMARK_OBJECTS = NO;

// ..........................................................
// PRIVATE HELPER METHODS
//
// Private helper methods.  These are not kept as part of the class
// definition because SC.Object is copied frequently and we want to keep the
// number of class methods to a minimum.

SC._detect_base = function _detect_base(func, parent, name) {
  return function invoke_superclass_method() {
    var base = parent[name], args;

    if (!base) {
      throw new Error("No '" + name + "' method was found on the superclass");
    }

    // NOTE: It is possible to cache the base, so that the first
    // call to sc_super will avoid doing the lookup again. However,
    // since the cost of the extra method dispatch is low and is
    // only incurred on sc_super, but also creates another possible
    // weird edge-case (when a class is enhanced after first used),
    // we'll leave it off for now unless profiling demonstrates that
    // it's a hotspot.
    //if(base && func === base) { func.base = function() {}; }
    //else { func.base = base; }

    if(func.isEnhancement) {
      args = Array.prototype.slice.call(arguments, 1);
    } else {
      args = arguments;
    }

    return base.apply(this, args);
  };
};

/** @private
  Augments a base object by copying the properties from the extended hash.
  In addition to simply copying properties, this method also performs a
  number of optimizations that can make init'ing a new object much faster
  including:

  - concatenating concatenatedProperties
  - prepping a list of bindings, observers, and dependent keys
  - caching local observers so they don't need to be manually constructed.

  @param {Hash} base hash
  @param {Hash} extension
  @returns {Hash} base hash
*/
SC._object_extend = function _object_extend(base, ext, proto) {
  if (!ext) { throw "SC.Object.extend expects a non-null value.  Did you forget to 'sc_require' something?  Or were you passing a Protocol to extend() as if it were a mixin?"; }
  // set _kvo_cloned for later use
  base._kvo_cloned = null;

  // get some common vars
  var key, idx, len, cur, cprops = base.concatenatedProperties, K = SC.K ;
  var p1,p2;

  // first, save any concat props.  use old or new array or concat
  idx = (cprops) ? cprops.length : 0 ;
  var concats = (idx>0) ? {} : null;
  while(--idx>=0) {
    key = cprops[idx]; p1 = base[key]; p2 = ext[key];

    if (p1) {
      if (!(p1 instanceof Array)) p1 = SC.$A(p1);
      concats[key] = (p2) ? p1.concat(p2) : p2 ;
    } else {
      if (!(p2 instanceof Array)) p2 = SC.$A(p2);
      concats[key] = p2 ;
    }
  }

  // setup arrays for bindings, observers, and properties.  Normally, just
  // save the arrays from the base.  If these need to be changed during
  // processing, then they will be cloned first.
  var bindings = base._bindings, clonedBindings = NO;
  var observers = base._observers, clonedObservers = NO;
  var properties = base._properties, clonedProperties = NO;
  var paths, pathLoc, local ;

  // outlets are treated a little differently because you can manually
  // name outlets in the passed in hash. If this is the case, then clone
  // the array first.
  var outlets = base.outlets, clonedOutlets = NO ;
  if (ext.outlets) {
    outlets = (outlets || SC.EMPTY_ARRAY).concat(ext.outlets);
    clonedOutlets = YES ;
  }

  // now copy properties, add superclass to func.
  for(key in ext) {

    if (key === '_kvo_cloned') continue; // do not copy

    // avoid copying builtin methods
    if (!ext.hasOwnProperty(key)) continue ;

    // get the value.  use concats if defined
    var value = (concats.hasOwnProperty(key) ? concats[key] : null) || ext[key];

    // Possibly add to a bindings.
    if (key.length > 7 && key.slice(-7) === "Binding") {
      if (!clonedBindings) {
        bindings = (bindings || SC.EMPTY_ARRAY).slice() ;
        clonedBindings = YES ;
      }

      if (bindings === null) bindings = (base._bindings || SC.EMPTY_ARRAY).slice();
      bindings[bindings.length] = key ;

    // Also add observers, outlets, and properties for functions...
    } else if (value && (value instanceof Function)) {

      // add super to funcs.  Be sure not to set the base of a func to
      // itself to avoid infinite loops.
      if (!value.superclass && (value !== (cur=base[key]))) {
        value.superclass = cur || K;
        value.base = proto ? SC._detect_base(value, proto, key) : cur || K;
      }

      // handle regular observers
      if (value.propertyPaths) {
        if (!clonedObservers) {
          observers = (observers || SC.EMPTY_ARRAY).slice() ;
          clonedObservers = YES ;
        }
        observers[observers.length] = key ;

      // handle local properties
      }

      if (paths = value.localPropertyPaths) {
        pathLoc = paths.length;
        while(--pathLoc >= 0) {
          local = base._kvo_for(SC.keyFor('_kvo_local', paths[pathLoc]), SC.CoreSet);
          local.add(key);
          base._kvo_for('_kvo_observed_keys', SC.CoreSet).add(paths[pathLoc]);
        }

      // handle computed properties
      }

      if (value.dependentKeys) {
        if (!clonedProperties) {
          properties = (properties || SC.EMPTY_ARRAY).slice() ;
          clonedProperties = YES ;
        }
        properties[properties.length] = key ;

      // handle outlets
      }

      if (value.autoconfiguredOutlet) {
        if (!clonedOutlets) {
          outlets = (outlets || SC.EMPTY_ARRAY).slice();
          clonedOutlets = YES ;
        }
        outlets[outlets.length] = key ;
      }

      if (value.isEnhancement) {
        value = SC._enhance(base[key] || K, value);
      }
    }

    // copy property
    base[key] = value ;
  }

  // Manually set base on toString() because some JS engines (such as IE8) do
  // not enumerate it
  if (ext.hasOwnProperty('toString')) {
    key = 'toString';
    // get the value.  use concats if defined
    value = (concats.hasOwnProperty(key) ? concats[key] : null) || ext[key] ;
    if (!value.superclass && (value !== (cur=base[key]))) {
      value.superclass = value.base = cur || K ;
    }
    // copy property
    base[key] = value ;
  }


  // copy bindings, observers, and properties
  base._bindings = bindings || [];
  base._observers = observers || [] ;
  base._properties = properties || [] ;
  base.outlets = outlets || [];

  return base ;
} ;

SC._enhance = function(originalFunction, enhancement) {
  return function() {
    var args = Array.prototype.slice.call(arguments, 0);
    var self = this;

    args.unshift(function() { return originalFunction.apply(self, arguments); });
    return enhancement.apply(this, args);
  };
};

/** @class

  Root object for the SproutCore framework.  SC.Object is the root class for
  most classes defined by SproutCore.  It builds on top of the native object
  support provided by JavaScript to provide support for class-like
  inheritance, automatic bindings, properties observers, and more.

  Most of the classes you define in your application should inherit from
  SC.Object or one of its subclasses.  If you are writing objects of your
  own, you should read this documentation to learn some of the details of
  how SC.Object's behave and how they differ from other frameworks.

  About SproutCore Classes
  ===

  JavaScript is not a class-based language.  Instead it uses a type of
  inheritence inspired by self called "prototypical" inheritance.
  ...

  Using SproutCore objects with other JavaScript object.
  ===

  You can create a SproutCore object just like any other object...
  obj = new SC.Object() ;

  @extends SC.Observable
  @since SproutCore 1.0
*/
SC.Object = function(props) {
  this.__sc_super__ = SC.Object.prototype;
  return this._object_init(props);
};

SC.mixin(SC.Object, /** @scope SC.Object */ {

  /**
    Adds the passed properties to the object's class definition.  You can
    pass as many hashes as you want, including Mixins, and they will be
    added in the order they are passed.

    This is a shorthand for calling SC.mixin(MyClass, props...);

    @param {Hash} props the properties you want to add.
    @returns {Object} receiver
  */
  mixin: function(props) {
    var len = arguments.length, loc ;
    for(loc =0;loc<len;loc++) SC.mixin(this, arguments[loc]);
    return this ;
  },

  // ..........................................
  // CREATING CLASSES AND INSTANCES
  //

  /**
    Points to the superclass for this class.  You can use this to trace a
    class hierarchy.

    @type SC.Object
  */
  superclass: null,

  /**
    Creates a new subclass of the receiver, adding any passed properties to
    the instance definition of the new class.  You should use this method
    when you plan to create several objects based on a class with similar
    properties.

    Init:

    If you define an init() method, it will be called when you create
    instances of your new class.  Since SproutCore uses the init() method to
    do important setup, you must be sure to always call arguments.callee.base.apply(this,arguments) somewhere
    in your init() to allow the normal setup to proceed.

    @param {Hash} props the methods of properties you want to add
    @returns {Class} A new object class
  */
  extend: function(props) {
    var bench = SC.BENCHMARK_OBJECTS ;
    if (bench) SC.Benchmark.start('SC.Object.extend') ;

    // build a new constructor and copy class methods.  Do this before
    // adding any other properties so they are not overwritten by the copy.
    var prop, ret = function(props) {
      this.__sc_super__ = ret.prototype;
      return this._object_init(props);
    } ;
    for(prop in this) {
      if (!this.hasOwnProperty(prop)) continue ;
      ret[prop] = this[prop];
    }

    // manually copy toString() because some JS engines do not enumerate it
    if (this.hasOwnProperty('toString')) ret.toString = this.toString;

    // now setup superclass, guid
    ret.superclass = this ;
    ret.__sc_super__ = this.prototype;
    SC.generateGuid(ret, "sc"); // setup guid

    ret.subclasses = SC.Set.create();
    this.subclasses.add(ret); // now we can walk a class hierarchy

    // setup new prototype and add properties to it
    var base = (ret.prototype = SC.beget(this.prototype));
    var idx, len = arguments.length;
    for(idx=0;idx<len;idx++) { SC._object_extend(base, arguments[idx], ret.__sc_super__) ; }
    base.constructor = ret; // save constructor

    if (bench) SC.Benchmark.end('SC.Object.extend') ;
    return ret ;
  },

  reopen: function(props) {
    return SC._object_extend(this.prototype, props, this.__sc_super__);
  },

  /**
    Creates a new instance of the class.

    Unlike most frameworks, you do not pass parameters to the init function
    for an object.  Instead, you pass a hash of additional properties you
    want to have assigned to the object when it is first created.  This is
    functionally like creating an anonymous subclass of the receiver and then
    instantiating it, but more efficient.

    You can use create() like you would a normal constructor in a
    class-based system, or you can use it to create highly customized
    singleton objects such as controllers or app-level objects.  This is
    often more efficient than creating subclasses and then instantiating
    them.

    You can pass any hash of properties to this method, including mixins.

    @param {Hash} props
      optional hash of method or properties to add to the instance.

    @returns {SC.Object} new instance of the receiver class.
  */
  create: function() {
    var C=this, ret = new C(arguments);
    if (SC.ObjectDesigner) {
      SC.ObjectDesigner.didCreateObject(ret, SC.$A(arguments));
    }
    return ret ;
  },
  /**
    Walk like a duck.  You can use this to quickly test classes.

    @type Boolean
  */
  isClass: YES,

  /**
    Set of subclasses that extend from this class.  You can observe this
    array if you want to be notified when the object is extended.

    @type SC.Set
  */
  subclasses: SC.Set.create(),

  /** @private */
  toString: function() { return SC._object_className(this); },

  // ..........................................
  // PROPERTY SUPPORT METHODS
  //

  /**
    Returns YES if the receiver is a subclass of the named class.  If the
    receiver is the class passed, this will return NO since the class is not
    a subclass of itself.  See also kindOf().

    Example:

          ClassA = SC.Object.extend();
          ClassB = ClassA.extend();

          ClassB.subclassOf(ClassA) => YES
          ClassA.subclassOf(ClassA) => NO

    @param {Class} scClass class to compare
    @returns {Boolean}
  */
  subclassOf: function(scClass) {
    if (this === scClass) return NO ;
    var t = this ;
    while(t = t.superclass) if (t === scClass) return YES ;
    return NO ;
  },

  /**
    Returns YES if the passed object is a subclass of the receiver.  This is
    the inverse of subclassOf() which you call on the class you want to test.

    @param {Class} scClass class to compare
    @returns {Boolean}
  */
  hasSubclass: function(scClass) {
    return (scClass && scClass.subclassOf) ? scClass.subclassOf(this) : NO;
  },

  /**
    Returns YES if the receiver is the passed class or is a subclass of the
    passed class.  Unlike subclassOf(), this method will return YES if you
    pass the receiver itself, since class is a kind of itself.  See also
    subclassOf().

    Example:

          ClassA = SC.Object.extend();
          ClassB = ClassA.extend();

          ClassB.kindOf(ClassA) => YES
          ClassA.kindOf(ClassA) => YES

    @param {Class} scClass class to compare
    @returns {Boolean}
  */
  kindOf: function(scClass) {
    return (this === scClass) || this.subclassOf(scClass) ;
  },

  // ..........................................................
  // Designers
  //
  /**
    This method works just like extend() except that it will also preserve
    the passed attributes.

    @param {Hash} attrs Attributes to add to view
    @returns {Class} SC.Object subclass to create
    @function
  */
  design: function() {
    if (this.isDesign) {
      
      SC.Logger.warn("SC.Object#design called twice for %@.".fmt(this));
      
      return this;
    }

    var ret = this.extend.apply(this, arguments);
    ret.isDesign = YES ;
    if (SC.ObjectDesigner) {
      SC.ObjectDesigner.didLoadDesign(ret, this, SC.A(arguments));
    }
    return ret ;
  }
}) ;

// ..........................................
// DEFAULT OBJECT INSTANCE
//
SC.Object.prototype = {

  _kvo_enabled: YES,

  /** @private
    This is the first method invoked on a new instance.  It will first apply
    any added properties to the new instance and then calls the real init()
    method.

    @param {Array} extensions an array-like object with hashes to apply.
    @returns {Object} receiver
  */
  _object_init: function(extensions) {
    // apply any new properties
    var idx, len = (extensions) ? extensions.length : 0;
    for(idx=0;idx<len;idx++) { SC._object_extend(this, extensions[idx], this.__sc_super__) ; }
    SC.generateGuid(this, "sc") ; // add guid
    this.init() ; // call real init

    // Call 'initMixin' methods to automatically setup modules.
    var inits = this.initMixin; len = (inits) ? inits.length : 0 ;
    for(idx=0;idx < len; idx++) inits[idx].call(this);

    return this ; // done!
  },

  /**
    You can call this method on an object to mixin one or more hashes of
    properties on the receiver object.  In addition to simply copying
    properties, this method will also prepare the properties for use in
    bindings, computed properties, etc.

    If you plan to use this method, you should call it before you call
    the inherited init method from SC.Object or else your instance may not
    function properly.

    Example:

          // dynamically apply a mixin specified in an object property
          var MyClass = SC.Object.extend({
             extraMixin: null,

             init: function() {
               this.mixin(this.extraMixin);
               arguments.callee.base.apply(this,arguments);
             }
          });

          var ExampleMixin = { foo: "bar" };

          var instance = MyClass.create({ extraMixin: ExampleMixin }) ;

          instance.get('foo') => "bar"

    @param {Hash} ext a hash to copy.  Only one.
    @returns {Object} receiver
  */
  mixin: function() {
    var idx, len = arguments.length;
    for(idx=0;idx<len;idx++) SC.mixin(this, arguments[idx]) ;

    // call initMixin
    for(idx=0;idx<len;idx++) {
      var init = arguments[idx].initMixin ;
      if (init) init.call(this) ;
    }
    return this ;
  },

  /**
    This method is invoked automatically whenever a new object is
    instantiated.  You can override this method as you like to setup your
    new object.

    Within your object, be sure to call arguments.callee.base.apply(this,arguments) to ensure that the
    built-in init method is also called or your observers and computed
    properties may not be configured.

    Although the default init() method returns the receiver, the return
    value is ignored.


  */
  init: function() {
    this.initObservable();
    return this ;
  },

  /**
    Set to NO once this object has been destroyed.

    @type Boolean
  */
  isDestroyed: NO,

  /**
    Call this method when you are finished with an object to teardown its
    contents.  Because JavaScript is garbage collected, you do not usually
    need to call this method.  However, you may choose to do so for certain
    objects, especially views, in order to let them reclaim memory they
    consume immediately.

    If you would like to perform additional cleanup when an object is
    finished, you may override this method.  Be sure to call arguments.callee.base.apply(this,arguments).

    @returns {SC.Object} receiver
  */
  destroy: function() {
    if (this.get('isDestroyed')) return this; // nothing to do
    this.set('isDestroyed', YES);

    // destroy any mixins
    var idx, inits = this.destroyMixin, len = (inits) ? inits.length : 0 ;
    for(idx=0;idx < len; idx++) inits[idx].call(this);

    // disconnect all bindings
    this.bindings.invoke('disconnect');
    this.bindings = null;

    return this ;
  },

  /**
    Walk like a duck. Always YES since this is an object and not a class.

    @type Boolean
  */
  isObject: true,

  /**
    Returns YES if the named value is an executable function.

    @param {String} methodName the property name to check
    @returns {Boolean}
  */
  respondsTo: function( methodName ) {
    return !!(this[methodName] instanceof Function);
  },

  /**
    Attemps to invoke the named method, passing the included two arguments.
    Returns NO if the method is either not implemented or if the handler
    returns NO (indicating that it did not handle the event).  This method
    is invoked to deliver actions from menu items and to deliver events.
    You can override this method to provide additional handling if you
    prefer.

    @param {String} methodName
    @param {Object} arg1
    @param {Object} arg2
    @returns {Boolean} YES if handled, NO if not handled
  */
  tryToPerform: function(methodName, arg1, arg2) {
    return this.respondsTo(methodName) && (this[methodName](arg1, arg2) !== NO);
  },

  /**
    EXPERIMENTAL:  You can use this to invoke a superclass implementation in
    any method.  This does not work in Safari 2 or earlier.  If you need to
    target these methods, you should use one of the alternatives below:

    - *With Build Tools:* arguments.callee.base.apply(this,arguments);
    - *Without Build Tools:* arguments.callee.base.apply(this, arguments);

    Example

    All of the following methods will call the superclass implementation of
    your method:

          SC.Object.create({

            // DOES NOT WORK IN SAFARI 2 OR EARLIER
            method1: function() {
              this.superclass();
            },

            // REQUIRES SC-BUILD TOOLS
            method2: function() {
              arguments.callee.base.apply(this,arguments);
            },

            // WORKS ANYTIME
            method3: function() {
              arguments.callee.base.apply(this, arguments);
            }
          });

    @param {*args} args any arguments you want to pass along.
    @returns {Object} return value from super
  */
  superclass: function(args) {
    var caller = arguments.callee.caller;
    if (!caller) throw "superclass cannot determine the caller method" ;
    return caller.superclass ? caller.superclass.apply(this, arguments) : null;
  },

  /**
    returns YES if the receiver is an instance of the named class.  See also
    kindOf().

    Example

          var ClassA = SC.Object.extend();
          var ClassB = SC.Object.extend();

          var instA = ClassA.create();
          var instB = ClassB.create();

          instA.instanceOf(ClassA) => YES
          instB.instanceOf(ClassA) => NO

    @param {Class} scClass the class
    @returns {Boolean}
  */
  instanceOf: function(scClass) {
    return this.constructor === scClass ;
  },

  /**
    Returns true if the receiver is an instance of the named class or any
    subclass of the named class.  See also instanceOf().

    Example

          var ClassA = SC.Object.extend();
          var ClassB = SC.Object.extend();

          var instA = ClassA.create();
          var instB = ClassB.create();

          instA.kindOf(ClassA) => YES
          instB.kindOf(ClassA) => YES

    @param {Class} scClass the class
    @returns {Boolean}
  */
  kindOf: function(scClass) { return this.constructor.kindOf(scClass); },

  /** @private */
  toString: function() {
    if (!this._object_toString) {
      // only cache the string if the klass name is available
      var klassName = SC._object_className(this.constructor) ;
      var string = "%@:%@".fmt(klassName, SC.guidFor(this));
      if (klassName) this._object_toString = string ;
      else return string ;
    }
    return this._object_toString ;
  },

  /**
    Activates any outlet connections in object and syncs any bindings.  This
    method is called automatically for view classes but may be used for any
    object.


  */
  awake: function() {
    var outlets = this.outlets,
        i, len, outlet;
    for (i = 0, len = outlets.length;  i < len;  ++i) {
      outlet = outlets[i];
      this.get(outlet);
    }
    this.bindings.invoke('sync');
  },

  /**
    Invokes the passed method or method name one time during the runloop.  You
    can use this method to schedule methods that need to execute but may be
    too expensive to execute more than once, such as methods that update the
    DOM.

    Note that in development mode only, the object and method that call this
    method will be recorded, for help in debugging scheduled code.

    @param {Function|String} method method or method name
    @returns {SC.Object} receiver
  */
  invokeOnce: function(method) {
    SC.RunLoop.currentRunLoop.invokeOnce(this, method) ;
    return this ;
  },

  /**
    Invokes the passed method once at the beginning of the next runloop,
    before any other methods (including events) are processed. This is useful
    for situations where you know you need to update something, but due to
    the way the run loop works, you can't actually do the update until the
    run loop has completed.

    A simple example is setting the selection on a collection controller to a
    newly created object. Because the collection controller won't have its
    content collection updated until later in the run loop, setting the
    selection immediately will have no effect. In this situation, you could do
    this instead:

          // Creates a new MyRecord object and sets the selection of the
          // myRecord collection controller to the new object.
          createObjectAction: function(sender, evt) {
            // create a new record and add it to the store
            var obj = MyRecord.newRecord() ;

            // update the collection controller's selection
            MyApp.myRecordCollectionController.invokeLast( function() {
              this.set('selection', [obj]) ;
            });
          }

    You can call invokeLast as many times as you like and the method will
    only be invoked once.

    Note that in development mode only, the object and method that call this
    method will be recorded, for help in debugging scheduled code.

    @param {Function|String} method method or method name
    @returns {SC.Object} receiver
  */
  invokeLast: function(method) {
    SC.RunLoop.currentRunLoop.invokeLast(this, method) ;
    return this ;
  },

  /**
    The properties named in this array will be concatenated in subclasses
    instead of replaced.  This allows you to name special properties that
    should contain any values you specify plus values specified by parents.

    It is used by SproutCore and is available for your use, though you
    should limit the number of properties you include in this list as it
    adds a slight overhead to new class and instance creation.

    @type Array
  */
  concatenatedProperties: ['concatenatedProperties', 'initMixin', 'destroyMixin']

} ;

// bootstrap the constructor for SC.Object.
SC.Object.prototype.constructor = SC.Object;

// Add observable to mixin
SC.mixin(SC.Object.prototype, SC.Observable) ;

// ..........................................................
// CLASS NAME SUPPORT
//

/** @private
  This is a way of performing brute-force introspection.  This searches
  through all the top-level properties looking for classes.  When it finds
  one, it saves the class path name.
*/
function findClassNames() {

  if (SC._object_foundObjectClassNames) return ;
  SC._object_foundObjectClassNames = true ;

  var seen = [] ;
  var detectedSC = false;
  var searchObject = function(root, object, levels) {
    levels-- ;

    // not the fastest, but safe
    if (seen.indexOf(object) >= 0) return ;
    seen.push(object) ;

    for(var key in object) {
      if (key == '__scope__') continue ;
      if (key == 'superclass') continue ;
      if (key == '__SC__') key = 'SC' ;
      if (!key.match(/^[A-Z0-9]/)) continue ;
      if (key == 'SC') {
        if (detectedSC) continue;
        detectedSC = true;
      }

      var path = (root) ? [root,key].join('.') : key ;
      var value = object[key] ;

      try {
        var type = SC.typeOf(value);
      } catch (e) {
        // Firefox gives security errors when trying to run typeOf on certain objects
        break;
      }

      switch(type) {
      case SC.T_CLASS:
        if (!value._object_className) value._object_className = path;
        if (levels>=0) searchObject(path, value, levels) ;
        break ;

      case SC.T_OBJECT:
        if (levels>=0) searchObject(path, value, levels) ;
        break ;

      case SC.T_HASH:
        if (((root) || (path==='SC')) && (levels>=0)) searchObject(path, value, levels) ;
        break ;

      default:
        break;
      }
    }
  } ;

  // Fix for IE 7 and 8 in order to detect the SC global variable. When you create
  // a global variable in IE, it is not added to the window object like in other
  // browsers. Therefore the searchObject method will not pick it up. So we have to
  // update the window object to have a reference to the global variable. And
  // doing window['SC'] does not work since the global variable already exists. For
  // any object that you create that is used act as a namespace, be sure to create it
  // like so:
  //
  //   window.MyApp = window.MyApp || SC.Object.create({ ... })
  //
  window['__SC__'] = SC;
  searchObject(null, window, 2) ;
}

/**
  Same as the instance method, but lets you check instanceOf without
  having to first check if instanceOf exists as a method.

  @param {Object} scObject the object to check instance of
  @param {Class} scClass the class
  @returns {Boolean} if object1 is instance of class
*/
SC.instanceOf = function(scObject, scClass) {
  return !!(scObject && scObject.constructor === scClass) ;
} ;

/**
  Same as the instance method, but lets you check kindOf without having to
  first check if kindOf exists as a method.

  @param {Object} scObject object to check kind of
  @param {Class} scClass the class to check
  @returns {Boolean} if object is an instance of class or subclass
*/
SC.kindOf = function(scObject, scClass) {
  if (scObject && !scObject.isClass) scObject = scObject.constructor;
  return !!(scObject && scObject.kindOf && scObject.kindOf(scClass));
};

/** @private
  Returns the name of this class.  If the name is not known, triggers
  a search.  This can be expensive the first time it is called.

  This method is used to allow classes to determine their own name.
*/
SC._object_className = function(obj) {
  if (SC.isReady === NO) return ''; // class names are not available until ready
  if (!obj._object_className) findClassNames() ;
  if (obj._object_className) return obj._object_className ;

  // if no direct classname was found, walk up class chain looking for a
  // match.
  var ret = obj ;
  while(ret && !ret._object_className) ret = ret.superclass;
  return (ret && ret._object_className) ? ret._object_className : 'Anonymous';
} ;


/* >>>>>>>>>> BEGIN source/private/property_chain.js */
sc_require('system/object');

/**
  @class
  @private

  SC._PropertyChain is used as the bookkeeping system for notifying the KVO
  system of changes to computed properties that contains paths as dependent
  keys.

  Each instance of SC._PropertyChain serves as a node in a linked list. One node
  is created for each property in the path, and stores a reference to the name
  of the property and the object to which it belongs. If that property changes,
  the SC._PropertyChain instance notifies its associated computed property to
  invalidate, then rebuilds the chain with the new value.

  To create a new chain, call SC._PropertyChain.createChain() with the target,
  path, and property to invalidate if any of the objects in the path change.

  For example, if you called createChain() with 'foo.bar.baz', it would
  create a linked list like this:

   ---------------------     ---------------------     ---------------------
  | property:     'foo' |   | property:     'bar' |   | property:     'baz' |
  | nextProperty: 'bar' |   | nextProperty: 'baz' |   | nextProperty: undef |
  | next:           ------->| next:           ------->| next:     undefined |
   ---------------------     ---------------------     ---------------------

  @extends SC.Object
  @since SproutCore 1.5
*/

SC._PropertyChain = SC.Object.extend(
/** @scope SC.Object.prototype */ {
  /**
    The object represented by this node in the chain.

    @property {Object}
  */
  object: null,

  /**
    The key on the previous object in the chain that contains the object
    represented by this node in the chain.

    @property {String}
  */
  property: null,

  /**
    The target object. This is the object passed to createChain(), and the
    object which contains the +toInvalidate+ property that will be invalidated
    if +property+ changes.

    @property {Object}
  */
  target: null,

  /**
    The property of +target+ to invalidate when +property+ changes.

    @property {String}
  */
  toInvalidate: null,

  /**
    The property key on +object+ that contains the object represented by the
    next node in the chain.

    @property {String}
  */
  nextProperty: null,

  /**
    Registers this segment of the chain with the object it represents.

    This should be called with the object represented by the previous node in
    the chain as the first parameter. If no previous object is provided, it will
    assume it is the root node in the chain and treat the target as the previous
    object.

    @param {Object} [newObject] The object in the chain to hook to.
  */
  activate: function(newObject) {
    var curObject = this.get('object'),
        property  = this.get('property'),
        nextObject;

    // If no parameter is passed, assume we are the root in the chain
    // and look up property relative to the target, since dependent key
    // paths are always relative.
    if (!newObject) { newObject = this.get('target'); }

    if (curObject && curObject!==newObject) {
      this.deactivate();
    }
    this.set('object', newObject);

    // In the special case of @each, we treat the enumerable as the next
    // property so just skip registering it
    if (newObject && property!=='@each') {
      newObject.registerDependentKeyWithChain(property, this);
    }

    // now - lookup the object for the next one...
    if (this.next) {
      nextObject = newObject ? newObject.get(property) : undefined;
      this.next.activate(nextObject);
    }

    return this;
  },

  /**
    Removes this segment of the chain from the object it represents. This is 
    usually called when the object represented by the previous segment in the 
    chain changes.
  */
  deactivate: function() {
    var object   = this.get('object'),
        property = this.get('property');

    // If the chain element is not associated with an object,
    // we don't need to deactivate anything.
    if (object) object.removeDependentKeyWithChain(property, this);
    if (this.next) this.next.deactivate();
    return this;
  },

  /**
    Invalidates the +toInvalidate+ property of the +target+ object.
  */
  notifyPropertyDidChange: function() {
    var target       = this.get('target'),
        toInvalidate = this.get('toInvalidate'),
        curObj, newObj;

    // Tell the target of the chain to invalidate the property
    // that depends on this element of the chain
    target.propertyDidChange(toInvalidate);

    // If there are more dependent keys in the chain, we need
    // to invalidate them and set them up again.
    if (this.next) {
      // Get the new value of the object associated with this node to pass to
      // activate().
      curObj = this.get('object');
      newObj = curObj.get(this.get('property'));

      this.next.activate(newObj); // reactivate down the line
    }
  },

  
  /**
    Returns a string representation of the chain segment.

    @returns {String}
  */
  toString: function() {
    return "SC._PropertyChain(target: %@, property: %@)".fmt(
      this.get('target'), this.get('property'));
  }
  
});

SC._PropertyChain.createChain = function(path, target, toInvalidate) {
  var parts = path.split('.');
  var len = parts.length,
      i   = 1;

  var root = SC._PropertyChain.create({
    property:     parts[0],
    target:       target,
    toInvalidate: toInvalidate,
    nextProperty: parts[1]
  });


  root.set('length', len);
  var tail = root;

  while(--len >= 1) {
    tail = tail.next = SC._PropertyChain.create({
      property:     parts[i],
      target:       target,
      toInvalidate: toInvalidate,
      nextProperty: parts[++i]
    });

    tail.set('length', len);
  }

  return root;
};

/* >>>>>>>>>> BEGIN source/system/binding.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('ext/function');
sc_require('system/object');

/**
  Debug parameter you can turn on.  This will log all bindings that fire to
  the console.  This should be disabled in production code.  Note that you
  can also enable this from the console or temporarily.

  @property {Boolean}
*/
SC.LOG_BINDINGS = NO ;

/**
  Performance paramter.  This will benchmark the time spent firing each
  binding.

  @property {Boolean}
*/
SC.BENCHMARK_BINDING_NOTIFICATIONS = NO ;

/**
  Performance parameter.  This will benchmark the time spend configuring each
  binding.

  @property {Boolean}
*/
SC.BENCHMARK_BINDING_SETUP = NO;

/**
  Default placeholder for multiple values in bindings.

  @property {String}
*/
SC.MULTIPLE_PLACEHOLDER = '@@MULT@@' ;

/**
  Default placeholder for null values in bindings.

  @property {String}
*/
SC.NULL_PLACEHOLDER = '@@NULL@@' ;

/**
  Default placeholder for empty values in bindings.

  @property {String}
*/
SC.EMPTY_PLACEHOLDER = '@@EMPTY@@' ;


/**
  @class

  A binding simply connects the properties of two objects so that whenever the
  value of one property changes, the other property will be changed also.  You
  do not usually work with Binding objects directly but instead describe
  bindings in your class definition using something like:

        valueBinding: "MyApp.someController.title"

  This will create a binding from "MyApp.someController.title" to the "value"
  property of your object instance automatically.  Now the two values will be
  kept in sync.

  Customizing Your Bindings
  ===

  In addition to synchronizing values, bindings can also perform some basic
  transforms on values.  These transforms can help to make sure the data fed
  into one object always meets the expectations of that object regardless of
  what the other object outputs.

  To customize a binding, you can use one of the many helper methods defined
  on SC.Binding like so:

        valueBinding: SC.Binding.single("MyApp.someController.title")

  This will create a binding just like the example above, except that now the
  binding will convert the value of MyApp.someController.title to a single
  object (removing any arrays) before applying it to the "value" property of
  your object.

  You can also chain helper methods to build custom bindings like so:

        valueBinding: SC.Binding.single("MyApp.someController.title").notEmpty("(EMPTY)")

  This will force the value of MyApp.someController.title to be a single value
  and then check to see if the value is "empty" (null, undefined, empty array,
  or an empty string).  If it is empty, the value will be set to the string
  "(EMPTY)".

  One Way Bindings
  ===

  One especially useful binding customization you can use is the oneWay()
  helper.  This helper tells SproutCore that you are only interested in
  receiving changes on the object you are binding from.  For example, if you
  are binding to a preference and you want to be notified if the preference
  has changed, but your object will not be changing the preference itself, you
  could do:

        bigTitlesBinding: SC.Binding.oneWay("MyApp.preferencesController.bigTitles")

  This way if the value of MyApp.preferencesController.bigTitles changes the
  "bigTitles" property of your object will change also.  However, if you
  change the value of your "bigTitles" property, it will not update the
  preferencesController.

  One way bindings are almost twice as fast to setup and twice as fast to
  execute because the binding only has to worry about changes to one side.

  You should consider using one way bindings anytime you have an object that
  may be created frequently and you do not intend to change a property; only
  to monitor it for changes. (such as in the example above).

  Adding Custom Transforms
  ===

  In addition to using the standard helpers provided by SproutCore, you can
  also defined your own custom transform functions which will be used to
  convert the value.  To do this, just define your transform function and add
  it to the binding with the transform() helper.  The following example will
  not allow Integers less than ten.  Note that it checks the value of the
  bindings and allows all other values to pass:

        valueBinding: SC.Binding.transform(function(value, binding) {
          return ((SC.typeOf(value) === SC.T_NUMBER) && (value < 10)) ? 10 : value;
        }).from("MyApp.someController.value")

  If you would like to instead use this transform on a number of bindings,
  you can also optionally add your own helper method to SC.Binding.  This
  method should simply return the value of this.transform(). The example
  below adds a new helper called notLessThan() which will limit the value to
  be not less than the passed minimum:

      SC.Binding.notLessThan = function(minValue) {
        return this.transform(function(value, binding) {
          return ((SC.typeOf(value) === SC.T_NUMBER) && (value < minValue)) ? minValue : value ;
        }) ;
      } ;

  You could specify this in your core.js file, for example.  Then anywhere in
  your application you can use it to define bindings like so:

        valueBinding: SC.Binding.from("MyApp.someController.value").notLessThan(10)

  Also, remember that helpers are chained so you can use your helper along with
  any other helpers.  The example below will create a one way binding that
  does not allow empty values or values less than 10:

        valueBinding: SC.Binding.oneWay("MyApp.someController.value").notEmpty().notLessThan(10)

  Note that the built in helper methods all allow you to pass a "from"
  property path so you don't have to use the from() helper to set the path.
  You can do the same thing with your own helper methods if you like, but it
  is not required.

  Creating Custom Binding Templates
  ===

  Another way you can customize bindings is to create a binding template.  A
  template is simply a binding that is already partially or completely
  configured.  You can specify this template anywhere in your app and then use
  it instead of designating your own custom bindings.  This is a bit faster on
  app startup but it is mostly useful in making your code less verbose.

  For example, let's say you will be frequently creating one way, not empty
  bindings that allow values greater than 10 throughout your app.  You could
  create a binding template in your core.js like this:

        MyApp.LimitBinding = SC.Binding.oneWay().notEmpty().notLessThan(10);

  Then anywhere you want to use this binding, just refer to the template like
  so:

        valueBinding: MyApp.LimitBinding.beget("MyApp.someController.value")

  Note that when you use binding templates, it is very important that you
  always start by using beget() to extend the template.  If you do not do
  this, you will end up using the same binding instance throughout your app
  which will lead to erratic behavior.

  How to Manually Activate a Binding
  ===

  All of the examples above show you how to configure a custom binding, but
  the result of these customizations will be a binding template, not a fully
  active binding.  The binding will actually become active only when you
  instantiate the object the binding belongs to.  It is useful however, to
  understand what actually happens when the binding is activated.

  For a binding to function it must have at least a "from" property and a "to"
  property.  The from property path points to the object/key that you want to
  bind from while the to path points to the object/key you want to bind to.

  When you define a custom binding, you are usually describing the property
  you want to bind from (such as "MyApp.someController.value" in the examples
  above).  When your object is created, it will automatically assign the value
  you want to bind "to" based on the name of your binding key.  In the
  examples above, during init, SproutCore objects will effectively call
  something like this on your binding:

        binding = this.valueBinding.beget().to("value", this) ;

  This creates a new binding instance based on the template you provide, and
  sets the to path to the "value" property of the new object.  Now that the
  binding is fully configured with a "from" and a "to", it simply needs to be
  connected to become active.  This is done through the connect() method:

        binding.connect() ;

  Now that the binding is connected, it will observe both the from and to side
  and relay changes.

  If you ever needed to do so (you almost never will, but it is useful to
  understand this anyway), you could manually create an active binding by
  doing the following:

        SC.Binding.from("MyApp.someController.value")
         .to("MyApp.anotherObject.value")
         .connect();

  You could also use the bind() helper method provided by SC.Object. (This is
  the same method used by SC.Object.init() to setup your bindings):

        MyApp.anotherObject.bind("value", "MyApp.someController.value") ;

  Both of these code fragments have the same effect as doing the most friendly
  form of binding creation like so:


        MyApp.anotherObject = SC.Object.create({
          valueBinding: "MyApp.someController.value",

          // OTHER CODE FOR THIS OBJECT...

        }) ;

  SproutCore's built in binding creation method make it easy to automatically
  create bindings for you.  You should always use the highest-level APIs
  available, even if you understand how to it works underneath.

  @since SproutCore 1.0
*/
SC.Binding = /** @scope SC.Binding.prototype */{

  /**
    This is the core method you use to create a new binding instance.  The
    binding instance will have the receiver instance as its parent which means
    any configuration you have there will be inherited.

    The returned instance will also have its parentBinding property set to the
    receiver.

    @param {String} [fromPath]
    @returns {SC.Binding} new binding instance
  */
  beget: function(fromPath) {
    var ret = SC.beget(this) ;
    ret.parentBinding = this;
    if (fromPath !== undefined) ret = ret.from(fromPath) ;
    return ret ;
  },

  /**
    Returns a builder function for compatibility.
  */
  builder: function() {
    var binding = this,
        ret = function(fromProperty) { return binding.beget().from(fromProperty); };
    ret.beget = function() { return binding.beget(); } ;
    return ret ;
  },

  /**
    This will set "from" property path to the specified value.  It will not
    attempt to resolve this property path to an actual object/property tuple
    until you connect the binding.

    The binding will search for the property path starting at the root level
    unless you specify an alternate root object as the second paramter to this
    method.  Alternatively, you can begin your property path with either "." or
    "*", which will use the root object of the to side be default.  This special
    behavior is used to support the high-level API provided by SC.Object.

    @param {String|Tuple} propertyPath A property path or tuple
    @param {Object} [root] root object to use when resolving the path.
    @returns {SC.Binding} this
  */
  from: function(propertyPath, root) {

    // if the propertyPath is null/undefined, return this.  This allows the
    // method to be called from other methods when the fromPath might be
    // optional. (cf single(), multiple())
    if (!propertyPath) return this ;

    // beget if needed.
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._fromPropertyPath = propertyPath ;
    binding._fromRoot = root ;
    binding._fromTuple = null ;
    return binding ;
  },

  /**
   This will set the "to" property path to the specified value.  It will not
   attempt to reoslve this property path to an actual object/property tuple
   until you connect the binding.

    @param {String|Tuple} propertyPath A property path or tuple
    @param {Object} [root] root object to use when resolving the path.
    @returns {SC.Binding} this
  */
  to: function(propertyPath, root) {
    // beget if needed.
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._toPropertyPath = propertyPath ;
    binding._toRoot = root ;
    binding._toTuple = null ; // clear out any existing one.
    return binding ;
  },

  /**
    Attempts to connect this binding instance so that it can receive and relay
    changes.  This method will raise an exception if you have not set the
    from/to properties yet.

    @returns {SC.Binding} this
  */
  connect: function() {
    // If the binding is already connected, do nothing.
    if (this.isConnected) return this ;
    this.isConnected = YES ;
    this._connectionPending = YES ; // its connected but not really...
    this._syncOnConnect = YES ;

    SC.Binding._connectQueue.add(this) ;

    if (!SC.RunLoop.isRunLoopInProgress()) {
      this._scheduleSync();
    }

    return this;
  },

  /** @private
    Actually connects the binding.  This is done at the end of the runloop
    to give you time to setup your entire object graph before the bindings
    try to activate.
  */
  _connect: function() {
    if (!this._connectionPending) return; //nothing to do
    this._connectionPending = NO ;

    var path, root,
        bench = SC.BENCHMARK_BINDING_SETUP;

    if (bench) SC.Benchmark.start("SC.Binding.connect()");

    // try to connect the from side.
    // as a special behavior, if the from property path begins with either a
    // . or * and the fromRoot is null, use the toRoot instead.  This allows
    // for support for the SC.Object shorthand:
    //
    // contentBinding: "*owner.value"
    //
    path = this._fromPropertyPath; root = this._fromRoot ;

    if (typeof path === "string") {

      // if the first character is a '.', this is a static path.  make the
      // toRoot the default root.
      if (path.indexOf('.') === 0) {
        path = path.slice(1);
        if (!root) root = this._toRoot ;

      // if the first character is a '*', then setup a tuple since this is a
      // chained path.
      } else if (path.indexOf('*') === 0) {
        path = [this._fromRoot || this._toRoot, path.slice(1)] ;
        root = null ;
      }
    }
    this._fromObserverData = [path, this, this.fromPropertyDidChange, root];
    SC.Observers.addObserver.apply(SC.Observers, this._fromObserverData);

    // try to connect the to side
    if (!this._oneWay) {
      path = this._toPropertyPath; root = this._toRoot ;
      this._toObserverData = [path, this, this.toPropertyDidChange, root];
      SC.Observers.addObserver.apply(SC.Observers, this._toObserverData);
    }

    if (bench) SC.Benchmark.end("SC.Binding.connect()");

    // now try to sync if needed
    if (this._syncOnConnect) {
      this._syncOnConnect = NO ;
      if (bench) SC.Benchmark.start("SC.Binding.connect().sync");
      this.sync();
      if (bench) SC.Benchmark.end("SC.Binding.connect().sync");
    }
  },

  /**
    Disconnects the binding instance.  Changes will no longer be relayed.  You
    will not usually need to call this method.

    @returns {SC.Binding} this
  */
  disconnect: function() {
    if (!this.isConnected) return this; // nothing to do.

    // if connection is still pending, just cancel
    if (this._connectionPending) {
      this._connectionPending = NO ;

    // connection is completed, disconnect.
    } else {
      SC.Observers.removeObserver.apply(SC.Observers, this._fromObserverData);
      if (!this._oneWay) {
        SC.Observers.removeObserver.apply(SC.Observers, this._toObserverData);
      }
    }

    this.isConnected = NO ;
    return this ;
  },

  /**
    Invoked whenever the value of the "from" property changes.  This will mark
    the binding as dirty if the value has changed.
    
    @param {Object} target The object that contains the key
    @param {String} key The name of the property which changed
  */
  fromPropertyDidChange: function(target, key) {
    var v = target ? target.get(key) : null;

    //console.log("fromPropertyDidChange: %@ v = %@".fmt(this, v)) ;

    // if the new value is different from the current binding value, then
    // schedule to register an update.
    if (v !== this._bindingValue || key === '[]') {

      this._setBindingValue(target, key) ;
      this._changePending = YES ;
      SC.Binding._changeQueue.add(this) ; // save for later.

      this._scheduleSync();
    }
  },

  /**
    Invoked whenever the value of the "to" property changes.  This will mark the
    binding as dirty only if:

    - the binding is not one way
    - the value does not match the stored transformedBindingValue

    if the value does not match the transformedBindingValue, then it will
    become the new bindingValue.
    
    @param {Object} target The object that contains the key
    @param {String} key The name of the property which changed
  */
  toPropertyDidChange: function(target, key) {
    if (this._oneWay) return; // nothing to do

    var v = target.get(key) ;

    // if the new value is different from the current binding value, then
    // schedule to register an update.
    if (v !== this._transformedBindingValue) {
      this._setBindingValue(target, key) ;
      this._changePending = YES ;
      SC.Binding._changeQueue.add(this) ; // save for later.

      this._scheduleSync();
    }
  },

  _scheduleSync: function() {
    if (SC.RunLoop.isRunLoopInProgress() || this._syncScheduled) { return; }

    this._syncScheduled = YES;
    var self = this;

    setTimeout(function() { SC.run(); self._syncScheduled = NO; }, 1);
  },

  /** @private
    Saves the source location for the binding value.  This will be used later
    to actually update the binding value.
  */
  _setBindingValue: function(source, key) {
    this._bindingSource = source;
    this._bindingKey    = key;
  },

  /** @private
    Updates the binding value from the current binding source if needed.  This
    should be called just before using this._bindingValue.
  */
  _computeBindingValue: function() {
    var source = this._bindingSource,
        key    = this._bindingKey,
        v, idx;

    this._bindingValue = v = (source ? source.getPath(key) : null);

    // apply any transforms to get the to property value also
    var transforms = this._transforms;
    if (transforms) {
      var len = transforms.length,
          transform;
      for(idx=0;idx<len;idx++) {
        transform = transforms[idx] ;
        v = transform(v, this) ;
      }
    }

    // if error objects are not allowed, and the value is an error, then
    // change it to null.
    if (this._noError && SC.typeOf(v) === SC.T_ERROR) v = null ;

    this._transformedBindingValue = v;
  },

  _connectQueue: SC.CoreSet.create(),
  _alternateConnectQueue: SC.CoreSet.create(),
  _changeQueue: SC.CoreSet.create(),
  _alternateChangeQueue: SC.CoreSet.create(),
  _changePending: NO,

  /**
    Call this method on SC.Binding to flush all bindings with changed pending.

    @returns {Boolean} YES if changes were flushed.
  */
  flushPendingChanges: function() {

    // don't allow flushing more than one at a time
    if (this._isFlushing) return NO;
    this._isFlushing = YES ;
    SC.Observers.suspendPropertyObserving();

    var didFlush = NO,
        log = SC.LOG_BINDINGS,
        // connect any bindings
        queue, binding ;
    while((queue = this._connectQueue).length >0) {
      this._connectQueue = this._alternateConnectQueue ;
      this._alternateConnectQueue = queue ;
      while(binding = queue.pop()) binding._connect() ;
    }

    // loop through the changed queue...
    while ((queue = this._changeQueue).length > 0) {
      if (log) SC.Logger.log("Begin: Trigger changed bindings") ;

      didFlush = YES ;

      // first, swap the change queues.  This way any binding changes that
      // happen while we flush the current queue can be queued up.
      this._changeQueue = this._alternateChangeQueue ;
      this._alternateChangeQueue = queue ;

      // next, apply any bindings in the current queue.  This may cause
      // additional bindings to trigger, which will end up in the new active
      // queue.
      while(binding = queue.pop()) binding.applyBindingValue() ;

      // now loop back and see if there are additional changes pending in the
      // active queue.  Repeat this until all bindings that need to trigger
      // have triggered.
      if (log) SC.Logger.log("End: Trigger changed bindings") ;
    }

    // clean up
    this._isFlushing = NO ;
    SC.Observers.resumePropertyObserving();

    return didFlush ;
  },

  /**
    This method is called at the end of the Run Loop to relay the changed
    binding value from one side to the other.
  */
  applyBindingValue: function() {
    this._changePending = NO ;

    // compute the binding targets if needed.
    this._computeBindingTargets() ;
    this._computeBindingValue();

    var v = this._bindingValue,
        tv = this._transformedBindingValue,
        bench = SC.BENCHMARK_BINDING_NOTIFICATIONS,
        log = SC.LOG_BINDINGS ;

    // the from property value will always be the binding value, update if
    // needed.
    if (!this._oneWay && this._fromTarget) {
      if (log) SC.Logger.log("%@: %@ -> %@".fmt(this, v, tv)) ;
      if (bench) SC.Benchmark.start(this.toString() + "->") ;
      this._fromTarget.setPathIfChanged(this._fromPropertyKey, v) ;
      if (bench) SC.Benchmark.end(this.toString() + "->") ;
    }

    // update the to value with the transformed value if needed.
    if (this._toTarget) {
      if (log) SC.Logger.log("%@: %@ <- %@".fmt(this, v, tv)) ;
      if (bench) SC.Benchmark.start(this.toString() + "<-") ;
      this._toTarget.setPathIfChanged(this._toPropertyKey, tv) ;
      if (bench) SC.Benchmark.start(this.toString() + "<-") ;
    }
  },

  /**
    Calling this method on a binding will cause it to check the value of the
    from side of the binding matches the current expected value of the
    binding. If not, it will relay the change as if the from side's value has
    just changed.

    This method is useful when you are dynamically connecting bindings to a
    network of objects that may have already been initialized.
  */
  sync: function() {

    // do nothing if not connected
    if (!this.isConnected) return this;

    // connection is pending, just note that we should sync also
    if (this._connectionPending) {
      this._syncOnConnect = YES ;

    // we are connected, go ahead and sync
    } else {
      this._computeBindingTargets() ;
      var target = this._fromTarget,
          key = this._fromPropertyKey ;
      if (!target || !key) return this ; // nothing to do

      // in debug, let's check for whether target is a valid observable with getPath.
      // Common cases might have it be a Window or a DOM object.
      //
      // If we have a target, it is ready, but if it is invalid, that is WRONG.
      //
      
      if (!target.isObservable) {
        SC.Logger.warn("Cannot bind '%@' to property '%@' on non-observable '%@'".fmt(this._toPropertyPath, key, target));
        return this;
      }
      

      // get the new value
      var v = target.getPath(key) ;

      // if the new value is different from the current binding value, then
      // schedule to register an update.
      if (v !== this._bindingValue || key === '[]') {
        this._setBindingValue(target, key) ;
        this._changePending = YES ;
        SC.Binding._changeQueue.add(this) ; // save for later.
      }
    }

    return this ;
  },

  // set if you call sync() when the binding connection is still pending.
  _syncOnConnect: NO,

  _computeBindingTargets: function() {
    if (!this._fromTarget) {

      var path, root, tuple ;

      // if the fromPropertyPath begins with a . or * then we may use the
      // toRoot as the root object.  Similar code exists in connect() so if
      // you make a change to one be sure to update the other.
      path = this._fromPropertyPath; root = this._fromRoot ;
      if (typeof path === "string") {

        // static path beginning with the toRoot
        if (path.indexOf('.') === 0) {
          path = path.slice(1) ; // remove the .
          if (!root) root = this._toRoot; // use the toRoot optionally

        // chained path beginning with toRoot.  Setup a tuple
        } else if (path.indexOf('*') === 0) {
          path = [root || this._toRoot, path.slice(1)];
          root = null ;
        }
      }

      tuple = SC.tupleForPropertyPath(path, root) ;
      if (tuple) {
        this._fromTarget = tuple[0]; this._fromPropertyKey = tuple[1] ;
      }
    }

    if (!this._toTarget) {
      path = this._toPropertyPath; root = this._toRoot ;
      tuple = SC.tupleForPropertyPath(path, root) ;
      if (tuple) {
        this._toTarget = tuple[0]; this._toPropertyKey = tuple[1] ;
      }
    }
  },

  /**
    Configures the binding as one way.  A one-way binding will relay changes
    on the "from" side to the "to" side, but not the other way around.  This
    means that if you change the "to" side directly, the "from" side may have
    a different value.

    @param {String} [fromPath] from path to connect.
    @param {Boolean} [aFlag] Pass NO to set the binding back to two-way
    @returns {SC.Binding} this
  */
  oneWay: function(fromPath, aFlag) {

    // If fromPath is a bool but aFlag is undefined, swap.
    if ((aFlag === undefined) && (SC.typeOf(fromPath) === SC.T_BOOL)) {
      aFlag = fromPath; fromPath = null ;
    }

    // beget if needed.
    var binding = this.from(fromPath) ;
    if (binding === SC.Binding) binding = binding.beget() ;
    binding._oneWay = (aFlag === undefined) ? YES : aFlag ;
    return binding ;
  },

  /**
    Adds the specified transform function to the array of transform functions.

    The function you pass must have the following signature:

          function(value) {} ;

    It must return either the transformed value or an error object.

    Transform functions are chained, so they are called in order.  If you are
    extending a binding and want to reset the transforms, you can call
    resetTransform() first.

    @param {Function} transformFunc the transform function.
    @returns {SC.Binding} this
  */
  transform: function(transformFunc) {
    var binding = (this === SC.Binding) ? this.beget() : this ;
    var t = binding._transforms ;

    // clone the transform array if this comes from the parent
    if (t && (t === binding.parentBinding._transform)) {
      t = binding._transforms = t.slice() ;
    }

    // create the transform array if needed.
    if (!t) t = binding._transforms = [] ;

    // add the transform function
    t.push(transformFunc) ;
    return binding;
  },

  /**
    Resets the transforms for the binding.  After calling this method the
    binding will no longer transform values.  You can then add new transforms
    as needed.

    @returns {SC.Binding} this
  */
  resetTransforms: function() {
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._transforms = null ; return binding ;
  },

  /**
    Specifies that the binding should not return error objects.  If the value
    of a binding is an Error object, it will be transformed to a null value
    instead.

    Note that this is not a transform function since it will be called at the
    end of the transform chain.

    @param {String} [fromPath] from path to connect.
    @param {Boolean} [aFlag] Pass NO to allow error objects again.
    @returns {SC.Binding} this
  */
  noError: function(fromPath, aFlag) {
    // If fromPath is a bool but aFlag is undefined, swap.
    if ((aFlag === undefined) && (SC.typeOf(fromPath) === SC.T_BOOL)) {
      aFlag = fromPath; fromPath = null ;
    }

    // beget if needed.
    var binding = this.from(fromPath) ;
    if (binding === SC.Binding) binding = binding.beget() ;
    binding._noError = (aFlag === undefined) ? YES : aFlag ;
    return binding ;
  },

  /**
    Adds a transform to the chain that will allow only single values to pass.
    This will allow single values, nulls, and error values to pass through.  If
    you pass an array, it will be mapped as so:

          [] => null
          [a] => a
          [a,b,c] => Multiple Placeholder

    You can pass in an optional multiple placeholder or it will use the
    default.

    Note that this transform will only happen on forwarded valued.  Reverse
    values are send unchanged.

    @param {String} fromPath from path or null
    @param {Object} [placeholder] placeholder value.
    @returns {SC.Binding} this
  */
  single: function(fromPath, placeholder) {
    if (placeholder === undefined) {
      placeholder = SC.MULTIPLE_PLACEHOLDER ;
    }
    return this.from(fromPath).transform(function(value, isForward) {
      if (value && value.isEnumerable) {
        var len = value.get('length');
        value = (len>1) ? placeholder : (len<=0) ? null : value.firstObject();
      }
      return value ;
    }) ;
  },

  /**
    Adds a transform that will return the placeholder value if the value is
    null, undefined, an empty array or an empty string.  See also notNull().

    @param {String} fromPath from path or null
    @param {Object} [placeholder]
    @returns {SC.Binding} this
  */
  notEmpty: function(fromPath, placeholder) {
    if (placeholder === undefined) placeholder = SC.EMPTY_PLACEHOLDER ;
    return this.from(fromPath).transform(function(value, isForward) {
      if (SC.none(value) || (value === '') || (SC.isArray(value) && value.length === 0)) {
        value = placeholder ;
      }
      return value ;
    }) ;
  },

  /**
    Adds a transform that will return the placeholder value if the value is
    null or undefined.  Otherwise it will passthrough untouched.  See also notEmpty().

    @param {String} fromPath from path or null
    @param {Object} [placeholder]
    @returns {SC.Binding} this
  */
  notNull: function(fromPath, placeholder) {
    if (placeholder === undefined) placeholder = SC.EMPTY_PLACEHOLDER ;
    return this.from(fromPath).transform(function(value, isForward) {
      if (SC.none(value)) value = placeholder ;
      return value ;
    }) ;
  },

  /**
    Adds a transform that will convert the passed value to an array.  If
    the value is null or undefined, it will be converted to an empty array.

    @param {String} [fromPath]
    @returns {SC.Binding} this
  */
  multiple: function(fromPath) {
    return this.from(fromPath).transform(function(value) {
      if (!SC.isArray(value)) value = (value == null) ? [] : [value] ;
      return value ;
    }) ;
  },

  /**
    Adds a transform to convert the value to a bool value.  If the value is
    an array it will return YES if array is not empty.  If the value is a string
    it will return YES if the string is not empty.

    @param {String} [fromPath]
    @returns {SC.Binding} this
  */
  bool: function(fromPath) {
    return this.from(fromPath).transform(function(v) {
      var t = SC.typeOf(v) ;
      if (t === SC.T_ERROR) return v ;
      return (t == SC.T_ARRAY) ? (v.length > 0) : (v === '') ? NO : !!v ;
    }) ;
  },

  /**
    Adds a transform that forwards the logical 'AND' of values at 'pathA' and
    'pathB' whenever either source changes.  Note that the transform acts strictly
    as a one-way binding, working only in the direction

      'pathA' AND 'pathB' --> value  (value returned is the result of ('pathA' && 'pathB'))

    Usage example where a delete button's 'isEnabled' value is determined by whether
    something is selected in a list and whether the current user is allowed to delete:

      deleteButton: SC.ButtonView.design({
        isEnabledBinding: SC.Binding.and('MyApp.itemsController.hasSelection', 'MyApp.userController.canDelete')
      })

    @param {String} pathA The first part of the conditional
    @param {String} pathB The second part of the conditional
  */
  and: function(pathA, pathB) {

    // create an object to do the logical computation
    var gate = SC.Object.create({
      valueABinding: pathA,
      valueBBinding: pathB,

      and: function() {
        return (this.get('valueA') && this.get('valueB'));
      }.property('valueA', 'valueB').cacheable()
    });

    // add a transform that depends on the result of that computation.
    return this.from('and', gate).oneWay();
  },

  /**
    Adds a transform that forwards the 'OR' of values at 'pathA' and
    'pathB' whenever either source changes.  Note that the transform acts strictly
    as a one-way binding, working only in the direction

      'pathA' AND 'pathB' --> value  (value returned is the result of ('pathA' || 'pathB'))

    @param {String} pathA The first part of the conditional
    @param {String} pathB The second part of the conditional
  */
  or: function(pathA, pathB) {

    // create an object to the logical computation
    var gate = SC.Object.create({
      valueABinding: pathA,
      valueBBinding: pathB,

      or: function() {
        return (this.get('valueA') || this.get('valueB'));
      }.property('valueA', 'valueB').cacheable()
    });

    return this.from('or', gate).oneWay();
  },

  /**
    Adds a transform to convert the value to the inverse of a bool value.  This
    uses the same transform as bool() but inverts it.

    @param {String} [fromPath]
    @returns {SC.Binding} this
  */
  not: function(fromPath) {
    return this.from(fromPath).transform(function(v) {
      var t = SC.typeOf(v) ;
      if (t === SC.T_ERROR) return v ;
      return !((t == SC.T_ARRAY) ? (v.length > 0) : (v === '') ? NO : !!v) ;
    }) ;
  },

  /**
    Adds a transform that will return YES if the value is null or undefined, NO otherwise.
    
    @param {String} [fromPath]
    @returns {SC.Binding} this
  */
  isNull: function(fromPath) {
    return this.from(fromPath).transform(function(v) {
      var t = SC.typeOf(v) ;
      return (t === SC.T_ERROR) ? v : SC.none(v) ;
    });
  },

  toString: function() {
    var from = this._fromRoot ? "<%@>:%@".fmt(this._fromRoot,this._fromPropertyPath) : this._fromPropertyPath;

    var to = this._toRoot ? "<%@>:%@".fmt(this._toRoot,this._toPropertyPath) : this._toPropertyPath;

    var oneWay = this._oneWay ? '[oneWay]' : '';
    return "SC.Binding%@(%@ -> %@)%@".fmt(SC.guidFor(this), from, to, oneWay);
  }
} ;

/**
  Shorthand method to define a binding.  This is the same as calling:

        SC.binding(path) = SC.Binding.from(path)
*/
SC.binding = function(path, root) { return SC.Binding.from(path,root); } ;


/* >>>>>>>>>> BEGIN source/system/error.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// @global SC

sc_require('ext/function');

/**
  @class

  An error, used to represent an error state.

  Many API's within SproutCore will return an instance of this object whenever
  they have an error occur.  An error includes an error code, description,
  and optional human readable label that indicates the item that failed.

  Depending on the error, other properties may also be added to the object
  to help you recover from the failure.

  You can pass error objects to various UI elements to display the error in
  the interface. You can easily determine if the value returned by some API is
  an error or not using the helper SC.ok(value).

  Faking Error Objects
  ---

  You can actually make any object you want to be treated like an Error object
  by simply implementing two properties: isError and errorValue.  If you
  set isError to YES, then calling SC.ok(obj) on your object will return NO.
  If isError is YES, then SC.val(obj) will return your errorValue property
  instead of the receiver.
  
  When using SC.typeOf(obj), SC.T_ERROR will only be returned if the obj
  is an instance of SC.Error

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Error = SC.Object.extend(
/** @scope SC.Error.prototype */ {

  /**
    error code.  Used to designate the error type.

    @type Number
  */
  code: -1,

  /**
    Human readable description of the error.  This can also be a non-localized
    key.

    @type String
  */
  message: '',

  /**
    The value the error represents.  This is used when wrapping a value inside
    of an error to represent the validation failure.

    @type Object
  */
  errorValue: null,

  /**
    The original error object.  Normally this will return the receiver.
    However, sometimes another object will masquarade as an error; this gives
    you a way to get at the underyling error.

    @type SC.Error
  */
  errorObject: function() {
    return this;
  }.property().cacheable(),

  /**
    Human readable name of the item with the error.

    @type String
  */
  label: null,

  /** @private */
  toString: function() {
    return "SC.Error:%@:%@ (%@)".fmt(SC.guidFor(this), this.get('message'), this.get('code'));
  },

  /**
    Walk like a duck.

    @type Boolean
  */
  isError: YES
}) ;

/**
  Creates a new SC.Error instance with the passed description, label, and
  code.  All parameters are optional.

  @param description {String} human readable description of the error
  @param label {String} human readable name of the item with the error
  @param code {Number} an error code to use for testing.
  @returns {SC.Error} new error instance.
*/
SC.Error.desc = function(description, label, value, code) {
  var opts = { message: description } ;
  if (label !== undefined) opts.label = label ;
  if (code !== undefined) opts.code = code ;
  if (value !== undefined) opts.errorValue = value ;
  return this.create(opts) ;
} ;

/**
  Shorthand form of the SC.Error.desc method.

  @param description {String} human readable description of the error
  @param label {String} human readable name of the item with the error
  @param code {Number} an error code to use for testing.
  @returns {SC.Error} new error instance.
*/

SC.$error = function(description, label, value, c) {  
  return SC.Error.desc(description,label, value, c);
} ;

/**
  Returns NO if the passed value is an error object or false.

  @param {Object} ret object value
  @returns {Boolean}
*/
SC.ok = function(ret) {
  return (ret !== false) && !(ret && ret.isError);
};

/** @private */
SC.$ok = SC.ok;

/**
  Returns the value of an object.  If the passed object is an error, returns
  the value associated with the error; otherwise returns the receiver itself.

  @param {Object} obj the object
  @returns {Object} value
*/
SC.val = function(obj) {
  if (obj && obj.isError) {
    return obj.get ? obj.get('errorValue') : null ; // Error has no value
  } else return obj ;
};

/** @private */
SC.$val = SC.val;

// STANDARD ERROR OBJECTS

/**
  Standard error code for errors that do not support multiple values.

  @type Number
*/
SC.Error.HAS_MULTIPLE_VALUES = -100 ;

/* >>>>>>>>>> BEGIN source/system/index_set.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/enumerable') ;
sc_require('mixins/observable') ;
sc_require('mixins/freezable');
sc_require('mixins/copyable');

/**
  @class

  A collection of ranges.  You can use an IndexSet to keep track of non-
  continuous ranges of items in a parent array.  IndexSet's are used for
  selection, for managing invalidation ranges and other data-propogation.

  Examples
  ---

        var set = SC.IndexSet.create(ranges) ;
        set.contains(index);
        set.add(index, length);
        set.remove(index, length);

        // uses a backing SC.Array object to return each index
        set.forEach(function(object) { .. })

        // returns ranges
        set.forEachRange(function(start, length) { .. });

  Implementation Notes
  ---

  An IndexSet stores indices on the object.  A positive value great than the
  index tells you the end of an occupied range.  A negative values tells you
  the end of an empty range.  A value less than the index is a search
  accelerator.  It tells you the start of the nearest range.

  @extends SC.Enumerable
  @extends SC.Observable
  @extends SC.Copyable
  @extends SC.Freezable
  @since SproutCore 1.0
*/
SC.IndexSet = SC.mixin({},
  SC.Enumerable, SC.Observable, SC.Freezable, SC.Copyable,
/** @scope SC.IndexSet.prototype */ {

  /** @private
    Walks a content array and copies its contents to a new array.  For large
    content arrays this is faster than using slice()
  */
  _sc_sliceContent: function(c) {
    if (c.length < 1000) return c.slice(); // use native when faster
    var cur = 0, ret = [], next = c[0];
    while(next !== 0) {
      ret[cur] = next ;
      cur = (next<0) ? (0-next) : next ;
      next = c[cur];
    }
    ret[cur] = 0;
    this._hint(0, cur, ret); // hints are not copied manually - add them
    return ret ;
  },

  /**
    To create a set, pass either a start and index or another IndexSet.

    @param {Number} start
    @param {Number} length
    @returns {SC.IndexSet}
  */
  create: function(start, length) {
    var ret = SC.beget(this);
    ret.initObservable();
    ret.registerDependentKey('min', '[]');

    // optimized method to clone an index set.
    if (start && start.isIndexSet) {
      ret._content = this._sc_sliceContent(start._content);
      ret.max = start.max;
      ret.length = start.length;
      ret.source = start.source ;

    // otherwise just do a regular add
    } else {
      ret._content = [0];
      if (start !== undefined) ret.add(start, length);
    }
    return ret ;
  },

  /**
    Walk like a duck.

    @type Boolean
  */
  isIndexSet: YES,

  /**  @private
    Internal setting determines the preferred skip size for hinting sets.

    @type Number
  */
  HINT_SIZE: 256,

  /**
    Total number of indexes contained in the set

    @type Number
  */
  length: 0,

  /**
    One greater than the largest index currently stored in the set.  This
    is sometimes useful when determining the total range of items covering
    the index set.

    @type Number
  */
  max: 0,

  /**
    The first index included in the set or -1.

    @type Number
  */
  min: function() {
    var content = this._content,
        cur = content[0];
    return (cur === 0) ? -1 : (cur>0) ? 0 : Math.abs(cur);

  }.property('[]').cacheable(),

  /**
    Returns the first index in the set .

    @type Number
  */
  firstObject: function() {
    return (this.get('length')>0) ? this.get('min') : undefined;
  }.property(),

  /**
    Returns the starting index of the nearest range for the specified
    index.

    @param {Number} index
    @returns {Number} starting index
  */
  rangeStartForIndex: function(index) {
    var content = this._content,
        max     = this.get('max'),
        ret, next, accel;

    // fast cases
    if (index >= max) return max ;
    if (Math.abs(content[index]) > index) return index ; // we hit a border

    // use accelerator to find nearest content range
    accel = index - (index % SC.IndexSet.HINT_SIZE);
    ret = content[accel];
    if (ret<0 || ret>index) ret = accel;
    next = Math.abs(content[ret]);

    // now step forward through ranges until we find one that includes the
    // index.
    while (next < index) {
      ret = next ;
      next = Math.abs(content[ret]);
    }
    return ret ;
  },

  /**
    Returns YES if the passed index set contains the exact same indexes as
    the receiver.  If you pass any object other than an index set, returns NO.

    @param {Object} obj another object.
    @returns {Boolean}
  */
  isEqual: function(obj) {

    // optimize for some special cases
    if (obj === this) return YES ;
    if (!obj || !obj.isIndexSet || (obj.max !== this.max) || (obj.length !== this.length)) return NO;

    // ok, now we need to actually compare the ranges of the two.
    var lcontent = this._content,
        rcontent = obj._content,
        cur      = 0,
        next     = lcontent[cur];

    do {
      if (rcontent[cur] !== next) return NO ;
      cur = Math.abs(next) ;
      next = lcontent[cur];
    } while (cur !== 0);
    return YES ;
  },

  /**
    Returns the first index in the set before the passed index or null if
    there are no previous indexes in the set.

    @param {Number} index index to check
    @returns {Number} index or -1
  */
  indexBefore: function(index) {

    if (index===0) return -1; // fast path
    index--; // start with previous index

    var content = this._content,
        max     = this.get('max'),
        start   = this.rangeStartForIndex(index);
    if (!content) return null;

    // loop backwards until we find a range that is in the set.
    while((start===max) || (content[start]<0)) {
      if (start === 0) return -1 ; // nothing before; just quit
      index = start -1 ;
      start = this.rangeStartForIndex(index);
    }

    return index;
  },

  /**
    Returns the first index in the set after the passed index or null if
    there are no additional indexes in the set.

    @param {Number} index index to check
    @returns {Number} index or -1
  */
  indexAfter: function(index) {
    var content = this._content,
        max     = this.get('max'),
        start, next ;
    if (!content || (index>=max)) return -1; // fast path
    index++; // start with next index


    // loop forwards until we find a range that is in the set.
    start = this.rangeStartForIndex(index);
    next  = content[start];
    while(next<0) {
      if (next === 0) return -1 ; //nothing after; just quit
      index = start = Math.abs(next);
      next  = content[start];
    }

    return index;
  },

  /**
    Returns YES if the index set contains the named index

    @param {Number} start index or range
    @param {Number} length optional range length
    @returns {Boolean}
  */
  contains: function(start, length) {
    var content, cur, next, rstart, rnext;

    // normalize input
    if (length === undefined) {
      if (start === null || start === undefined) return NO ;

      if (typeof start === SC.T_NUMBER) {
        length = 1 ;

      // if passed an index set, check each receiver range
      } else if (start && start.isIndexSet) {
        if (start === this) return YES ; // optimization

        content = start._content ;
        cur = 0 ;
        next = content[cur];
        while (next !== 0) {
          if ((next>0) && !this.contains(cur, next-cur)) return NO ;
          cur = Math.abs(next);
          next = content[cur];
        }
        return YES ;

      } else {
        length = start.length;
        start = start.start;
      }
    }

    rstart = this.rangeStartForIndex(start);
    rnext  = this._content[rstart];

    return (rnext>0) && (rstart <= start) && (rnext >= (start+length));
  },

  /**
    Returns YES if the index set contains any of the passed indexes.  You
    can pass a single index, a range or an index set.

    @param {Number} start index, range, or IndexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  intersects: function(start, length) {
    var content, cur, next, lim;

    // normalize input
    if (length === undefined) {
      if (typeof start === SC.T_NUMBER) {
        length = 1 ;

      // if passed an index set, check each receiver range
      } else if (start && start.isIndexSet) {
        if (start === this) return YES ; // optimization

        content = start._content ;
        cur = 0 ;
        next = content[cur];
        while (next !== 0) {
          if ((next>0) && this.intersects(cur, next-cur)) return YES ;
          cur = Math.abs(next);
          next = content[cur];
        }
        return NO ;

      } else {
        length = start.length;
        start = start.start;
      }
    }

    cur     = this.rangeStartForIndex(start);
    content = this._content;
    next    = content[cur];
    lim     = start + length;
    while (cur < lim) {
      if (next === 0) return NO; // no match and at end!
      if ((next > 0) && (next > start)) return YES ; // found a match
      cur = Math.abs(next);
      next = content[cur];
    }
    return NO ; // no match
  },

  /**
    Returns a new IndexSet without the passed range or indexes.   This is a
    convenience over simply cloning and removing.  Does some optimizations.

    @param {Number} start index, range, or IndexSet
    @param {Number} length optional range length
    @returns {SC.IndexSet} new index set
  */
  without: function(start, length) {
    if (start === this) return SC.IndexSet.create(); // just need empty set
    return this.clone().remove(start, length);
  },

  /**
    Replace the index set's current content with the passed index set.  This
    is faster than clearing the index set adding the values again.

    @param {Number} start index, Range, or another IndexSet
    @param {Number} length optional length of range.
    @returns {SC.IndexSet} receiver
  */
  replace: function(start, length) {

    if (length === undefined) {
      if (typeof start === SC.T_NUMBER) {
        length = 1 ;
      } else if (start && start.isIndexSet) {
        this._content = this._sc_sliceContent(start._content);
        this.beginPropertyChanges()
          .set('max', start.max)
          .set('length', start.length)
          .set('source', start.source)
          .enumerableContentDidChange()
        .endPropertyChanges();
        return this ;

      } else {
        length = start.length;
        start  = start.start;
      }
    }

    var oldlen = this.length;
    this._content.length=1;
    this._content[0] = 0;
    this.length = this.max = 0 ; // reset without notifying since add()
    return this.add(start, length);
  },

  /**
    Adds the specified range of indexes to the set.  You can also pass another
    IndexSet to union the contents of the index set with the receiver.

    @param {Number} start index, Range, or another IndexSet
    @param {Number} length optional length of range.
    @returns {SC.IndexSet} receiver
  */
  add: function(start, length) {

    if (this.isFrozen) throw SC.FROZEN_ERROR;

    var content, cur, next;

    // normalize IndexSet input
    if (start && start.isIndexSet) {

      content = start._content;

      if (!content) return this; // nothing to do

      cur = 0 ;
      next = content[0];
      while(next !== 0) {
        if (next>0) this.add(cur, next-cur);
        cur = next<0 ? 0-next : next;
        next = content[cur];
      }
      return this ;

    } else if (length === undefined) {

      if (start === null || start === undefined) {
        return this; // nothing to do
      } else if (typeof start === SC.T_NUMBER) {
        length = 1 ;
      } else {
        length = start.length;
        start = start.start;
      }
    } else if (length === null) length = 1 ;

    // if no length - do nothing.
    if (length <= 0) return this;

    // special case - appending to end of set
    var max     = this.get('max'),
        oldmax  = max,
        delta, value ;

    content = this._content ;

    if (start === max) {

      // if adding to the end and the end is in set, merge.
      if (start > 0) {
        cur = this.rangeStartForIndex(start-1);
        next = content[cur];

        // just extend range at end
        if (next > 0) {
          delete content[max]; // no 0
          content[cur] = max = start + length ;
          start = cur ;

        // previous range was not in set, just tack onto the end
        } else {
          content[max] = max = start + length;
        }
      } else {
        content[start] = max = length;
      }

      content[max] = 0 ;
      this.set('max', max);
      this.set('length', this.length + length) ;
      length = max - start ;

    } else if (start > max) {
      content[max] = 0-start; // empty!
      content[start] = start+length ;
      content[start+length] = 0; // set end
      this.set('max', start + length) ;
      this.set('length', this.length + length) ;

      // affected range goes from starting range to end of content.
      length = start + length - max ;
      start = max ;

    // otherwise, merge into existing range
    } else {

      // find nearest starting range.  split or join that range
      cur   = this.rangeStartForIndex(start);
      next  = content[cur];
      max   = start + length ;
      delta = 0 ;

      // we are right on a boundary and we had a range or were the end, then
      // go back one more.
      if ((start>0) && (cur === start) && (next <= 0)) {
        cur = this.rangeStartForIndex(start-1);
        next = content[cur] ;
      }

      // previous range is not in set.  splice it here
      if (next < 0) {
        content[cur] = 0-start ;

        // if previous range extends beyond this range, splice afterwards also
        if (Math.abs(next) > max) {
          content[start] = 0-max;
          content[max] = next ;
        } else content[start] = next;

      // previous range is in set.  merge the ranges
      } else {
        start = cur ;
        if (next > max) {
          // delta -= next - max ;
          max = next ;
        }
      }

      // at this point there should be clean starting point for the range.
      // just walk the ranges, adding up the length delta and then removing
      // the range until we find a range that passes last
      cur = start;
      while (cur < max) {
        // get next boundary.  splice if needed - if value is 0, we are at end
        // just skip to last
        value = content[cur];
        if (value === 0) {
          content[max] = 0;
          next = max ;
          delta += max - cur ;
        } else {
          next  = Math.abs(value);
          if (next > max) {
            content[max] = value ;
            next = max ;
          }

          // ok, cur range is entirely inside top range.
          // add to delta if needed
          if (value < 0) delta += next - cur ;
        }

        delete content[cur] ; // and remove range
        cur = next;
      }

      // cur should always === last now.  if the following range is in set,
      // merge in also - don't adjust delta because these aren't new indexes
      if ((cur = content[max]) > 0) {
        delete content[max];
        max = cur ;
      }

      // finally set my own range.
      content[start] = max ;
      if (max > oldmax) this.set('max', max) ;

      // adjust length
      this.set('length', this.get('length') + delta);

      // compute hint range
      length = max - start ;
    }

    this._hint(start, length);
    if (delta !== 0) this.enumerableContentDidChange();
    return this;
  },

  /**
    Removes the specified range of indexes from the set

    @param {Number} start index, Range, or IndexSet
    @param {Number} length optional length of range.
    @returns {SC.IndexSet} receiver
  */
  remove: function(start, length) {

    if (this.isFrozen) throw SC.FROZEN_ERROR;

    // normalize input
    if (length === undefined) {
      if (start === null || start === undefined) {
        return this; // nothing to do

      } else if (typeof start === SC.T_NUMBER) {
        length = 1 ;

      // if passed an index set, just add each range in the index set.
      } else if (start.isIndexSet) {
        start.forEachRange(this.remove, this);
        return this;

      } else {
        length = start.length;
        start = start.start;
      }
    }

    if (length <= 0) return this; // nothing to do

    // special case - appending to end of set
    var max     = this.get('max'),
        oldmax  = max,
        content = this._content,
        cur, next, delta, value, last ;

    // if we're past the end, do nothing.
    if (start >= max) return this;

    // find nearest starting range.  split or join that range
    cur   = this.rangeStartForIndex(start);
    next  = content[cur];
    last  = start + length ;
    delta = 0 ;

    // we are right on a boundary and we had a range or were the end, then
    // go back one more.
    if ((start>0) && (cur === start) && (next > 0)) {
      cur = this.rangeStartForIndex(start-1);
      next = content[cur] ;
    }

    // previous range is in set.  splice it here
    if (next > 0) {
      content[cur] = start ;

      // if previous range extends beyond this range, splice afterwards also
      if (next > last) {
        content[start] = last;
        content[last] = next ;
      } else content[start] = next;

    // previous range is not in set.  merge the ranges
    } else {
      start = cur ;
      next  = Math.abs(next);
      if (next > last) {
        last = next ;
      }
    }

    // at this point there should be clean starting point for the range.
    // just walk the ranges, adding up the length delta and then removing
    // the range until we find a range that passes last
    cur = start;
    while (cur < last) {
      // get next boundary.  splice if needed - if value is 0, we are at end
      // just skip to last
      value = content[cur];
      if (value === 0) {
        content[last] = 0;
        next = last ;

      } else {
        next  = Math.abs(value);
        if (next > last) {
          content[last] = value ;
          next = last ;
        }

        // ok, cur range is entirely inside top range.
        // add to delta if needed
        if (value > 0) delta += next - cur ;
      }

      delete content[cur] ; // and remove range
      cur = next;
    }

    // cur should always === last now.  if the following range is not in set,
    // merge in also - don't adjust delta because these aren't new indexes
    if ((cur = content[last]) < 0) {
      delete content[last];
      last = Math.abs(cur) ;
    }

    // set my own range - if the next item is 0, then clear it.
    if (content[last] === 0) {
      delete content[last];
      content[start] = 0 ;
      this.set('max', start); //max has changed

    } else {
      content[start] = 0-last ;
    }

    // adjust length
    this.set('length', this.get('length') - delta);

    // compute hint range
    length = last - start ;

    this._hint(start, length);
    if (delta !== 0) this.enumerableContentDidChange();
    return this;
  },

  /** @private
    iterates through a named range, setting hints every HINT_SIZE indexes
    pointing to the nearest range start.  The passed range must start on a
    range boundary.  It can end anywhere.
  */
  _hint: function(start, length, content) {
    if (content === undefined) content = this._content;

    var skip    = SC.IndexSet.HINT_SIZE,
        next    = Math.abs(content[start]), // start of next range
        loc     = start - (start % skip) + skip, // next hint loc
        lim     = start + length ; // stop

    while (loc < lim) {
      // make sure we are in current rnage
      while ((next !== 0) && (next <= loc)) {
        start = next ;
        next  = Math.abs(content[start]) ;
      }

      // past end
      if (next === 0) {
        delete content[loc];

      // do not change if on actual boundary
      } else if (loc !== start) {
        content[loc] = start ;  // set hint
      }

      loc += skip;
    }
  },

  /**
    Clears the set
  */
  clear: function() {
    if (this.isFrozen) throw SC.FROZEN_ERROR;

    var oldlen = this.length;
    this._content.length=1;
    this._content[0] = 0;
    this.set('length', 0).set('max', 0);
    if (oldlen > 0) this.enumerableContentDidChange();
  },

  /**
    Add all the ranges in the passed array.

    @param {Enumerable} objects The list of ranges you want to add
  */
  addEach: function(objects) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;

    this.beginPropertyChanges();
    var idx = objects.get('length') ;
    if (objects.isSCArray) {
      while(--idx >= 0) this.add(objects.objectAt(idx)) ;
    } else if (objects.isEnumerable) {
      objects.forEach(function(idx) { this.add(idx); }, this);
    }
    this.endPropertyChanges();

    return this ;
  },

  /**
    Removes all the ranges in the passed array.

    @param {Object...} objects The list of objects you want to remove
  */
  removeEach: function(objects) {
    if (this.isFrozen) throw SC.FROZEN_ERROR;

    this.beginPropertyChanges();

    var idx = objects.get('length') ;
    if (objects.isSCArray) {
      while(--idx >= 0) this.remove(objects.objectAt(idx)) ;
    } else if (objects.isEnumerable) {
      objects.forEach(function(idx) { this.remove(idx); }, this);
    }

    this.endPropertyChanges();

    return this ;
  },

  /**
   Clones the set into a new set.
  */
  clone: function() {
    return SC.IndexSet.create(this);
  },

  /**
    Returns a string describing the internal range structure.  Useful for
    debugging.

    @returns {String}
  */
  inspect: function() {
    var content = this._content,
        len     = content.length,
        idx     = 0,
        ret     = [],
        item;

    for(idx=0;idx<len;idx++) {
      item = content[idx];
      if (item !== undefined) ret.push("%@:%@".fmt(idx,item));
    }
    return "SC.IndexSet<%@>".fmt(ret.join(' , '));
  },

  /**
    Invoke the callback, passing each occuppied range instead of each
    index.  This can be a more efficient way to iterate in some cases.  The
    callback should have the signature:

          callback(start, length, indexSet, source) { ... }

    If you pass a target as a second option, the callback will be called in
    the target context.

    @param {Function} callback The method to run on each iteration
    @param {Object} target the object to call the callback on
    @returns {SC.IndexSet} receiver
  */
  forEachRange: function(callback, target) {
    var content = this._content,
        cur     = 0,
        next    = content[cur],
        source  = this.source;

    if (target === undefined) target = null ;
    while (next !== 0) {
      if (next > 0) callback.call(target, cur, next - cur, this, source);
      cur  = Math.abs(next);
      next = content[cur];
    }

    return this ;
  },

  /**
    Invokes the callback for each index within the passed start/length range.
    Otherwise works just like regular forEach().

    @param {Number} start starting index
    @param {Number} length length of range
    @param {Function} callback
    @param {Object} target
    @returns {SC.IndexSet} receiver
  */
  forEachIn: function(start, length, callback, target) {
    var content = this._content,
        cur     = 0,
        idx     = 0,
        lim     = start + length,
        source  = this.source,
        next    = content[cur];

    if (target === undefined) target = null ;
    while (next !== 0) {
      if (cur < start) cur = start ; // skip forward
      while((cur < next) && (cur < lim)) {
        callback.call(target, cur++, idx++, this, source);
      }

      if (cur >= lim) {
        cur = next = 0 ;
      } else {
        cur  = Math.abs(next);
        next = content[cur];
      }
    }
    return this ;
  },

  /**
    Total number of indexes within the specified range.

    @param {Number|SC.IndexSet} start index, range object or IndexSet
    @param {Number} length optional range length
    @returns {Number} count of indexes
  */
  lengthIn: function(start, length) {

    var ret = 0 ;

    // normalize input
    if (length === undefined) {
      if (start === null || start === undefined) {
        return 0; // nothing to do

      } else if (typeof start === SC.T_NUMBER) {
        length = 1 ;

      // if passed an index set, just add each range in the index set.
      } else if (start.isIndexSet) {
        start.forEachRange(function(start, length) {
          ret += this.lengthIn(start, length);
        }, this);
        return ret;

      } else {
        length = start.length;
        start = start.start;
      }
    }

    // fast path
    if (this.get('length') === 0) return 0;

    var content = this._content,
        cur     = 0,
        next    = content[cur],
        lim     = start + length ;

    while (cur<lim && next !== 0) {
      if (next>0) {
        ret += (next>lim) ? lim-cur : next-cur;
      }
      cur  = Math.abs(next);
      next = content[cur];
    }

    return ret ;
  },

  // ..........................................................
  // OBJECT API
  //

  /**
    Optionally set the source property on an index set and then you can
    iterate over the actual object values referenced by the index set.  See
    indexOf(), lastIndexOf(), forEachObject(), addObject() and removeObject().
  */
  source: null,

  /**
    Returns the first index in the set that matches the passed object.  You
    must have a source property on the set for this to work.

    @param {Object} object the object to check
    @param {Number} startAt optional starting point
    @returns {Number} found index or -1 if not in set
  */
  indexOf: function(object, startAt) {
    var source  = this.source;
    if (!source) throw "%@.indexOf() requires source".fmt(this);

    var len     = source.get('length'),

        // start with the first index in the set
        content = this._content,
        cur     = content[0]<0 ? Math.abs(content[0]) : 0,
        idx ;

    while(cur>=0 && cur<len) {
      idx = source.indexOf(object, cur);
      if (idx<0) return -1 ; // not found in source
      if (this.contains(idx)) return idx; // found in source and in set.
      cur = idx+1;
    }

    return -1; // not found
  },

  /**
    Returns the last index in the set that matches the passed object.  You
    must have a source property on the set for this to work.

    @param {Object} object the object to check
    @param {Number} startAt optional starting point
    @returns {Number} found index or -1 if not in set
  */
  lastIndexOf: function(object, startAt) {
    var source  = this.source;
    if (!source) throw "%@.lastIndexOf() requires source".fmt(this);

    // start with the last index in the set
    var len     = source.get('length'),
        cur     = this.max-1,
        idx ;

    if (cur >= len) cur = len-1;
    while (cur>=0) {
      idx = source.lastIndexOf(object, cur);
      if (idx<0) return -1 ; // not found in source
      if (this.contains(idx)) return idx; // found in source and in set.
      cur = idx+1;
    }

    return -1; // not found
  },

  /**
    Iterates through the objects at each index location in the set.  You must
    have a source property on the set for this to work.  The callback you pass
    will be invoked for each object in the set with the following signature:

          function callback(object, index, source, indexSet) { ... }

    If you pass a target, it will be used when the callback is called.

    @param {Function} callback function to invoke.
    @param {Object} target optional content. otherwise uses window
    @returns {SC.IndexSet} receiver
  */
  forEachObject: function(callback, target) {
    var source  = this.source;
    if (!source) throw "%@.forEachObject() requires source".fmt(this);

    var content = this._content,
        cur     = 0,
        idx     = 0,
        next    = content[cur];

    if (target === undefined) target = null ;
    while (next !== 0) {

      while(cur < next) {
        callback.call(target, source.objectAt(cur), cur, source, this);
        cur++;
      }

      cur  = Math.abs(next);
      next = content[cur];
    }
    return this ;
  },

  /**
    Adds all indexes where the object appears to the set.  If firstOnly is
    passed, then it will find only the first index and add it.  If  you know
    the object only appears in the source array one time, firstOnly may make
    this method faster.

    Requires source to work.

    @param {Object} object the object to add
    @param {Boolean} firstOnly Set to true if you can assume that the first
       match is the only one
    @returns {SC.IndexSet} receiver
  */
  addObject: function(object, firstOnly) {
    var source  = this.source;
    if (!source) throw "%@.addObject() requires source".fmt(this);

    var len = source.get('length'),
        cur = 0, idx;

    while(cur>=0 && cur<len) {
      idx = source.indexOf(object, cur);
      if (idx >= 0) {
        this.add(idx);
        if (firstOnly) return this ;
        cur = idx++;
      } else return this ;
    }
    return this ;
  },

  /**
    Adds any indexes matching the passed objects.  If firstOnly is passed,
    then only finds the first index for each object.

    @param {SC.Enumerable} objects the objects to add
    @param {Boolean} firstOnly Set to true if you can assume that the first
       match is the only one
    @returns {SC.IndexSet} receiver
  */
  addObjects: function(objects, firstOnly) {
    objects.forEach(function(object) {
      this.addObject(object, firstOnly);
    }, this);
    return this;
  },

  /**
    Removes all indexes where the object appears to the set.  If firstOnly is
    passed, then it will find only the first index and add it.  If  you know
    the object only appears in the source array one time, firstOnly may make
    this method faster.

    Requires source to work.

    @param {Object} object the object to add
    @param {Boolean} firstOnly Set to true if you can assume that the first
       match is the only one
    @returns {SC.IndexSet} receiver
  */
  removeObject: function(object, firstOnly) {
    var source  = this.source;
    if (!source) throw "%@.removeObject() requires source".fmt(this);

    var len = source.get('length'),
        cur = 0, idx;

    while(cur>=0 && cur<len) {
      idx = source.indexOf(object, cur);
      if (idx >= 0) {
        this.remove(idx);
        if (firstOnly) return this ;
        cur = idx+1;
      } else return this ;
    }
    return this ;
  },

  /**
    Removes any indexes matching the passed objects.  If firstOnly is passed,
    then only finds the first index for each object.

    @param {SC.Enumerable} objects the objects to add
    @param {Boolean} firstOnly Set to true if you can assume that the first
       match is the only one
    @returns {SC.IndexSet} receiver
  */
  removeObjects: function(objects, firstOnly) {
    objects.forEach(function(object) {
      this.removeObject(object, firstOnly);
    }, this);
    return this;
  },


  // .......................................
  // PRIVATE
  //

  /**
    Usually observing notifications from IndexSet are not useful, so
    supress them by default.

    @type Boolean
  */
  LOG_OBSERVING: NO,

  /** @private - optimized call to forEach() */
  forEach: function(callback, target) {
    var content = this._content,
        cur     = 0,
        idx     = 0,
        source  = this.source,
        next    = content[cur];

    if (target === undefined) target = null ;
    while (next !== 0) {
      while(cur < next) {
        callback.call(target, cur++, idx++, this, source);
      }
      cur  = Math.abs(next);
      next = content[cur];
    }
    return this ;
  },

  /** @private - support iterators */
  nextObject: function(ignore, idx, context) {
    var content = this._content,
        next    = context.next,
        max     = this.get('max'); // next boundary

    // seed.
    if (idx === null) {
      idx = next = 0 ;

    } else if (idx >= max) {
      delete context.next; // cleanup context
      return null ; // nothing left to do

    } else idx++; // look on next index

    // look for next non-empty range if needed.
    if (idx === next) {
      do {
        idx = Math.abs(next);
        next = content[idx];
      } while(next < 0);
      context.next = next;
    }

    return idx;
  },

  toString: function() {
    var str = [];
    this.forEachRange(function(start, length) {
      str.push(length === 1 ? start : "%@..%@".fmt(start, start + length - 1));
    }, this);
    return "SC.IndexSet<%@>".fmt(str.join(',')) ;
  },

  max: 0

}) ;

SC.IndexSet.slice = SC.IndexSet.copy = SC.IndexSet.clone ;
SC.IndexSet.EMPTY = SC.IndexSet.create().freeze();

/* >>>>>>>>>> BEGIN source/system/json.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.json = {
  
  /**
    Encodes an object graph to a JSON output.  Beware that JSON cannot deal
    with circular references.  If you try to encode an object graph with
    references it could hang your browser.
    
    @param {Object} root object graph
    @returns {String} encode JSON
  */
  encode: function(root) {
    return JSON.stringify(root) ;
  },
  
  /**
    Decodes a JSON file in a safe way, returning the generated object graph.
  
    @param {String} encoded JSON
    @returns {Object} object graph or Error if there was a problem.
  */
  decode: function(root) {
    return JSON.parse(root) ;
  }

} ;

/*
    http://www.JSON.org/json2.js
    2010-03-20

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

/* >>>>>>>>>> BEGIN source/system/logger.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('ext/function');

// ..........................................................
// CONSTANTS
//

// Implementation note:  We use two spaces after four-letter prefixes and one
// after five-letter prefixes so things align in monospaced consoles.

/**
  If {@link SC.Logger.format} is true, this delimiter will be put between arguments.

  @property {String}
*/
SC.LOGGER_LOG_DELIMITER = ", ";

/**
  If {@link SC.Logger.error} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.

  @property {String}
*/
SC.LOGGER_LOG_ERROR = "ERROR: ";

/**
  If {@link SC.Logger.info} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.

  @property {String}
*/
SC.LOGGER_LOG_INFO = "INFO:  ";

/**
  If {@link SC.Logger.warn} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.

  @property {String}
*/
SC.LOGGER_LOG_WARN = "WARN:  ";

/**
  If {@link SC.Logger.debug} falls back onto {@link SC.Logger.log}, this will be
  prepended to the output.

  @property {String}
*/
SC.LOGGER_LOG_DEBUG = "DEBUG: ";

/**
  If {@link SC.Logger.group} falls back onto {@link SC.Logger.log}, this will
  be prepended to the output.

  @property {String}
*/
SC.LOGGER_LOG_GROUP_HEADER = "** %@";       // The variable is the group title

/**
  If the reporter does not support group(), then we’ll add our own indentation
  to our output.  This constant represents one level of indentation.

  @property {String}
*/
SC.LOGGER_LOG_GROUP_INDENTATION = "    ";

/**
  When reporting recorded log messages, the timestamp is included with this
  prefix.

  @property {String}
*/
SC.LOGGER_RECORDED_LOG_TIMESTAMP_PREFIX = "%@:  ";


SC.LOGGER_LEVEL_DEBUG = 'debug';
SC.LOGGER_LEVEL_INFO  = 'info';
SC.LOGGER_LEVEL_WARN  = 'warn';
SC.LOGGER_LEVEL_ERROR = 'error';
SC.LOGGER_LEVEL_NONE  = 'none';



/** @class

  Object to allow for safe logging actions, such as using the browser console.
  In addition to being output to the console, logs can be optionally recorded
  in memory, to be accessed by your application as appropriate.

  This class also adds in the concept of a “current log level”, which allows
  your application to potentially determine a subset of logging messages to
  output and/or record.  The order of levels is:

    -  debug        SC.LOGGER_LEVEL_DEBUG
    -  info         SC.LOGGER_LEVEL_INFO
    -  warn         SC.LOGGER_LEVEL_WARN
    -  error        SC.LOGGER_LEVEL_ERROR

  All messages at the level or “above” will be output/recorded.  So, for
  example, if you set the level to 'info', all 'info', 'warn', and 'error'
  messages will be output/recorded, but no 'debug' messages will be.  Also,
  there are two separate log levels:  one for output, and one for recording.
  You may wish to only output, say, 'warn' and above, but record everything
  from 'debug' on up.  (You can also limit the number log messages to record.)

  This mechanism allows your application to avoid needless output (which has a
  non-zero cost in many browsers) in the general case, but turning up the log
  level when necessary for debugging.  Note that there can still be a
  performance cost for preparing log messages (calling {@link String.fmt},
  etc.), so it’s still a good idea to be selective about what log messages are
  output even to 'debug', especially in hot code.

  Similarly, you should be aware that if you wish to log objects without
  stringification — using the {@link SC.Logger.debugWithoutFmt} variants — and
  you enable recording, the “recorded messages” array will hold onto a
  reference to the arguments, potentially increasing the amount of memory
  used.

  As a convenience, this class also adds some shorthand methods to SC:

    -  SC.debug()   ==>   SC.Logger.debug()
    -  SC.info()    ==>   SC.Logger.info()
    -  SC.warn()    ==>   SC.Logger.warn()
    -  SC.error()   ==>   SC.Logger.error()

  …although note that no shorthand versions exist for the less-common
  functions, such as defining groups.

  The FireFox plugin Firebug was used as a function reference. Please see
  [Firebug Logging Reference](http://getfirebug.com/logging.html)
  for further information.

  @author Colin Campbell
  @author Benedikt Böhm
  @author William Kakes
  @extends SC.Object
  @since SproutCore 1.0
  @see <a href="http://getfirebug.com/logging.html">Firebug Logging Reference</a>
*/
SC.Logger = SC.Object.create(
	/** @scope SC.Logger.prototype */{

  // ..........................................................
  // PROPERTIES
  //

  /**
    The current log level determining what is output to the reporter object
    (usually your browser’s console).  Valid values are:

      -  SC.LOGGER_LEVEL_DEBUG
      -  SC.LOGGER_LEVEL_INFO
      -  SC.LOGGER_LEVEL_WARN
      -  SC.LOGGER_LEVEL_ERROR
      -  SC.LOGGER_LEVEL_NONE

    If you do not specify this value, it will default to SC.LOGGER_LEVEL_DEBUG
    when running in development mode and SC.LOGGER_LEVEL_INFO when running in
    production mode.

    @property: {Constant}
  */
  logOutputLevel: null,        // If null, set appropriately during init()


  /**
    The current log level determining what is output to the reporter object
    (usually your browser’s console).  Valid values are the same as with
    'logOutputLevel':

      -  SC.LOGGER_LEVEL_DEBUG
      -  SC.LOGGER_LEVEL_INFO
      -  SC.LOGGER_LEVEL_WARN
      -  SC.LOGGER_LEVEL_ERROR
      -  SC.LOGGER_LEVEL_NONE

    If you do not specify this value, it will default to SC.LOGGER_LEVEL_NONE.

    @property: {Constant}
  */
  logRecordingLevel: SC.LOGGER_LEVEL_NONE,


  /**
    All recorded log messages.  You generally should not need to interact with
    this array, as most commonly-used functionality can be achieved via the
    {@link SC.Logger.outputRecordedLogMessages} and
    {@link SC.Logger.stringifyRecordedLogMessages} methods.

    This array will be lazily created when the first message is recorded.

    Format:

    For efficiency, each entry in the array is a simple hash rather than a
    full SC.Object instance.  Furthermore, to minimize memory usage, niceties
    like “type of entry: message” are avoided; if you need to parse this
    structure, you can determine which type of entry you’re looking at by
    checking for the 'message' and 'indentation' fields.
<pre>
    Log entry:
    {
      type:               {Constant}     (SC.LOGGER_LEVEL_DEBUG, etc.)
      message:            {String | Boolean}
      originalArguments:  {Arguments}    // optional
      timestamp:          {Date}
    }
    
    Group entry (either beginning or end of):
    {
      type:         {Constant}     SC.LOGGER_LEVEL_DEBUG, etc.
      indentation:  {Number}       The value is the new group indentation level
      beginGroup:   {Boolean}      Whether this entry is the beginning of a new group (as opposed to the end)
      title:        {String}       Optional for new groups, and never present for end-of-group
      timestamp:    {Date}
    }
</pre>

    @property {Array}
  */
  recordedLogMessages: null,


  /**
    If the recording level is set such that messages will be recorded, this is
    the maximum number of messages that will be saved in the
    'recordedLogMessages' array.  Any further recorded messages will push
    older messages out of the array, so the most recent messages will be
    saved.

    @property {Number}
  */
  recordedLogMessagesMaximumLength: 500,


  /**
    If the recording level is set such that messages will be recorded, this is
    the minimum number of messages that will be saved whenever the recordings
    are pruned.  (They are pruned whenever you hit the maximum length, as
    specified via the 'recordedLogMessagesMaximumLength' property.  This
    mechanism avoids thrashing the array for each log message once the
    maximum is reached.)  When pruning, the most recent messages will be saved.

    @property {Number}
  */
  recordedLogMessagesPruningMinimumLength: 100,


  /**
    Whether or not to enable debug logging.  This property exists for
    backwards compatibility with previous versions of SC.Logger.  In newer
    code, you should instead set the appropriate output/recording log levels.

    If this property is set to YES, it will set 'logOutputLevel' to
    SC.LOGGER_LEVEL_DEBUG.  Otherwise, it will have no effect.

    @deprecated Set the log level instead.
    @property: {Boolean}
  */
  debugEnabled: NO,


  /**
    Computed property that checks for the existence of the reporter object.

    @property {Boolean}
  */
  exists: function() {
    return !SC.none(this.get('reporter'));
  }.property('reporter').cacheable(),


  /**
    If console.log does not exist, SC.Logger will use window.alert instead
    when {@link SC.Logger.log} is invoked.

    Note that this property has no effect for messages initiated via the
    debug/info/warn/error methods, on the assumption that it is better to
    simply utilize the message recording mechanism than put up a bunch of
    alerts when there is no browser console.

    @property {Boolean}
  */
  fallBackOnAlert: NO,


  /**
    The reporter is the object which implements the actual logging functions.

    @default The browser’s console
    @property {Object}
  */
  reporter: console,




  // ..........................................................
  // METHODS
  //

  /**
    Logs a debug message to the console and potentially to the recorded
    array, provided the respective log levels are set appropriately.

    The first argument must be a string, and if there are any additional
    arguments, it is assumed to be a format string.  Thus, you can (and
    should) use it like:

        SC.Logger.debug("%@:  My debug message", this);       // good

    …and not:

        SC.Logger.debug("%@:  My debug message".fmt(this));        // bad

    The former method can be more efficient because if the log levels are set
    in such a way that the debug() invocation will be ignored, then the
    String.fmt() call will never actually be performed.

    @param {String}              A message or a format string
    @param {…}       (optional)  Other arguments to pass to String.fmt() when using a format string
  */
  debug: function(message, optionalFormatArgs) {
    // Implementation note:  To avoid having to put the SC.debug() shorthand
    // variant inside a function wrapper, we'll avoid 'this'.
    SC.Logger._handleMessage(SC.LOGGER_LEVEL_DEBUG, YES, message, arguments);
  },


  /**
    Logs a debug message to the console and potentially to the recorded
    array, provided the respective log levels are set appropriately.

    Unlike simply debug(), this method does not try to apply String.fmt() to
    the arguments, and instead passes them directly to the reporter (and
    stringifies them if recording).  This can be useful if the browser formats
    a type in a manner more useful to you than you can achieve with
    String.fmt().

    @param {String|Array|Function|Object}
  */
  debugWithoutFmt: function() {
    this._handleMessage(SC.LOGGER_LEVEL_DEBUG, NO, null, arguments);
  },


  /**
    Begins a new group in the console and/or in the recorded array provided
    the respective log levels are set to ouput/record 'debug' messages.
    Every message after this call (at any log level) will be indented for
    readability until a matching {@link SC.Logger.debugGroupEnd} is invoked,
    and you can create as many levels as you want.

    Assuming you are using 'debug' messages elsewhere, it is preferable to
    group them using this method over simply {@link SC.Logger.group} — the log
    levels could be set such that the 'debug' messages are never seen, and you
    wouldn’t want an empty/needless group!

    You can optionally provide a title for the group.  If there are any
    additional arguments, the first argument is assumed to be a format string.
    Thus, you can (and should) use it like:

          SC.Logger.debugGroup("%@:  My debug group", this);       // good

    …and not:

          SC.Logger.debugGroup("%@:  My debug group".fmt(this));   // bad

    The former method can be more efficient because if the log levels are set
    in such a way that the debug() invocation will be ignored, then the
    String.fmt() call will never actually be performed.

    @param {String}  (optional)  A title or format string to display above the group
    @param {…}       (optional)  Other arguments to pass to String.fmt() when using a format string as the title
  */
  debugGroup: function(message, optionalFormatArgs) {
    // Implementation note:  To avoid having to put the SC.debugGroup()
    // shorthand variant inside a function wrapper, we'll avoid 'this'.
    SC.Logger._handleGroup(SC.LOGGER_LEVEL_DEBUG, message, arguments);
  },


  /**
    Ends a group initiated with {@link SC.Logger.debugGroup}, provided the
    respective output/recording log levels are set appropriately.

    @see SC.Logger.debugGroup
  */
  debugGroupEnd: function() {
    // Implementation note:  To avoid having to put the SC.debugGroupEnd()
    // shorthand variant inside a function wrapper, we'll avoid 'this'.
    SC.Logger._handleGroupEnd(SC.LOGGER_LEVEL_DEBUG);
  },



  /**
    Logs an informational message to the console and potentially to the
    recorded array, provided the respective log levels are set appropriately.

    The first argument must be a string, and if there are any additional
    arguments, it is assumed to be a format string.  Thus, you can (and
    should) use it like:

          SC.Logger.info("%@:  My info message", this);       // good

    …and not:

          SC.Logger.info("%@:  My info message".fmt(this));   // bad

    The former method can be more efficient because if the log levels are set
    in such a way that the info() invocation will be ignored, then the
    String.fmt() call will never actually be performed.

    @param {String}              A message or a format string
    @param {…}       (optional)  Other arguments to pass to String.fmt() when using a format string
  */
  info: function(message, optionalFormatArgs) {
    // Implementation note:  To avoid having to put the SC.info() shorthand
    // variant inside a function wrapper, we'll avoid 'this'.
    SC.Logger._handleMessage(SC.LOGGER_LEVEL_INFO, YES, message, arguments);
  },


  /**
    Logs an information message to the console and potentially to the recorded
    array, provided the respective log levels are set appropriately.

    Unlike simply info(), this method does not try to apply String.fmt() to
    the arguments, and instead passes them directly to the reporter (and
    stringifies them if recording).  This can be useful if the browser formats
    a type in a manner more useful to you than you can achieve with
    String.fmt().

    @param {String|Array|Function|Object}
  */
  infoWithoutFmt: function() {
    this._handleMessage(SC.LOGGER_LEVEL_INFO, NO, null, arguments);
  },


  /**
    Begins a new group in the console and/or in the recorded array provided
    the respective log levels are set to ouput/record 'info' messages.
    Every message after this call (at any log level) will be indented for
    readability until a matching {@link SC.Logger.infoGroupEnd} is invoked,
    and you can create as many levels as you want.

    Assuming you are using 'info' messages elsewhere, it is preferable to
    group them using this method over simply {@link SC.Logger.group} — the log
    levels could be set such that the 'info' messages are never seen, and you
    wouldn’t want an empty/needless group!

    You can optionally provide a title for the group.  If there are any
    additional arguments, the first argument is assumed to be a format string.
    Thus, you can (and should) use it like:

          SC.Logger.infoGroup("%@:  My info group", this);       // good

    …and not:

          SC.Logger.infoGroup("%@:  My info group".fmt(this));   // bad

    The former method can be more efficient because if the log levels are set
    in such a way that the info() invocation will be ignored, then the
    String.fmt() call will never actually be performed.

    @param {String}  (optional)  A title or format string to display above the group
    @param {…}       (optional)  Other arguments to pass to String.fmt() when using a format string as the title
  */
  infoGroup: function(message, optionalFormatArgs) {
    // Implementation note:  To avoid having to put the SC.infoGroup()
    // shorthand variant inside a function wrapper, we'll avoid 'this'.
    SC.Logger._handleGroup(SC.LOGGER_LEVEL_INFO, message, arguments);
  },


  /**
    Ends a group initiated with {@link SC.Logger.infoGroup}, provided the
    respective output/recording log levels are set appropriately.

    @see SC.Logger.infoGroup
  */
  infoGroupEnd: function() {
    // Implementation note:  To avoid having to put the SC.infoGroupEnd()
    // shorthand variant inside a function wrapper, we'll avoid 'this'.
    SC.Logger._handleGroupEnd(SC.LOGGER_LEVEL_INFO);
  },



  /**
    Logs a warning message to the console and potentially to the recorded
    array, provided the respective log levels are set appropriately.

    The first argument must be a string, and if there are any additional
    arguments, it is assumed to be a format string.  Thus, you can (and
    should) use it like:

          SC.Logger.warn("%@:  My warning message", this);       // good

    …and not:

          SC.Logger.warn("%@:  My warning message".fmt(this));   // bad

    The former method can be more efficient because if the log levels are set
    in such a way that the warn() invocation will be ignored, then the
    String.fmt() call will never actually be performed.

    @param {String}              A message or a format string
    @param {…}       (optional)  Other arguments to pass to String.fmt() when using a format string
  */
  warn: function(message, optionalFormatArgs) {
    // Implementation note:  To avoid having to put the SC.warn() shorthand
    // variant inside a function wrapper, we'll avoid 'this'.
    SC.Logger._handleMessage(SC.LOGGER_LEVEL_WARN, YES, message, arguments);

  },


  /**
    Logs a warning message to the console and potentially to the recorded
    array, provided the respective log levels are set appropriately.

    Unlike simply warn(), this method does not try to apply String.fmt() to
    the arguments, and instead passes them directly to the reporter (and
    stringifies them if recording).  This can be useful if the browser formats
    a type in a manner more useful to you than you can achieve with
    String.fmt().

    @param {String|Array|Function|Object}
  */
  warnWithoutFmt: function() {
    this._handleMessage(SC.LOGGER_LEVEL_WARN, NO, null, arguments);
  },


  /**
    Begins a new group in the console and/or in the recorded array provided
    the respective log levels are set to ouput/record 'warn' messages.
    Every message after this call (at any log level) will be indented for
    readability until a matching {@link SC.Logger.warnGroupEnd} is invoked,
    and you can create as many levels as you want.

    Assuming you are using 'warn' messages elsewhere, it is preferable to
    group them using this method over simply {@link SC.Logger.group} — the log
    levels could be set such that the 'warn' messages are never seen, and you
    wouldn’t want an empty/needless group!

    You can optionally provide a title for the group.  If there are any
    additional arguments, the first argument is assumed to be a format string.
    Thus, you can (and should) use it like:

          SC.Logger.warnGroup("%@:  My warn group", this);       // good

    …and not:

          SC.Logger.warnGroup("%@:  My warn group".fmt(this));   // bad

    The former method can be more efficient because if the log levels are set
    in such a way that the warn() invocation will be ignored, then the
    String.fmt() call will never actually be performed.

    @param {String}  (optional)  A title or format string to display above the group
    @param {…}       (optional)  Other arguments to pass to String.fmt() when using a format string as the title
  */
  warnGroup: function(message, optionalFormatArgs) {
    // Implementation note:  To avoid having to put the SC.warnGroup()
    // shorthand variant inside a function wrapper, we'll avoid 'this'.
    SC.Logger._handleGroup(SC.LOGGER_LEVEL_WARN, message, arguments);
  },


  /**
    Ends a group initiated with {@link SC.Logger.warnGroup}, provided the
    respective output/recording log levels are set appropriately.

    @see SC.Logger.warnGroup
  */
  warnGroupEnd: function() {
    // Implementation note:  To avoid having to put the SC.warnGroupEnd()
    // shorthand variant inside a function wrapper, we'll avoid 'this'.
    SC.Logger._handleGroupEnd(SC.LOGGER_LEVEL_WARN);
  },


  /**
    Logs an error message to the console and potentially to the recorded
    array, provided the respective log levels are set appropriately.

    The first argument must be a string, and if there are any additional
    arguments, it is assumed to be a format string.  Thus, you can (and
    should) use it like:

          SC.Logger.error("%@:  My error message", this);       // good

    …and not:

          SC.Logger.warn("%@:  My error message".fmt(this));    // bad

    The former method can be more efficient because if the log levels are set
    in such a way that the warn() invocation will be ignored, then the
    String.fmt() call will never actually be performed.

    @param {String}              A message or a format string
    @param {…}       (optional)  Other arguments to pass to String.fmt() when using a format string
  */
  error: function(message, optionalFormatArgs) {
    // Implementation note:  To avoid having to put the SC.error() shorthand
    // variant inside a function wrapper, we'll avoid 'this'.
    SC.Logger._handleMessage(SC.LOGGER_LEVEL_ERROR, YES, message, arguments);
  },


  /**
    Logs an error message to the console and potentially to the recorded
    array, provided the respective log levels are set appropriately.

    Unlike simply error(), this method does not try to apply String.fmt() to
    the arguments, and instead passes them directly to the reporter (and
    stringifies them if recording).  This can be useful if the browser formats
    a type in a manner more useful to you than you can achieve with
    String.fmt().

    @param {String|Array|Function|Object}
  */
  errorWithoutFmt: function() {
    this._handleMessage(SC.LOGGER_LEVEL_ERROR, NO, null, arguments);
  },


  /**
    Begins a new group in the console and/or in the recorded array provided
    the respective log levels are set to ouput/record 'error' messages.
    Every message after this call (at any log level) will be indented for
    readability until a matching {@link SC.Logger.errorGroupEnd} is invoked,
    and you can create as many levels as you want.

    Assuming you are using 'error' messages elsewhere, it is preferable to
    group them using this method over simply {@link SC.Logger.group} — the log
    levels could be set such that the 'error' messages are never seen, and you
    wouldn’t want an empty/needless group!

    You can optionally provide a title for the group.  If there are any
    additional arguments, the first argument is assumed to be a format string.
    Thus, you can (and should) use it like:

          SC.Logger.errorGroup("%@:  My error group", this);       // good

    …and not:

          SC.Logger.errorGroup("%@:  My error group".fmt(this));   // bad

    The former method can be more efficient because if the log levels are set
    in such a way that the error() invocation will be ignored, then the
    String.fmt() call will never actually be performed.

    @param {String}  (optional)  A title or format string to display above the group
    @param {…}       (optional)  Other arguments to pass to String.fmt() when using a format string as the title
  */
  errorGroup: function(message, optionalFormatArgs) {
    // Implementation note:  To avoid having to put the SC.errorGroup()
    // shorthand variant inside a function wrapper, we'll avoid 'this'.
    SC.Logger._handleGroup(SC.LOGGER_LEVEL_ERROR, message, arguments);
  },


  /**
    Ends a group initiated with {@link SC.Logger.errorGroup}, provided the
    respective output/recording log levels are set appropriately.

    @see SC.Logger.errorGroup
  */
  errorGroupEnd: function() {
    // Implementation note:  To avoid having to put the SC.errorGroupEnd()
    // shorthand variant inside a function wrapper, we'll avoid 'this'.
    SC.Logger._handleGroupEnd(SC.LOGGER_LEVEL_ERROR);
  },



  /**
    This method will output all recorded log messages to the reporter.  This
    provides a convenient way to see the messages “on-demand” without having
    to have them always output.  The timestamp of each message will be
    included as a prefix if you specify 'includeTimestamps' as YES, although
    in some browsers the native group indenting can make the timestamp
    formatting less than ideal.

    @param {Boolean}  (optional)  Whether to include timestamps in the output
  */
  outputRecordedLogMessages: function(includeTimestamps) {
    // If we have no reporter, there's nothing we can do.
    if (!this.get('exists')) return;

    var reporter        = this.get('reporter'),
        entries         = this.get('recordedLogMessages'),
        indentation     = 0,
        timestampFormat = SC.LOGGER_RECORDED_LOG_TIMESTAMP_PREFIX,
        i, iLen, entry, type, timestampStr, message, originalArguments,
        output, title, newIndentation, disparity, j, jLen;

    if (entries) {
      for (i = 0, iLen = entries.length;  i < iLen;  ++i) {
        entry        = entries[i];
        type         = entry.type;

        if (includeTimestamps) {
          timestampStr = timestampFormat.fmt(entry.timestamp.toUTCString());
        }

        // Is this a message or a group directive?
        message = entry.message;
        if (message) {
          // It's a message entry.  Were the original arguments stored?  If
          // so, we need to use those instead of the message.
          originalArguments = entry.originalArguments;
          this._outputMessage(type, timestampStr, indentation, message, originalArguments);
        }
        else {
          // It's a group directive.  Update our indentation appropriately.
          newIndentation = entry.indentation;
          title          = entry.title;
          disparity      = newIndentation - indentation;

          // If the reporter implements group() and the indentation level
          // changes by more than 1, that implies that some earlier “begin
          // group” / “end group” directives were pruned from the beginning of
          // the buffer and we need to insert empty groups to compensate.
          if (reporter.group) {
            if (Math.abs(disparity) > 1) {
              for (j = 0, jLen = (disparity - 1);  j < jLen;  ++j) {
                if (disparity > 0) {
                  reporter.group();
                }
                else {
                  reporter.groupEnd();
                }
              }
            }

            if (disparity > 0) {
              output = timestampStr ? timestampStr : "";
              output += title;
              reporter.group(output);
            }
            else {
              reporter.groupEnd();
            }
          }
          else {
            // The reporter doesn't implement group()?  Then simulate it using
            // log(), assuming it implements that.
            if (disparity > 0) {
              // We're beginning a group.  Output the header at an indentation
              // that is one smaller.
              this._outputGroup(type, timestampStr, newIndentation - 1, title);
            }
            // else {}  (There is no need to simulate a group ending.)
          }

          // Update our indentation.
          indentation = newIndentation;
        }
      }
    }
  },


  /**
    This method will return a string representation of all recorded log
    messages to the reporter, which can be convenient for saving logs and so
    forth.  The timestamp of each message will be included in the string.

    If there are no recorded log messages, an empty string will be returned
    (as opposed to null).

    @returns {String}
  */
  stringifyRecordedLogMessages: function() {
    var ret           = "",
        entries       = this.get('recordedLogMessages'),
        indentation   = 0,
        timestampFormat = SC.LOGGER_RECORDED_LOG_TIMESTAMP_PREFIX,
        prefixMapping = this._LOG_FALLBACK_PREFIX_MAPPING,
        groupHeader   = SC.LOGGER_LOG_GROUP_HEADER,
        i, iLen, entry, type, message, originalArguments, prefix, line,
        title, newIndentation, disparity;

    if (entries) {
      for (i = 0, iLen = entries.length;  i < iLen;  ++i) {
        entry = entries[i];
        type  = entry.type;

        // First determine the prefix.
        prefix = timestampFormat.fmt(entry.timestamp.toUTCString());
        prefix += prefixMapping[type] || "";

        // Is this a message or a group directive?
        message = entry.message;
        if (message) {
          // It's a message entry.  Were arguments used, or did we format a
          // message?  If arguments were used, we need to stringfy those
          // instead of using the message.
          originalArguments = entry.originalArguments;
          line =  prefix + this._indentation(indentation);
          line += originalArguments ? this._argumentsToString(originalArguments) : message;
        }
        else {
          // It's a group directive, so we need to update our indentation
          // appropriately.  Also, if it's the beginning of the group and it
          // has a title, then we need to include an appropriate header.
          newIndentation = entry.indentation;
          title          = entry.title;
          disparity      = newIndentation - indentation;
          if (disparity > 0) {
            // We're beginning a group.  Output the header at an indentation
            // that is one smaller.
            line = prefix + this._indentation(indentation) + groupHeader.fmt(title);
          }

          // Update our indentation.
          indentation = newIndentation;
        }

        // Add the line to our string.
        ret += line + "\n";
      }
    }
    return ret;
  },



  /**
    Log output to the console, but only if it exists.

    IMPORTANT:  Unlike debug(), info(), warn(), and error(), messages sent to
    this method do not consult the log level and will always be output.
    Similarly, they will never be recorded.

    In general, you should avoid this method and instead choose the
    appropriate categorization for your message, choosing the appropriate
    method.

    @param {String|Array|Function|Object}
    @returns {Boolean} Whether or not anything was logged
  */
  log: function() {
    var reporter = this.get('reporter'),
        ret      = NO;

    // Log through the reporter.
    if (this.get('exists')) {
      if (typeof reporter.log === "function") {
        reporter.log.apply(reporter, arguments);
        ret = YES;
      }
      else if (reporter.log) {
        // IE8 implements console.log but reports the type of console.log as
        // "object", so we cannot use apply().  Because of this, the best we
        // can do is call it directly with an array of our arguments.
        reporter.log(this._argumentsToArray(arguments));
        ret = YES;
      }
    }

    // log through alert
    if (!ret  &&  this.get('fallBackOnAlert')) {
      // include support for overriding the alert through the reporter
      // if it has come this far, it's likely this will fail
      if (this.get('exists')  &&  (typeof reporter.alert === "function")) {
        reporter.alert(arguments);
        ret = YES;
      }
      else {
        alert(arguments);
        ret = YES;
      }
    }
    return ret;
  },


  /**
    Every log after this call until {@link SC.Logger.groupEnd} is called
    will be indented for readability.  You can create as many levels
    as you want.

    IMPORTANT:  Unlike debugGroup(), infoGroup(), warnGroup(), and
    errorGroup(), this method do not consult the log level and will always
    result in output when the reporter supports it.  Similarly, group messages
    logged via this method will never be recorded.

    @param {String}  (optional)  An optional title to display above the group
  */
  group: function(title) {
    var reporter = this.get('reporter');

    if (this.get('exists')  &&  (typeof reporter.group === "function")) {
      reporter.group(title);
    }
  },

  /**
    Ends a group declared with {@link SC.Logger.group}.

    @see SC.Logger.group
  */
  groupEnd: function() {
    var reporter = this.get('reporter');

    if (this.get('exists')  &&  (typeof reporter.groupEnd === "function")) {
      reporter.groupEnd();
    }
  },



  /**
    Outputs the properties of an object.

    Logs the object using {@link SC.Logger.log} if the reporter.dir function
    does not exist.

    @param {Object}
  */
  dir: function() {
    var reporter = this.get('reporter');

    if (this.get('exists')  &&  (typeof reporter.dir === "function")) {
      // Firebug's console.dir doesn't support multiple objects here
      // but maybe custom reporters will
      reporter.dir.apply(reporter, arguments);
    }
    else {
      this.log.apply(this, arguments);
    }
  },


  /**
    Prints an XML outline for any HTML or XML object.

    Logs the object using {@link SC.Logger.log} if reporter.dirxml function
    does not exist.

    @param {Object}
  */
  dirxml: function() {
    var reporter = this.get('reporter');

    if (this.get('exists')  &&  (typeof reporter.dirxml === "function")) {
      // Firebug's console.dirxml doesn't support multiple objects here
      // but maybe custom reporters will
      reporter.dirxml.apply(reporter, arguments);
    }
    else {
      this.log.apply(this, arguments);
    }
  },



  /**
    Begins the JavaScript profiler, if it exists. Call {@link SC.Logger.profileEnd}
    to end the profiling process and receive a report.

    @param {String}     (optional)  A title to associate with the profile
    @returns {Boolean} YES if reporter.profile exists, NO otherwise
  */
  profile: function(title) {
    var reporter = this.get('reporter');

    if (this.get('exists')  &&  (typeof reporter.profile === "function")) {
      reporter.profile(title);
      return YES;
    }
    return NO;
  },

  /**
    Ends the JavaScript profiler, if it exists.  If you specify a title, the
    profile with that title will be ended.

    @param {String}     (optional)  A title to associate with the profile
    @returns {Boolean} YES if reporter.profileEnd exists, NO otherwise
    @see SC.Logger.profile
  */
  profileEnd: function(title) {
    var reporter = this.get('reporter');

    if (this.get('exists')  &&  (typeof reporter.profileEnd === "function")) {
      reporter.profileEnd(title);
      return YES;
    }
    return NO;
  },


  /**
    Measure the time between when this function is called and
    {@link SC.Logger.timeEnd} is called.

    @param {String}     The name of the profile to begin
    @returns {Boolean} YES if reporter.time exists, NO otherwise
    @see SC.Logger.timeEnd
  */
  time: function(name) {
    var reporter = this.get('reporter');

    if (this.get('exists')  &&  (typeof reporter.time === "function")) {
      reporter.time(name);
      return YES;
    }
    return NO;
  },

  /**
    Ends the profile specified.

    @param {String}     The name of the profile to end
    @returns {Boolean}  YES if reporter.timeEnd exists, NO otherwise
    @see SC.Logger.time
  */
  timeEnd: function(name) {
    var reporter = this.get('reporter');

    if (this.get('exists')  &&  (typeof reporter.timeEnd === "function")) {
      reporter.timeEnd(name);
      return YES;
    }
    return NO;
  },


  /**
    Prints a stack-trace.

    @returns {Boolean} YES if reporter.trace exists, NO otherwise
  */
  trace: function() {
    var reporter = this.get('reporter');

    if (this.get('exists')  &&  (typeof reporter.trace === "function")) {
      reporter.trace();
      return YES;
    }
    return NO;
  },




  // ..........................................................
  // INTERNAL SUPPORT
  //

  init: function() {
    arguments.callee.base.apply(this,arguments);

    // Set a reasonable default value if none has been set.
    if (!this.get('logOutputLevel')) {
      if (SC.buildMode === "debug") {
        this.set('logOutputLevel', SC.LOGGER_LEVEL_DEBUG);
      }
      else {
        this.set('logOutputLevel', SC.LOGGER_LEVEL_INFO);
      }
    }
  
    this.debugEnabledDidChange();
  },


  /** @private
    For backwards compatibility with the older 'debugEnabled' property, set
    our log output level to SC.LOGGER_LEVEL_DEBUG if 'debugEnabled' is set to
    YES.
  */
  debugEnabledDidChange: function() {
    if (this.get('debugEnabled')) {
      this.set('logOutputLevel', SC.LOGGER_LEVEL_DEBUG);
    }
  }.observes('debugEnabled'),



  /** @private
    Outputs and/or records the specified message of the specified type if the
    respective current log levels allow for it.  Assuming
    'automaticallyFormat' is specified, then String.fmt() will be called
    automatically on the message, but only if at least one of the log levels
    is such that the result will be used.

    @param {String}               type                 Expected to be SC.LOGGER_LEVEL_DEBUG, etc.
    @param {Boolean}              automaticallyFormat  Whether or not to treat 'message' as a format string if there are additional arguments
    @param {String}               message              Expected to a string format (for String.fmt()) if there are other arguments
    @param {String}   (optional)  originalArguments    All arguments passed into debug(), etc. (which includes 'message'; for efficiency, we don’t copy it)
  */
  _handleMessage: function(type, automaticallyFormat, message, originalArguments) {
    // Are we configured to show this type?
    var shouldOutput = this._shouldOutputType(type),
        shouldRecord = this._shouldRecordType(type),
        hasOtherArguments, i, len, args, output, entry;

    // If we're neither going to output nor record the message, then stop now.
    if (!(shouldOutput || shouldRecord)) return;

    // Do we have arguments other than 'message'?  (Remember that
    // 'originalArguments' contains the message here, too, hence the > 1.)
    hasOtherArguments = (originalArguments  &&  originalArguments.length > 1);

    // If we're automatically formatting and there is no message (or it is
    // not a string), then don't automatically format after all.
    if (automaticallyFormat  &&  (SC.none(message)  ||  (typeof message !== "string"))) {
      automaticallyFormat = NO;
    }

    // If we should automatically format, and the client specified other
    // arguments in addition to the message, then we'll call .fmt() assuming
    // that the message is a format string.
    if (automaticallyFormat) {
      if (hasOtherArguments) {
        args = [];
        for (i = 1, len = originalArguments.length;  i < len;  ++i) {
          args.push(originalArguments[i]);
        }
        message = message.fmt.apply(message, args);
      }
    }

    if (shouldOutput) {
      // We only want to pass the original arguments to _outputMessage() if we
      // didn't format the message ourselves.
      args = automaticallyFormat ? null : originalArguments;
      this._outputMessage(type, null, this._outputIndentationLevel, message, args);
    }

    // If we're recording the log, append the message now.
    if (shouldRecord) {
      entry = {
        type:      type,
        message:   message ? message : YES,
        timestamp: new Date()
      };

      // If we didn't automatically format, and we have other arguments, then
      // be sure to record them, too.
      if (!automaticallyFormat  &&  hasOtherArguments) {
        entry.originalArguments = originalArguments;
      }

      this._addRecordedMessageEntry(entry);
    }
  },


  /** @private
    Outputs and/or records a group with the (optional) specified title
    assuming the respective current log levels allow for it.  This will output
    the title (if there is one) and indent all further messages (of any type)
    until _handleGroupEnd() is invoked.

    If additional arguments beyond a title are passed in, then String.fmt()
    will be called automatically on the title, but only if at least one of the
    log levels is such that the result will be used.

    @param {String}              type                 Expected to be SC.LOGGER_LEVEL_DEBUG, etc.
    @param {String}  (optional)  title                Expected to a string format (for String.fmt()) if there are other arguments
    @param {String}  (optional)  originalArguments    All arguments passed into debug(), etc. (which includes 'title'; for efficiency, we don’t copy it)
  */
  _handleGroup: function(type, title, originalArguments) {
    // Are we configured to show this type?
    var shouldOutput = this._shouldOutputType(type),
        shouldRecord = this._shouldRecordType(type),
        hasOtherArguments, i, len, args, arg, reporter, func, header, output,
        indentation, entry;

    // If we're neither going to output nor record the group, then stop now.
    if (!(shouldOutput || shouldRecord)) return;

    // Do we have arguments other than 'title'?  (Remember that
    // 'originalArguments' contains the title here, too, hence the > 1.)
    hasOtherArguments = (originalArguments  &&  originalArguments.length > 1);

    // If the client specified a title as well other arguments, then we'll
    // call .fmt() assuming that the title is a format string.
    if (title  &&  hasOtherArguments) {
      args = [];
      for (i = 1, len = originalArguments.length;  i < len;  ++i) {
        args.push(originalArguments[i]);
      }
      title = title.fmt.apply(title, args);
    }

    if (shouldOutput) {
      this._outputGroup(type, null, this._outputIndentationLevel, title);

      // Increase our indentation level to accommodate the group.
      this._outputIndentationLevel++;
    }

    // If we're recording the group, append the entry now.
    if (shouldRecord) {
      // Increase our indentation level to accommodate the group.
      indentation = ++this._recordingIndentationLevel;

      entry = {
        type:         type,
        indentation:  indentation,
        beginGroup:   YES,
        title:        title,
        timestamp:    new Date()
      };

      this._addRecordedMessageEntry(entry);
    }
  },


  /** @private
    Outputs and/or records a “group end” assuming the respective current log
    levels allow for it.  This will remove one level of indentation from all
    further messages (of any type).

    @param {String}              type                 Expected to be SC.LOGGER_LEVEL_DEBUG, etc.
  */
  _handleGroupEnd: function(type) {
    // Are we configured to show this type?
    var shouldOutput = this._shouldOutputType(type),
        shouldRecord = this._shouldRecordType(type),
        reporter, func, indentation, entry;

    // If we're neither going to output nor record the "group end", then stop
    // now.
    if (!(shouldOutput || shouldRecord)) return;

    if (shouldOutput) {
      // Decrease our indentation level to accommodate the group.
      this._outputIndentationLevel--;
      
      if (this.get('exists')) {
        // Do we have reporter.groupEnd defined as a function?  If not, we
        // simply won't output anything.
        reporter = this.get('reporter');
        func     = reporter.groupEnd;
        if (func) {
          func.call(reporter);
        }
      }
    }

    // If we're recording the “group end”, append the entry now.
    if (shouldRecord) {
      // Decrease our indentation level to accommodate the group.
      indentation = --this._recordingIndentationLevel;

      entry = {
        type:         type,
        indentation:  indentation,
        timestamp:    new Date()
      };

      this._addRecordedMessageEntry(entry);
    }
  },


  /** @private
    Returns whether a message of the specified type ('debug', etc.) should be
    output to the reporter based on the current value of 'logOutputLevel'.

    @param {Constant}  type
    @returns {Boolean}
  */
  _shouldOutputType: function(type) {
    var logLevelMapping = this._LOG_LEVEL_MAPPING,
        level           = logLevelMapping[type]                        ||  0,
        currentLevel    = logLevelMapping[this.get('logOutputLevel')]  ||  0;

    return (level <= currentLevel);
  },


  /** @private
    Returns whether a message of the specified type ('debug', etc.) should be
    recorded based on the current value of 'logRecordingLevel'.

    @param {Constant}  type
    @returns {Boolean}
  */
  _shouldRecordType: function(type) {
    // This is the same code as in _shouldOutputType(), but inlined to
    // avoid yet another function call.
    var logLevelMapping = this._LOG_LEVEL_MAPPING,
        level           = logLevelMapping[type]                           ||  0,
        currentLevel  = logLevelMapping[this.get('logRecordingLevel')]  ||  0;

    return (level <= currentLevel);
  },


  /** @private
    Outputs the specified message to the current reporter.  If the reporter
    does not handle the specified type of message, it will fall back to using
    log() if possible.

    @param {Constant}               type
    @param {String}                 timestampStr       An optional timestamp prefix for the line, or null for none
    @param {Number}                 indentation        The current indentation level
    @param {String}                 message
    @param {Arguments}  (optional)  originalArguments  If specified, the assumption is that the message was not automatically formatted
  */
  _outputMessage: function(type, timestampStr, indentation, message, originalArguments) {
    if (!this.get('exists')) return;

    // Do we have reporter[type] defined as a function?  If not, we'll fall
    // back to reporter.log if that exists.
    var reporter = this.get('reporter'),
        output, shouldIndent, func, prefix, args, arg;

    // If the reporter doesn't support group(), then we need to manually
    // include indentation for the group.  (It it does, we'll assume that
    // we're currently at the correct group level.)
    shouldIndent = !reporter.group;

    // Note:  Normally we wouldn't do the hash dereference twice, but
    //        storing the result like this:
    //
    //          var nativeFunction = console[type];
    //          nativeFunction(output);
    //
    //        …doesn't work in Safari 4, and:
    //
    //          nativeFunction.call(console, output);
    //
    //        …doesn't work in IE8 because the console.* methods are
    //       reported as being objects.
    func = reporter[type];
    if (func) {
      // If we formatted, just include the message.  Otherwise, include all
      // the original arguments.
      if (!originalArguments) {
        output = "";
        if (timestampStr) output = timestampStr;
        if (shouldIndent) output =+ this._indentation(indentation);
        output += message;
        reporter[type](output);
      }
      else {
        // We have arguments?  Then pass them along to the reporter function
        // so that it can format them appropriately.  We'll use the timestamp
        // string (if there is one) and the indentation as the first
        // arguments.
        args = this._argumentsToArray(originalArguments);
        prefix = "";
        if (timestampStr) prefix = timestampStr;
        if (shouldIndent) prefix += this._indentation(indentation);
        if (prefix) args.splice(0, 0, prefix);
        
        if (func.apply) {
          func.apply(reporter, args);
        }
        else {
          // In IE8, passing the arguments as an array isn't ideal, but it's
          // pretty much all we can do because we can't call apply().
          reporter[type](args);            
        }
      }
    }
    else {
      // The reporter doesn't support the requested function?  If it at least
      // support log(), fall back to that.
      if (reporter.log) {
        prefix = "";
        if (timestampStr) prefix = timestampStr;
        prefix += this._LOG_FALLBACK_PREFIX_MAPPING[type] || "";
        if (shouldIndent) prefix += this._indentation(indentation);

        // If we formatted, just include the message.  Otherwise, include
        // all the original arguments.
        if (!originalArguments) {
          reporter.log(prefix + message);
        }
        else {
          args = this._argumentsToArray(originalArguments);
          if (prefix) args.splice(0, 0, prefix);
          reporter.log(args);
        }
      }
    }
  },


  /** @private
    Outputs the specified “begin group” directive to the current reporter.  If
    the reporter does not handle the group() method, it will fall back to
    simulating using log() if possible.

    @param {Constant}               type
    @param {String}                 timestampStr  An optional timestamp prefix for the line, or null for none
    @param {Number}                 indentation   The current indentation level, not including what the group will set it to
    @param {String}     (optional)  title
  */
  _outputGroup: function(type, timestampStr, indentation, title) {
    if (!this.get('exists')) return;

    // Do we have reporter.group defined as a function?  If not, we'll fall
    // back to reporter.log if that exists.  (Thankfully, we can avoid the IE8
    // special-casing we have in _outputMessage() because IE8 doesn't support
    // console.group(), anyway.)
    var reporter = this.get('reporter'),
        func     = reporter.group,
        output;

    if (func) {
      output = timestampStr ? timestampStr : "";
      output += title;
      func.call(reporter, output);
    }
    else if (reporter.log) {
      // The reporter doesn't support group()?  Then simulate with log().
      // (We'll live with the duplicitous dereference rather than using
      // apply() to work around the IE8 issue described in _outputMessage().)
      output = "";
      if (timestampStr) output = timestampStr;
      output += this._LOG_FALLBACK_PREFIX_MAPPING[type] || "";
      output += this._indentation(indentation);
      output += SC.LOGGER_LOG_GROUP_HEADER.fmt(title);
      reporter.log(output);
    }
  },


  /** @private
    This method will add the specified entry to the recorded log messages
    array and also prune array as necessary according to the current values of
    'recordedLogMessagesMaximumLength' and
    'recordedLogMessagesPruningMinimumLength'.
  */
  _addRecordedMessageEntry: function(entry) {
    var recordedMessages = this.get('recordedLogMessages'),
        len;

    // Lazily create the array.
    if (!recordedMessages) {
      recordedMessages = [];
      this.set('recordedLogMessages', recordedMessages);
    }

    recordedMessages.push(entry);

    // Have we exceeded the maximum size?  If so, do some pruning.
    len = recordedMessages.length;
    if (len > this.get('recordedLogMessagesMaximumLength')) {
      recordedMessages.splice(0, (len - this.get('recordedLogMessagesPruningMinimumLength')));
    }
    
    // Notify that the array content changed.
    recordedMessages.enumerableContentDidChange();
  },



  /** @private
    The arguments function property doesn't support Array#unshift. This helper
    copies the elements of arguments to a blank array.

    @param {Array} arguments The arguments property of a function
    @returns {Array} An array containing the elements of arguments parameter
  */
  _argumentsToArray: function(args) {
    var ret = [],
        i, len;

    if (args) {
      for (i = 0, len = args.length;  i < len;  ++i) {
        ret[i] = args[i];
      }
    }
    return ret;
  },


  /** @private
    Formats the arguments array of a function by creating a string with
    SC.LOGGER_LOG_DELIMITER between the elements.
  */
  _argumentsToString: function() {
    var ret       = "",
        delimeter = SC.LOGGER_LOG_DELIMITER,
        i, len;

    for (i = 0, len = (arguments.length - 1);  i < len;  ++i) {
      ret += arguments[i] + delimeter;
    }
    ret += arguments[len];
    return ret;
  },


  /** @private
    Returns a string containing the appropriate indentation for the specified
    indentation level.

    @param {Number}  The indentation level
    @returns {String}
  */
  _indentation: function(level) {
    if (!level  ||  level < 0) {
      level = 0;
    }

    var ret    = "",
        indent = SC.LOGGER_LOG_GROUP_INDENTATION,
        i;

    for (i = 0;  i < level;  ++i) {
      ret += indent;
    }
    return ret;
  },



  /** @private
    The current “for output” indentation level.  The reporter (browser
    console) is expected to keep track of this for us for output, but we need
    to do our own bookkeeping if the browser doesn’t support console.group.
    This is incremented by _debugGroup() and friends, and decremented by
    _debugGroupEnd() and friends.
  */
  _outputIndentationLevel: 0,


  /** @private
    The current “for recording” indentation level.  This can be different than
    the “for output” indentation level if the respective log levels are set
    differently.  This is incremented by _debugGroup() and friends, and
    decremented by _debugGroupEnd() and friends.
  */
  _recordingIndentationLevel: 0,


  /** @private
    A mapping of the log level constants (SC.LOGGER_LEVEL_DEBUG, etc.) to
    their priority.  This makes it easy to determine which levels are “higher”
    than the current level.

    Implementation note:  We’re hardcoding the values of the constants defined
    earlier here for a tiny bit of efficiency (we can create the hash all at
    once rather than having to push in keys).
  */
  _LOG_LEVEL_MAPPING: { debug: 4, info: 3, warn: 2, error: 1, none: 0 },


  /** @private
    If the current reporter does not support a particular type of log message
    (for example, some older browsers’ consoles support console.log but not
    console.debug), we’ll use the specified prefixes.

    Implementation note:  We’re hardcoding the values of the constants defined
    earlier here for a tiny bit of efficiency (we can create the hash all at
    once rather than having to push in keys).
  */
  _LOG_FALLBACK_PREFIX_MAPPING: {
    debug:  SC.LOGGER_LOG_DEBUG,
    info:   SC.LOGGER_LOG_INFO,
    warn:   SC.LOGGER_LOG_WARN,
    error:  SC.LOGGER_LOG_ERROR
  }

});


// Add convenient shorthands methods to SC.
SC.debug = SC.Logger.debug;
SC.info  = SC.Logger.info;
SC.warn  = SC.Logger.warn;
SC.error = SC.Logger.error;

/* >>>>>>>>>> BEGIN source/system/run_loop.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('ext/function');
sc_require('private/observer_set');

/**
  @class

  The run loop provides a universal system for coordinating events within
  your application.  The run loop processes timers as well as pending
  observer notifications within your application.

  To use a RunLoop within your application, you should make sure your event
  handlers always begin and end with SC.RunLoop.begin() and SC.RunLoop.end()

  The RunLoop is important because bindings do not fire until the end of
  your run loop is reached.  This improves the performance of your
  application.

  Example:

  This is how you could write your mouseup handler in jQuery:

        $('#okButton').on('click', function() {
          SC.RunLoop.begin();

          // handle click event...

          SC.RunLoop.end(); // allows bindings to trigger...
        });

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.RunLoop = SC.Object.extend(/** @scope SC.RunLoop.prototype */ {

  /**
    Call this method whenver you begin executing code.

    This is typically invoked automatically for you from event handlers and
    the timeout handler.  If you call setTimeout() or setInterval() yourself,
    you may need to invoke this yourself.

    @returns {SC.RunLoop} receiver
  */
  beginRunLoop: function() {
    this._start = new Date().getTime() ; // can't use Date.now() in runtime
    if (SC.LOG_BINDINGS || SC.LOG_OBSERVERS) {
      SC.Logger.log("-- SC.RunLoop.beginRunLoop at %@".fmt(this._start));
    }
    this._runLoopInProgress = YES;
    return this ;
  },

  /**
    YES when a run loop is in progress

    @property
    @type Boolean
  */
  isRunLoopInProgress: function() {
    return this._runLoopInProgress;
  }.property(),

  /**
    Call this method whenever you are done executing code.

    This is typically invoked automatically for you from event handlers and
    the timeout handler.  If you call setTimeout() or setInterval() yourself
    you may need to invoke this yourself.

    @returns {SC.RunLoop} receiver
  */
  endRunLoop: function() {
    // at the end of a runloop, flush all the delayed actions we may have
    // stored up.  Note that if any of these queues actually run, we will
    // step through all of them again.  This way any changes get flushed
    // out completely.

    if (SC.LOG_BINDINGS || SC.LOG_OBSERVERS) {
      SC.Logger.log("-- SC.RunLoop.endRunLoop ~ flushing application queues");
    } 
    
    this.flushAllPending();
    
    this._start = null ;

    if (SC.LOG_BINDINGS || SC.LOG_OBSERVERS) {
      SC.Logger.log("-- SC.RunLoop.endRunLoop ~ End");
    }

    SC.RunLoop.lastRunLoopEnd = Date.now();
    this._runLoopInProgress = NO;

    return this ;
  },

  /**
    Repeatedly flushes all bindings, observers, and other queued functions until all queues are empty.
  */
  flushAllPending: function() {
    var didChange ;
    
    do {
      didChange = this.flushApplicationQueues() ;
      if (!didChange) didChange = this._flushinvokeLastQueue() ; 
    } while(didChange) ;
  },
  
  
  /**
    Invokes the passed target/method pair once at the end of the runloop.
    You can call this method as many times as you like and the method will
    only be invoked once.

    Usually you will not call this method directly but use invokeOnce()
    defined on SC.Object.

    Note that in development mode only, the object and method that call this
    method will be recorded, for help in debugging scheduled code.

    @param {Object} target
    @param {Function} method
    @returns {SC.RunLoop} receiver
  */
  invokeOnce: function(target, method) {
    // normalize
    if (method === undefined) {
      method = target; target = this ;
    }

    if (typeof method === "string") method = target[method];
    if (!this._invokeQueue) this._invokeQueue = SC.ObserverSet.create();
    if ( method ) this._invokeQueue.add(target, method);
    return this ;
  },

  /**
    Invokes the passed target/method pair at the very end of the run loop,
    once all other delayed invoke queues have been flushed.  Use this to
    schedule cleanup methods at the end of the run loop once all other work
    (including rendering) has finished.

    If you call this with the same target/method pair multiple times it will
    only invoke the pair only once at the end of the runloop.

    Usually you will not call this method directly but use invokeLast()
    defined on SC.Object.

    Note that in development mode only, the object and method that call this
    method will be recorded, for help in debugging scheduled code.

    @param {Object} target
    @param {Function} method
    @returns {SC.RunLoop} receiver
  */
  invokeLast: function(target, method) {
    // normalize
    if (method === undefined) {
      method = target; target = this ;
    }

    if (typeof method === "string") method = target[method];
    if (!this._invokeLastQueue) this._invokeLastQueue = SC.ObserverSet.create();
    this._invokeLastQueue.add(target, method);
    return this ;
  },

  /**
    Executes any pending events at the end of the run loop.  This method is
    called automatically at the end of a run loop to flush any pending
    queue changes.

    The default method will invoke any one time methods and then sync any
    bindings that might have changed.  You can override this method in a
    subclass if you like to handle additional cleanup.

    This method must return YES if it found any items pending in its queues
    to take action on.  endRunLoop will invoke this method repeatedly until
    the method returns NO.  This way if any if your final executing code
    causes additional queues to trigger, then can be flushed again.

    @returns {Boolean} YES if items were found in any queue, NO otherwise
  */
  flushApplicationQueues: function() {
    var hadContent = NO,
        // execute any methods in the invokeQueue.
        queue = this._invokeQueue;
    if ( queue && queue.getMembers().length ) {
      this._invokeQueue = null; // reset so that a new queue will be created
      hadContent = YES ; // needs to execute again
      queue.invokeMethods();
    }

    // flush any pending changed bindings.  This could actually trigger a
    // lot of code to execute.
    return SC.Binding.flushPendingChanges() || hadContent ;
  },

  _flushinvokeLastQueue: function() {
    var queue = this._invokeLastQueue, hadContent = NO ;
    if (queue && queue.getMembers().length ) {
      this._invokeLastQueue = null; // reset queue.
      hadContent = YES; // has targets!
      if (hadContent) queue.invokeMethods();
    }
    return hadContent ;
  }

});

/**
  The current run loop.  This is created automatically the first time you
  call begin().

  @type SC.RunLoop
*/
SC.RunLoop.currentRunLoop = null;

/**
  The default RunLoop class.  If you choose to extend the RunLoop, you can
  set this property to make sure your class is used instead.

  @type Class
*/
SC.RunLoop.runLoopClass = SC.RunLoop;

/**
  Begins a new run loop on the currentRunLoop.  If you are already in a
  runloop, this method has no effect.

  @returns {SC.RunLoop} receiver
*/
SC.RunLoop.begin = function() {
  var runLoop = this.currentRunLoop;
  if (!runLoop) runLoop = this.currentRunLoop = this.runLoopClass.create();
  runLoop.beginRunLoop();
  return this ;
};

/**
  Ends the run loop on the currentRunLoop.  This will deliver any final
  pending notifications and schedule any additional necessary cleanup.

  @returns {SC.RunLoop} receiver
*/
SC.RunLoop.end = function() {
  var runLoop = this.currentRunLoop;
  if (!runLoop) {
    throw "SC.RunLoop.end() called outside of a runloop!";
  }
  runLoop.endRunLoop();
  return this ;
} ;

/**
  Returns YES when a run loop is in progress

  @return {Boolean}
*/
SC.RunLoop.isRunLoopInProgress = function() {
  if(this.currentRunLoop) return this.currentRunLoop.get('isRunLoopInProgress');
  return NO;
};

/**
  Executes a passed function in the context of a run loop. If called outside a 
  runloop, starts and ends one. If called inside an existing runloop, is 
  simply executes the function unless you force it to create a nested runloop.
  
  If an exception is thrown during execution, we give an error catcher the
  opportunity to handle it before allowing the exception to bubble again.
  
  @param {Function} callback callback to execute
  @param {Object} target context for callback
  @param {Boolean} if YES, starts/ends a new runloop even if one is already running
*/
SC.run = function(callback, target, forceNested) {
  var alreadyRunning = SC.RunLoop.isRunLoopInProgress();

  // Only use a try/catch block if we have an ExceptionHandler
  // since in some browsers try/catch causes a loss of the backtrace
  if (SC.ExceptionHandler && SC.ExceptionHandler.enabled) {
    try {
      if(forceNested || !alreadyRunning) SC.RunLoop.begin();
      if (callback) callback.call(target);
      if(forceNested || !alreadyRunning) SC.RunLoop.end();
    } catch (e) {
      var handled = SC.ExceptionHandler.handleException(e);

      // If the exception was not handled, throw it again so the browser
      // can deal with it (and potentially use it for debugging).
      // (We don't throw it in IE because the user will see two errors)
      if (!handled && !SC.browser.msie) {
        throw e;
      }
    }
  } else {
    if(forceNested || !alreadyRunning) SC.RunLoop.begin();
    if (callback) callback.call(target);
    if(forceNested || !alreadyRunning) SC.RunLoop.end();
  }
};

