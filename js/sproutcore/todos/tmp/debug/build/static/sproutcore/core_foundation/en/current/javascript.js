/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Indicates that the collection view expects to accept a drop ON the specified
  item.
  
  @property {Number}
*/
SC.DROP_ON = 0x01 ;

/**
  Indicates that the collection view expects to accept a drop BEFORE the 
  specified item.
  
  @property {Number}
*/
SC.DROP_BEFORE = 0x02 ;

/**
  Indicates that the collection view expects to accept a drop AFTER the
  specified item.  This is treated just like SC.DROP_BEFORE is most views
  except for tree lists.
  
  @property {Number}
*/
SC.DROP_AFTER = 0x04 ;

/**
  Indicates that the collection view want's to know which operations would 
  be allowed for either drop operation.
  
  @property {Number}
*/
SC.DROP_ANY = 0x07 ;

/**
  Indicates that the content should be aligned to the left.
*/
SC.ALIGN_LEFT = 'left';

/**
  Indicates that the content should be aligned to the right.
*/
SC.ALIGN_RIGHT = 'right';

/**
  Indicates that the content should be aligned to the center.
*/
SC.ALIGN_CENTER = 'center';

/**
  Indicates that the content should be aligned to the top.
*/
SC.ALIGN_TOP = 'top';

/**
  Indicates that the content should be aligned to the middle.
*/
SC.ALIGN_MIDDLE = 'middle';

/**
  Indicates that the content should be aligned to the bottom.
*/
SC.ALIGN_BOTTOM = 'bottom';

/**
  Indicates that the content should be aligned to the top and left.
*/
SC.ALIGN_TOP_LEFT = 'top-left';

/**
  Indicates that the content should be aligned to the top and right.
*/
SC.ALIGN_TOP_RIGHT = 'top-right';

/**
  Indicates that the content should be aligned to the bottom and left.
*/
SC.ALIGN_BOTTOM_LEFT = 'bottom-left';

/**
  Indicates that the content should be aligned to the bottom and right.
*/
SC.ALIGN_BOTTOM_RIGHT = 'bottom-right';


SC.mixin(/** @lends SC */ {
  
  /**
    Reads or writes data from a global cache.  You can use this facility to
    store information about an object without actually adding properties to
    the object itself.  This is needed especially when working with DOM,
    which can leak easily in IE.
    
    To read data, simply pass in the reference element (used as a key) and
    the name of the value to read.  To write, also include the data.
    
    You can also just pass an object to retrieve the entire cache.
    
    @param elem {Object} An object or Element to use as scope
    @param name {String} Optional name of the value to read/write
    @param data {Object} Optional data.  If passed, write.
    @returns {Object} the value of the named data
  */
  data: $.data,
  
  /**
    Removes data from the global cache.  This is used throughout the
    framework to hold data without creating memory leaks.
    
    You can remove either a single item on the cache or all of the cached 
    data for an object.
    
    @param elem {Object} An object or Element to use as scope
    @param name {String} optional name to remove. 
    @returns {Object} the value or cache that was removed
  */
  removeData: $.removeData,

  // ..........................................................
  // LOCALIZATION SUPPORT
  //

  /**
    Known loc strings

    @type Hash
  */
  STRINGS: {},

  /**
    This is a simplified handler for installing a bunch of strings.  This
    ignores the language name and simply applies the passed strings hash.

    @param {String} lang the language the strings are for
    @param {Hash} strings hash of strings
    @returns {SC} The receiver, useful for chaining calls to the same object.
  */
  stringsFor: function(lang, strings) {
    SC.mixin(SC.STRINGS, strings);
    return this ;
  }

}) ;

/* >>>>>>>>>> BEGIN source/controllers/controller.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  The controller base class provides some common functions you will need
  for controllers in your applications, especially related to maintaining
  an editing context.
  
  In general you will not use this class, but you can use a subclass such
  as ObjectController, TreeController, or ArrayController.
  
  ## EDITING CONTEXTS
  
  One major function of a controller is to mediate between changes in the
  UI and changes in the model.  In particular, you usually do not want 
  changes you make in the UI to be applied to a model object directly.  
  Instead, you often will want to collect changes to an object and then
  apply them only when the user is ready to commit their changes.
  
  The editing contact support in the controller class will help you
  provide this capability.
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Controller = SC.Object.extend(
/** @scope SC.Controller.prototype */ {
  
  /**
    Makes a controller editable or not editable.  The SC.Controller class 
    itself does not do anything with this property but subclasses will 
    respect it when modifying content.
    
    @property {Boolean}
  */
  isEditable: YES,
  
  /**
   * Set this to YES if you are setting the controller content to a recordArray
   * or other content that needs to be cleaned up (with `.destroy()`) when
   * new content is set.
   */
  destroyContentOnReplace: NO,

  contentObjectDidChanged: function() {
    var oldContent, newContent;

    if (!this.get('destroyContentOnReplace')) return;

    oldContent = this._oldContent,
    newContent = this.get('content');
    if (oldContent && newContent !== oldContent && oldContent.destroy) {
      oldContent.destroy();
    }
    this._oldContent = newContent;
  }.observes('content')

});

/* >>>>>>>>>> BEGIN source/mixins/selection_support.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/**
  @namespace

  Implements common selection management properties for controllers.

  Selection can be managed by any controller in your applications.  This
  mixin provides some common management features you might want such as
  disabling selection, or restricting empty or multiple selections.

  To use this mixin, simply add it to any controller you want to manage
  selection and call updateSelectionAfterContentChange()
  whenever your source content changes.  You can also override the properties
  defined below to configure how the selection management will treat your
  content.

  This mixin assumes the arrangedObjects property will return an SC.Array of
  content you want the selection to reflect.

  Add this mixin to any controller you want to manage selection.  It is
  already applied to the CollectionController and ArrayController.

  @since SproutCore 1.0
*/
SC.SelectionSupport = {

  // ..........................................................
  // PROPERTIES
  //
  /**
    Walk like a duck.

    @property {Boolean}
  */
  hasSelectionSupport: YES,

  /**
    If YES, selection is allowed. Default is YES.

    @property {Boolean}
  */
  allowsSelection: YES,

  /**
    If YES, multiple selection is allowed. Default is YES.

    @property {Boolean}
  */
  allowsMultipleSelection: YES,

  /**
    If YES, allow empty selection Default is YES.

    @property {Boolean}
  */
  allowsEmptySelection: YES,

  /**
    Override to return the first selectable object.  For example, if you
    have groups or want to otherwise limit the kinds of objects that can be
    selected.

    the default imeplementation returns firstObject property.

    @returns {Object} first selectable object
  */
  firstSelectableObject: function() {
    return this.get('firstObject');
  }.property(),

  /**
    This is the current selection.  You can make this selection and another
    controller's selection work in concert by binding them together. You
    generally have a master selection that relays changes TO all the others.

    @property {SC.SelectionSet}
  */
  selection: function(key, value) {
    var old = this._scsel_selection,
    oldlen = old ? old.get('length') : 0,
    empty,
    arrangedObjects = this.get('arrangedObjects'),
    len;

    // whenever we have to recompute selection, reapply all the conditions to
    // the selection.  This ensures that changing the conditions immediately
    // updates the selection.
    //
    // Note also if we don't allowSelection, we don't clear the old selection;
    // we just don't allow it to be changed.
    if ((value === undefined) || !this.get('allowsSelection')) { value = old; }

    len = (value && value.isEnumerable) ? value.get('length') : 0;

    // if we don't allow multiple selection
    if ((len > 1) && !this.get('allowsMultipleSelection')) {

      if (oldlen > 1) {
        value = SC.SelectionSet.create().addObject(old.get('firstObject')).freeze();
        len = 1;
      } else {
        value = old;
        len = oldlen;
      }
    }

    // if we don't allow empty selection, block that also, unless we
    // have nothing to select.  select first selectable item if necessary.
    if ((len === 0) && !this.get('allowsEmptySelection') && arrangedObjects && arrangedObjects.get('length') !== 0) {
      if (oldlen === 0) {
        value = this.get('firstSelectableObject');
        if (value) { value = SC.SelectionSet.create().addObject(value).freeze(); }
        else { value = SC.SelectionSet.EMPTY; }
        len = value.get('length');

      } else {
        value = old;
        len = oldlen;
      }
    }

    // if value is empty or is not enumerable, then use empty set
    if (len === 0) { value = SC.SelectionSet.EMPTY; }

    // always use a frozen copy...
    if(value !== old) value = value.frozenCopy();
    this._scsel_selection = value;

    return value;

  }.property('arrangedObjects', 'allowsEmptySelection', 'allowsMultipleSelection', 'allowsSelection').cacheable(),

  /**
    YES if the receiver currently has a non-zero selection.

    @property {Boolean}
  */
  hasSelection: function() {
    var sel = this.get('selection');
    return !! sel && (sel.get('length') > 0);
  }.property('selection').cacheable(),

  // ..........................................................
  // METHODS
  //
  /**
    Selects the passed objects in your content.  If you set "extend" to YES,
    then this will attempt to extend your selection as well.

    @param {SC.Enumerable} objects objects to select
    @param {Boolean} extend optionally set to YES to extend selection
    @returns {Object} receiver
  */
  selectObjects: function(objects, extend) {

    // handle passing an empty array
    if (!objects || objects.get('length') === 0) {
      if (!extend) { this.set('selection', SC.SelectionSet.EMPTY); }
      return this;
    }

    var sel = this.get('selection');
    if (extend && sel) { sel = sel.copy(); }
    else { sel = SC.SelectionSet.create(); }

    sel.addObjects(objects).freeze();
    this.set('selection', sel);
    return this;
  },

  /**
    Selects a single passed object in your content.  If you set "extend" to
    YES then this will attempt to extend your selection as well.

    @param {Object} object object to select
    @param {Boolean} extend optionally set to YES to extend selection
    @returns {Object} receiver
  */
  selectObject: function(object, extend) {
    if (object === null) {
      if (!extend) { this.set('selection', null); }
      return this;

    } else { return this.selectObjects([object], extend); }
  },

  /**
    Deselects the passed objects in your content.

    @param {SC.Enumerable} objects objects to select
    @returns {Object} receiver
  */
  deselectObjects: function(objects) {

    if (!objects || objects.get('length') === 0) { return this; } // nothing to do
    var sel = this.get('selection');
    if (!sel || sel.get('length') === 0) { return this; } // nothing to do
    // find index for each and remove it
    sel = sel.copy().removeObjects(objects).freeze();
    this.set('selection', sel.freeze());
    return this;
  },

  /**
    Deselects the passed object in your content.

    @param {SC.Object} object single object to select
    @returns {Object} receiver
  */
  deselectObject: function(object) {
    if (!object) { return this; } // nothing to do
    else { return this.deselectObjects([object]); }
  },

  /**
    Call this method whenever your source content changes to ensure the
    selection always remains up-to-date and valid.

    @returns {Object}
  */
  updateSelectionAfterContentChange: function() {
    var arrangedObjects = this.get('arrangedObjects');
    var selectionSet = this.get('selection');
    var allowsEmptySelection = this.get('allowsEmptySelection');
    var indexSet; // Selection index set for arranged objects

    // If we don't have any selection, there's nothing to update
    if (!selectionSet) { return this; }
    // Remove any selection set objects that are no longer in the content
    indexSet = selectionSet.indexSetForSource(arrangedObjects);
    if ((indexSet && (indexSet.get('length') !== selectionSet.get('length'))) || (!indexSet && (selectionSet.get('length') > 0))) { // then the selection content has changed
      selectionSet = selectionSet.copy().constrain(arrangedObjects).freeze();
      this.set('selection', selectionSet);
    }

    // Reselect an object if required (if content length > 0)
    if ((selectionSet.get('length') === 0) && arrangedObjects && (arrangedObjects.get('length') > 0) && !allowsEmptySelection) {
      this.selectObject(this.get('firstSelectableObject'), NO);
    }

    return this;
  }

};

/* >>>>>>>>>> BEGIN source/controllers/array.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('controllers/controller');
sc_require('mixins/selection_support');

/**
  @class

  An ArrayController provides a way for you to publish an array of objects
  for CollectionView or other controllers to work with.  To work with an
  ArrayController, set the content property to the array you want the
  controller to manage.  Then work directly with the controller object as if
  it were the array itself.

  When you want to display an array of objects in a CollectionView, bind the
  "arrangedObjects" of the array controller to the CollectionView's "content"
  property.  This will automatically display the array in the collection view.

  @extends SC.Controller
  @extends SC.Array
  @extends SC.SelectionSupport
  @author Charles Jolley
  @since SproutCore 1.0
*/
SC.ArrayController = SC.Controller.extend(SC.Array, SC.SelectionSupport,
/** @scope SC.ArrayController.prototype */ {

  // ..........................................................
  // PROPERTIES
  //

  /**
    The content array managed by this controller.

    You can set the content of the ArrayController to any object that
    implements SC.Array or SC.Enumerable.  If you set the content to an object
    that implements SC.Enumerable only, you must also set the orderBy property
    so that the ArrayController can order the enumerable for you.

    If you set the content to a non-enumerable and non-array object, then the
    ArrayController will wrap the item in an array in an attempt to normalize
    the result.

    @property {SC.Array}
  */
  content: null,

  /**
    Makes the array editable or not.  If this is set to NO, then any attempts
    at changing the array content itself will throw an exception.

    @property {Boolean}
  */
  isEditable: YES,

  /**
    Used to sort the array.

    If you set this property to a key name, array of key names, or a function,
    then then ArrayController will automatically reorder your content array
    to match the sort order.  (If you set a function, the function will be
    used to sort).

    Normally, you should only use this property if you set the content of the
    controller to an unordered enumerable such as SC.Set or SC.SelectionSet.
    In this case the orderBy property is required in order for the controller
    to property order the content for display.

    If you set the content to an array, it is usually best to maintain the
    array in the proper order that you want to display things rather than
    using this method to order the array since it requires an extra processing
    step.  You can use this orderBy property, however, for displaying smaller
    arrays of content.

    Note that you can only to use addObject() to insert new objects into an
    array that is ordered.  You cannot manually reorder or insert new objects
    into specific locations because the order is managed by this property
    instead.

    If you pass a function, it should be suitable for use in compare().

    @property {String|Array|Function}
  */
  orderBy: null,

  /**
    Set to YES if you want the controller to wrap non-enumerable content
    in an array and publish it.  Otherwise, it will treat single content like
    null content.

    @property {Boolean}
  */
  allowsSingleContent: YES,

  /**
    Set to YES if you want objects removed from the array to also be
    deleted.  This is a convenient way to manage lists of items owned
    by a parent record object.

    Note that even if this is set to NO, calling destroyObject() instead of
    removeObject() will still destroy the object in question as well as
    removing it from the parent array.

    @property {Boolean}
  */
  destroyOnRemoval: NO,

  /**
    Returns an SC.Array object suitable for use in a CollectionView.
    Depending on how you have your ArrayController configured, this property
    may be one of several different values.

    @property {SC.Array}
  */
  arrangedObjects: function() {
    return this;
  }.property().cacheable(),

  /**
    Computed property indicates whether or not the array controller can
    remove content.  You can delete content only if the content is not single
    content and isEditable is YES.

    @property {Boolean}
  */
  canRemoveContent: function() {
    var content = this.get('content'), ret;
    ret = !!content && this.get('isEditable') && this.get('hasContent');
    if (ret) {
      return !content.isEnumerable ||
             (SC.typeOf(content.removeObject) === SC.T_FUNCTION);
    } else return NO ;
  }.property('content', 'isEditable', 'hasContent'),

  /**
    Computed property indicates whether you can reorder content.  You can
    reorder content as long a the controller isEditable and the content is a
    real SC.Array-like object.  You cannot reorder content when orderBy is
    non-null.

    @property {Boolean}
  */
  canReorderContent: function() {
    var content = this.get('content'), ret;
    ret = !!content && this.get('isEditable') && !this.get('orderBy');
    return ret && !!content.isSCArray;
  }.property('content', 'isEditable', 'orderBy'),

  /**
    Computed property insides whether you can add content.  You can add
    content as long as the controller isEditable and the content is not a
    single object.

    Note that the only way to simply add object to an ArrayController is to
    use the addObject() or pushObject() methods.  All other methods imply
    reordering and will fail.

    @property {Boolean}
  */
  canAddContent: function() {
    var content = this.get('content'), ret ;
    ret = content && this.get('isEditable') && content.isEnumerable;
    if (ret) {
      return (SC.typeOf(content.addObject) === SC.T_FUNCTION) ||
             (SC.typeOf(content.pushObject) === SC.T_FUNCTION);
    } else return NO ;
  }.property('content', 'isEditable'),

  /**
    Set to YES if the controller has valid content that can be displayed,
    even an empty array.  Returns NO if the content is null or not enumerable
    and allowsSingleContent is NO.

    @property {Boolean}
  */
  hasContent: function() {
    var content = this.get('content');
    return !!content &&
           (!!content.isEnumerable || !!this.get('allowsSingleContent'));
  }.property('content', 'allowSingleContent'),

  /**
    Returns the current status property for the content.  If the content does
    not have a status property, returns SC.Record.READY.

    @property {Number}
  */
  status: function() {
    var content = this.get('content'),
        ret = content ? content.get('status') : null;
    return ret ? ret : SC.Record.READY;
  }.property().cacheable(),

  // ..........................................................
  // METHODS
  //

  /**
    Adds an object to the array.  If the content is ordered, this will add the
    object to the end of the content array.  The content is not ordered, the
    location depends on the implementation of the content.

    If the source content does not support adding an object, then this method
    will throw an exception.

    @param {Object} object the object to add
    @returns {SC.ArrayController} receiver
  */
  addObject: function(object) {
    if (!this.get('canAddContent')) { throw "%@ cannot add content".fmt(this); }

    var content = this.get('content');
    if (content.isSCArray) { content.pushObject(object); }
    else if (content.addObject) { content.addObject(object); }
    else { throw "%@.content does not support addObject".fmt(this); }

    return this;
  },

  /**
    Removes the passed object from the array.  If the underyling content
    is a single object, then this simply sets the content to null.  Otherwise
    it will call removeObject() on the content.

    Also, if destroyOnRemoval is YES, this will actually destroy the object.

    @param {Object} object the object to remove
    @returns {SC.ArrayController} receiver
  */
  removeObject: function(object) {
    if (!this.get('canRemoveContent')) {
      throw "%@ cannot remove content".fmt(this);
    }

    var content = this.get('content');
    if (content.isEnumerable) {
      content.removeObject(object);
    } else {
      this.set('content', null);
    }

    if (this.get('destroyOnRemoval') && object.destroy) { object.destroy(); }
    return this;
  },

  // ..........................................................
  // SC.ARRAY SUPPORT
  //

  /**
    Compute the length of the array based on the observable content

    @property {Number}
  */
  length: function() {
    var content = this._scac_observableContent();
    return content ? content.get('length') : 0;
  }.property().cacheable(),

  /** @private
    Returns the object at the specified index based on the observable content
  */
  objectAt: function(idx) {
    var content = this._scac_observableContent();
    return content ? content.objectAt(idx) : undefined ;
  },

  /** @private
    Forwards a replace on to the content, but only if reordering is allowed.
  */
  replace: function(start, amt, objects) {
    // check for various conditions before a replace is allowed
    if (!objects || objects.get('length')===0) {
      if (!this.get('canRemoveContent')) {
        throw "%@ cannot remove objects from the current content".fmt(this);
      }
    } else if (!this.get('canReorderContent')) {
      throw "%@ cannot add or reorder the current content".fmt(this);
    }

    // if we can do this, then just forward the change.  This should fire
    // updates back up the stack, updating rangeObservers, etc.
    var content = this.get('content'); // note: use content, not observable
    var objsToDestroy = [], i, objsLen;
    if (this.get('destroyOnRemoval')){
      for(i=0; i<amt; i++){
        objsToDestroy.push(content.objectAt(i+start));
      }
    }

    if (content) { content.replace(start, amt, objects); }

    for(i=0, objsLen = objsToDestroy.length; i<objsLen; i++){

      objsToDestroy[i].destroy();
    }
    objsToDestroy = null;

    return this;
  },

  indexOf: function(object, startAt) {
    var content = this._scac_observableContent();
    return content ? content.indexOf(object, startAt) : -1;
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this._scac_contentDidChange();
  },

  /** @private
    Cached observable content property.  Set to NO to indicate cache is
    invalid.
  */
  _scac_cached: NO,

  /**
    @private

    Returns the current array this controller is actually managing.  Usually
    this should be the same as the content property, but sometimes we need to
    generate something different because the content is not a regular array.

    Passing YES to the force parameter will force this value to be recomputed.

    @returns {SC.Array} observable or null
  */
  _scac_observableContent: function() {
    var ret = this._scac_cached;
    if (ret) { return ret; }

    var content = this.get('content'), func, len, order;

    // empty content
    if (SC.none(content)) { return (this._scac_cached = []); }

    // wrap non-enumerables
    if (!content.isEnumerable) {
      ret = this.get('allowsSingleContent') ? [content] : [];
      return (this._scac_cached = ret);
    }

    // no-wrap
    var orderBy = this.get('orderBy');
    if (!orderBy) {
      if (content.isSCArray) { return (this._scac_cached = content) ; }
      else { throw "%@.orderBy is required for unordered content".fmt(this); }
    }

    // all remaining enumerables must be sorted.

    // build array - then sort it
    var type = SC.typeOf(orderBy);

    if(type === SC.T_STRING) {
      orderBy = [orderBy];
    } else if(type === SC.T_FUNCTION) {
      func = orderBy;
    } else if(type !== SC.T_ARRAY) {
      throw "%@.orderBy must be Array, String, or Function".fmt(this);
    }

    // generate comparison function if needed - use orderBy
    func = func || function(a,b) {
      var status, key, match, descending;

      for(var i=0, l=orderBy.get('length'); i<l && !status; i++) {
        key = orderBy.objectAt(i);

        match = key.match(/^(ASC )?(DESC )?(.*)$/);
        key = match[3]; order = match[2] ? -1 : 1;

        if (a) { a = a.isObservable ? a.get(key) : a[key]; }
        if (b) { b = b.isObservable ? b.get(key) : b[key]; }

        status = SC.compare(a, b) * order;
      }

      return status ;
    };

    return (this._scac_cached = content.toArray().sort(func)) ;
  },

  propertyWillChange: function(key) {
    if (key === 'content') {
      this.arrayContentWillChange(0, this.get('length'), 0);
    } else {
      return arguments.callee.base.apply(this,arguments);
    }
  },

  _scac_arrayContentWillChange: function(start, removed, added) {
    this.arrayContentWillChange(start, removed, added);
    var removedObjects = this.slice(start, start+removed);
    this.teardownEnumerablePropertyChains(removedObjects);
  },

  _scac_arrayContentDidChange: function(start, removed, added) {
    this.arrayContentDidChange(start, removed, added);
    var addedObjects = this.slice(start, start+added);
    this._scac_cached = NO;
    this.setupEnumerablePropertyChains(addedObjects);
    this.updateSelectionAfterContentChange();
  },

  /** @private
    Whenever content changes, setup and teardown observers on the content
    as needed.
  */
  _scac_contentDidChange: function() {

    this._scac_cached = NO; // invalidate observable content

    var content     = this.get('content'),
        orders      = !!this.get('orderBy'),
        lastContent = this._scac_content,
        oldlen      = this._scac_length || 0,
        didChange   = this._scac_arrayContentDidChange,
        willChange  = this._scac_arrayContentWillChange,
        sfunc       = this._scac_contentStatusDidChange,
        efunc       = this._scac_enumerableDidChange,
        newlen;

    if (content === lastContent) { return this; } // nothing to do

    // teardown old observer
    if (lastContent) {
      if (lastContent.isSCArray) {
        lastContent.removeArrayObservers({
          target: this,
          didChange: didChange,
          willChange: willChange
        });
      } else if (lastContent.isEnumerable) {
        lastContent.removeObserver('[]', this, efunc);
      }

      lastContent.removeObserver('status', this, sfunc);

      this.teardownEnumerablePropertyChains(lastContent);
    }

    // save new cached values
    this._scac_cached = NO;
    this._scac_content = content ;

    // setup new observer
    // also, calculate new length.  do it manually instead of using
    // get(length) because we want to avoid computed an ordered array.
    if (content) {
      // Content is an enumerable, so listen for changes to its
      // content, and get its length.
      if (content.isSCArray) {
        content.addArrayObservers({
          target: this,
          didChange: didChange,
          willChange: willChange
        });

        newlen = content.get('length');
      } else if (content.isEnumerable) {
        content.addObserver('[]', this, efunc);
        newlen = content.get('length');
      } else {
        // Assume that someone has set a non-enumerable as the content, and
        // treat it as the sole member of an array.
        newlen = 1;
      }

      // Observer for changes to the status property, in case this is an
      // SC.Record or SC.RecordArray.
      content.addObserver('status', this, sfunc);

      this.setupEnumerablePropertyChains(content);
    } else {
      newlen = SC.none(content) ? 0 : 1;
    }

    // finally, notify enumerable content has changed.
    this._scac_length = newlen;
    this._scac_contentStatusDidChange();

    this.arrayContentDidChange(0, 0, newlen);
    this.updateSelectionAfterContentChange();
  }.observes('content'),

  /** @private
    Whenever enumerable content changes, need to regenerate the
    observableContent and notify that the range has changed.

    This is called whenever the content enumerable changes or whenever orderBy
    changes.
  */
  _scac_enumerableDidChange: function() {
    var content = this.get('content'), // use content directly
        newlen  = content ? content.get('length') : 0,
        oldlen  = this._scac_length;

    this._scac_length = newlen;
    this.beginPropertyChanges();
    this._scac_cached = NO; // invalidate
    // If this is an unordered enumerable, we have no way
    // of knowing which indices changed. Instead, we just
    // invalidate the whole array.
    this.arrayContentDidChange(0, oldlen, newlen);
    this.endPropertyChanges();
    this.updateSelectionAfterContentChange();
  }.observes('orderBy'),

  /** @private
    Whenver the content "status" property changes, relay out.
  */
  _scac_contentStatusDidChange: function() {
    this.notifyPropertyChange('status');
  }

});

/* >>>>>>>>>> BEGIN source/controllers/object.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('controllers/controller') ;

/** @class

  An ObjectController gives you a simple way to manage the editing state of
  an object.  You can use an ObjectController instance as a "proxy" for your
  model objects.
  
  Any properties you get or set on the object controller, will be passed 
  through to its content object.  This allows you to setup bindings to your
  object controller one time for all of your views and then swap out the 
  content as needed.
  
  ## Working with Arrays
  
  An ObjectController can accept both arrays and single objects as content.  
  If the content is an array, the ObjectController will do its best to treat 
  the array as a single object.  For example, if you set the content of an
  ObjectController to an array of Contact records and then call:
  
      contactController.get('name');

  The controller will check the name property of each Contact in the array.  
  If the value of the property for each Contact is the same, that value will 
  be returned.  If the any values are different, then an array will be 
  returned with the values from each Contact in them. 
  
  Most SproutCore views can work with both arrays and single content, which 
  means that most of the time, you can simply hook up your views and this will
  work.
  
  If you would prefer to make sure that your ObjectController is always 
  working with a single object and you are using bindings, you can always 
  setup your bindings so that they will convert the content to a single object 
  like so:
  
      contentBinding: SC.Binding.single('MyApp.listController.selection') ;

  This will ensure that your content property is always a single object 
  instead of an array.
  
  @extends SC.Controller
  @since SproutCore 1.0
*/
SC.ObjectController = SC.Controller.extend(
/** @scope SC.ObjectController.prototype */ {

  // ..........................................................
  // PROPERTIES
  // 
  
  /**
    Set to the object you want this controller to manage.  The object should
    usually be a single value; not an array or enumerable.  If you do supply
    an array or enumerable with a single item in it, the ObjectController
    will manage that single item.

    Usually your content object should implement the SC.Observable mixin, but
    this is not required.  All SC.Object-based objects support SC.Observable
    
    @property {Object}
  */
  content: null,

  /**
    If YES, then setting the content to an enumerable or an array with more 
    than one item will cause the Controller to attempt to treat the array as
    a single object.  Use of get(), for example, will get every property on
    the enumerable and return it.  set() will set the property on every item
    in the enumerable. 
    
    If NO, then setting content to an enumerable with multiple items will be
    treated like setting a null value.  hasContent will be NO.
    
    @property {Boolean}
  */
  allowsMultipleContent: NO,

  /**
    Becomes YES whenever this object is managing content.  Usually this means
    the content property contains a single object or an array or enumerable
    with a single item.  Array's or enumerables with multiple items will 
    normally make this property NO unless allowsMultipleContent is YES.
    
    @property {Boolean}
  */
  hasContent: function() {
    return !SC.none(this.get('observableContent'));
  }.property('observableContent'),
  
  /**
    Makes a controller editable or not editable.  The SC.Controller class 
    itself does not do anything with this property but subclasses will 
    respect it when modifying content.
    
    @property {Boolean}
  */
  isEditable: YES,
  
  /**
    Primarily for internal use.  Normally you should not access this property 
    directly.  
    
    Returns the actual observable object proxied by this controller.  Usually 
    this property will mirror the content property.  In some cases - notably 
    when setting content to an enumerable, this may return a different object.
    
    Note that if you set the content to an enumerable which itself contains
    enumerables and allowsMultipleContent is NO, this will become null.
    
    @property {Object}
  */
  observableContent: function() {
    var content = this.get('content'),
        len, allowsMultiple;
        
    // if enumerable, extract the first item or possibly become null
    if (content && content.isEnumerable) {
      len = content.get('length');
      allowsMultiple = this.get('allowsMultipleContent');
      
      if (len === 1) content = content.firstObject();
      else if (len===0 || !allowsMultiple) content = null;
      
      // if we got some new content, it better not be enum also...
      if (content && !allowsMultiple && content.isEnumerable) content=null;
    }
    
    return content;
  }.property('content', 'allowsMultipleContent').cacheable(),

  // ..........................................................
  // METHODS
  // 

  /**
    Override this method to destroy the selected object.
    
    The default just passes this call onto the content object if it supports
    it, and then sets the content to null.  
    
    Unlike most calls to destroy() this will not actually destroy the 
    controller itself; only the the content.  You continue to use the 
    controller by setting the content to a new value.
    
    @returns {SC.ObjectController} receiver
  */
  destroy: function() {
    var content = this.get('observableContent') ;
    if (content && SC.typeOf(content.destroy) === SC.T_FUNCTION) {
      content.destroy();
    } 
    this.set('content', null) ;  
    return this;
  },
  
  /**
    Invoked whenever any property on the content object changes.  

    The default implementation will simply notify any observers that the 
    property has changed.  You can override this method if you need to do 
    some custom work when the content property changes.
    
    If you have set the content property to an enumerable with multiple 
    objects and you set allowsMultipleContent to YES, this method will be 
    called anytime any property in the set changes.

    If all properties have changed on the content or if the content itself 
    has changed, this method will be called with a key of "*".
    
    @param {Object} target the content object
    @param {String} key the property that changes
    @returns {void}
  */
  contentPropertyDidChange: function(target, key) {
    if (key === '*') this.allPropertiesDidChange();
    else this.notifyPropertyChange(key);
  },
  
  /**
    Called whenver you try to get/set an unknown property.  The default 
    implementation will pass through to the underlying content object but 
    you can override this method to do some other kind of processing if 
    needed.
    
    @property {String} key key being retrieved
    @property {Object} value value to set or undefined if reading only
    @returns {Object} property value
  */
  unknownProperty: function(key,value) {
    
    // avoid circular references
    if (key==='content') {
      if (value !== undefined) this.content = value;
      return this.content;
    }
    
    // for all other keys, just pass through to the observable object if 
    // there is one.  Use getEach() and setEach() on enumerable objects.
    var content = this.get('observableContent'), loc, cur, isSame;
    if (content===null || content===undefined) return undefined; // empty

    // getter...
    if (value === undefined) {
      if (content.isEnumerable) {
        value = content.getEach(key);

        // iterate over array to see if all values are the same. if so, then
        // just return that value
        loc = value.get('length');
        if (loc>0) {
          isSame = YES;
          cur = value.objectAt(0);
          while((--loc > 0) && isSame) {
            if (cur !== value.objectAt(loc)) isSame = NO ;
          }
          if (isSame) value = cur;
        } else value = undefined; // empty array.

      } else value = (content.isObservable) ? content.get(key) : content[key];
      
    // setter
    } else {
      if (!this.get('isEditable')) {
        throw "%@.%@ is not editable".fmt(this,key);
      }
      
      if (content.isEnumerable) content.setEach(key, value);
      else if (content.isObservable) content.set(key, value);
      else content[key] = value;
    }
    
    return value;
  },
  
  // ...............................
  // INTERNAL SUPPORT
  //

  /** @private - setup observer on init if needed. */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    if (this.get('content')) this._scoc_contentDidChange();
    if (this.get('observableContent')) this._scoc_observableContentDidChange();
  },

  _scoc_contentDidChange: function () {
    var last = this._scoc_content,
        cur  = this.get('content');
        
    if (last !== cur) {
      this._scoc_content = cur;
      var func = this._scoc_enumerableContentDidChange;
      if (last && last.isEnumerable) {
        //console.log('no longer observing [] on last');
        last.removeObserver('[]', this, func);
      }
      if (cur && cur.isEnumerable) {
        //console.log('observing [] on cur');
        cur.addObserver('[]', this, func);
      }
    }
  }.observes("content"),
  
  /**  @private
    
    Called whenever the observable content property changes.  This will setup
    observers on the content if needed.
  */
  _scoc_observableContentDidChange: function() {
    var last = this._scoc_observableContent,
        cur  = this.get('observableContent'),
        func = this.contentPropertyDidChange,
        efunc= this._scoc_enumerableContentDidChange;

    if (last === cur) return this; // nothing to do
    //console.log('observableContentDidChange');
    
    this._scoc_observableContent = cur; // save old content
    
    // stop observing last item -- if enumerable stop observing set
    if (last) {
      if (last.isEnumerable) last.removeObserver('[]', this, efunc);
      else if (last.isObservable) last.removeObserver('*', this, func);
    }
    
    if (cur) {
      if (cur.isEnumerable) cur.addObserver('[]', this, efunc);
      else if (cur.isObservable) cur.addObserver('*', this, func);
    }

    // notify!
    if ((last && last.isEnumerable) || (cur && cur.isEnumerable)) {
      this._scoc_enumerableContentDidChange();
    } else this.contentPropertyDidChange(cur, '*');

  }.observes("observableContent"),
  
  /** @private
    Called when observed enumerable content has changed.  This will teardown
    and setup observers on the enumerable content items and then calls 
    contentPropertyDidChange().  This method may be called even if the new
    'cur' is not enumerable but the last content was enumerable.
  */
  _scoc_enumerableContentDidChange: function() {
    var cur  = this.get('observableContent'),
        set  = this._scoc_observableContentItems,
        func = this.contentPropertyDidChange;
    
    // stop observing each old item
    if (set) {
      set.forEach(function(item) {
        if (item.isObservable) item.removeObserver('*', this, func);
      }, this);
      set.clear();
    }
    
    // start observing new items if needed
    if (cur && cur.isEnumerable) {
      if (!set) set = SC.Set.create();
      cur.forEach(function(item) {
        if (set.contains(item)) return ; // nothing to do
        set.add(item);
        if (item.isObservable) item.addObserver('*', this, func);
      }, this); 
    } else set = null;
    
    this._scoc_observableContentItems = set; // save for later cleanup
  
    // notify
    this.contentPropertyDidChange(cur, '*');
    return this ;
  }
        
}) ;

/* >>>>>>>>>> BEGIN source/ext/handlebars.js */
/**
  Prepares the Handlebars templating library for use inside SproutCore's view
  system.

  The SC.Handlebars object is the standard Handlebars library, extended to use
  SproutCore's get() method instead of direct property access, which allows
  computed properties to be used inside templates.

  To use SC.Handlebars, call SC.Handlebars.compile().  This will return a
  function that you can call multiple times, with a context object as the first
  parameter:

      var template = SC.Handlebars.compile("my {{cool}} template");
      var result = template({
        cool: "awesome"
      });

      console.log(result); // prints "my awesome template"

  Note that you won't usually need to use SC.Handlebars yourself. Instead, use
  SC.TemplateView, which takes care of integration into the view layer for you.
*/

SC.Handlebars = {};

SC.Handlebars.Compiler = function() {};
SC.Handlebars.Compiler.prototype = SC.beget(Handlebars.Compiler.prototype);
SC.Handlebars.Compiler.prototype.compiler = SC.Handlebars.Compiler;

SC.Handlebars.JavaScriptCompiler = function() {};
SC.Handlebars.JavaScriptCompiler.prototype = SC.beget(Handlebars.JavaScriptCompiler.prototype);
SC.Handlebars.JavaScriptCompiler.prototype.compiler = SC.Handlebars.JavaScriptCompiler;

SC.Handlebars.JavaScriptCompiler.prototype.nameLookup = function(parent, name, type) {
  if (type === 'context') {
    return "SC.get(" + parent + ", " + this.quotedString(name) + ");";
  } else {
    return Handlebars.JavaScriptCompiler.prototype.nameLookup.call(this, parent, name, type);
  }
};

SC.Handlebars.Compiler.prototype.mustache = function(mustache) {
  if (mustache.params.length || mustache.hash) {
    return Handlebars.Compiler.prototype.mustache.call(this, mustache);
  } else {
    var id = new Handlebars.AST.IdNode(['bind']);
    mustache = new Handlebars.AST.MustacheNode([id].concat([mustache.id]), mustache.hash, !mustache.escaped);
    return Handlebars.Compiler.prototype.mustache.call(this, mustache);
  }
};

SC.Handlebars.compile = function(string) {
  var ast = Handlebars.parse(string);
  var environment = new SC.Handlebars.Compiler().compile(ast, {data: true, stringParams: true});
  var ret = new SC.Handlebars.JavaScriptCompiler().compile(environment, {data: true, stringParams: true});
  ret.rawTemplate = string;
  return ret;
};

/**
  Registers a helper in Handlebars that will be called if no property with the
  given name can be found on the current context object, and no helper with
  that name is registered.

  This throws an exception with a more helpful error message so the user can
  track down where the problem is happening.
*/
Handlebars.registerHelper('helperMissing', function(path, options) {
  var error;

  error = "%@ Handlebars error: Could not find property '%@' on object %@.";
  throw error.fmt(options.data.view, path, this);
});

/* >>>>>>>>>> BEGIN source/ext/handlebars/bind.js */
sc_require('ext/handlebars');

/**
  Adds the `bind`, `bindAttr`, and `boundIf` helpers to Handlebars.

  # bind

  `bind` can be used to display a value, then update that value if it changes.
  For example, if you wanted to print the `title` property of `content`:

      {{bind "content.title"}}

  This will return the `title` property as a string, then create a new observer
  at the specified path. If it changes, it will update the value in DOM. Note
  that this will only work with SC.Object and subclasses, since it relies on
  SproutCore's KVO system.

  # bindAttr

  `bindAttr` allows you to create a binding between DOM element attributes and
  SproutCore objects. For example:

      <img {{bindAttr src="imageUrl" alt="imageTitle"}}>

  # boundIf

  Use the `boundIf` helper to create a conditional that re-evaluates whenever
  the bound value changes.

      {{#boundIf "content.shouldDisplayTitle"}}
        {{content.title}}
      {{/boundIf}}
*/
(function() {
  // Binds a property into the DOM. This will create a hook in DOM that the
  // KVO system will look for and upate if the property changes.
  var bind = function(property, options, preserveContext, shouldDisplay) {
    var data    = options.data,
        fn      = options.fn,
        inverse = options.inverse,
        view    = data.view;

    // Set up observers for observable objects
    if (this.isObservable) {
      // Create the view that will wrap the output of this template/property and
      // add it to the nearest view's childViews array.
      // See the documentation of SC._BindableSpan for more.
      var bindView = view.createChildView(SC._BindableSpan, {
        preserveContext: preserveContext,
        shouldDisplayFunc: shouldDisplay,
        displayTemplate: fn,
        inverseTemplate: inverse,
        property: property,
        previousContext: this,
        tagName: (options.hash.tagName || "span")
      });

      var observer, invoker;

      view.get('childViews').push(bindView);

      observer = function() {
        if (bindView.get('layer')) {
          bindView.rerender();
        } else {
          // If no layer can be found, we can assume somewhere
          // above it has been re-rendered, so remove the
          // observer.
          this.removeObserver(property, invoker);
        }
      };

      invoker = function() {
        this.invokeOnce(observer);
      };

      // Observe the given property on the context and
      // tells the SC._BindableSpan to re-render.
      this.addObserver(property, invoker);

      var context = bindView.renderContext(bindView.get('tagName'));
      bindView.renderToContext(context);
      return new Handlebars.SafeString(context.join());
    } else {
      // The object is not observable, so just render it out and
      // be done with it.
      return SC.getPath(this, property);
    }
  };

  Handlebars.registerHelper('bind', function(property, fn) {
    return bind.call(this, property, fn, false, function(result) { return !SC.none(result); } );
  });

  Handlebars.registerHelper('boundIf', function(property, fn) {
    if(fn) {
      return bind.call(this, property, fn, true, function(result) {
        if (SC.typeOf(result) === SC.T_ARRAY) {
          if (result.length !== 0) { return true; }
          return false;
        } else {
          return !!result;
        }
      } );
    } else {
      throw "Cannot use boundIf helper without a block.";
    }
  });
})();

Handlebars.registerHelper('with', function(context, options) {
  return Handlebars.helpers.bind.call(options.contexts[0], context, options);
});

Handlebars.registerHelper('if', function(context, options) {
  return Handlebars.helpers.boundIf.call(options.contexts[0], context, options);
});

Handlebars.registerHelper('unless', function(context, options) {
  var fn = options.fn, inverse = options.inverse;

  options.fn = inverse;
  options.inverse = fn;

  return Handlebars.helpers.boundIf.call(options.contexts[0], context, options);
});

Handlebars.registerHelper('bindAttr', function(options) {
  var attrs = options.hash;
  var view = options.data.view;
  var ret = [];

  // Generate a unique id for this element. This will be added as a
  // data attribute to the element so it can be looked up when
  // the bound property changes.
  var dataId = jQuery.uuid++;

  // Handle classes differently, as we can bind multiple classes
  var classBindings = attrs['class'];
  if (classBindings != null) {
    var classResults = SC.Handlebars.bindClasses(this, classBindings, view, dataId);
    ret.push('class="'+classResults.join(' ')+'"');
    delete attrs['class'];
  }

  var attrKeys = SC.keys(attrs);

  // For each attribute passed, create an observer and emit the
  // current value of the property as an attribute.
  attrKeys.forEach(function(attr) {
    var property = attrs[attr];
    var value = this.getPath(property);

    var observer, invoker;

    observer = function observer() {
      var result = this.getPath(property);
      var elem = view.$("[data-handlebars-id='" + dataId + "']");

      // If we aren't able to find the element, it means the element
      // to which we were bound has been removed from the view.
      // In that case, we can assume the template has been re-rendered
      // and we need to clean up the observer.
      if (elem.length === 0) {
        this.removeObserver(property, invoker);
        return;
      }

      // A false result will remove the attribute from the element. This is
      // to support attributes such as disabled, whose presence is meaningful.
      if (result === NO) {
        elem.removeAttr(attr);

      // Likewise, a true result will set the attribute's name as the value.
      } else if (result === YES) {
        elem.attr(attr, attr);

      } else {
        elem.attr(attr, result);
      }
    };

    invoker = function() {
      this.invokeOnce(observer);
    };

    // Add an observer to the view for when the property changes.
    // When the observer fires, find the element using the
    // unique data id and update the attribute to the new value.
    this.addObserver(property, invoker);

    // Use the attribute's name as the value when it is YES
    if (value === YES) {
      value = attr;
    }

    // Do not add the attribute when the value is false
    if (value !== NO) {
      // Return the current value, in the form src="foo.jpg"
      ret.push(attr+'="'+value+'"');
    }
  }, this);

  // Add the unique identifier
  ret.push('data-handlebars-id="'+dataId+'"');
  return ret.join(' ');
});

/**
  Helper that, given a space-separated string of property paths and a context,
  returns an array of class names. Calling this method also has the side effect
  of setting up observers at those property paths, such that if they change,
  the correct class name will be reapplied to the DOM element.

  For example, if you pass the string "fooBar", it will first look up the "fooBar"
  value of the context. If that value is YES, it will add the "foo-bar" class
  to the current element (i.e., the dasherized form of "fooBar"). If the value
  is a string, it will add that string as the class. Otherwise, it will not add
  any new class name.

  @param {SC.Object} context The context from which to lookup properties
  @param {String} classBindings A string, space-separated, of class bindings to use
  @param {SC.View} view The view in which observers should look for the element to update
  @param {String} id Optional id use to lookup elements

  @returns {Array} An array of class names to add
*/
SC.Handlebars.bindClasses = function(context, classBindings, view, id) {
  var ret = [], newClass, value, elem;

  // Helper method to retrieve the property from the context and
  // determine which class string to return, based on whether it is
  // a Boolean or not.
  var classStringForProperty = function(property) {
    var val = context.getPath(property);

    // If value is a Boolean and true, return the dasherized property
    // name.
    if (val === YES) {
      // Normalize property path to be suitable for use
      // as a class name. For exaple, content.foo.barBaz
      // becomes bar-baz.
      return SC.String.dasherize(property.split('.').get('lastObject'));

    // If the value is not NO, undefined, or null, return the current
    // value of the property.
    } else if (val !== NO && val !== undefined && val !== null) {
      return val;

    // Nothing to display. Return null so that the old class is removed
    // but no new class is added.
    } else {
      return null;
    }
  };

  // For each property passed, loop through and setup
  // an observer.
  classBindings.split(' ').forEach(function(property) {

    // Variable in which the old class value is saved. The observer function
    // closes over this variable, so it knows which string to remove when
    // the property changes.
    var oldClass;

    var observer, invoker;

    // Set up an observer on the context. If the property changes, toggle the
    // class name.
    observer = function() {
      // Get the current value of the property
      newClass = classStringForProperty(property);
      elem = id ? view.$("[data-handlebars-id='" + id + "']") : view.$();

      // If we can't find the element anymore, a parent template has been
      // re-rendered and we've been nuked. Remove the observer.
      if (elem.length === 0) {
        context.removeObserver(property, invoker);
      } else {
        // If we had previously added a class to the element, remove it.
        if (oldClass) {
          elem.removeClass(oldClass);
        }

        // If necessary, add a new class. Make sure we keep track of it so
        // it can be removed in the future.
        if (newClass) {
          elem.addClass(newClass);
          oldClass = newClass;
        } else {
          oldClass = null;
        }
      }
    };

    invoker = function() {
      this.invokeOnce(observer);
    };

    context.addObserver(property, invoker);

    // We've already setup the observer; now we just need to figure out the correct
    // behavior right now on the first pass through.
    value = classStringForProperty(property);

    if (value) {
      ret.push(value);

      // Make sure we save the current value so that it can be removed if the observer
      // fires.
      oldClass = value;
    }
  });

  return ret;
};

/* >>>>>>>>>> BEGIN source/ext/handlebars/collection.js */
/*globals Handlebars */

sc_require('ext/handlebars');

Handlebars.registerHelper('collection', function(path, options) {
  var fn = options.fn;
  var data = options.data;
  var inverse = options.inverse;
  var hash = options.hash;
  var collectionClass, collectionObject;

  collectionClass = path ? SC.getPath(this, path) || SC.getPath(path) :
    SC.TemplateCollectionView;

  
  if (!collectionClass) {
    throw "%@ #collection: Could not find %@".fmt(data.view, path);
  }
  

  var extensions = {};

  if (hash) {
    var itemHash = {}, match;

    for (var prop in hash) {
      if (hash.hasOwnProperty(prop)) {
        match = prop.match(/^item(.)(.*)$/);

        if(match) {
          itemHash[match[1].toLowerCase() + match[2]] = hash[prop];
          delete hash[prop];
        }
      }
    }

    extensions = SC.clone(hash);
    extensions.itemViewOptions = itemHash;
  }

  if (fn) { extensions.itemViewTemplate = fn; }
  if (inverse) { extensions.inverseTemplate = inverse; }

  if(collectionClass.isClass) {
    collectionObject = collectionClass.extend(extensions);
  } else {
    collectionObject = SC.mixin(collectionClass, extensions);
  }

  options.fn = function() { return ""; };

  return Handlebars.helpers.view.call(this, collectionObject, options);
});

Handlebars.registerHelper('each', function(path, options) {
  options.hash.contentBinding = SC.Binding.from('*'+path, this).oneWay();
  options.hash.itemContextProperty = 'content';
  return Handlebars.helpers.collection.call(this, null, options);
});

/* >>>>>>>>>> BEGIN source/ext/handlebars/localization.js */
sc_require('ext/handlebars');

Handlebars.registerHelper('loc', function(property) {
  return SC.String.loc(property);
});

/* >>>>>>>>>> BEGIN source/ext/handlebars/view.js */
sc_require('ext/handlebars');

SC.Handlebars.ViewHelper = SC.Object.create({
  helper: function(thisContext, path, options) {
    var inverse = options.inverse;
    var data = options.data;
    var view = data.view;
    var fn = options.fn;
    var hash = options.hash;

    var newView;
    if (path.isClass || path.isObject) {
      newView = path;
      if (!newView) {
        throw "Null or undefined object was passed to the #view helper. Did you mean to pass a property path string?";
      }
    } else {
      // Path is relative, look it up with this view as the root
      if (path.charAt(0) === '.') {
        newView = SC.objectForPropertyPath(path.slice(1), view);
      } else {
        // Path is absolute, look up path on global (window) object
        newView = SC.getPath(thisContext, path);
        if (!newView) {
          newView = SC.getPath(path);
        }
      }
      if (!newView) { throw "Unable to find view at path '" + path + "'"; }
    }

    if (hash.id) { hash.layerId = hash.id; }

    var contextOptions = {
      'id': hash.id,
      'class': hash['class'],
      'classBinding': hash.classBinding
    };
    delete hash.id;
    delete hash['class'];
    delete hash.classBinding;

    if (newView.isClass) {
      newView = newView.extend(hash);
    } else {
      SC.mixin(newView, hash);
    }

    var currentView = data.view;

    var childViews = currentView.get('childViews');
    var childView = currentView.createChildView(newView);

    // Set the template of the view to the passed block if we got one
    if (fn) { childView.template = fn; }


    childViews.pushObject(childView);

    var context = SC.RenderContext(childView.get('tagName'));

    // Add id and class names passed to view helper
    this.applyAttributes(contextOptions, childView, context);

    childView.applyAttributesToContext(context);
    // tomdale wants to make SproutCore slow
    childView.render(context, YES);

    return new Handlebars.SafeString(context.join());
  },

  applyAttributes: function(options, childView, context) {
    var id = options.id;
    var classNames = options['class'];

    if (classNames) {
      context.addClass(classNames.split(' '));
    }

    if (id) {
      childView.set('layerId', id);
      context.id(id);
    }

    var classBindings = options.classBinding;
    if (classBindings) {
      SC.Handlebars.bindClasses(childView, classBindings, childView).forEach(function(className) {
        context.setClass(className, YES);
      });
    }
  }
});


Handlebars.registerHelper('view', function(path, options) {
  return SC.Handlebars.ViewHelper.helper(this, path, options);
});

/* >>>>>>>>>> BEGIN source/system/browser.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.mixin(SC.browser,
/** @scope SC.browser */ {

  /**
    Pass any number of arguments, and this will check them against the browser
    version split on ".".  If any of them are not equal, return the inequality.
    If as many arguments as were passed in are equal, return 0.  If something
    is NaN, return 0.
  */
  compareVersion: function () {
    if (this._versionSplit === undefined) {
      var coerce = function (part) {
        return Number(part.match(/^[0-9]+/));
      };
      this._versionSplit = SC.A(this.version.split('.')).map(coerce);
    }

    var tests = SC.A(arguments).map(Number);
    for (var i = 0; i < tests.length; i++) {
      var check = this._versionSplit[i] - tests[i];
      if (isNaN(check)) return 0;
      if (check !== 0) return check;
    }
    
    return 0;
  }

});


/* >>>>>>>>>> BEGIN source/system/builder.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  The Builder class makes it easy to create new chained-builder API's such as
  those provided by CoreQuery or jQuery.  Usually you will not create a new
  builder yourself, but you will often use instances of the Builder object to
  configure parts of the UI such as menus and views.
  
  # Anatomy of a Builder
  
  You can create a new Builder much like you would any other class in 
  SproutCore.  For example, you could create a new CoreQuery-type object with
  the following:
  
      SC.$ = SC.Builder.create({
        // methods you can call go here.
      });
  
  Unlike most classes in SproutCore, Builder objects are actually functions 
  that you can call to create new instances.  In the example above, to use 
  the builder, you must call it like a function:
  
      buildit = SC.$();
  
  If you define an init() method on a builder, it will be invoked wheneve the
  builder is called as a function, including any passed params.  Your init()
  method MUST return this, unlike regular SC objects.  i.e.
  
      SC.$ = SC.Builder.create({
        init: function(args) { 
          this.args = SC.A(args);
          return this;
        }
      });
      
      buildit = SC.$('a', 'b');
      buildit.args => ['a','b']
  
  In addition to defining a function like this, all builder objects also have
  an 'fn' property that contains a hash of all of the helper methods defined
  on the builder function.  Once a builder has been created, you can add 
  addition "plugins" for the builder by simply adding new methods to the
  fn property.
  
  # Writing Builder Functions
  
  All builders share a few things in common:
  
   * when a new builder is created, it's init() method will be called.  The default version of this method simply copies the passed parameters into the builder as content, but you can override this with anything you want.
   * the content the builder works on is stored as indexed properties (i.e. 0,1,2,3, like an array).  The builder should also have a length property if you want it treated like an array.
   *- Builders also maintain a stack of previous builder instances which you can pop off at any time.
  
  To get content back out of a builder once you are ready with it, you can
  call the method done().  This will return an array or a single object, if 
  the builder only works on a single item.
  
  You should write your methods using the getEach() iterator to work on your
  member objects.  All builders implement SC.Enumerable in the fn() method.

      CoreQuery = SC.Builder.create({
        ...
      }) ;
      
      CoreQuery = new SC.Builder(properties) {
        ...
      } ;
      
      CoreQuery2 = CoreQuery.extend() {
      }
  
  @constructor
*/
SC.Builder = function (props) { return SC.Builder.create(props); };

/** 
  Create a new builder object, applying the passed properties to the 
  builder's fn property hash.
  
  @param {Hash} properties
  @returns {SC.Builder}
*/
SC.Builder.create = function create(props) { 
  
  // generate new fn with built-in properties and copy props
  var fn = SC.mixin(SC.beget(this.fn), props||{}) ;
  if (props.hasOwnProperty('toString')) fn.toString = props.toString;
  
  // generate new constructor and hook in the fn
  var construct = function() {
    var ret = SC.beget(fn); // NOTE: using closure here...
    
    // the defaultClass is usually this for this constructor. 
    // e.g. SC.View.build() -> this = SC.View
    ret.defaultClass = this ;
    ret.constructor = construct ;

    // now init the builder object.
    return ret.init.apply(ret, arguments) ;
  } ;
  construct.fn = construct.prototype = fn ;

  // the create() method can be used to extend a new builder.
  // eg. SC.View.buildCustom = SC.View.build.extend({ ...props... })
  construct.extend = SC.Builder.create ;
  construct.mixin = SC.Builder.mixin ;
  
  return construct; // return new constructor
} ;

SC.Builder.mixin = function() {
  var len = arguments.length, idx;
  for(idx=0;idx<len;idx++) SC.mixin(this, arguments[idx]);
  return this ;
};

/** This is the default set of helper methods defined for new builders. */
SC.Builder.fn = {

  /** 
    Default init method for builders.  This method accepts either a single
    content object or an array of content objects and copies them onto the 
    receiver.  You can override this to provide any kind of init behavior 
    that you want.  Any parameters passed to the builder method will be 
    forwarded to your init method.
    
    @returns {SC.Builder} receiver
  */
  init: function(content) {
    if (content !== undefined) {
      if (SC.typeOf(content) === SC.T_ARRAY) {
        var loc=content.length;
        while(--loc >= 0) {
          this[loc] = content.objectAt ? content.objectAt(loc) : content[loc];
        }
        this.length = content.length ;
      } else {
        this[0] = content; this.length=1;
      }
    }
    return this ;
  },
  
  /** Return the number of elements in the matched set. */
  size: function() { return this.length; },
  
  /** 
    Take an array of elements and push it onto the stack (making it the
    new matched set.)  The receiver will be saved so it can be popped later.
    
    @param {Object|Array} content
    @returns {SC.Builder} new isntance
  */
  pushStack: function() {
    // Build a new CoreQuery matched element set
    var ret = this.constructor.apply(this,arguments);

    // Add the old object onto the stack (as a reference)
    ret.prevObject = this;

    // Return the newly-formed element set
    return ret;
  },

  /**
    Returns the previous object on the stack so you can continue with that
    transform.  If there is no previous item on the stack, an empty set will
    be returned.
  */
  end: function() { 
    return this.prevObject || this.constructor(); 
  },
  
  // toString describes the builder
  toString: function() { 
    return "%@$(%@)".fmt(this.defaultClass.toString(), 
      SC.A(this).invoke('toString').join(',')); 
  },
  
  /** You can enhance the fn using this mixin method. */
  mixin: SC.Builder.mixin
  
};

// Apply SC.Enumerable.  Whenever possible we want to use the Array version
// because it might be native code.
(function() {
  var enumerable = SC.Enumerable, fn = SC.Builder.fn, key, value ;
  for(key in enumerable) {
    if (!enumerable.hasOwnProperty(key)) continue ;
    value = Array.prototype[key] || enumerable[key];
    fn[key] = value ;
  }
})();




/* >>>>>>>>>> BEGIN source/system/core_query.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/builder') ;

// Alias jQuery as SC.$ and SC.CoreQuery for compatibility
SC.$ = SC.CoreQuery = jQuery ;

// Add some plugins to SC.$. jQuery will get these also. -- test in system/core_query/additions
SC.mixin(SC.$.fn, /** @scope SC.$.prototype */ {

  isCoreQuery: YES, // walk like a duck

  /** @private - better loggin */
  toString: function() {
    var values = [],
        len = this.length, idx=0;
    for(idx=0;idx<len;idx++) {
      values[idx] = '%@: %@'.fmt(idx, this[idx] ? this[idx].toString() : '(null)');
    }
    return "<$:%@>(%@)".fmt(SC.guidFor(this),values.join(' , '));
  },

  /**
    Returns YES if all member elements are visible.  This is provided as a
    common test since CoreQuery does not support filtering by
    psuedo-selector.
  */
  isVisible: function() {
    return Array.prototype.every.call(this, function(elem){
      return SC.$.isVisible(elem);
    });
  },

  /**
    Attempts to find the views managing the passed DOM elements and returns
    them.   This will start with the matched element and walk up the DOM until
    it finds an element managed by a view.

    @returns {Array} array of views or null.
  */
  view: function() {
    return this.map(function() {
      var ret=null, guidKey = SC.viewKey, dom = this, value;
      while(!ret && dom && (dom !== document)) {
        if (dom.nodeType===1 && (value = dom.getAttribute('id'))) { ret = SC.View.views[value] ; }
        dom = dom.parentNode;
      }
      dom = null;
      return ret ;
    });
  },

  /**
    Returns YES if any of the matched elements have the passed element or CQ object as a child element.
  */
  within: function(el) {
    if( this.filter(el).length ) { return true; }
    return !!this.has(el).length;
  }

});

/**
  Make CoreQuery enumerable.  Since some methods need to be disambiguated,
  we will implement some wrapper functions here.

  Note that SC.Enumerable is implemented on SC.Builder, which means the
  CoreQuery object inherits this automatically.  jQuery does not extend from
  SC.Builder though, so we reapply SC.Enumerable just to be safe.
*/
(function() {
  var original = {},
      wrappers = {

    // if you call find with a selector, then use the jQuery way.  If you
    // call with a function/target, use Enumerable way
    find: function(callback,target) {
      return (target !== undefined) ? SC.Enumerable.find.call(this, callback, target) : original.find.call(this, callback) ;
    },

    // ditto for filter - execute SC.Enumerable style if a target is passed.
    filter: function(callback,target) {
      return (target !== undefined) ?
        this.pushStack(SC.Enumerable.filter.call(this, callback, target)) :
        original.filter.call(this, callback) ;
    },

    // filterProperty is an SC.Enumerable thing, but it needs to be wrapped
    // in a CoreQuery object.
    filterProperty: function(key, value) {
      return this.pushStack(
        SC.Enumerable.filterProperty.call(this,key,value));
    },

    // indexOf() is best implemented using the jQuery index()
    indexOf: SC.$.index,

    // map() is a little tricky because jQuery is non-standard.  If you pass
    // a context object, we will treat it like SC.Enumerable.  Otherwise use
    // jQuery.
    map: function(callback, target) {
      return (target !== undefined) ?
        SC.Enumerable.map.call(this, callback, target) :
        original.map.call(this, callback);
    }
  };

  // loop through an update some enumerable methods.
  var fn = SC.$.fn,
      enumerable = SC.Enumerable ,
      value;

  for(var key in enumerable) {
    if (enumerable.hasOwnProperty(key)) {
      value = enumerable[key];
      if (key in wrappers) {
        original[key] = fn[key]; value = wrappers[key];
      }
      fn[key] = value;
    }
  }
})();

// Add some global helper methods.
SC.mixin(SC.$, {

  /** @private helper method to determine if an element is visible.  Exposed
   for use in testing. */
  isVisible: function(elem) {
    var CQ = SC.$;
    return ("hidden"!=elem.type) && (CQ.css(elem,"display")!="none") && (CQ.css(elem,"visibility")!="hidden");
  }

}) ;



/* >>>>>>>>>> BEGIN source/system/event.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/core_query') ;

/**
  The event class provides a simple cross-platform library for capturing and
  delivering events on DOM elements and other objects.  While this library
  is based on code from both jQuery and Prototype.js, it includes a number of
  additional features including support for handler objects and event 
  delegation.

  Since native events are implemented very unevenly across browsers,
  SproutCore will convert all native events into a standardized instance of
  this special event class.  
  
  SproutCore events implement the standard W3C event API as well as some 
  additional helper methods.

  @constructor
  @param {Event} originalEvent
  @returns {SC.Event} event instance
  
  @since SproutCore 1.0
*/
SC.Event = function(originalEvent) { 
  var idx, len;
  // copy properties from original event, if passed in.
  if (originalEvent) {
    this.originalEvent = originalEvent ;
    var props = SC.Event._props, key;
    len = props.length;
    idx = len;
    while(--idx >= 0) {
      key = props[idx] ;
      this[key] = originalEvent[key] ;
    }
  }

  // Fix timeStamp
  this.timeStamp = this.timeStamp || Date.now();

  // Fix target property, if necessary
  // Fixes #1925 where srcElement might not be defined either
  if (!this.target) this.target = this.srcElement || document; 

  // check if target is a textnode (safari)
  if (this.target.nodeType === 3 ) this.target = this.target.parentNode;

  // Add relatedTarget, if necessary
  if (!this.relatedTarget && this.fromElement) {
    this.relatedTarget = (this.fromElement === this.target) ? this.toElement : this.fromElement;
  }

  // Calculate pageX/Y if missing and clientX/Y available
  if (SC.none(this.pageX) && !SC.none(this.clientX)) {
    var doc = document.documentElement, body = document.body;
    this.pageX = this.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
    this.pageY = this.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
  }

  // Add which for key events
  if (!this.which && ((this.charCode || originalEvent.charCode === 0) ? this.charCode : this.keyCode)) {
    this.which = this.charCode || this.keyCode;
  }

  // Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
  if (!this.metaKey && this.ctrlKey) this.metaKey = this.ctrlKey;

  // Add which for click: 1 == left; 2 == middle; 3 == right
  // Note: button is not normalized, so don't use it
  if (!this.which && this.button) {
    this.which = ((this.button & 1) ? 1 : ((this.button & 2) ? 3 : ( (this.button & 4) ? 2 : 0 ) ));
  }

  // Normalize wheel delta values for mousewheel events
  if (this.type === 'mousewheel' || this.type === 'DOMMouseScroll' || this.type === 'MozMousePixelScroll') {
    var deltaMultiplier = SC.Event.MOUSE_WHEEL_MULTIPLIER,
        version = parseFloat(SC.browser.version);

    // normalize wheelDelta, wheelDeltaX, & wheelDeltaY for Safari
    if (SC.browser.webkit && originalEvent.wheelDelta !== undefined) {
      this.wheelDelta = 0-(originalEvent.wheelDeltaY || originalEvent.wheelDeltaX);
      this.wheelDeltaY = 0-(originalEvent.wheelDeltaY||0);
      this.wheelDeltaX = 0-(originalEvent.wheelDeltaX||0);

    // normalize wheelDelta for Firefox
    // note that we multiple the delta on FF to make it's acceleration more 
    // natural.
    } else if (!SC.none(originalEvent.detail) && SC.browser.mozilla) {
      if (originalEvent.axis && (originalEvent.axis === originalEvent.HORIZONTAL_AXIS)) {
        this.wheelDeltaX = originalEvent.detail;
        this.wheelDeltaY = this.wheelDelta = 0;
      } else {
        this.wheelDeltaY = this.wheelDelta = originalEvent.detail ;
        this.wheelDeltaX = 0 ;
      }

    // handle all other legacy browser
    } else {
      this.wheelDelta = this.wheelDeltaY = SC.browser.msie || SC.browser.opera ? 0-originalEvent.wheelDelta : originalEvent.wheelDelta ;
      this.wheelDeltaX = 0 ;
    }

    // we have a value over the limit and it wasn't caught when we generated MOUSE_WHEEL_MULTIPLIER
    // this will happen as new Webkit-based browsers are released and we haven't covered them off
    // in our browser detection. It'll scroll too quickly the first time, but we might as well learn
    // and change our handling for the next scroll
    if (this.wheelDelta > SC.Event.MOUSE_WHEEL_DELTA_LIMIT && !SC.Event._MOUSE_WHEEL_LIMIT_INVALIDATED) {
      deltaMultiplier = SC.Event.MOUSE_WHEEL_MULTIPLIER = 0.004;
      SC.Event._MOUSE_WHEEL_LIMIT_INVALIDATED = YES;
    }

    this.wheelDelta *= deltaMultiplier;
    this.wheelDeltaX *= deltaMultiplier;
    this.wheelDeltaY *= deltaMultiplier;
  }

  return this; 
} ;

SC.mixin(SC.Event, /** @scope SC.Event */ {

  /**
    We need this because some browsers deliver different values
    for mouse wheel deltas. Once the first mouse wheel event has
    been run, this value will get set. Because we don't know the
    maximum or minimum value ahead of time, if the event's delta
    exceeds `SC.Event.MOUSE_WHEEL_DELTA_LIMIT`, this value can be
    invalidated and changed during a later event.

    @field
    @type Number
    @default 1
  */
  MOUSE_WHEEL_MULTIPLIER: (function() {
    var deltaMultiplier = 1,
        version = parseFloat(SC.browser.version),
        didChange = NO;

    if (SC.browser.safari) {
      // Safari 5.0.1 and up
      if (version >= 533.17) {
        deltaMultiplier = 0.004;
        didChange = YES;
      } else if (version < 533) {
        // Scrolling in Safari 5.0
        deltaMultiplier = 40;
        didChange = YES;
      }
    } else if (SC.browser.mozilla) {
      deltaMultiplier = 10;
      didChange = YES;
    }

    if (didChange) { SC.Event._MOUSE_WHEEL_LIMIT_INVALIDATED = YES; }

    return deltaMultiplier;
  })(),

  /**
    This represents the limit in the delta before a different multiplier
    will be applied. Because we can't generated an accurate mouse
    wheel event ahead of time, and browsers deliver differing values
    for mouse wheel deltas, this is necessary to ensure that
    browsers that scale their values largely are dealt with correctly
    in the future.

    @type Number
    @default 1000
  */
  MOUSE_WHEEL_DELTA_LIMIT: 1000,

  /** @private
    We only want to invalidate once
  */
  _MOUSE_WHEEL_LIMIT_INVALIDATED: NO,

  /** 
    Standard method to create a new event.  Pass the native browser event you
    wish to wrap if needed.
  */
  create: function(e) { return new SC.Event(e); },

  // the code below was borrowed from jQuery, Dean Edwards, and Prototype.js
  
  /**
    Bind an event to an element.

    This method will cause the passed handler to be executed whenever a
    relevant event occurs on the named element.  This method supports a
    variety of handler types, depending on the kind of support you need.
    
    ## Simple Function Handlers

        SC.Event.add(anElement, "click", myClickHandler) ;
    
    The most basic type of handler you can pass is a function.  This function
    will be executed everytime an event of the type you specify occurs on the
    named element.  You can optionally pass an additional context object which
    will be included on the event in the event.data property.
    
    When your handler function is called the, the function's "this" property
    will point to the element the event occurred on.
    
    The click handler for this method must have a method signature like:
    
        function(event) { return YES|NO; }
    
    ## Method Invocations

        SC.Event.add(anElement, "click", myObject, myObject.aMethod) ;

    Optionally you can specify a target object and a method on the object to 
    be invoked when the event occurs.  This will invoke the method function
    with the target object you pass as "this".  The method should have a 
    signature like:
    
        function(event, targetElement) { return YES|NO; }

    Like function handlers, you can pass an additional context data paramater
    that will be included on the event in the event.data property.
    
    ## Handler Return Values

    Both handler functions should return YES if you want the event to 
    continue to propagate and NO if you want it to stop.  Returning NO will
    both stop bubbling of the event and will prevent any default action 
    taken by the browser.  You can also control these two behaviors separately
    by calling the stopPropagation() or preventDefault() methods on the event
    itself, returning YES from your method.
    
    ## Limitations
    
    Although SproutCore's event implementation is based on jQuery, it is 
    much simpler in design.  Notably, it does not support namespaced events
    and you can only pass a single type at a time.
    
    If you need more advanced event handling, consider the SC.ClassicResponder 
    functionality provided by SproutCore or use your favorite DOM library.

    @param {Element} elem a DOM element, window, or document object
    @param {String} eventType the event type you want to respond to
    @param {Object} target The target object for a method call or a function.
    @param {Object} method optional method or method name if target passed
    @param {Object} context optional context to pass to the handler as event.data
    @returns {Object} receiver
  */
  add: function(elem, eventType, target, method, context, useCapture) {

    // if a CQ object is passed in, either call add on each item in the 
    // matched set, or simply get the first element and use that.
    if (elem && elem.isCoreQuery) {
      if (elem.length > 0) {
        elem.forEach(function(e) { 
          this.add(e, eventType, target, method, context);
        }, this);
        return this;
      } else elem = elem[0];
    }
    if (!elem) return this; // nothing to do

		if (!useCapture) {
			useCapture = NO;
		}
    
    // cannot register events on text nodes, etc.
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) return SC.Event;

    // For whatever reason, IE has trouble passing the window object
    // around, causing it to be cloned in the process
    if (SC.browser.msie && elem.setInterval) elem = window;

    // if target is a function, treat it as the method, with optional context
    if (SC.typeOf(target) === SC.T_FUNCTION) {
      context = method; method = target; target = null;
      
    // handle case where passed method is a key on the target.
    } else if (target && SC.typeOf(method) === SC.T_STRING) {
      method = target[method] ;
    }

    // Get the handlers queue for this element/eventType.  If the queue does
    // not exist yet, create it and also setup the shared listener for this
    // eventType.
    var events = SC.data(elem, "sc_events") || SC.data(elem, "sc_events", {}) ,
        handlers = events[eventType]; 
    if (!handlers) {
      handlers = events[eventType] = {} ;
      this._addEventListener(elem, eventType, useCapture) ;
    }
    
    // Build the handler array and add to queue
    handlers[SC.hashFor(target, method)] = [target, method, context];
    SC.Event._global[eventType] = YES ; // optimization for global triggers

    // Nullify elem to prevent memory leaks in IE
    elem = events = handlers = null ;
    return this ;
  },

  /**
    Removes a specific handler or all handlers for an event or event+type.

    To remove a specific handler, you must pass in the same function or the
    same target and method as you passed into SC.Event.add().  See that method
    for full documentation on the parameters you can pass in.
    
    If you omit a specific handler but provide both an element and eventType,
    then all handlers for that element will be removed.  If you provide only
    and element, then all handlers for all events on that element will be
    removed.
    
    ## Limitations
    
    Although SproutCore's event implementation is based on jQuery, it is 
    much simpler in design.  Notably, it does not support namespaced events
    and you can only pass a single type at a time.
    
    If you need more advanced event handling, consider the SC.ClassicResponder 
    functionality provided by SproutCore or use your favorite DOM library.
    
    @param {Element} elem a DOM element, window, or document object
    @param {String} eventType the event type to remove
    @param {Object} target The target object for a method call.  Or a function.
    @param {Object} method optional name of method
    @returns {Object} receiver
  */
  remove: function(elem, eventType, target, method) {

    // if a CQ object is passed in, either call add on each item in the 
    // matched set, or simply get the first element and use that.
    if (elem && elem.isCoreQuery) {
      if (elem.length > 0) {
        elem.forEach(function(e) { 
          this.remove(e, eventType, target, method);
        }, this);
        return this;
      } else elem = elem[0];
    }
    if (!elem) return this; // nothing to do
    
    // don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) return SC.Event;

    // For whatever reason, IE has trouble passing the window object
    // around, causing it to be cloned in the process
    if (SC.browser.msie && elem.setInterval) elem = window;

    var handlers, key, events = SC.data(elem, "sc_events") ;
    if (!events) return this ; // nothing to do if no events are registered

    // if no type is provided, remove all types for this element.
    if (eventType === undefined) {
      for(eventType in events) this.remove(elem, eventType) ;

    // otherwise, remove the handler for this specific eventType if found
    } else if (handlers = events[eventType]) {

      var cleanupHandlers = NO ;
      
      // if a target/method is provided, remove only that one
      if (target || method) {
        
        // normalize the target/method
        if (SC.typeOf(target) === SC.T_FUNCTION) {
          method = target; target = null ;
        } else if (SC.typeOf(method) === SC.T_STRING) {
          method = target[method] ;
        }
        
        delete handlers[SC.hashFor(target, method)];
        
        // check to see if there are handlers left on this event/eventType.
        // if not, then cleanup the handlers.
        key = null ;
        for(key in handlers) break ;
        if (key===null) cleanupHandlers = YES ;

      // otherwise, just cleanup all handlers
      } else cleanupHandlers = YES ;
      
      // If there are no more handlers left on this event type, remove 
      // eventType hash from queue.
      if (cleanupHandlers) {
        delete events[eventType] ;
        this._removeEventListener(elem, eventType) ;
      }
      
      // verify that there are still events registered on this element.  If 
      // there aren't, cleanup the element completely to avoid memory leaks.
      key = null ;
      for(key in events) break;
      if(!key) {
        SC.removeData(elem, "sc_events") ;
        delete this._elements[SC.guidFor(elem)]; // important to avoid leaks
      }
      
    }
    
    elem = events = handlers = null ; // avoid memory leaks
    return this ;
  },

  NO_BUBBLE: ['blur', 'focus', 'change'],
  
  /**
    Generates a simulated event object.  This is mostly useful for unit 
    testing.  You can pass the return value of this property into the 
    trigger() method to actually send the event.
    
    @param {Element} elem the element the event targets
    @param {String} eventType event type.  mousedown, mouseup, etc
    @param {Hash} attrs optional additonal attributes to apply to event.
    @returns {Hash} simulated event object
  */
  simulateEvent: function(elem, eventType, attrs) {
    var ret = SC.Event.create({
      type: eventType,
      target: elem,
      preventDefault: function(){ this.cancelled = YES; },
      stopPropagation: function(){ this.bubbles = NO; },
      allowDefault: function() { this.hasCustomEventHandling = YES; },
      timeStamp: Date.now(),
      bubbles: (this.NO_BUBBLE.indexOf(eventType)<0),
      cancelled: NO,
      normalized: YES
    });
    if (attrs) SC.mixin(ret, attrs) ;
    return ret ;
  },
  
  /**
    Trigger an event execution immediately.  You can use this method to 
    simulate arbitrary events on arbitary elements.

    ## Limitations
    
    Note that although this is based on the jQuery implementation, it is 
    much simpler.  Notably namespaced events are not supported and you cannot
    trigger events globally.
    
    If you need more advanced event handling, consider the SC.Responder 
    functionality provided by SproutCore or use your favorite DOM library.

    ## Example
    
        SC.Event.trigger(view.get('layer'), 'mousedown');
    
    @param elem {Element} the target element
    @param eventType {String} the event type
    @param args {Array} optional argument or arguments to pass to handler.
    @param donative ??
    @returns {Boolean} Return value of trigger or undefined if not fired
  */
  trigger: function(elem, eventType, args, donative) {

    // if a CQ object is passed in, either call add on each item in the 
    // matched set, or simply get the first element and use that.
    if (elem && elem.isCoreQuery) {
      if (elem.length > 0) {
        elem.forEach(function(e) { 
          this.trigger(e, eventType, args, donative);
        }, this);
        return this;
      } else elem = elem[0];
    }
    if (!elem) return this; // nothing to do

    // don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) return undefined;
    
    // Normalize to an array
    args = SC.A(args) ;

    var ret, fn = SC.typeOf(elem[eventType] || null) === SC.T_FUNCTION , 
        event, current, onfoo, isClick;

    // Get the event to pass, creating a fake one if necessary
    event = args[0];
    if (!event || !event.preventDefault) {
      event = this.simulateEvent(elem, eventType) ;
      args.unshift(event) ;
    }
    
    event.type = eventType ;
    
    // Trigger the event - bubble if enabled
    current = elem;
    do {
      ret = SC.Event.handle.apply(current, args);
      current = (current===document) ? null : (current.parentNode || document);
    } while(!ret && event.bubbles && current);    
    current = null ;

    // Handle triggering native .onfoo handlers
    onfoo = elem["on" + eventType] ;
    isClick = SC.$.nodeName(elem, 'a') && eventType === 'click';
    if ((!fn || isClick) && onfoo && onfoo.apply(elem, args) === NO) ret = NO;

    // Trigger the native events (except for clicks on links)
    if (fn && donative !== NO && ret !== NO && !isClick) {
      this.triggered = YES;
      try {
        elem[ eventType ]();
      // prevent IE from throwing an error for some hidden elements
      } catch (e) {}
    }
    
    this.triggered = NO;

    return ret;
  },

  /**
    This method will handle the passed event, finding any registered listeners
    and executing them.  If you have an event you want handled, you can 
    manually invoke this method.  This function expects it's "this" value to
    be the element the event occurred on, so you should always call this 
    method like:
    
        SC.Event.handle.call(element, event) ;

    Note that like other parts of this library, the handle function does not
    support namespaces.
    
    @param event {Event} the event to handle
    @returns {Boolean}
  */
  handle: function(event) {

    // ignore events triggered after window is unloaded or if double-called
    // from within a trigger.
    if ((typeof SC === "undefined") || SC.Event.triggered) return YES ;
    
    // returned undefined or NO
    var val, ret, namespace, all, handlers, args, key, handler, method, target;

    // normalize event across browsers.  The new event will actually wrap the
    // real event with a normalized API.
    args = SC.A(arguments);
    args[0] = event = SC.Event.normalizeEvent(event || window.event);

    // get the handlers for this event type
    handlers = (SC.data(this, "sc_events") || {})[event.type];
    if (!handlers) return NO ; // nothing to do
    
    // invoke all handlers
    for (key in handlers ) {
      handler = handlers[key];
      // handler = [target, method, context]
      method = handler[1];

      // Pass in a reference to the handler function itself
      // So that we can later remove it
      event.handler = method;
      event.data = event.context = handler[2];

      target = handler[0] || this;
      ret = method.apply( target, args );
      
      if (val !== NO) val = ret;

      // if method returned NO, do not continue.  Stop propogation and
      // return default.  Note that we test explicitly for NO since 
      // if the handler returns no specific value, we do not want to stop.
      if ( ret === NO ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    return val;
  },

  /**
    This method is called just before the window unloads to unhook all 
    registered events.
  */
  unload: function() {
    var key, elements = this._elements ;
    for(key in elements) this.remove(elements[key]) ;
    
    // just in case some book-keeping was screwed up.  avoid memory leaks
    for(key in elements) delete elements[key] ;
    delete this._elements ; 
  },
  
  /**
    This hash contains handlers for special or custom events.  You can add
    your own handlers for custom events here by simply naming the event and
    including a hash with the following properties:
    
     - setup: this function should setup the handler or return NO
     - teardown: this function should remove the event listener
     
  */
  special: {
    
    ready: {
      setup: function() {
        // Make sure the ready event is setup
        SC._bindReady() ;
        return;
      },

      teardown: function() { return; }

    },

    /** @private
        Implement support for mouseenter on browsers other than IE */
    mouseenter: {
      setup: function() {
        if ( SC.browser.msie ) return NO;
        SC.Event.add(this, 'mouseover', SC.Event.special.mouseenter.handler);
        return YES;
      },

      teardown: function() {
        if ( SC.browser.msie ) return NO;
        SC.Event.remove(this, 'mouseover', SC.Event.special.mouseenter.handler);
        return YES;
      },

      handler: function(event) {
        // If we actually just moused on to a sub-element, ignore it
        if ( SC.Event._withinElement(event, this) ) return YES;
        // Execute the right handlers by setting the event type to mouseenter
        event.type = "mouseenter";
        return SC.Event.handle.apply(this, arguments);
      }
    },

    /** @private
        Implement support for mouseleave on browsers other than IE */
    mouseleave: {
      setup: function() {
        if ( SC.browser.msie ) return NO;
        SC.Event.add(this, "mouseout", SC.Event.special.mouseleave.handler);
        return YES;
      },

      teardown: function() {
        if ( SC.browser.msie ) return NO;
        SC.Event.remove(this, "mouseout", SC.Event.special.mouseleave.handler);
        return YES;
      },

      handler: function(event) {
        // If we actually just moused on to a sub-element, ignore it
        if ( SC.Event._withinElement(event, this) ) return YES;
        // Execute the right handlers by setting the event type to mouseleave
        event.type = "mouseleave";
        return SC.Event.handle.apply(this, arguments);
      }
    }
  },

  KEY_BACKSPACE: 8,
  KEY_TAB:       9,
  KEY_RETURN:   13,
  KEY_ESC:      27,
  KEY_LEFT:     37,
  KEY_UP:       38,
  KEY_RIGHT:    39,
  KEY_DOWN:     40,
  KEY_DELETE:   46,
  KEY_HOME:     36,
  KEY_END:      35,
  KEY_PAGEUP:   33,
  KEY_PAGEDOWN: 34,
  KEY_INSERT:   45,
    
  _withinElement: function(event, elem) {
    // Check if mouse(over|out) are still within the same parent element
    var parent = event.relatedTarget;
    
    // Traverse up the tree
    while ( parent && parent != elem ) {
      try { parent = parent.parentNode; } catch(error) { parent = elem; }
    }

    // Return YES if we actually just moused on to a sub-element
    return parent === elem;
  },
  
  /** @private
    Adds the primary event listener for the named type on the element.
    
    If the event type has a special handler defined in SC.Event.special, 
    then that handler will be used.  Otherwise the normal browser method will
    be used.
    
    @param elem {Element} the target element
    @param eventType {String} the event type
  */
  _addEventListener: function(elem, eventType, useCapture) {
    var listener, special = this.special[eventType] ;

		if (!useCapture) {
			useCapture = NO;
		}

    // Check for a special event handler
    // Only use addEventListener/attachEvent if the special
    // events handler returns NO
    if ( !special || special.setup.call(elem)===NO) {
      
      // Save element in cache.  This must be removed later to avoid 
      // memory leaks.
      var guid = SC.guidFor(elem) ;
      this._elements[guid] = elem;
      
      listener = SC.data(elem, "listener") || SC.data(elem, "listener", 
       function() {
         return SC.Event.handle.apply(SC.Event._elements[guid], arguments); 
      }) ;
      
      // Bind the global event handler to the element
      if (elem.addEventListener) {
        elem.addEventListener(eventType, listener, useCapture);
      } else if (elem.attachEvent) {
        // attachEvent is not working for IE8 and xhr objects
        // there is currently a hack in request , but it needs to fixed here.
        elem.attachEvent("on" + eventType, listener);
      }
      //  
      // else {
      //         elem.onreadystatechange = listener;
      //       }
    }
    
    elem = special = listener = null ; // avoid memory leak
  },

  /** @private
    Removes the primary event listener for the named type on the element.
    
    If the event type has a special handler defined in SC.Event.special, 
    then that handler will be used.  Otherwise the normal browser method will
    be used.
    
    Note that this will not clear the _elements hash from the element.  You
    must call SC.Event.unload() on unload to make sure that is cleared.
    
    @param elem {Element} the target element
    @param eventType {String} the event type
  */
  _removeEventListener: function(elem, eventType) {
    var listener, special = SC.Event.special[eventType] ;
    if (!special || (special.teardown.call(elem)===NO)) {
      listener = SC.data(elem, "listener") ;
      if (listener) {
        if (elem.removeEventListener) {
          elem.removeEventListener(eventType, listener, NO);
        } else if (elem.detachEvent) {
          elem.detachEvent("on" + eventType, listener);
        }
      }
    }
    
    elem = special = listener = null ;
  },

  _elements: {},
  
  // implement preventDefault() in a cross platform way
  
  /** @private Take an incoming event and convert it to a normalized event. */
  normalizeEvent: function(event) {
    if (event === window.event) {
      // IE can't do event.normalized on an Event object
      return SC.Event.create(event) ; 
    } else {
      return event.normalized ? event : SC.Event.create(event) ;
    }
  },
  
  _global: {},

  /** @private properties to copy from native event onto the event */
  _props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target timeStamp toElement type view which touches targetTouches changedTouches animationName elapsedTime dataTransfer".split(" ")
  
}) ;

SC.Event.prototype = {

  /**
    Set to YES if you have called either preventDefault() or stopPropagation().  
    This allows a generic event handler to notice if you want to provide 
    detailed control over how the browser handles the real event.
    
    @property {Boolean}
  */
  hasCustomEventHandling: NO,
  
  /**
    Returns the touches owned by the supplied view.
    
    @param {SC.View}
    @returns {Array} touches an array of SC.Touch objects
  */
  touchesForView: function(view) {
    if (this.touchContext) return this.touchContext.touchesForView(view);
  },
  
  /**
    Same as touchesForView, but sounds better for responders.
    
    @param {SC.RootResponder}
    @returns {Array} touches an array of SC.Touch objects
  */
  touchesForResponder: function(responder) {
    if (this.touchContext) return this.touchContext.touchesForView(responder);
  },
  
  /**
    Returns average data--x, y, and d (distance)--for the touches owned by the 
    supplied view.
    
    @param {SC.View}
    @returns {Array} touches an array of SC.Touch objects
  */
  averagedTouchesForView: function(view) {
    if (this.touchContext) return this.touchContext.averagedTouchesForView(view);
    return null;
  },
  
  /**
    Indicates that you want to allow the normal default behavior.  Sets
    the hasCustomEventHandling property to YES but does not cancel the event.
    
    @returns {SC.Event} receiver
  */
  allowDefault: function() {
    this.hasCustomEventHandling = YES ;
    return this ;  
  },
  
  /** 
    Implements W3C standard.  Will prevent the browser from performing its
    default action on this event.
    
    @returns {SC.Event} receiver
  */
  preventDefault: function() {
    var evt = this.originalEvent ;
    if (evt) {
      if (evt.preventDefault) evt.preventDefault() ;
      evt.returnValue = NO ; // IE
    }
    this.hasCustomEventHandling = YES ;
    return this ;
  },

  /**
    Implements W3C standard.  Prevents further bubbling of the event.
    
    @returns {SC.Event} receiver
  */
  stopPropagation: function() {
    var evt = this.originalEvent ;
    if (evt) {
      if (evt.stopPropagation) evt.stopPropagation() ;
      evt.cancelBubble = YES ; // IE
    }
    this.hasCustomEventHandling = YES ; 
    return this ;
  },

  /** 
    Stops both the default action and further propogation.  This is more 
    convenient than calling both.
    
    @returns {SC.Event} receiver
  */
  stop: function() {
    return this.preventDefault().stopPropagation();
  },
  
  /** 
    Always YES to indicate the event was normalized. 
    
    @property {Boolean}
  */
  normalized: YES,

  /** 
    Returns the pressed character (found in this.which) as a string. 
  
    @returns {String}
  */
  getCharString: function() {
    if(SC.browser.msie){
      if(this.keyCode == 8 || this.keyCode == 9 || (this.keyCode>=37 && this.keyCode<=40)){
        return String.fromCharCode(0);
      }
      else {
        return (this.keyCode>0) ? String.fromCharCode(this.keyCode) : null;  
      }
    }
    else {
      return (this.charCode>0) ? String.fromCharCode(this.charCode) : null;
    }
  },
  
  /** 
    Returns character codes for the event.  The first value is the normalized 
    code string, with any shift or ctrl characters added to the begining.  
    The second value is the char string by itself.
  
    @returns {Array}
  */
  commandCodes: function() {
    var code=this.keyCode, ret=null, key=null, modifiers='', lowercase ;
    
    // handle function keys.
    if (code) {
      ret = SC.FUNCTION_KEYS[code] ;
      if (!ret && (this.altKey || this.ctrlKey || this.metaKey)) {
        ret = SC.PRINTABLE_KEYS[code];
      }
      
      if (ret) {
        if (this.altKey) modifiers += 'alt_' ;
        if (this.ctrlKey || this.metaKey) modifiers += 'ctrl_' ;
        if (this.shiftKey) modifiers += 'shift_' ;
      }
    }

    // otherwise just go get the right key.
    if (!ret) {
      code = this.which ;
      key = ret = String.fromCharCode(code) ;
      lowercase = ret.toLowerCase() ;
      if (this.metaKey) {
        modifiers = 'meta_' ;
        ret = lowercase;
        
      } else ret = null ;
    }

    if (ret) ret = modifiers + ret ;
    return [ret, key] ;
  }
    
} ;

// Also provide a Prototype-like API so that people can use either one.

/** Alias for add() method.  This provides a Prototype-like API. */
SC.Event.observe = SC.Event.add ;

/** Alias for remove() method.  This provides a Prototype-like API */
SC.Event.stopObserving = SC.Event.remove ;

/** Alias for trigger() method.  This provides a Prototype-like API */
SC.Event.fire = SC.Event.trigger;

// Register unload handler to eliminate any registered handlers
// This avoids leaks in IE and issues with mouseout or other handlers on 
// other browsers.

if(SC.browser.msie) SC.Event.add(window, 'unload', SC.Event.prototype, SC.Event.unload) ;

SC.MODIFIER_KEYS = {
  16:'shift', 17:'ctrl', 18: 'alt'
};

SC.FUNCTION_KEYS = {
  8: 'backspace',  9: 'tab',  13: 'return',  19: 'pause',  27: 'escape',  
  33: 'pageup', 34: 'pagedown', 35: 'end', 36: 'home', 
  37: 'left', 38: 'up', 39: 'right', 40: 'down', 44: 'printscreen', 
  45: 'insert', 46: 'delete', 112: 'f1', 113: 'f2', 114: 'f3', 115: 'f4', 
  116: 'f5', 117: 'f7', 119: 'f8', 120: 'f9', 121: 'f10', 122: 'f11', 
  123: 'f12', 144: 'numlock', 145: 'scrolllock'
} ;

SC.PRINTABLE_KEYS = {
  32: ' ', 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7",
  56:"8", 57:"9", 59:";", 61:"=", 65:"a", 66:"b", 67:"c", 68:"d", 69:"e",
  70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n",
  79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w",
  88:"x", 89:"y", 90:"z", 107:"+", 109:"-", 110:".", 188:",", 190:".",
  191:"/", 192:"`", 219:"[", 220:"\\", 221:"]", 222:"\""
} ;

/* >>>>>>>>>> BEGIN source/system/cursor.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// standard browser cursor definitions
SC.SYSTEM_CURSOR = 'default' ;
SC.AUTO_CURSOR = SC.DEFAULT_CURSOR = 'auto' ;
SC.CROSSHAIR_CURSOR = 'crosshair' ;
SC.HAND_CURSOR = SC.POINTER_CURSOR = 'pointer' ;
SC.MOVE_CURSOR = 'move' ;
SC.E_RESIZE_CURSOR = 'e-resize' ;
SC.NE_RESIZE_CURSOR = 'ne-resize' ;
SC.NW_RESIZE_CURSOR = 'nw-resize' ;
SC.N_RESIZE_CURSOR = 'n-resize' ;
SC.SE_RESIZE_CURSOR = 'se-resize' ;
SC.SW_RESIZE_CURSOR = 'sw-resize' ;
SC.S_RESIZE_CURSOR = 's-resize' ;
SC.W_RESIZE_CURSOR = 'w-resize' ;
SC.IBEAM_CURSOR = SC.TEXT_CURSOR = 'text' ;
SC.WAIT_CURSOR = 'wait' ;
SC.HELP_CURSOR = 'help' ;

/**
  @class SC.Cursor

  A Cursor object is used to sychronize the cursor used by multiple views at 
  the same time. For example, thumb views within a split view acquire a cursor
  instance from the split view and set it as their cursor. The split view is 
  able to update its cursor object to reflect the state of the split view.
  Because cursor objects are implemented internally with CSS, this is a very 
  efficient way to update the same cursor for a group of view objects.
  
  Note: This object creates an anonymous CSS class to represent the cursor. 
  The anonymous CSS class is automatically added by SproutCore to views that
  have the cursor object set as "their" cursor. Thus, all objects attached to 
  the same cursor object will have their cursors updated simultaneously with a
  single DOM call.
  
  @extends SC.Object
*/
SC.Cursor = SC.Object.extend(
/** @scope SC.Cursor.prototype */ {
  
  /** @private */
  init: function() {
    arguments.callee.base.apply(this,arguments) ;
    
    // create a unique style rule and add it to the shared cursor style sheet
    var cursorStyle = this.get('cursorStyle') || SC.DEFAULT_CURSOR ,
        ss = this.constructor.sharedStyleSheet(),
        guid = SC.guidFor(this);
    
    if (ss.insertRule) { // WC3
      ss.insertRule(
        '.'+guid+' {cursor: '+cursorStyle+';}',
        ss.cssRules ? ss.cssRules.length : 0
      ) ;
    } else if (ss.addRule) { // IE
      ss.addRule('.'+guid, 'cursor: '+cursorStyle) ;
    }
    
    this.cursorStyle = cursorStyle ;
    this.className = guid ; // used by cursor clients...
    return this ;
  },
  
  /**
    This property is the connection between cursors and views. The default
    SC.View behavior is to add this className to a view's layer if it has
    its cursor property defined.
    
    @readOnly
    @property {String} the css class name updated by this cursor
  */
  className: null,
  
  /**
    @property {String} the cursor value, can be 'url("path/to/cursor")'
  */
  cursorStyle: SC.DEFAULT_CURSOR,
  
  /** @private */
  cursorStyleDidChange: function() {
    var cursorStyle, rule, selector, ss, rules, idx, len;
    cursorStyle = this.get('cursorStyle') || SC.DEFAULT_CURSOR;
    rule = this._rule;
    if (rule) {
      rule.style.cursor = cursorStyle ; // fast path
      return ;
    }
    
    // slow path, taken only once
    selector = '.'+this.get('className') ;
    ss = this.constructor.sharedStyleSheet() ;
    rules = (ss.cssRules ? ss.cssRules : ss.rules) || [] ;
    
    // find our rule, cache it, and update the cursor style property
    for (idx=0, len = rules.length; idx<len; ++idx) {
      rule = rules[idx] ;
      if (rule.selectorText === selector) {
        this._rule = rule ; // cache for next time
        rule.style.cursor = cursorStyle ; // update the cursor
        break ;
      }
    }
  }.observes('cursorStyle')
  
  // TODO implement destroy
  
});

/** @private */
SC.Cursor.sharedStyleSheet = function() {
  var head, ss = this._styleSheet ;
  if (!ss) {
    // create the stylesheet object the hard way (works everywhere)
    ss = document.createElement('style') ;
    ss.type = 'text/css' ;
    head = document.getElementsByTagName('head')[0] ;
    if (!head) head = document.documentElement ; // fix for Opera
    head.appendChild(ss) ;
    
    // get the actual stylesheet object, not the DOM element
    ss = document.styleSheets[document.styleSheets.length-1] ;
    this._styleSheet = ss ;
  }
  return ss ;
};

/* >>>>>>>>>> BEGIN source/system/responder.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  Provides common methods for sending events down a responder chain.
  Responder chains are used most often to deliver events to user interface
  elements in your application, but you can also use them to deliver generic
  events to any part of your application, including controllers.

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Responder = SC.Object.extend( /** @scope SC.Responder.prototype */ {

  isResponder: YES,
  
  /** @property
    The pane this responder belongs to.  This is used to determine where you 
    belong to in the responder chain.  Normally you should leave this property
    set to null.
  */
  pane: null,
  
  /** @property
    The app this responder belongs to.  For non-user-interface responder 
    chains, this is used to determine the context.  Usually this
    is the property you will want to work with.
  */
  responderContext: null,
  
  /** @property
    This is the nextResponder in the responder chain.  If the receiver does 
    not implement a particular event handler, it will bubble to the next 
    responder.
    
    This can point to an object directly or it can be a string, in which case
    the path will be resolved from the responderContext root.
  */
  nextResponder: null,
  
  /** @property 
    YES if the view is currently first responder.  This property is always 
    edited by the pane during its makeFirstResponder() method.
  */
  isFirstResponder: NO,
  
  /** @property
  
    YES the responder is somewhere in the responder chain.  This currently
    only works when used with a ResponderContext.
    
    @type {Boolean}
  */
  hasFirstResponder: NO,    
  
  /** @property
    Set to YES if your view is willing to accept first responder status.  This is used when calculcating key responder loop.
  */
  acceptsFirstResponder: YES,
  
  becomingFirstResponder: NO,
  
  /** 
    Call this method on your view or responder to make it become first 
    responder.
    
    @returns {SC.Responder} receiver
  */
  becomeFirstResponder: function() {  
    var pane = this.get('pane') || this.get('responderContext') ||
              this.pane();
    if (pane && this.get('acceptsFirstResponder')) {
      if (pane.get('firstResponder') !== this) pane.makeFirstResponder(this);
    } 
    return this ;
  },
  
  /**
    Call this method on your view or responder to resign your first responder 
    status. Normally this is not necessary since you will lose first responder 
    status automatically when another view becomes first responder.
    
    @param {Event} the original event that caused this method to be called
    @returns {SC.Responder} receiver
  */
  resignFirstResponder: function(evt) {
    var pane = this.get('pane') || this.get('responderContext');
    if (pane && (pane.get('firstResponder') === this)) {
      pane.makeFirstResponder(null, evt);
    }
    return YES;  
  },

  /**
    Called just before the responder or any of its subresponder's are about to
    lose their first responder status.  The passed responder is the responder
    that is about to lose its status. 
    
    Override this method to provide any standard teardown when the first 
    responder changes.
    
    @param {SC.Responder} responder the responder that is about to change
    @returns {void}
  */
  willLoseFirstResponder: function(responder) {},
  
  /**
    Called just after the responder or any of its subresponder's becomes a 
    first responder.  
    
    Override this method to provide any standard setup when the first 
    responder changes.
    
    @param {SC.Responder} responder the responder that changed
    @returns {void}
  */
  didBecomeFirstResponder: function(responder) {}

});

/* >>>>>>>>>> BEGIN source/system/theme.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  Represents a theme, and is also the core theme in which SC looks for
  other themes.

  If an SC.View has a theme of "ace", it will look in its parent's theme
  for the theme "ace". If there is no parent--that is, if the view is a
  frame--it will look in SC.Theme for the named theme. To find a theme,
  it calls find(themeName) on the theme.

  To be located, themes must be registered either as a root theme (by
  calling SC.Theme.addTheme) or as a child theme of another theme (by
  calling theTheme.addTheme).

  All themes are instances. However, new instances based on the current
  instance can always be created: just call .create(). This method is used
  by SC.View when you name a theme that doesn't actually exist: it creates
  a theme based on the parent theme.

  Locating Child Themes
  ----------------------------
  Locating child themes is relatively simple for the most part: it looks in
  its own "themes" property, which is an object inheriting from its parent's
  "themes" set, so it includes all parent themes.

  However, it does _not_ include global themes. This is because, when find()
  is called, it wants to ensure any child theme is specialized. That is, the
  child theme should include all class names of the base class theme. This only
  makes sense if the theme really is a child theme of the theme or one of its
  base classes; if the theme is a global theme, those class names should not
  be included.

  This makes sense logically as well, because when searching for a render delegate,
  it will locate it in any base theme that has it, but that doesn't mean
  class names from the derived theme shouldn't be included.

  @extends SC.Object
  @since SproutCore 1.1
  @author Alex Iskander
*/
SC.Theme = {
  /**
    Walks like a duck.
  */
  isTheme: YES,

  /**
    Class names for the theme.

    These class names include the name of the theme and the names
    of all parent themes. You can also add your own.
   */
  classNames: SC.CoreSet.create(),

  /**
    @private
    A helper to extend class names with another set of classnames. The
    other set of class names can be a hash, an array, a Set, or a space-
    delimited string.
  */
  _extend_class_names: function(classNames) {
    // class names may be a CoreSet, array, string, or hash
    if (classNames) {
      if (SC.typeOf(classNames) === SC.T_HASH && !classNames.isSet) {
        for (var className in classNames) {
          if (classNames[className]) this.classNames.add(className);
          else this.classNames.remove(className);
        }
      } else if (typeof classNames === "string") {
        this.classNames.addEach(classNames.split(' '));
      } else {
        // it must be an array or another CoreSet... same difference.
        this.classNames.addEach(classNames);
      }
    }
  },

  /**
    @private
    Helper method that extends this theme with some extra properties.

    Used during Theme.create();
   */
  _extend_self: function(ext) {
    if (ext.classNames) this._extend_class_names(ext.classNames);

    // mixin while enabling arguments.callee.base.apply(this,arguments);
    var key, value, cur;
    for (key in ext) {
      if (key === 'classNames') continue; // already handled.
      if (!ext.hasOwnProperty(key)) continue;

      value = ext[key];
      if (value instanceof Function && !value.base && (value !== (cur=this[key]))) {
        value.base = cur;
      }

      this[key] = value;
    }
  },

  /**
    Creates a new theme based on this one. The name of the new theme will
    be added to the classNames set.
  */
  create: function() {
    var result = SC.beget(this);
    result.baseTheme = this;

    // if we don't beget themes, the same instance would be shared between
    // all themes. this would be bad: imagine that we have two themes:
    // "Ace" and "Other." Each one has a "capsule" child theme. If they
    // didn't have their own child themes hash, the two capsule themes
    // would conflict.
    if (this.themes === SC.Theme.themes) {
      result.themes = {};
    } else {
      result.themes = SC.beget(this.themes);
    }
    
    // we also have private ("invisible") child themes; look at invisibleSubtheme
    // method.
    result._privateThemes = {};

    // also, the theme specializes all child themes as they are created
    // to ensure that all of the class names on this theme are included.
    result._specializedThemes = {};

    // we could put this in _extend_self, but we don't want to clone
    // it for each and every argument passed to create().
    result.classNames = SC.clone(this.classNames);

    var args = arguments, len = args.length, idx, mixin;
    for (idx = 0; idx < len; idx++) {
      result._extend_self(args[idx]);
    }

    if (result.name) result.classNames.add(result.name);

    return result;
  },

  /**
    Creates a child theme based on this theme, with the given name,
    and automatically registers it as a child theme.
  */
  subtheme: function(name) {
    // extend the theme
    var t = this.create({ name: name });

    // add to our set of themes
    this.addTheme(t);

    // and return the theme class
    return t;
  },
  
  /**
    Semi-private, only used by SC.View to create "invisible" subthemes. You
    should never need to call this directly, nor even worry about.
    
    Invisible subthemes are only available when find is called _on this theme_;
    if find() is called on a child theme, it will _not_ locate this theme.
    
    The reason for "invisible" subthemes is that SC.View will create a subtheme
    when it finds a theme name that doesn't exist. For example, imagine that you 
    have a parent view with theme "base", and a child view with theme "popup".
    If no "popup" theme can be found inside "base", SC.View will call
    base.subtheme. This will create a new theme with the name "popup",
    derived from "base". Everyone is happy.
    
    But what happens if you then change the parent theme to "ace"? The view
    will try again to find "popup", and it will find it-- but it will still be
    a child theme of "base"; SC.View _needs_ to re-subtheme it, but it won't
    know it needs to, because it has been found.
  */
  invisibleSubtheme: function(name) {
    // extend the theme
    var t = this.create({ name: name });

    // add to our set of themes
    this._privateThemes[name] = t;
    
    // and return the theme class
    return t;
  },
  
  //
  // THEME MANAGEMENT
  //

  themes: {},

  /**
    Finds a theme by name within this theme (the theme must have
    previously been added to this theme or a base theme by using addTheme, or
    been registered as a root theme).

    If the theme found is not a root theme, this will specialize the theme so
    that it includes all class names for this theme.
  */
  find: function(themeName) {
    if (this === SC.Theme) return this.themes[themeName];
    var theme;

    // if there is a private theme (invisible subtheme) by that name, use it
    theme = this._privateThemes[themeName];
    if (theme) return theme;

    // if there is a specialized version (the theme extended with our class names)
    // return that one
    theme = this._specializedThemes[themeName];
    if (theme) return theme;

    // otherwise, we may need to specialize one.
    theme = this.themes[themeName];
    if (theme && !this._specializedThemes[themeName]) {
      return (this._specializedThemes[themeName] = theme.create({ classNames: this.classNames }));
    }

    // and finally, if it is a root theme, we do nothing to it.
    theme = SC.Theme.themes[themeName];
    if (theme) return theme;

    return null;
  },

  /**
    Adds a child theme to the theme. This allows the theme to be located
    by SproutCore views and such later.

    Each theme is registered in the "themes" property by name. Calling
    find(name) will return the theme with the given name.

    Because the themes property is an object begetted from (based on) any
    parent theme's "themes" property, if the theme cannot be found in this
    theme, it will be found in any parent themes.
  */
  addTheme: function(theme) {
    this.themes[theme.name] = theme;
  }
};

// SproutCore _always_ has its base theme. This is not quite
// optimal, but the reasoning is because of test running: the
// test runner, when running foundation unit tests, cannot load
// the theme. As such, foundation must include default versions of
// all of its render delegates, and it does so in BaseTheme. All SproutCore
// controls have render delegates in BaseTheme.
SC.BaseTheme = SC.Theme.create({
  name: '' // it is a base class, and doesn't need a class name or such
});

// however, SproutCore does need a default theme, even if no
// actual theme is loaded.
SC.Theme.themes['sc-base'] = SC.BaseTheme;
SC.defaultTheme = 'sc-base';

/* >>>>>>>>>> BEGIN source/system/locale.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  The Locale defined information about a specific locale, including date and
  number formatting conventions, and localization strings.  You can define
  various locales by adding them to the SC.locales hash, keyed by language
  and/or country code.
  
  On page load, the default locale will be chosen based on the current 
  languages and saved at SC.Locale.current.  This locale is used for 
  localization, etc.
  
  ## Creating a new locale
  
  You can create a locale by simply extending the SC.Locale class and adding
  it to the locales hash:
  
      SC.Locale.locales['en'] = SC.Locale.extend({ .. config .. }) ;
  
  Alternatively, you could choose to base your locale on another locale by
  extending that locale:
  
      SC.Locale.locales['en-US'] = SC.Locale.locales['en'].extend({ ... }) ;
  
  Note that if you do not define your own strings property, then your locale
  will inherit any strings added to the parent locale.  Otherwise you must
  implement your own strings instead.
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Locale = SC.Object.extend({
  
  init: function() {
    // make sure we know the name of our own locale.
    if (!this.language) SC.Locale._assignLocales();
    
    // Make sure we have strings that were set using the new API.  To do this
    // we check to a bool that is set by one of the string helpers.  This 
    // indicates that the new API was used. If the new API was not used, we
    // check to see if the old API was used (which places strings on the 
    // String class). 
    if (!this.hasStrings) {
      var langs = this._deprecatedLanguageCodes || [] ;
      langs.push(this.language);
      var idx = langs.length ;
      var strings = null ;
      while(!strings && --idx >= 0) {
        strings = String[langs[idx]];
      }
      if (strings) {
        this.hasStrings = YES; 
        this.strings = strings ;
      }
    }
  },
  
  /** Set to YES when strings have been added to this locale. */
  hasStrings: NO,
  
  /** The strings hash for this locale. */
  strings: {},
  
  /**
    The metrics for this locale.  A metric is a singular value that is usually
    used in a user interface layout, such as "width of the OK button".
  */
  metrics: {},

  toString: function() {
    if (!this.language) SC.Locale._assignLocales() ;
    return "SC.Locale["+this.language+"]"+SC.guidFor(this) ;
  },
  
  /** 
    Returns the localized version of the string or the string if no match
    was found.
    
    @param {String} string
    @param {String} optional default string to return instead
    @returns {String}
  */
  locWithDefault: function(string, def) {
    var ret = this.strings[string];
    
    // strings may be blank, so test with typeOf.
    if (SC.typeOf(ret) === SC.T_STRING) return ret;
    else if (SC.typeOf(def) === SC.T_STRING) return def;
    return string;
  },

  /**
    Returns the localized value of the metric for the specified key, or
    undefined if no match is found.

    @param {String} key
    @returns {Number} ret
  */
  locMetric: function(key) {
    var ret = this.metrics[key];
    if (SC.typeOf(ret) === SC.T_NUMBER) {
      return ret;
    }
    else if (ret === undefined) {
      SC.warn("No localized metric found for key \"" + key + "\"");
      return undefined;
    }
    else {
      SC.warn("Unexpected metric type for key \"" + key + "\"");
      return undefined;
    }
  },

  /**
    Creates and returns a new hash suitable for use as an SC.View’s 'layout'
    hash.  This hash will be created by looking for localized metrics following
    a pattern based on the “base key” you specify.

    For example, if you specify "Button.Confirm", the following metrics will be
    used if they are defined:

      Button.Confirm.left
      Button.Confirm.top
      Button.Confirm.right
      Button.Confirm.bottom
      Button.Confirm.width
      Button.Confirm.height
      Button.Confirm.midWidth
      Button.Confirm.minHeight
      Button.Confirm.centerX
      Button.Confirm.centerY

    Additionally, you can optionally specify a hash which will be merged on top
    of the returned hash.  For example, if you wish to allow a button’s width
    to be configurable per-locale, but always wish for it to be centered
    vertically and horizontally, you can call:

      locLayout("Button.Confirm", {centerX:0, centerY:0})

    …so that you can combine both localized and non-localized elements in the
    returned hash.  (An exception will be thrown if there is a locale-specific
    key that matches a key specific in this hash.)

    @param {String} baseKey
    @param {String} (optional) additionalHash
    @returns {Hash}
  */
  locLayout: function(baseKey, additionalHash) {
    // Note:  In this method we'll directly access this.metrics rather than
    //        going through locMetric() for performance and to avoid
    //        locMetric()'s sanity checks.

    var i, len, layoutKey, key, value,
        layoutKeys = SC.Locale.layoutKeys,
        metrics    = this.metrics,

        // Cache, to avoid repeated lookups
        typeOfFunc = SC.typeOf,
        numberType = SC.T_NUMBER,

        ret        = {};


    // Start off by mixing in the additionalHash; we'll look for collisions with
    // the localized values in the loop below.
    if (additionalHash) SC.mixin(ret, additionalHash);


    // For each possible key that can be included in a layout hash, see whether
    // we have a localized value.
    for (i = 0, len = layoutKeys.length;  i < len;  ++i) {
      layoutKey = layoutKeys[i];
      key       = baseKey + "." + layoutKey;
      value     = metrics[key];

      if (typeOfFunc(value) === numberType) {
        // We have a localized value!  As a sanity check, if the caller
        // specified an additional hash and it has the same key, we'll throw an
        // error.
        if (additionalHash  &&  additionalHash[layoutKey]) {
          throw "locLayout():  There is a localized value for the key '" + key + "' but a value for '" + layoutKey + "' was also specified in the non-localized hash";
        }

        ret[layoutKey] = value;
      }
    }

    return ret;
  }

}) ;

SC.Locale.mixin(/** @scope SC.Locale */ {

  /**
    If YES, localization will favor the detected language instead of the
    preferred one.
  */
  useAutodetectedLanguage: NO,

  /**
    This property is set by the build tools to the current build language.
  */
  preferredLanguage: null,

  /**
    This property holds all attributes name which can be used for a layout hash
    (for an SC.View).  These are what we support inside the layoutFor() method.
  */
  layoutKeys: ['left', 'top', 'right', 'bottom', 'width', 'height',
               'minWidth', 'minHeight', 'centerX', 'centerY'],

  /** 
    Invoked at the start of SproutCore's document onready handler to setup 
    the currentLocale.  This will use the language properties you have set on
    the locale to make a decision.
  */
  createCurrentLocale: function() {

    // get values from String if defined for compatibility with < 1.0 build 
    // tools.
    var autodetect = (String.useAutodetectedLanguage !== undefined) ? String.useAutodetectedLanguage : this.useAutodetectedLanguage; 
    var preferred = (String.preferredLanguage !== undefined) ? String.preferredLanguage : this.preferredLanguage ;

    // determine the language
    var lang = ((autodetect) ? SC.browser.language : null) || preferred || SC.browser.language || 'en';
    lang = SC.Locale.normalizeLanguage(lang) ;

    // get the locale class.  If a class cannot be found, fall back to generic
    // language then to english.
    var klass = this.localeClassFor(lang) ;

    // if the detected language does not match the current language (or there
    // is none) then set it up.
    if (lang != this.currentLanguage) {
      this.currentLanguage = lang ; // save language
      this.currentLocale = klass.create(); // setup locale
    }
    return this.currentLocale ;
  },

  /**
    Finds the locale class for the names language code or creates on based on
    its most likely parent.
  */
  localeClassFor: function(lang) {
    lang = SC.Locale.normalizeLanguage(lang) ;
    var parent, klass = this.locales[lang];
    
    // if locale class was not found and there is a broader-based locale
    // present, create a new locale based on that.
    if (!klass && ((parent = lang.split('-')[0]) !== lang) && (klass = this.locales[parent])) {
      klass = this.locales[lang] = klass.extend() ;      
    }
    
    // otherwise, try to create a new locale based on english.
    if (!klass) klass = this.locales[lang] = this.locales.en.extend();
    
    return klass;
  },

  /** 
    Shorthand method to define the settings for a particular locale.
    The settings you pass here will be applied directly to the locale you
    designate.  

    If you are already holding a reference to a locale definition, you can
    also use this method to operate on the receiver.
    
    If the locale you name does not exist yet, this method will create the 
    locale for you, based on the most closely related locale or english.  For 
    example, if you name the locale 'fr-CA', you will be creating a locale for
    French as it is used in Canada.  This will be based on the general French
    locale (fr), since that is more generic.  On the other hand, if you create
    a locale for manadarin (cn), it will be based on generic english (en) 
    since there is no broader language code to match against.

    @param {String} localeName
    @param {Hash} options
    @returns {SC.Locale} the defined locale
  */
  define: function(localeName, options) {
    var locale ;
    if (options===undefined && (SC.typeOf(localeName) !== SC.T_STRING)) {
      locale = this; options = localeName ;
    } else locale = SC.Locale.localeClassFor(localeName) ;
    SC.mixin(locale.prototype, options) ;
    return locale ;
  },
  
  /**
    Gets the current options for the receiver locale.  This is useful for 
    inspecting registered locales that have not been instantiated.
    
    @returns {Hash} options + instance methods
  */
  options: function() { return this.prototype; },
  
  /**
    Adds the passed hash of strings to the locale's strings table.  Note that
    if the receiver locale inherits its strings from its parent, then the 
    strings table will be cloned first.
    
    @returns {Object} receiver
  */
  addStrings: function(stringsHash) {
    // make sure the target strings hash exists and belongs to the locale
    var strings = this.prototype.strings ;
    if (strings) {
      if (!this.prototype.hasOwnProperty('strings')) {
        this.prototype.strings = SC.clone(strings) ;
      }
    } else strings = this.prototype.strings = {} ;
    
    // add strings hash
    if (stringsHash)  this.prototype.strings = SC.mixin(strings, stringsHash) ;
    this.prototype.hasStrings = YES ;
    return this;
  },

  /**
    Adds the passed hash of metrics to the locale's metrics table, much as
    addStrings() is used to add in strings.   Note that if the receiver locale
    inherits its metrics from its parent, then the metrics table will be cloned
    first.

    @returns {Object} receiver
  */
  addMetrics: function(metricsHash) {
    // make sure the target metrics hash exists and belongs to the locale
    var metrics = this.prototype.metrics;
    if (metrics) {
      if (!this.prototype.hasOwnProperty(metrics)) {
        this.prototype.metrics = SC.clone(metrics) ;
      }
    }
    else {
      metrics = this.prototype.metrics = {} ;
    }

    // add metrics hash
    if (metricsHash) this.prototype.metrics = SC.mixin(metrics, metricsHash);

    // Note:  We don't need the equivalent of this.hasStrings here, because we
    //        are not burdened by an older API to look for like the strings
    //        support is.

    return this;
  },

  _map: { english: 'en', french: 'fr', german: 'de', japanese: 'ja', jp: 'ja', spanish: 'es' },
  
  /**
    Normalizes the passed language into a two-character language code.
    This method allows you to specify common languages in their full english
    name (i.e. English, French, etc). and it will be treated like their two
    letter code equivalent.
    
    @param {String} languageCode
    @returns {String} normalized code
  */
  normalizeLanguage: function(languageCode) {
    if (!languageCode) return 'en' ;
    return SC.Locale._map[languageCode.toLowerCase()] || languageCode ;
  },
  
  // this method is called once during init to walk the installed locales 
  // and make sure they know their own names.
  _assignLocales: function() {
    for(var key in this.locales) this.locales[key].prototype.language = key;
  },
  
  toString: function() {
    if (!this.prototype.language) SC.Locale._assignLocales() ;
    return "SC.Locale["+this.prototype.language+"]" ;
  },
  
  // make sure important properties are copied to new class. 
  extend: function() {
    var ret= SC.Object.extend.apply(this, arguments) ;
    ret.addStrings= SC.Locale.addStrings;
    ret.define = SC.Locale.define ;
    ret.options = SC.Locale.options ;
    ret.toString = SC.Locale.toString ;
    return ret ;
  }
    
}) ;

/** 
  This locales hash contains all of the locales defined by SproutCore and
  by your own application.  See the SC.Locale class definition for the
  various properties you can set on your own locales.
  
  @property {Hash}
*/
SC.Locale.locales = {
  en: SC.Locale.extend({ _deprecatedLanguageCodes: ['English'] }),
  fr: SC.Locale.extend({ _deprecatedLanguageCodes: ['French'] }),
  de: SC.Locale.extend({ _deprecatedLanguageCodes: ['German'] }),
  ja: SC.Locale.extend({ _deprecatedLanguageCodes: ['Japanese', 'jp'] }),
  es: SC.Locale.extend({ _deprecatedLanguageCodes: ['Spanish'] })
} ;




/**
  This special helper will store the strings you pass in the locale matching
  the language code.  If a locale is not defined from the language code you
  specify, then one will be created for you with the english locale as the 
  parent.
  
  @param {String} languageCode
  @param {Hash} strings
  @returns {Object} receiver 
*/
SC.stringsFor = function(languageCode, strings) {
  // get the locale, creating one if needed.
  var locale = SC.Locale.localeClassFor(languageCode);
  locale.addStrings(strings) ;
  return this ;
} ;

/**
  Just like SC.stringsFor, but for metrics.

  @param {String} languageCode
  @param {Hash} metrics
  @returns {Object} receiver
*/
SC.metricsFor = function(languageCode, metrics) {
  var locale = SC.Locale.localeClassFor(languageCode);
  locale.addMetrics(metrics);
  return this;
};

/* >>>>>>>>>> BEGIN source/system/string.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/locale');

// These are basic enhancements to the string class used throughout
// SproutCore.
/** @private */
SC.STRING_TITLEIZE_REGEXP = (/([\s|\-|\_|\n])([^\s|\-|\_|\n]?)/g);
SC.STRING_DECAMELIZE_REGEXP = (/([a-z])([A-Z])/g);
SC.STRING_DASHERIZE_REGEXP = (/[ _]/g);
SC.STRING_DASHERIZE_CACHE = {};
SC.STRING_TRIM_LEFT_REGEXP = (/^\s+/g);
SC.STRING_TRIM_RIGHT_REGEXP = (/\s+$/g);

/**
  @namespace

  SproutCore implements a variety of enhancements to the built-in String
  object that make it easy to perform common substitutions and conversions.

  Most of the utility methods defined here mirror those found in Prototype
  1.6.

  @since SproutCore 1.0
  @lends String.prototype
*/
SC.mixin(SC.String, {

  /**
    Capitalizes a string.

    ## Examples

        capitalize('my favorite items') // 'My favorite items'
        capitalize('css-class-name')    // 'Css-class-name'
        capitalize('action_name')       // 'Action_name'
        capitalize('innerHTML')         // 'InnerHTML'

    @return {String} capitalized string
  */
  capitalize: function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
    Camelizes a string.  This will take any words separated by spaces, dashes
    or underscores and convert them into camelCase.

    ## Examples

        camelize('my favorite items') // 'myFavoriteItems'
        camelize('css-class-name')    // 'cssClassName'
        camelize('action_name')       // 'actionName'
        camelize('innerHTML')         // 'innerHTML'

    @returns {String} camelized string
  */
  camelize: function(str) {
    var ret = str.replace(SC.STRING_TITLEIZE_REGEXP, function(str, separater, character) {
      return character ? character.toUpperCase() : '';
    });

    var first = ret.charAt(0),
        lower = first.toLowerCase();

    return first !== lower ? lower + ret.slice(1) : ret;
  },

  /**
    Converts a camelized string into all lower case separated by underscores.

    ## Examples

    decamelize('my favorite items') // 'my favorite items'
    decamelize('css-class-name')    // 'css-class-name'
    decamelize('action_name')       // 'action_name'
    decamelize('innerHTML')         // 'inner_html'

    @returns {String} the decamelized string.
  */
  decamelize: function(str) {
    return str.replace(SC.STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
  },

  /**
    Converts a camelized string or a string with spaces or underscores into
    a string with components separated by dashes.

    ## Examples

    | *Input String* | *Output String* |
    dasherize('my favorite items') // 'my-favorite-items'
    dasherize('css-class-name')    // 'css-class-name'
    dasherize('action_name')       // 'action-name'
    dasherize('innerHTML')         // 'inner-html'

    @returns {String} the dasherized string.
  */
  dasherize: function(str) {
    var cache = SC.STRING_DASHERIZE_CACHE,
        ret   = cache[str];

    if (ret) {
      return ret;
    } else {
      ret = SC.String.decamelize(str).replace(SC.STRING_DASHERIZE_REGEXP,'-');
      cache[str] = ret;
    }

    return ret;
  },

  /**
    Localizes the string.  This will look up the receiver string as a key
    in the current Strings hash.  If the key matches, the loc'd value will be
    used.  The resulting string will also be passed through fmt() to insert
    any variables.

    @param str {String} String to localize
    @param args {Object...} optional arguments to interpolate also
    @returns {String} the localized and formatted string.
  */
  loc: function(str) {
    // NB: This could be implemented as a wrapper to locWithDefault() but
    // it would add some overhead to deal with the arguments and adds stack
    // frames, so we are keeping the implementation separate.
    if(!SC.Locale.currentLocale) { SC.Locale.createCurrentLocale(); }

    var localized = SC.Locale.currentLocale.locWithDefault(str);
    if (SC.typeOf(localized) !== SC.T_STRING) { localized = str; }

    var args = SC.$A(arguments);
    args.shift(); // remove str param
    //to extend String.prototype
    if(args.length>0 && args[0].isSCArray) args=args[0];

    return SC.String.fmt(localized, args);
  },

  /**
    Returns the localized metric value for the specified key.  A metric is a
    single value intended to be used in your interface’s layout, such as
    "Button.Confirm.Width" = 100.

    If you would like to return a set of metrics for use in a layout hash, you
    may prefer to use the locLayout() method instead.

    @param str {String} key
    @returns {Number} the localized metric
  */
  locMetric: function(key) {
    var K             = SC.Locale,
        currentLocale = K.currentLocale;

    if (!currentLocale) {
      K.createCurrentLocale();
      currentLocale = K.currentLocale;
    }
    return currentLocale.locMetric(key);
  },

  /**
    Creates and returns a new hash suitable for use as an SC.View’s 'layout'
    hash.  This hash will be created by looking for localized metrics following
    a pattern based on the “base key” you specify.

    For example, if you specify "Button.Confirm", the following metrics will be
    used if they are defined:

      Button.Confirm.left
      Button.Confirm.top
      Button.Confirm.right
      Button.Confirm.bottom
      Button.Confirm.width
      Button.Confirm.height
      Button.Confirm.midWidth
      Button.Confirm.minHeight
      Button.Confirm.centerX
      Button.Confirm.centerY

    Additionally, you can optionally specify a hash which will be merged on top
    of the returned hash.  For example, if you wish to allow a button’s width
    to be configurable per-locale, but always wish for it to be centered
    vertically and horizontally, you can call:

      locLayout("Button.Confirm", {centerX:0, centerY:0})

    …so that you can combine both localized and non-localized elements in the
    returned hash.  (An exception will be thrown if there is a locale-specific
    key that matches a key specific in this hash.)


    For example, if your locale defines:

      Button.Confirm.left
      Button.Confirm.top
      Button.Confirm.right
      Button.Confirm.bottom


    …then these two code snippets will produce the same result:

      layout: {
        left:   "Button.Confirm.left".locMetric(),
        top:    "Button.Confirm.top".locMetric(),
        right:  "Button.Confirm.right".locMetric(),
        bottom: "Button.Confirm.bottom".locMetric()
      }

      layout: "Button.Confirm".locLayout()

    The former is slightly more efficient because it doesn’t have to iterate
    through the possible localized layout keys, but in virtually all situations
    you will likely wish to use the latter.

    @param str {String} key
    @param {str} (optional) additionalHash
    @param {String} (optional) additionalHash
    @returns {Number} the localized metric
  */
  locLayout: function(key, additionalHash) {
    var K             = SC.Locale,
        currentLocale = K.currentLocale;

    if (!currentLocale) {
      K.createCurrentLocale();
      currentLocale = K.currentLocale;
    }
    return currentLocale.locLayout(key, additionalHash);
  },

  /**
    Works just like loc() except that it will return the passed default
    string if a matching key is not found.

    @param {String} str the string to localize
    @param {String} def the default to return
    @param {Object...} args optional formatting arguments
    @returns {String} localized and formatted string
  */
  locWithDefault: function(str, def) {
    if (!SC.Locale.currentLocale) { SC.Locale.createCurrentLocale(); }

    var localized = SC.Locale.currentLocale.locWithDefault(str, def);
    if (SC.typeOf(localized) !== SC.T_STRING) { localized = str; }

    var args = SC.$A(arguments);
    args.shift(); // remove str param
    args.shift(); // remove def param

    return SC.String.fmt(localized, args);
  },

  /**
   Removes any extra whitespace from the edges of the string. This method is
   also aliased as strip().

   @returns {String} the trimmed string
  */
  trim: jQuery.trim,

  /**
   Removes any extra whitespace from the left edge of the string.

   @returns {String} the trimmed string
  */
  trimLeft: function (str) {
    return str.replace(SC.STRING_TRIM_LEFT_REGEXP,"");
  },

  /**
   Removes any extra whitespace from the right edge of the string.

   @returns {String} the trimmed string
  */
  trimRight: function (str) {
    return str.replace(SC.STRING_TRIM_RIGHT_REGEXP,"");
  }
});


// IE doesn't support string trimming
if(String.prototype.trim) {
  SC.supplement(String.prototype,
  /** @scope String.prototype */ {

    trim: function() {
      return SC.String.trim(this, arguments);
    },

    trimLeft: function() {
      return SC.String.trimLeft(this, arguments);
    },

    trimRight: function() {
      return SC.String.trimRight(this, arguments);
    }
  });
}

// We want the version defined here, not in Runtime
SC.mixin(String.prototype,
/** @scope String.prototype */ {

  loc: function() {
    return SC.String.loc(this.toString(), SC.$A(arguments));
  },

  locMetric: function() {
    return SC.String.locMetric(this.toString());
  },

  locLayout: function(additionalHash) {
    return SC.String.locLayout(this.toString(), additionalHash);
  }

});


/* >>>>>>>>>> BEGIN source/mixins/delegate_support.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace

  Support methods for the Delegate design pattern.

  The Delegate design pattern makes it easy to delegate a portion of your
  application logic to another object.  This is most often used in views to
  delegate various application-logic decisions to controllers in order to
  avoid having to bake application-logic directly into the view itself.

  The methods provided by this mixin make it easier to implement this pattern
  but they are not required to support delegates.

  ## The Pattern

  The delegate design pattern typically means that you provide a property,
  usually ending in "delegate", that can be set to another object in the
  system.

  When events occur or logic decisions need to be made that you would prefer
  to delegate, you can call methods on the delegate if it is set.  If the
  delegate is not set, you should provide some default functionality instead.

  Note that typically delegates are not observable, hence it is not necessary
  to use get() to retrieve the value of the delegate.

  @since SproutCore 1.0

*/
SC.DelegateSupport = {

  /**
    Selects the delegate that implements the specified method name.  Pass one
    or more delegates.  The receiver is automatically included as a default.

    This can be more efficient than using invokeDelegateMethod() which has
    to marshall arguments into a delegate call.

    @param {String} methodName
    @param {Object...} delegate one or more delegate arguments
    @returns {Object} delegate or null
  */
  delegateFor: function(methodName) {
    var idx = 1,
        len = arguments.length,
        ret ;

    while(idx<len) {
      ret = arguments[idx];
      if (ret && ret[methodName] !== undefined) return ret ;
      idx++;
    }

    return (this[methodName] !== undefined) ? this : null;
  },

  /**
    Invokes the named method on the delegate that you pass.  If no delegate
    is defined or if the delegate does not implement the method, then a
    method of the same name on the receiver will be called instead.

    You can pass any arguments you want to pass onto the delegate after the
    delegate and methodName.

    @param {Object} delegate a delegate object.  May be null.
    @param {String} methodName a method name
    @param {Object...} args (OPTIONAL) any additional arguments

    @returns {Object} value returned by delegate
  */
  invokeDelegateMethod: function(delegate, methodName, args) {
    args = SC.A(arguments); args = args.slice(2, args.length) ;
    if (!delegate || !delegate[methodName]) delegate = this ;

    var method = delegate[methodName];
    return method ? method.apply(delegate, args) : null;
  },

  /**
    Search the named delegates for the passed property.  If one is found,
    gets the property value and returns it.  If none of the passed delegates
    implement the property, search the receiver for the property as well.

    @param {String} key the property to get.
    @param {Object} delegate one or more delegate
    @returns {Object} property value or undefined
  */
  getDelegateProperty: function(key, delegate) {
    var idx = 1,
        len = arguments.length,
        ret ;

    while(idx<len) {
      ret = arguments[idx++];
      if (ret && ret[key] !== undefined) {
        return ret.get ? ret.get(key) : ret[key] ;
      }
    }

    return (this[key] !== undefined) ? this.get(key) : undefined ;
  }

};

/* >>>>>>>>>> BEGIN source/views/view/base.js */
sc_require('mixins/delegate_support');

/** @class */
SC.CoreView = SC.Responder.extend(SC.DelegateSupport);

/* >>>>>>>>>> BEGIN source/views/view.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/browser');
sc_require('system/event');
sc_require('system/cursor');
sc_require('system/responder') ;
sc_require('system/theme');

sc_require('system/string') ;
sc_require('views/view/base') ;


/**
  Default property to disable or enable by default the contextMenu
*/
SC.CONTEXT_MENU_ENABLED = YES;

/**
  Default property to disable or enable if the focus can jump to the address
  bar or not.
*/
SC.TABBING_ONLY_INSIDE_DOCUMENT = NO;

/**
  Tells the property (when fetched with themed()) to get its value from the renderer (if any).
*/
SC.FROM_THEME = "__FROM_THEME__"; // doesn't really matter what it is, so long as it is unique. Readability is a plus.

/** @private - custom array used for child views */
SC.EMPTY_CHILD_VIEWS_ARRAY = [];
SC.EMPTY_CHILD_VIEWS_ARRAY.needsClone = YES;

/**
  @class

*/
SC.CoreView.reopen(
/** @scope SC.View.prototype */ {

  concatenatedProperties: ['outlets', 'displayProperties', 'classNames', 'renderMixin', 'didCreateLayerMixin', 'willDestroyLayerMixin'],

  /**
    The current pane.
    @property {SC.Pane}
  */
  pane: function() {
    var view = this ;
    while (view && !view.isPane) { view = view.get('parentView') ; }
    return view ;
  }.property('parentView').cacheable(),

  /**
    The page this view was instantiated from.  This is set by the page object
    during instantiation.

    @property {SC.Page}
  */
  page: null,

  /**
    If the view is currently inserted into the DOM of a parent view, this
    property will point to the parent of the view.
  */
  parentView: null,

  /**
    The isVisible property determines if the view is shown in the view
    hierarchy it is a part of. A view can have isVisible == YES and still have
    isVisibleInWindow == NO. This occurs, for instance, when a parent view has
    isVisible == NO. Default is YES.

    The isVisible property is considered part of the layout and so changing it
    will trigger a layout update.

    @property {Boolean}
  */
  isVisible: YES,
  isVisibleBindingDefault: SC.Binding.bool(),

  /**
    Whether the view should be displayed. This is always YES,
    unless the visibility module is added to SC.View.

    If the visibility module is added, this property will be used to
    optimize certain behaviors on the view. For example, updates to the
    view layer will not be performed until the view becomes visible
    in the window.
  */
  isVisibleInWindow: YES,

  // ..........................................................
  // CHILD VIEW SUPPORT
  //

  /**
    Array of child views.  You should never edit this array directly unless
    you are implementing createChildViews().  Most of the time, you should
    use the accessor methods such as appendChild(), insertBefore() and
    removeChild().

    @property {Array}
  */
  childViews: SC.EMPTY_CHILD_VIEWS_ARRAY,

  // ..........................................................
  // LAYER SUPPORT
  //

  /**
    Returns the current layer for the view.  The layer for a view is only
    generated when the view first becomes visible in the window and even
    then it will not be computed until you request this layer property.

    If the layer is not actually set on the view itself, then the layer will
    be found by calling this.findLayerInParentLayer().

    You can also set the layer by calling set on this property.

    @property {DOMElement} the layer
  */
  layer: function(key, value) {
    if (value !== undefined) {
      this._view_layer = value ;

    // no layer...attempt to discover it...
    } else {
      value = this._view_layer;
      if (!value) {
        var parent = this.get('parentView');
        if (parent) { parent = parent.get('layer'); }
        if (parent) { this._view_layer = value = this.findLayerInParentLayer(parent); }
      }
    }
    return value ;
  }.property('isVisibleInWindow').cacheable(),

  /**
    Get a CoreQuery object for this view's layer, or pass in a selector string
    to get a CoreQuery object for a DOM node nested within this layer.

    @param {String} sel a CoreQuery-compatible selector string
    @returns {SC.CoreQuery} the CoreQuery object for the DOM node
  */
  $: function(sel) {
    var layer = this.get('layer') ;

    if(!layer) { return SC.$(); }
    else if(sel === undefined) { return SC.$(layer); }
    else { return SC.$(sel, layer); }
  },

  /**
    Returns the DOM element that should be used to hold child views when they
    are added/remove via DOM manipulation.  The default implementation simply
    returns the layer itself.  You can override this to return a DOM element
    within the layer.

    @property {DOMElement} the container layer
  */
  containerLayer: function() {
    return this.get('layer') ;
  }.property('layer').cacheable(),

  /**
    The ID to use when trying to locate the layer in the DOM.  If you do not
    set the layerId explicitly, then the view's GUID will be used instead.
    This ID must be set at the time the view is created.

    @property {String}
    @readOnly
  */
  layerId: function(key, value) {
    if (value) { this._layerId = value; }
    if (this._layerId) { return this._layerId; }
    return SC.guidFor(this) ;
  }.property().cacheable(),

  /**
    Attempts to discover the layer in the parent layer.  The default
    implementation looks for an element with an ID of layerId (or the view's
    guid if layerId is null).  You can override this method to provide your
    own form of lookup.  For example, if you want to discover your layer using
    a CSS class name instead of an ID.

    @param {DOMElement} parentLayer the parent's DOM layer
    @returns {DOMElement} the discovered layer
  */
  findLayerInParentLayer: function(parentLayer) {
    var id = "#" + this.get('layerId');
    return jQuery(id)[0] || jQuery(id, parentLayer)[0] ;
  },

  /**
    Returns YES if the receiver is a subview of a given view or if it's
    identical to that view. Otherwise, it returns NO.

    @property {SC.View} view
  */
  isDescendantOf: function(view) {
    var parentView = this.get('parentView');

    if(this === view) { return YES; }
    else if(parentView) { return parentView.isDescendantOf(view); }
    else { return NO; }
  },

  /**
    This method is invoked whenever a display property changes.  It will set
    the layerNeedsUpdate method to YES.  If you need to perform additional
    setup whenever the display changes, you can override this method as well.

    @returns {SC.View} receiver
  */
  displayDidChange: function() {
    this.set('layerNeedsUpdate', YES) ;
    return this;
  },

  /**
    Marks the view as needing a display update if the isVisible property changes.

    Note that this behavior is identical to a display property. It is broken out
    into its own observer so that it can be overridden with additional
    functionality if the visibility module is applied to SC.View.
  */
  _sc_isVisibleDidChange: function() {
    this.displayDidChange();
  }.observes('isVisible'),

  /**
    Setting this property to YES will cause the updateLayerIfNeeded method to
    be invoked at the end of the runloop.  You can also force a view to update
    sooner by calling updateLayerIfNeeded() directly.  The method will update
    the layer only if this property is YES.

    @property {Boolean}
    @test in updateLayer
  */
  layerNeedsUpdate: NO,

  /** @private
    Schedules the updateLayerIfNeeded method to run at the end of the runloop
    if layerNeedsUpdate is set to YES.
  */
  _view_layerNeedsUpdateDidChange: function() {
    if (this.get('layerNeedsUpdate')) {
      this.invokeOnce(this.updateLayerIfNeeded) ;
    }
  }.observes('layerNeedsUpdate'),

  /**
    Updates the layer only if the view is visible onscreen and if
    layerNeedsUpdate is set to YES.  Normally you will not invoke this method
    directly.  Instead you set the layerNeedsUpdate property to YES and this
    method will be called once at the end of the runloop.

    If you need to update view's layer sooner than the end of the runloop, you
    can call this method directly.  If your view is not visible in the window
    but you want it to update anyway, then call this method, passing YES for
    the 'skipIsVisibleInWindowCheck' parameter.

    You should not override this method.  Instead override updateLayer() or
    render().

    @returns {SC.View} receiver
    @test in updateLayer
  */
  updateLayerIfNeeded: function(skipIsVisibleInWindowCheck) {
    var needsUpdate  = this.get('layerNeedsUpdate'),
        shouldUpdate = needsUpdate  &&  (skipIsVisibleInWindowCheck || this.get('isVisibleInWindow'));
    if (shouldUpdate) {
      // only update a layer if it already exists
      if (this.get('layer')) {
        this.beginPropertyChanges() ;
        this.set('layerNeedsUpdate', NO) ;
        this.updateLayer() ;
        this.endPropertyChanges() ;
      }
    }

    return this ;
  },

  /**
    This is the core method invoked to update a view layer whenever it has
    changed.  This method simply creates a render context focused on the
    layer element and then calls your render() method.

    You will not usually call or override this method directly.  Instead you
    should set the layerNeedsUpdate property to YES to cause this method to
    run at the end of the run loop, or you can call updateLayerIfNeeded()
    to force the layer to update immediately.

    Instead of overriding this method, consider overidding the render() method
    instead, which is called both when creating and updating a layer.  If you
    do not want your render() method called when updating a layer, then you
    should override this method instead.

    @param optionalContext provided only for backwards-compatibility.

    @returns {SC.View} receiver
  */
  updateLayer: function(optionalContext) {
    var mixins, idx, len, hasLegacyRenderMethod;

    var context = optionalContext || this.renderContext(this.get('layer')) ;
    this._renderLayerSettings(context, NO);

    // If the render method takes two parameters, we assume that it is a
    // legacy implementation that takes context and firstTime. If it has only
    // one parameter, we assume it is the render delegates style that requires
    // only context. Note that, for backwards compatibility, the default
    // SC.View implementation of render uses the old style.
    hasLegacyRenderMethod = !this.update;
    // Call render with firstTime set to NO to indicate an update, rather than
    // full re-render, should be performed.
    if (hasLegacyRenderMethod) {
      this.render(context, NO);
    }
    else {
      this.update(context.$());
    }
    if (mixins = this.renderMixin) {
      len = mixins.length;
      for(idx=0; idx<len; ++idx) { mixins[idx].call(this, context, NO) ; }
    }

    context.update() ;
    if (context._innerHTMLReplaced) {
      var pane = this.get('pane');
      if(pane && pane.get('isPaneAttached')) {
        this._notifyDidAppendToDocument();
      }
    }

    // If this view uses static layout, then notify that the frame (likely)
    // changed.
    if (this.useStaticLayout) { this.viewDidResize(); }

    if (this.didUpdateLayer) { this.didUpdateLayer(); } // call to update DOM
    if(this.designer && this.designer.viewDidUpdateLayer) {
      this.designer.viewDidUpdateLayer(); //let the designer know
    }
    return this ;
  },

  parentViewDidResize: function() {
    if (!this.get('hasLayout')) { this.notifyPropertyChange('frame'); }
    this.viewDidResize();
  },

  /**
    Override this in a child class to define behavior that should be invoked
    when a parent's view was resized.
   */
  viewDidResize: function() {},

  /**
    Creates a new renderContext with the passed tagName or element.  You
    can override this method to provide further customization to the context
    if needed.  Normally you will not need to call or override this method.

    @returns {SC.RenderContext}
  */
  renderContext: function(tagNameOrElement) {
    return SC.RenderContext(tagNameOrElement) ;
  },

  /**
    Creates the layer by creating a renderContext and invoking the view's
    render() method.  This will only create the layer if the layer does not
    already exist.

    When you create a layer, it is expected that your render() method will
    also render the HTML for all child views as well.  This method will
    notify the view along with any of its childViews that its layer has been
    created.

    @returns {SC.View} receiver
  */
  createLayer: function() {
    if (this.get('layer')) { return this ; } // nothing to do

    var context = this.renderContext(this.get('tagName')) ;

    // now prepare the content like normal.
    this.renderToContext(context) ;
    this.set('layer', context.element()) ;

    // now notify the view and its child views..
    this._notifyDidCreateLayer() ;

    return this ;
  },

  /** @private -
    Invokes the receivers didCreateLayer() method if it exists and then
    invokes the same on all child views.
  */
  _notifyDidCreateLayer: function() {
    this.notifyPropertyChange('layer');

    if (this.didCreateLayer) { this.didCreateLayer() ; }

    // and notify others
    var mixins = this.didCreateLayerMixin, len, idx,
        childViews = this.get('childViews'),
        childView;
    if (mixins) {
      len = mixins.length ;
      for (idx=0; idx<len; ++idx) { mixins[idx].call(this) ; }
    }

    len = childViews.length ;
    for (idx=0; idx<len; ++idx) {
      childView = childViews[idx];
      if (!childView) { continue; }

      // A parent view creating a layer might result in the creation of a
      // child view's DOM node being created via a render context without
      // createLayer() being invoked on the child.  In such cases, if anyone
      // had requested 'layer' and it was cached as null, we need to
      // invalidate it.
      childView.notifyPropertyChange('layer');

      // A strange case, that a childView's frame won't be correct before
      // we have a layer, if the childView doesn't have a fixed layout
      // and we are using static layout
      if (this.get('useStaticLayout')) {
        if (!childView.get('isFixedLayout')) { childView.viewDidResize(); }
      }

      childView._notifyDidCreateLayer() ;
    }
  },

  /**
    Destroys any existing layer along with the layer for any child views as
    well.  If the view does not currently have a layer, then this method will
    do nothing.

    If you implement willDestroyLayer() on your view or if any mixins
    implement willDestroLayerMixin(), then this method will be invoked on your
    view before your layer is destroyed to give you a chance to clean up any
    event handlers, etc.

    If you write a willDestroyLayer() handler, you can assume that your
    didCreateLayer() handler was called earlier for the same layer.

    Normally you will not call or override this method yourself, but you may
    want to implement the above callbacks when it is run.

    @returns {SC.View} receiver
  */
  destroyLayer: function() {
    var layer = this.get('layer') ;
    if (layer) {

      // Now notify the view and its child views.  It will also set the
      // layer property to null.
      this._notifyWillDestroyLayer() ;

      // do final cleanup
      if (layer.parentNode) { layer.parentNode.removeChild(layer) ; }
      layer = null ;
    }
    return this ;
  },

  /**
    Destroys and recreates the current layer.  This can be more efficient than
    modifying individual child views.

    @returns {SC.View} receiver
  */
  replaceLayer: function() {
    this.destroyLayer();
    //this.set('layerLocationNeedsUpdate', YES) ;
    this.invokeOnce(this.updateLayerLocation) ;
  },

  /**
    If the parent view has changed, we need to insert this
    view's layer into the layer of the new parent view.
  */
  parentViewDidChange: function() {
    this.parentViewDidResize();
    this.updateLayerLocation();
  },

  /**
    Set to YES when the view's layer location is dirty.  You can call
    updateLayerLocationIfNeeded() to clear this flag if it is set.

    @property {Boolean}
  */
  layerLocationNeedsUpdate: NO,

  /**
    Calls updateLayerLocation(), but only if the view's layer location
    currently needs to be updated.  This method is called automatically at
    the end of a run loop if you have called parentViewDidChange() at some
    point.

    @property {Boolean} force This property is ignored.
    @returns {SC.View} receiver
    @test in updateLayerLocation
  */
  updateLayerLocationIfNeeded: function(force) {
    if (this.get('layerLocationNeedsUpdate')) {
      this.updateLayerLocation() ;
    }
    return this ;
  },

  /**
    This method is called when a view changes its location in the view
    hierarchy.  This method will update the underlying DOM-location of the
    layer so that it reflects the new location.

    @returns {SC.View} receiver
  */
  updateLayerLocation: function() {
    // collect some useful value
    // if there is no node for some reason, just exit
    var node = this.get('layer'),
        parentView = this.get('parentView'),
        parentNode = parentView ? parentView.get('containerLayer') : null ;

    // remove node from current parentNode if the node does not match the new
    // parent node.
    if (node && node.parentNode && node.parentNode !== parentNode) {
      node.parentNode.removeChild(node);
    }

    // CASE 1: no new parentView.  just remove from parent (above).
    if (!parentView) {
      if (node && node.parentNode) { node.parentNode.removeChild(node); }

    // CASE 2: parentView has no layer, view has layer.  destroy layer
    // CASE 3: parentView has no layer, view has no layer, nothing to do
    } else if (!parentNode) {
      if (node) {
        if (node.parentNode) { node.parentNode.removeChild(node); }
        this.destroyLayer();
      }

    // CASE 4: parentView has layer, view has no layer.  create layer & add
    // CASE 5: parentView has layer, view has layer.  move layer
    } else {
      if (!node) {
        this.createLayer() ;
        node = this.get('layer') ;
        if (!node) { return; } // can't do anything without a node.
      }

      var siblings = parentView.get('childViews'),
          nextView = siblings.objectAt(siblings.indexOf(this)+1),
          nextNode = (nextView) ? nextView.get('layer') : null ;

      // before we add to parent node, make sure that the nextNode exists...
      if (nextView && (!nextNode || nextNode.parentNode!==parentNode)) {
        nextView.updateLayerLocationIfNeeded() ;
        nextNode = nextView.get('layer') ;
      }

      // add to parentNode if needed.
      if ((node.parentNode!==parentNode) || (node.nextSibling!==nextNode)) {
        parentNode.insertBefore(node, nextNode) ;
      }
    }

    parentNode = parentView = node = nextNode = null ; // avoid memory leaks

    this.set('layerLocationNeedsUpdate', NO) ;

    return this ;
  },

  /** @private -
    Invokes willDestroyLayer() on view and child views.  Then sets layer to
    null for receiver.
  */
  _notifyWillDestroyLayer: function() {
    if (this.willDestroyLayer) { this.willDestroyLayer() ; }
    var mixins = this.willDestroyLayerMixin, len, idx,
        childViews = this.get('childViews') ;
    if (mixins) {
      len = mixins.length ;
      for (idx=0; idx<len; ++idx) { mixins[idx].call(this) ; }
    }

    len = childViews.length ;
    for (idx=0; idx<len; ++idx) { childViews[idx]._notifyWillDestroyLayer() ; }

    this.set('layer', null) ;
  },



  /**
    @private

    Renders to a context.
    Rendering only happens for the initial rendering. Further updates happen in updateLayer,
    and are not done to contexts, but to layers.
    Note: You should not generally override nor directly call this method. This method is only
    called by createLayer to set up the layer initially, and by renderChildViews, to write to
    a context.

    @param {SC.RenderContext} context the render context.
    @param {Boolean} firstTime Provided for compatibility when rendering legacy views only.
  */
  renderToContext: function(context, firstTime) {
    var hasLegacyRenderMethod, mixins, idx, len;

    this.beginPropertyChanges() ;
    this.set('layerNeedsUpdate', NO) ;

    if (SC.none(firstTime)) { firstTime = YES; }

    this._renderLayerSettings(context, firstTime);

    // If the render method takes two parameters, we assume that it is a
    // legacy implementation that takes context and firstTime. If it has only
    // one parameter, we assume it is the render delegates style that requires
    // only context. Note that, for backwards compatibility, the default
    // SC.View implementation of render uses the old style.
    hasLegacyRenderMethod = !this.update;

    // Let the render method handle rendering. If we have a render delegate
    // object set, it will be used there.
    if (hasLegacyRenderMethod) {
      this.render(context, firstTime);
    }
    // This view implements the render delegate protocol.
    else {
      if (firstTime) {
        this.render(context);
      } else {
        this.update(context.$());
      }
    }

    // If we've made it this far and renderChildViews() was never called,
    // render any child views now.
    if (firstTime && !this._didRenderChildViews) { this.renderChildViews(context, firstTime); }
    // Reset the flag so that if the layer is recreated we re-render the child views
    this._didRenderChildViews = NO;


    if (mixins = this.renderMixin) {
      len = mixins.length;
      for(idx=0; idx<len; ++idx) { mixins[idx].call(this, context, firstTime) ; }
    }

    this.endPropertyChanges() ;
  },

  _renderLayerSettings: function(context, firstTime) {
    context.resetClassNames();
    context.resetStyles();

    this.applyAttributesToContext(context);
  },

  applyAttributesToContext: function(context) {
    context.addClass(this.get('classNames'));

    if (this.get('isTextSelectable')) { context.addClass('allow-select'); }
    if (!this.get('isVisible')) { context.addClass('sc-hidden'); }
    if (this.get('isFirstResponder')) { 
      context.addClass('focus');
      context.attr('tabindex', '0'); 
    }else{
      context.attr('tabindex', '-1');
    }

    context.id(this.get('layerId'));
    context.attr('role', this.get('ariaRole'));
  },

  /**
  @private

    Invoked by createLayer() and updateLayer() to actually render a context.
    This method calls the render() method on your view along with any
    renderMixin() methods supplied by mixins you might have added.

    You should not override this method directly. Nor should you call it. It is OLD.

    @param {SC.RenderContext} context the render context
    @param {Boolean} firstTime YES if this is creating a layer
    @returns {void}
  */
  prepareContext: function(context, firstTime) {
    // eventually, firstTime will be removed because it is ugly.
    // for now, we will sense whether we are doing things the ugly way or not.
    // if ugly, we will allow updates through.
    if (firstTime !== false) { firstTime = YES; } // the GOOD code path :)

    if (firstTime) {
      this.renderToContext(context);
    } else {
      this.updateLayer(context);
    }
  },

  /**
    Your render method should invoke this method to render any child views,
    especially if this is the first time the view will be rendered.  This will
    walk down the childView chain, rendering all of the children in a nested
    way.

    @param {SC.RenderContext} context the context
    @param {Boolean} firstName true if the layer is being created
    @returns {SC.RenderContext} the render context
    @test in render
  */
  renderChildViews: function(context, firstTime) {
    var cv = this.get('childViews'), len = cv.length, idx, view ;
    for (idx=0; idx<len; ++idx) {
      view = cv[idx] ;
      if (!view) { continue; }
      context = context.begin(view.get('tagName')) ;
      view.renderToContext(context, firstTime);
      context = context.end() ;
    }
    this._didRenderChildViews = YES;

    return context;
  },

  /** @private -
    override to add support for theming or in your view
  */
  render: function() { },

  /** @private -
    Invokes the receivers didAppendLayerToDocument() method if it exists and
    then invokes the same on all child views.
  */

  _notifyDidAppendToDocument: function() {
    if (!this.get('hasLayout')) { this.notifyPropertyChange('frame'); }
    if (this.didAppendToDocument) { this.didAppendToDocument(); }

    var i=0, child, childLen, children = this.get('childViews');
    for(i=0, childLen=children.length; i<childLen; i++) {
      child = children[i];
      if(child._notifyDidAppendToDocument){
        child._notifyDidAppendToDocument();
      }
    }
  },

  childViewsObserver: function(){
    var childViews = this.get('childViews'), i, iLen, child;
    for(i=0, iLen = childViews.length; i<iLen; i++){
      child = childViews[i];
      if(child._notifyDidAppendToDocument){
        child._notifyDidAppendToDocument();
      }
    }
  }.observes('childViews'),

  // ..........................................................
  // STANDARD RENDER PROPERTIES
  //

  /**
    Tag name for the view's outer element.  The tag name is only used when
    a layer is first created.  If you change the tagName for an element, you
    must destroy and recreate the view layer.

    @property {String}
  */
  tagName: 'div',

  /**
    The WAI-ARIA role of the control represented by this view. For example, a
    button may have a role of type 'button', or a pane may have a role of
    type 'alertdialog'. This property is used by assistive software to help
    visually challenged users navigate rich web applications.

    The full list of valid WAI-ARIA roles is available at:
    http://www.w3.org/TR/wai-aria/roles#roles_categorization

    @property {String}
  */
  ariaRole: null,

  /**
    Standard CSS class names to apply to the view's outer element.  This
    property automatically inherits any class names defined by the view's
    superclasses as well.

    @property {Array}
  */
  classNames: [],

  /**
    Tool tip property that will be set to the title attribute on the HTML
    rendered element.

    @property {String}
  */
  toolTip: null,

  /**
    The computed tooltip.  This is generated by localizing the toolTip
    property if necessary.

    @property {String}
  */
  displayToolTip: function() {
    var ret = this.get('toolTip');
    return (ret && this.get('localize')) ? SC.String.loc(ret) : (ret || '');
  }.property('toolTip','localize').cacheable(),

  /**
    Determines if the user can select text within the view.  Normally this is
    set to NO to disable text selection.  You should set this to YES if you
    are creating a view that includes editable text.  Otherwise, settings this
    to YES will probably make your controls harder to use and it is not
    recommended.

    @property {Boolean}
    @readOnly
  */
  isTextSelectable: NO,

  /**
    You can set this array to include any properties that should immediately
    invalidate the display.  The display will be automatically invalidated
    when one of these properties change.

    These are the properties that will be visible to any Render Delegate.
    When the RenderDelegate asks for a property it needs, the view checks the
    displayProperties array. It first looks for the property name prefixed
    by 'display'; for instance, if the render delegate needs a 'title',
    the view will attempt to find 'displayTitle'. If there is no 'displayTitle'
    in displayProperties, the view will then try 'title'. If 'title' is not
    in displayProperties either, an error will be thrown.

    This allows you to avoid collisions between your view's API and the Render
    Delegate's API.

    Implementation note:  'isVisible' is also effectively a display property,
    but it is not declared as such because the same effect is implemented
    inside _sc_isVisibleDidChange().  This avoids having two observers on
    'isVisible', which is:
      a.  More efficient
      b.  More correct, because we can guarantee the order of operations

    @property {Array}
    @readOnly
  */
  displayProperties: [],

  // .......................................................
  // SC.RESPONDER SUPPORT
  //

  /** @property
    The nextResponder is usually the parentView.
  */
  nextResponder: function() {
    return this.get('parentView') ;
  }.property('parentView').cacheable(),


  /** @property
    Set to YES if your view is willing to accept first responder status.  This
    is used when calculcating key responder loop.
  */
  acceptsFirstResponder: NO,

  // .......................................................
  // CORE DISPLAY METHODS
  //

  /** @private
    Setup a view, but do not finish waking it up.

     - configure childViews
     - Determine the view's theme
     - Fetch a render delegate from the theme, if necessary
     - register the view with the global views hash, which is used for event
       dispatch
  */
  init: function() {
    var parentView = this.get('parentView'),
        path, root, lp, displayProperties ;

    arguments.callee.base.apply(this,arguments);

    // Register the view for event handling. This hash is used by
    // SC.RootResponder to dispatch incoming events.
    SC.View.views[this.get('layerId')] = this;

    // setup child views.  be sure to clone the child views array first
    this.childViews = this.get('childViews').slice() ;
    this.createChildViews() ; // setup child Views

    // register display property observers ..
    // TODO: Optimize into class setup
    displayProperties = this.get('displayProperties') ;
    for(var i=0, l=displayProperties.length; i<l; i++) {
      this.addObserver(displayProperties[i], this, this.displayDidChange);
    }
  },

  /**
    Wakes up the view. The default implementation immediately syncs any
    bindings, which may cause the view to need its display updated. You
    can override this method to perform any additional setup. Be sure to
    call sc_super to setup bindings and to call awake on childViews.

    It is best to awake a view before you add it to the DOM.  This way when
    the DOM is generated, it will have the correct initial values and will
    not require any additional setup.

    @returns {void}
  */
  awake: function() {
    arguments.callee.base.apply(this,arguments);
    var childViews = this.get('childViews'), len = childViews.length, idx ;
    for (idx=0; idx<len; ++idx) {
      if (!childViews[idx]) { continue ; }
      childViews[idx].awake() ;
    }
  },

  /**
    Frame describes the current bounding rect for your view.  This is always
    measured from the top-left corner of the parent view.

    @property {Rect}
    @test in layoutStyle
  */
  frame: function() {
    return this.computeFrameWithParentFrame(null) ;
  }.property('useStaticLayout').cacheable(),    // We depend on the layout, but layoutDidChange will call viewDidResize to check the frame for us

  /**
    Computes the frame of the view by examining the view's DOM representation.
    If no representation exists, returns null.

    If the view has a parent view, the parent's bounds will be taken into account when
    calculating the frame.

    @returns {Rect} the computed frame
  */
  computeFrameWithParentFrame: function() {
    var layer,                            // The view's layer
        pv = this.get('parentView'),      // The view's parent view (if it exists)
        f;                                // The layer's coordinates in the document

    // need layer to be able to compute rect
    if (layer = this.get('layer')) {
      f = SC.offset(layer); // x,y
      if (pv) { f = pv.convertFrameFromView(f, null); }

      /*
        TODO Can probably have some better width/height values - CC
        FIXME This will probably not work right with borders - PW
      */
      f.width = layer.offsetWidth;
      f.height = layer.offsetHeight;
      return f;
    }

    // Unable to compute yet
    if (this.get('hasLayout')) {
      return null;
    } else {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
  },

  /**
    The clipping frame returns the visible portion of the view, taking into
    account the clippingFrame of the parent view.  Keep in mind that
    the clippingFrame is in the context of the view itself, not it's parent
    view.

    Normally this will be calculated based on the intersection of your own
    clippingFrame and your parentView's clippingFrame.

    @property {Rect}
  */
  clippingFrame: function() {
    var f = this.get('frame'),
        ret = f,
        pv, cf;

    if (!f) return null;
    pv = this.get('parentView');
    if (pv) {
      cf = pv.get('clippingFrame');
      if (!cf) return { x: 0, y: 0, width: f.width, height: f.height};
      ret = SC.intersectRects(cf, f);
    }
    ret.x -= f.x;
    ret.y -= f.y;

    return ret;
  }.property('parentView', 'frame').cacheable(),

  /** @private
    This method is invoked whenever the clippingFrame changes, notifying
    each child view that its clippingFrame has also changed.
  */
  _sc_view_clippingFrameDidChange: function() {
    var cvs = this.get('childViews'), len = cvs.length, idx, cv ;
    for (idx=0; idx<len; ++idx) {
      cv = cvs[idx] ;

      cv.notifyPropertyChange('clippingFrame') ;
      cv._sc_view_clippingFrameDidChange();
    }
  },

  /**
    Removes the child view from the parent view.

    @param {SC.View} view
    @returns {SC.View} receiver
  */
  removeChild: function(view) {
    // update parent node
    view.set('parentView', null) ;

    // remove view from childViews array.
    var childViews = this.get('childViews'),
        idx = childViews.indexOf(view) ;
    if (idx>=0) { childViews.removeAt(idx); }

    return this ;
  },

  /**
    Removes all children from the parentView.

    @returns {SC.View} receiver
  */
  removeAllChildren: function() {
    var childViews = this.get('childViews'), view ;
    while (view = childViews.objectAt(childViews.get('length')-1)) {
      this.removeChild(view) ;
    }
    return this ;
  },

  /**
    Removes the view from its parentView, if one is found.  Otherwise
    does nothing.

    @returns {SC.View} receiver
  */
  removeFromParent: function() {
    var parent = this.get('parentView') ;
    if (parent) { parent.removeChild(this) ; }
    return this ;
  },

  /**
    You must call this method on a view to destroy the view (and all of its
    child views). This will remove the view from any parent node, then make
    sure that the DOM element managed by the view can be released by the
    memory manager.
  */
  destroy: function() {
    if (this.get('isDestroyed')) { return this; } // nothing to do

    this._destroy(); // core destroy method

    // remove from parent if found
    if (this.get('parentView')) { this.removeFromParent(); }

    //Do generic destroy. It takes care of mixins and sets isDestroyed to YES.
    arguments.callee.base.apply(this,arguments);
    return this; // done with cleanup
  },

  _destroy: function() {
    if (this.get('isDestroyed')) { return this ; } // nothing to do

    // destroy the layer -- this will avoid each child view destroying
    // the layer over and over again...
    this.destroyLayer() ;

    // first destroy any children.
    var childViews = this.get('childViews'), len = childViews.length, idx ;
    if (len) {
      childViews = childViews.slice() ;
      for (idx=0; idx<len; ++idx) { childViews[idx].destroy() ; }
    }

    // next remove view from global hash
    delete SC.View.views[this.get('layerId')] ;
    delete this._CQ ;
    delete this.page ;

    return this ;
  },

  /**
    This method is called when your view is first created to setup any  child
    views that are already defined on your class.  If any are found, it will
    instantiate them for you.

    The default implementation of this method simply steps through your
    childViews array, which is expects to either be empty or to contain View
    designs that can be instantiated

    Alternatively, you can implement this method yourself in your own
    subclasses to look for views defined on specific properties and then build
     a childViews array yourself.

    Note that when you implement this method yourself, you should never
    instantiate views directly.  Instead, you should use
    this.createChildView() method instead.  This method can be much faster in
    a production environment than creating views yourself.

    @returns {SC.View} receiver
  */
  createChildViews: function() {
    var childViews = this.get('childViews'),
        len        = childViews.length,
        idx, key, views, view ;

    this.beginPropertyChanges() ;

    // swap the array
    for (idx=0; idx<len; ++idx) {
      if (key = (view = childViews[idx])) {

        // is this is a key name, lookup view class
        if (typeof key === SC.T_STRING) {
          view = this[key];
        } else {
          key = null ;
        }

        if (!view) {
          SC.Logger.error ("No view with name "+key+" has been found in "+this.toString());
          // skip this one.
          continue;
        }

        // createChildView creates the view if necessary, but also sets
        // important properties, such as parentView
        view = this.createChildView(view) ;
        if (key) { this[key] = view ; } // save on key name if passed
      }
      childViews[idx] = view;
    }

    this.endPropertyChanges() ;
    return this ;
  },

  /**
    Instantiates a view to be added to the childViews array during view
    initialization. You generally will not call this method directly unless
    you are overriding createChildViews(). Note that this method will
    automatically configure the correct settings on the new view instance to
    act as a child of the parent.

    @param {Class} viewClass
    @param {Hash} attrs optional attributes to add
    @returns {SC.View} new instance
    @test in createChildViews
  */
  createChildView: function(view, attrs) {
    if (!view.isClass) {
      attrs = view;
    } else {
      // attrs should always exist...
      if (!attrs) { attrs = {} ; }
      // clone the hash that was given so we dont pollute it if it's being reused
      else { attrs = SC.clone(attrs); }
    }

    attrs.owner = attrs.parentView = this ;

    // We need to set isVisibleInWindow before the init method is called on the view
    // The prototype check is a bit hackish and should be revisited - PDW
    if (view.isClass && view.prototype.hasVisibility) {
      attrs.isVisibleInWindow = this.get('isVisibleInWindow');
    }

    if (!attrs.page) { attrs.page = this.page ; }

    // Now add this to the attributes and create.
    if (view.isClass) { view = view.create(attrs); }

    return view ;
  },

  /** walk like a duck */
  isView: YES,

  /**
    Default method called when a selectstart event is triggered. This event is
    only supported by IE. Used in sproutcore to disable text selection and
    IE8 accelerators. The accelerators will be enabled only in
    text selectable views. In FF and Safari we use the css style 'allow-select'.

    If you want to enable text selection in certain controls is recommended
    to override this function to always return YES , instead of setting
    isTextSelectable to true.

    For example in textfield you dont want to enable textSelection on the text
    hint only on the actual text you are entering. You can achieve that by
    only overriding this method.

    @param evt {SC.Event} the selectstart event
    @returns YES if selectable
  */
  selectStart: function(evt) {
    return this.get('isTextSelectable');
  },

  /**
    Used to block the contextMenu per view.

    @param evt {SC.Event} the contextmenu event
    @returns YES if the contextmenu can show up
  */
  contextMenu: function(evt) {
    if (this.get('isContextMenuEnabled')) { return YES; }
  }

});

SC.CoreView.mixin(/** @scope SC.CoreView.prototype */ {

  /** @private walk like a duck -- used by SC.Page */
  isViewClass: YES,

  /**
    This method works just like extend() except that it will also preserve
    the passed attributes in case you want to use a view builder later, if
    needed.

    @param {Hash} attrs Attributes to add to view
    @returns {Class} SC.View subclass to create
    @function
  */
  design: function() {
    if (this.isDesign) {
      
      SC.Logger.warn("SC.View#design called twice for %@.".fmt(this));
      
      return this;
    }

    var ret = this.extend.apply(this, arguments);
    ret.isDesign = YES ;
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didLoadDesign(ret, this, SC.A(arguments));
    }
    return ret ;
  },

  extend: function() {
    var last = arguments[arguments.length - 1];

    if (last && !SC.none(last.theme)) {
      last.themeName = last.theme;
      delete last.theme;
    }

    return SC.Object.extend.apply(this, arguments);
  },

  /**
    Helper applies the layout to the prototype.
  */
  layout: function(layout) {
    this.prototype.layout = layout ;
    return this ;
  },

  /**
    Helper applies the classNames to the prototype
  */
  classNames: function(sc) {
    sc = (this.prototype.classNames || []).concat(sc);
    this.prototype.classNames = sc;
    return this ;
  },

  /**
    Help applies the tagName
  */
  tagName: function(tg) {
    this.prototype.tagName = tg;
    return this ;
  },

  /**
    Helper adds the childView
  */
  childView: function(cv) {
    var childViews = this.prototype.childViews || [];
    if (childViews === this.superclass.prototype.childViews) {
      childViews = childViews.slice();
    }
    childViews.push(cv) ;
    this.prototype.childViews = childViews;
    return this ;
  },

  /**
    Helper adds a binding to a design
  */
  bind: function(keyName, path) {
    var p = this.prototype, s = this.superclass.prototype;
    var bindings = p._bindings ;
    if (!bindings || bindings === s._bindings) {
      bindings = p._bindings = (bindings || []).slice() ;
    }

    keyName = keyName + "Binding";
    p[keyName] = path ;
    bindings.push(keyName);

    return this ;
  },

  /**
    Helper sets a generic property on a design.
  */
  prop: function(keyName, value) {
    this.prototype[keyName] = value;
    return this ;
  },

  /**
    Used to construct a localization for a view.  The default implementation
    will simply return the passed attributes.
  */
  localization: function(attrs, rootElement) {
    // add rootElement
    if (rootElement) attrs.rootElement = SC.$(rootElement)[0];
    return attrs;
  },

  /**
    Creates a view instance, first finding the DOM element you name and then
    using that as the root element.  You should not use this method very
    often, but it is sometimes useful if you want to attach to already
    existing HTML.

    @param {String|Element} element
    @param {Hash} attrs
    @returns {SC.View} instance
  */
  viewFor: function(element, attrs) {
    var args = SC.$A(arguments); // prepare to edit
    if (SC.none(element)) {
      args.shift(); // remove if no element passed
    } else args[0] = { rootElement: SC.$(element)[0] } ;
    var ret = this.create.apply(this, arguments) ;
    args = args[0] = null;
    return ret ;
  },

  /**
    Create a new view with the passed attributes hash.  If you have the
    Designer module loaded, this will also create a peer designer if needed.
  */
  create: function() {
    var last = arguments[arguments.length - 1];

    if (last && last.theme) {
      last.themeName = last.theme;
      delete last.theme;
    }

    var C=this, ret = new C(arguments);
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didCreateView(ret, SC.$A(arguments));
    }
    return ret ;
  },

  /**
    Applies the passed localization hash to the component views.  Call this
    method before you call create().  Returns the receiver.  Typically you
    will do something like this:

    view = SC.View.design({...}).loc(localizationHash).create();

    @param {Hash} loc
    @param rootElement {String} optional rootElement with prepped HTML
    @returns {SC.View} receiver
  */
  loc: function(loc) {
    var childLocs = loc.childViews;
    delete loc.childViews; // clear out child views before applying to attrs

    this.applyLocalizedAttributes(loc) ;
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didLoadLocalization(this, SC.$A(arguments));
    }

    // apply localization recursively to childViews
    var childViews = this.prototype.childViews, idx = childViews.length,
      viewClass;
    while(--idx>=0) {
      viewClass = childViews[idx];
      loc = childLocs[idx];
      if (loc && viewClass && typeof viewClass === SC.T_STRING) SC.String.loc(viewClass, loc);
    }

    return this; // done!
  },

  /**
    Internal method actually updates the localizated attributes on the view
    class.  This is overloaded in design mode to also save the attributes.
  */
  applyLocalizedAttributes: function(loc) {
    SC.mixin(this.prototype, loc) ;
  },

  views: {}

}) ;

// .......................................................
// OUTLET BUILDER
//

/**
  Generates a computed property that will look up the passed property path
  the first time you try to get the value.  Use this whenever you want to
  define an outlet that points to another view or object.  The root object
  used for the path will be the receiver.
*/
SC.outlet = function(path, root) {
  return function(key) {
    return (this[key] = SC.objectForPropertyPath(path, (root !== undefined) ? root : this)) ;
  }.property();
};

/** @private on unload clear cached divs. */
SC.CoreView.unload = function() {
  // delete view items this way to ensure the views are cleared.  The hash
  // itself may be owned by multiple view subclasses.
  var views = SC.View.views;
  if (views) {
   for(var key in views) {
     if (!views.hasOwnProperty(key)) continue ;
     delete views[key];
   }
  }
} ;

/**
  @class

  Base class for managing a view.  Views provide two functions:

   1. They translate state and events into drawing instructions for the
     web browser and
   2. They act as first responders for incoming keyboard, mouse, and
     touch events.

  View Initialization
  ====

  When a view is setup, there are several methods you can override that
  will be called at different times depending on how your view is created.
  Here is a guide to which method you want to override and when:

   - `init` -- override this method for any general object setup (such as
     observers, starting timers and animations, etc) that you need to happen
     everytime the view is created, regardless of whether or not its layer
     exists yet.
   - `render` -- override this method to generate or update your HTML to reflect
     the current state of your view.  This method is called both when your view
     is first created and later anytime it needs to be updated.
   - `didCreateLayer` -- the render() method is used to generate new HTML.
     Override this method to perform any additional setup on the DOM you might
     need to do after creating the view.  For example, if you need to listen
     for events.
   - `willDestroyLayer` -- if you implement didCreateLayer() to setup event
     listeners, you should implement this method as well to remove the same
     just before the DOM for your view is destroyed.
   - `updateLayer` -- Normally, when a view needs to update its content, it will
     re-render the view using the render() method.  If you would like to
     override this behavior with your own custom updating code, you can
     replace updateLayer() with your own implementation instead.
   - `didAppendToDocument` -- in theory all DOM setup could be done
     in didCreateLayer() as you already have a DOM element instantiated.
     However there is cases where the element has to be first appended to the
     Document because there is either a bug on the browser or you are using
     plugins which objects are not instantiated until you actually append the
     element to the DOM. This will allow you to do things like registering
     DOM events on flash or quicktime objects.

  @extends SC.Responder
  @extends SC.DelegateSupport
  @since SproutCore 1.0

*/
SC.View = SC.CoreView.extend(/** @scope SC.View.prototype */{
  classNames: ['sc-view'],
  
  displayProperties: ['isFirstResponder']
});

//unload views for IE, trying to collect memory.
if(SC.browser.msie) SC.Event.add(window, 'unload', SC.View, SC.View.unload) ;



/* >>>>>>>>>> BEGIN source/views/template.js */
sc_require("ext/handlebars");
sc_require("ext/handlebars/bind");
sc_require("ext/handlebars/collection");
sc_require("ext/handlebars/localization");
sc_require("ext/handlebars/view");
sc_require("views/view");

// Global hash of shared templates. This will automatically be populated
// by the build tools so that you can store your Handlebars templates in
// separate files that get loaded into JavaScript at buildtime.
SC.TEMPLATES = SC.Object.create();

/** @class

  SC.TemplateView allows you to create a view that uses the Handlebars templating
  engine to generate its HTML representation.

  To use it, create a file in your project called +mytemplate.handlebars+. Then,
  set the +templateName+ property of your SC.TemplateView to +mytemplate+.

  Alternatively, you can set the +template+ property to any function that
  returns a string. It is recommended that you use +SC.Handlebars.compile()+ to
  generate a function from a string containing Handlebars markup.

  @extends SC.CoreView
  @since SproutCore 1.5
*/
SC.TemplateView = SC.CoreView.extend(
/** @scope SC.TemplateView.prototype */ {

  // This makes it easier to build custom views on top of TemplateView without
  // gotchas, but may have tab navigation repercussions. The tab navigation
  // system should be revisited.
  acceptsFirstResponder: YES,

  /**
    The name of the template to lookup if no template is provided.

    SC.TemplateView will look for a template with this name in the global
    +SC.TEMPLATES+ hash. Usually this hash will be populated for you
    automatically when you include +.handlebars+ files in your project.

    @property {String}
  */
  templateName: null,

  /**
    The hash in which to look for +templateName+. Defaults to SC.TEMPLATES.

    @property {Object}
  */
  templates: SC.TEMPLATES,

  /**
    The template used to render the view. This should be a function that
    accepts an optional context parameter and returns a string of HTML that
    will be inserted into the DOM relative to its parent view.

    In general, you should set the +templateName+ property instead of setting
    the template yourself.

    @property {Function}
  */
  template: function(key, value) {
    if (value !== undefined) {
      return value;
    }

    var templateName = this.get('templateName'),
        template = this.get('templates').get(templateName);

    if (!template) {
      
      if (templateName) {
        SC.Logger.warn('%@ - Unable to find template "%@".'.fmt(this, templateName));
      }
      

      return function() { return ''; };
    }

    return template;
  }.property('templateName').cacheable(),

  /**
    The object from which templates should access properties.

    This object will be passed to the template function each time the render
    method is called, but it is up to the individual function to decide what
    to do with it.

    By default, this will be the view itself.

    @property {Object}
  */
  context: function(key, value) {
    if (value !== undefined) {
      return value;
    }

    return this;
  }.property().cacheable(),

  /**
    When the view is asked to render, we look for the appropriate template
    function and invoke it, then push its result onto the passed
    SC.RenderContext instance.

    @param {SC.RenderContext} context the render context
  */
  render: function(context) {
    var template = this.get('template');

    this._didRenderChildViews = YES;

    context.push(template(this.get('context'), null, null, { view: this, isRenderData: true }));
  },

  // in TemplateView, updating is handled by observers created by helpers in the
  // template. As a result, we create an empty update method so that the old
  // (pre-1.5) behavior which would force a full re-render does not get activated.
  update: function() { },

  /**
    Since mouseUp events will not fire unless we return YES to mouseDown, the
    default mouseDown implementation returns YES if a mouseDown method exists.
  */
  mouseDown: function() {
    if (this.mouseUp) { return YES; }
    return NO;
  }
});

/* >>>>>>>>>> BEGIN source/controls/button.js */
sc_require('views/template');

SC.Button = SC.TemplateView.extend({
  classNames: ['sc-button'],

  // Setting isActive to true will trigger the classBinding and add
  // 'is-active' to our layer's class names.
  mouseDown: function() {
    this.set('isActive', true);
    this._isMouseDown = YES;
  },

  mouseExited: function() {
    this.set('isActive', false);
  },

  mouseEntered: function() {
    if (this._isMouseDown) {
      this.set('isActive', true);
    }
  },

  rootResponder: function() {
    var pane = this.get('pane');
    return pane.get('rootResponder');
  }.property('pane').cacheable(),

  // Setting isActive to false will remove 'is-active' from our
  // layer's class names.
  mouseUp: function(event) {
    if (this.get('isActive')) {
      var action = this.get('action'),
          target = this.get('target') || null,
          rootResponder = this.get('rootResponder');

      if (action && rootResponder) {
        rootResponder.sendAction(action, target, this, this.get('pane'), null, this);
      }

      this.set('isActive', false);
    }

    this._isMouseDown = NO;
  },

  touchStart: function(touch) {
    this.mouseDown(touch);
  },

  touchEnd: function(touch) {
    this.mouseUp(touch);
  }
});

/* >>>>>>>>>> BEGIN source/ext/function.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.mixin(Function.prototype, /** @scope Function.prototype */ {

  /**
    Creates a timer that will execute the function after a specified 
    period of time.
    
    If you pass an optional set of arguments, the arguments will be passed
    to the function as well.  Otherwise the function should have the 
    signature:
    
        function functionName(timer)

    @param target {Object} optional target object to use as this
    @param interval {Number} the time to wait, in msec
    @returns {SC.Timer} scheduled timer
  */
  invokeLater: function(target, interval) {
    if (interval === undefined) interval = 1 ;
    var f = this;
    if (arguments.length > 2) {
      var args = SC.$A(arguments).slice(2,arguments.length);
      args.unshift(target);
      // f = f.bind.apply(f, args) ;
      var func = f ;
      // Use "this" in inner func because it get its scope by 
      // outer func f (=target). Could replace "this" with target for clarity.
      f = function() { return func.apply(this, args.slice(1)); } ;
    }
    return SC.Timer.schedule({ target: target, action: f, interval: interval });
  }

});

/* >>>>>>>>>> BEGIN source/ext/object.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// Extensions to the core SC.Object class
SC.mixin(SC.Object.prototype, /** @scope SC.Object.prototype */ {

  /**
    Invokes the named method after the specified period of time.

    This is a convenience method that will create a single run timer to
    invoke a method after a period of time.  The method should have the
    signature:

        methodName: function(timer)

    If you would prefer to pass your own parameters instead, you can instead
    call invokeLater() directly on the function object itself.

    @param methodName {String} method name to perform.
    @param interval {Number} period from current time to schedule.
    @returns {SC.Timer} scheduled timer.
  */
  invokeLater: function(methodName, interval) {
    if (interval === undefined) { interval = 1 ; }
    var f = methodName, args, func;

    // if extra arguments were passed - build a function binding.
    if (arguments.length > 2) {
      args = SC.$A(arguments).slice(2);
      if (SC.typeOf(f) === SC.T_STRING) { f = this[methodName] ; }
      func = f ;
      f = function() { return func.apply(this, args); } ;
    }

    // schedule the timer
    return SC.Timer.schedule({ target: this, action: f, interval: interval });
  },

  /**
    Lookup the named property path and then invoke the passed function,
    passing the resulting value to the function.

    This method is a useful way to handle deferred loading of properties.
    If you want to defer loading a property, you can override this method.
    When the method is called, passing a deferred property, you can load the
    property before invoking the callback method.

    You can even swap out the receiver object.

    The callback method should have the signature:

    function callback(objectAtPath, sourceObject) { ... }

    You may pass either a function itself or a target/method pair.

    @param {String} pathName
    @param {Object} target target or method
    @param {Function|String} method
    @returns {SC.Object} receiver
  */
  invokeWith: function(pathName, target, method) {
    // normalize target/method
    if (method === undefined) {
      method = target; target = this;
    }
    if (!target) { target = this ; }
    if (SC.typeOf(method) === SC.T_STRING) { method = target[method]; }

    // get value
    var v = this.getPath(pathName);

    // invoke method
    method.call(target, v, this);
    return this ;
  }

});

/* >>>>>>>>>> BEGIN source/ext/run_loop.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// Create anonymous subclass of SC.RunLoop to add support for processing
// view queues and Timers.
SC.RunLoop = SC.RunLoop.extend(
/** @scope SC.RunLoop.prototype */ {

  /**
    The time the current run loop began executing.

    All timers scheduled during this run loop will begin executing as if
    they were scheduled at this time.

    @property {Number}
  */
  startTime: function() {
    if (!this._start) { this._start = Date.now(); }
    return this._start ;
  }.property(),

  /*

    Override to fire and reschedule timers once per run loop.

    Note that timers should fire only once per run loop to avoid the
    situation where a timer might cause an infinite loop by constantly
    rescheduling itself everytime it is fired.
  */
  endRunLoop: function() {
    this.fireExpiredTimers(); // fire them timers!
    var ret = arguments.callee.base.apply(this,arguments); // do everything else
    this.scheduleNextTimeout(); // schedule a timout if timers remain
    return ret;
  },

  // ..........................................................
  // TIMER SUPPORT
  //

  /**
    Schedules a timer to execute at the specified runTime.  You will not
    usually call this method directly.  Instead you should work with SC.Timer,
    which will manage both creating the timer and scheduling it.

    Calling this method on a timer that is already scheduled will remove it
    from the existing schedule and reschedule it.

    @param {SC.Timer} timer the timer to schedule
    @param {Time} runTime the time offset when you want this to run
    @returns {SC.RunLoop} receiver
  */
  scheduleTimer: function(timer, runTime) {
    // if the timer is already in the schedule, remove it.
    this._timerQueue = timer.removeFromTimerQueue(this._timerQueue);

    // now, add the timer ot the timeout queue.  This will walk down the
    // chain of timers to find the right place to insert it.
    this._timerQueue = timer.scheduleInTimerQueue(this._timerQueue, runTime);
    return this ;
  },

  /**
    Removes the named timer from the timeout queue.  If the timer is not
    currently scheduled, this method will have no effect.

    @param {SC.Timer} timer the timer to schedule
    @returns {SC.RunLoop} receiver
  */
  cancelTimer: function(timer) {
    this._timerQueue = timer.removeFromTimerQueue(this._timerQueue) ;
    return this ;
  },

  /** @private - shared array used by fireExpiredTimers to avoid memory */
  TIMER_ARRAY: [],

  /**
    Invokes any timers that have expired since this method was last called.
    Usually you will not call this method directly, but it will be invoked
    automatically at the end of the run loop.

    @returns {Boolean} YES if timers were fired, NO otherwise
  */
  fireExpiredTimers: function() {
    if (!this._timerQueue || this._firing) { return NO; } // nothing to do

    // max time we are allowed to run timers
    var now = this.get('startTime'),
        timers = this.TIMER_ARRAY,
        idx, len, didFire;

    // avoid recursive calls
    this._firing = YES;

    // collect timers to fire.  we do this one time up front to avoid infinite
    // loops where firing a timer causes it to schedule itself again, causing
    // it to fire again, etc.
    this._timerQueue = this._timerQueue.collectExpiredTimers(timers, now);

    // now step through timers and fire them.
    len = timers.length;
    for(idx=0;idx<len;idx++) { timers[idx].fire(); }

    // cleanup
    didFire = timers.length > 0 ;
    timers.length = 0 ; // reset for later use...
    this._firing = NO ;
    return didFire;
  },

  /** @private
    Invoked at the end of a runloop, if there are pending timers, a timeout
    will be scheduled to fire when the next timer expires.  You will not
    usually call this method yourself.  It is invoked automatically at the
    end of a run loop.

    @returns {Boolean} YES if a timeout was scheduled
  */
  scheduleNextTimeout: function() {
    var timer = this._timerQueue ;

    var ret = NO ;
    // if no timer, and there is an existing timeout, cancel it
    if (!timer) {
      if (this._timeout) { clearTimeout(this._timeout); }

    // otherwise, determine if the timeout needs to be rescheduled.
    } else {
      var nextTimeoutAt = timer._timerQueueRunTime ;
      if (this._timeoutAt !== nextTimeoutAt) { // need to reschedule
        if (this._timeout) { clearTimeout(this._timeout); } // clear existing...
        // reschedule
        var delay = Math.max(0, nextTimeoutAt - Date.now());
        this._timeout = setTimeout(this._timeoutDidFire, delay);
        this._timeoutAt = nextTimeoutAt ;
      }
      ret = YES ;
    }

    return ret ;
  },

  /** @private
    Invoked when a timeout actually fires.  Simply cleanup, then begin and end
    a runloop. This will fire any expired timers and reschedule.  Note that
    this function will be called with 'this' set to the global context,
    hence the need to lookup the current run loop.
  */
  _timeoutDidFire: function() {
    var rl = SC.RunLoop.currentRunLoop;
    rl._timeout = rl._timeoutAt = null ; // cleanup
    SC.run();  // begin/end runloop to trigger timers.
  }

});

// Recreate the currentRunLoop with the new methods
SC.RunLoop.currentRunLoop = SC.RunLoop.create();

/* >>>>>>>>>> BEGIN source/ext/string.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/string');

SC.supplement(String.prototype,
/** @scope String.prototype */ {

  /**
    @see SC.String.capitalize
  */
  capitalize: function() {
    return SC.String.capitalize(this, arguments);
  },

  /**
    @see SC.String.camelize
  */
  camelize: function() {
    return SC.String.camelize(this, arguments);
  },

  /**
    @see SC.String.decamelize
  */
  decamelize: function() {
    return SC.String.decamelize(this, arguments);
  },

  /**
    @see SC.String.dasherize
  */
  dasherize: function() {
    return SC.String.dasherize(this, arguments);
  },

  /**
    @see SC.String.loc
  */
  loc: function() {
    var args = SC.$A(arguments);
    args.unshift(this);
    return SC.String.loc.apply(SC.String, args);
  },

  /**
    @see SC.String.locWithDefault
  */
  locWithDefault: function(def) {
    var args = SC.$A(arguments);
    args.unshift(this);
    return SC.String.locWithDefault.apply(SC.String, args);
  }

});


/* >>>>>>>>>> BEGIN source/mixins/responder_context.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('system/responder');

/** @namespace

  The root object for a responder chain.  A responder context can dispatch
  actions directly to a first responder; walking up the responder chain until
  it finds a responder that can handle the action.

  If no responder can be found to handle the action, it will attempt to send
  the action to the defaultResponder.

  You can have as many ResponderContext's as you want within your application.
  Every SC.Pane and SC.Application automatically implements this mixin.

  Note that to implement this, you should mix SC.ResponderContext into an
  SC.Responder or SC.Responder subclass.

  @since SproutCore 1.0
*/
SC.ResponderContext = {

  // ..........................................................
  // PROPERTIES
  //

  isResponderContext: YES,

  /** @property

    When set to YES, logs tracing information about all actions sent and
    responder changes.
  */
  trace: NO,

  /** @property
    The default responder.  Set this to point to a responder object that can
    respond to events when no other view in the hierarchy handles them.

    @type SC.Responder
  */
  defaultResponder: null,

  /** @property
    The next responder for an app is always its defaultResponder.
  */
  nextResponder: function() {
    return this.get('defaultResponder');
  }.property('defaultResponder').cacheable(),

  /** @property
    The first responder.  This is the first responder that should receive
    actions.
  */
  firstResponder: null,

  // ..........................................................
  // METHODS
  //

  /**
    Finds the next responder for the passed responder based on the responder's
    nextResponder property.  If the property is a string, then lookup the path
    in the receiver.
  */
  nextResponderFor: function(responder) {
    var next = responder.get('nextResponder');
    if (typeof next === SC.T_STRING) {
      next = SC.objectForPropertyPath(next, this);
    } else if (!next && (responder !== this)) next = this ;
    return next ;
  },

  /**
    Finds the responder name by searching the responders one time.
  */
  responderNameFor: function(responder) {
    if (!responder) return "(No Responder)";
    else if (responder._scrc_name) return responder._scrc_name;

    // none found, let's go hunting...look three levels deep
    var n = this.NAMESPACE;
    this._findResponderNamesFor(this, 3, n ? [this.NAMESPACE] : []);

    return responder._scrc_name || responder.toString(); // try again
  },

  _findResponderNamesFor: function(responder, level, path) {
    var key, value;

    for(key in responder) {
      if (key === 'nextResponder') continue ;
      value = responder[key];
      if (value && value.isResponder) {
        if (value._scrc_name) continue ;
        path.push(key);
        value._scrc_name = path.join('.');
        if (level>0) this._findResponderNamesFor(value, level-1, path);
        path.pop();
      }
    }
  },

  /**
    Makes the passed responder into the new firstResponder for this
    responder context.  This will cause the current first responder to lose
    its responder status and possibly keyResponder status as well.

    When you change the first responder, this will send callbacks to
    responders up the chain until you reach a shared responder, at which point
    it will stop notifying.

    @param {SC.Responder} responder
    @param {Event} evt that cause this to become first responder
    @returns {SC.ResponderContext} receiver
  */
  makeFirstResponder: function(responder, evt) {
    var current = this.get('firstResponder'),
        last    = this.get('nextResponder'),
        trace   = this.get('trace'),
        common ;

    if (this._locked) {
      if (trace) {
        SC.Logger.log('%@: AFTER ACTION: makeFirstResponder => %@'.fmt(this, this.responderNameFor(responder)));
      }

      this._pendingResponder = responder;
      return ;
    }

    if (trace) {
      SC.Logger.log('%@: makeFirstResponder => %@'.fmt(this, this.responderNameFor(responder)));
    }

    if (responder) responder.set("becomingFirstResponder", YES);

    this._locked = YES;
    this._pendingResponder = null;

    // Find the nearest common responder in the responder chain for the new
    // responder.  If there are no common responders, use last responder.
    // Note: start at the responder itself: it could be the common responder.
    common = responder ? responder : null;
    while (common) {
      if (common.get('hasFirstResponder')) break;
      common = (common===last) ? null : this.nextResponderFor(common);
    }
    if (!common) common = last;

    // Cleanup old first responder
    this._notifyWillLoseFirstResponder(current, current, common, evt);
    if (current) current.set('isFirstResponder', NO);

    // Set new first responder.  If new firstResponder does not have its
    // responderContext property set, then set it.

    // but, don't tell anyone until we have _also_ updated the hasFirstResponder state.
    this.beginPropertyChanges();

    this.set('firstResponder', responder) ;
    if (responder) responder.set('isFirstResponder', YES);

    this._notifyDidBecomeFirstResponder(responder, responder, common);
    
    // now, tell everyone the good news!
    this.endPropertyChanges();

    this._locked = NO ;
    if (this._pendingResponder) {
      this.makeFirstResponder(this._pendingResponder);
      this._pendingResponder = null;
    }

    if (responder) responder.set("becomingFirstResponder", NO);

    return this ;
  },

  _notifyWillLoseFirstResponder: function(responder, cur, root, evt) {
    if (cur === root) return ; // nothing to do

    cur.willLoseFirstResponder(responder, evt);
    cur.set('hasFirstResponder', NO);

    var next = this.nextResponderFor(cur);
    if (next) this._notifyWillLoseFirstResponder(responder, next, root);
  },

  _notifyDidBecomeFirstResponder: function(responder, cur, root) {
    if (cur === root) return ; // nothing to do

    var next = this.nextResponderFor(cur);
    if (next) this._notifyDidBecomeFirstResponder(responder, next, root);

    cur.set('hasFirstResponder', YES);
    cur.didBecomeFirstResponder(responder);
  },

  /**
    Re-enters the current responder (calling willLoseFirstResponder and didBecomeFirstResponder).
  */
  resetFirstResponder: function() {
    var current = this.get('firstResponder');
    if (!current) return;
    current.willLoseFirstResponder();
    current.didBecomeFirstResponder();
  },

  /**
    Send the passed action down the responder chain, starting with the
    current first responder.  This will look for the first responder that
    actually implements the action method and returns YES or no value when
    called.

    @param {String} action name of action
    @param {Object} sender object sending the action
    @param {Object} context optional additonal context info
    @returns {SC.Responder} the responder that handled it or null
  */
  sendAction: function(action, sender, context) {
    var working = this.get('firstResponder'),
        last    = this.get('nextResponder'),
        trace   = this.get('trace'),
        handled = NO,
        responder;

    this._locked = YES;
    if (trace) {
      SC.Logger.log("%@: begin action '%@' (%@, %@)".fmt(this, action, sender, context));
    }

    if (!handled && !working && this.tryToPerform) {
      handled = this.tryToPerform(action, sender, context);
    }

    while (!handled && working) {
      if (working.tryToPerform) {
        handled = working.tryToPerform(action, sender, context);
      }

      if (!handled) {
        working = (working===last) ? null : this.nextResponderFor(working);
      }
    }

    if (trace) {
      if (!handled) SC.Logger.log("%@:  action '%@' NOT HANDLED".fmt(this,action));
      else SC.Logger.log("%@: action '%@' handled by %@".fmt(this, action, this.responderNameFor(working)));
    }

    this._locked = NO ;

    if (responder = this._pendingResponder) {
      this._pendingResponder= null ;
      this.makeFirstResponder(responder);
    }


    return working ;
  }

};

/* >>>>>>>>>> BEGIN source/mixins/template_helpers/checkbox_support.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/template');

/** @class */

SC.Checkbox = SC.TemplateView.extend(
  /** @scope SC.Checkbox.prototype */ {

  title: null,
  value: null,

  displayTitle: function() {
    var title = this.get('title');
    return title ? SC.String.loc(title) : null;
  }.property('title').cacheable(),

  classNames: ['sc-checkbox'],
  template: SC.Handlebars.compile('<label><input type="checkbox">{{displayTitle}}</label>'),

  didCreateLayer: function() {
    var self = this;

    this.$('input').bind('change', function() {
      self.domValueDidChange(this);
    });
  },

  domValueDidChange: function(node) {
    this.set('value', $(node).prop('checked'));
  },

  value: function(key, value) {
    if (value !== undefined) {
      this.$('input').prop('checked', value);
    } else {
      value = this.$('input').prop('checked');
    }

    return value;
  }.property()
});

SC.CheckboxSupport = /** @scope SC.CheckboxSupport */{
  didCreateLayer: function() {
    this.$('input').change(jQuery.proxy(function() {
      SC.RunLoop.begin();
      this.notifyPropertyChange('value');
      SC.RunLoop.end();
    }, this));
  },

  value: function(key, value) {
    if (value !== undefined) {
      this.$('input').prop('checked', value);
    } else {
      value = this.$('input').prop('checked');
    }

    return value;
  }.property().idempotent()
};


/* >>>>>>>>>> BEGIN source/mixins/template_helpers/text_field_support.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/template');

/** @class */

SC.TextField = SC.TemplateView.extend(
  /** @scope SC.TextField.prototype */ {

  classNames: ['sc-text-field'],

  /**
    If set to `YES` uses textarea tag instead of input to
    accommodate multi-line strings.

    @type Boolean
    @default NO
  */
  isMultiline: NO,

  // we can't use bindAttr because of a race condition:
  //
  // when `value` is set, the bindAttr observer immediately calls
  // `get` in order to persist it to the DOM, but because we made
  // the `value` property idempotent, when it gets called by
  // bindAttr, it fetches the not-yet-updated value from the DOM
  // and returns it.
  //
  // In short, because we need to be able to catch changes to the
  // DOM made directly, we cannot also rely on bindAttr to update
  // the property: a chicken-and-egg problem.
  template: function(){
    return SC.Handlebars.compile(this.get('isMultiline') ? '<textarea></textarea>' : '<input type="text">');
  }.property('isMultiline').cacheable(),

  $input: function() {
    tagName = this.get('isMultiline') ? 'textarea' : 'input';
    return this.$(tagName);
  },

  didCreateLayer: function() {
    var self = this;

    var input = this.$input();
    input.val(this._value);

    if (SC.browser.msie) {
      SC.Event.add(input, 'focusin', this, this.focusIn);
      SC.Event.add(input, 'focusout', this, this.focusOut);
    } else {
      SC.Event.add(input, 'focus', this, this.focusIn);
      SC.Event.add(input, 'blur', this, this.focusOut);
    }

    input.bind('change', function() {
      self.domValueDidChange(SC.$(this));
    });
  },

  /**
    The problem this property is trying to solve is twofold:

    1. Make it possible to set the value of a text field that has
       not yet been inserted into the DOM
    2. Make sure that `value` properly reflects changes made directly
       to the element's `value` property.

    In order to achieve (2), we need to make the property volatile,
    so that SproutCore will call the getter no matter what if get()
    is called.

    In order to achieve (1), we need to store a local cache of the
    value, so that SproutCore can set the proper value as soon as
    the underlying DOM element is created.
  */
  value: function(key, value) {
    var input = this.$input();

    if (value !== undefined) {
      // We don't want to unnecessarily set the value.
      // Doing that could cause the selection to be lost.
      if (this._value !== value || input.val() !== value) {
        this._value = value;
        input.val(value);
      }
    } else if (input.length) {
      this._value = value = input.val();
    } else {
      value = this._value;
    }

    return value;
  }.property().idempotent(),

  domValueDidChange: function(jquery) {
    this.set('value', jquery.val());
  },

  focusIn: function(event) {
    this.becomeFirstResponder();
    this.tryToPerform('focus', event);
  },

  focusOut: function(event) {
    this.resignFirstResponder();
    this.tryToPerform('blur', event);
  },

  willLoseFirstResponder: function() {
    this.notifyPropertyChange('value');
  },

  keyUp: function(evt) {
    this.domValueDidChange(this.$input());

    if (evt.keyCode === SC.Event.KEY_RETURN) {
      return this.tryToPerform('insertNewline', evt);
    } else if (evt.keyCode === SC.Event.KEY_ESC) {
      return this.tryToPerform('cancel', evt);
    }

    return true;
  }

});

SC.TextFieldSupport = /** @scope SC.TextFieldSupport */{

  /** @private
    Used internally to store value because the layer may not exist
  */
  _value: null,

  /**
    @type String
    @default null
  */
  value: function(key, value) {
    var input = this.$('input');

    if (value !== undefined) {
      // We don't want to unnecessarily set the value.
      // Doing that could cause the selection to be lost.
      if (this._value !== value || input.val() !== value) {
        this._value = value;
        input.val(value);
      }
    } else {
      if (input.length > 0) {
        value = this._value = input.val();
      } else {
        value = this._value;
      }
    }

    return value;
  }.property().idempotent(),

  didCreateLayer: function() {
    var input = this.$('input');

    input.val(this._value);

    if (SC.browser.msie) {
      SC.Event.add(input, 'focusin', this, this.focusIn);
      SC.Event.add(input, 'focusout', this, this.focusOut);
    } else {
      SC.Event.add(input, 'focus', this, this.focusIn);
      SC.Event.add(input, 'blur', this, this.focusOut);
    }
  },

  focusIn: function(event) {
    this.becomeFirstResponder();
    this.tryToPerform('focus', event);
  },

  focusOut: function(event) {
    this.resignFirstResponder();
    this.tryToPerform('blur', event);
  },

  /** @private
    Make sure our input value is synced with any bindings.
    In some cases, such as auto-filling, a value can get
    changed without an event firing. We could do this
    on focusOut, but blur can potentially get called
    after other events.
  */
  willLoseFirstResponder: function() {
    this.notifyPropertyChange('value');
  },

  keyUp: function(event) {
    if (event.keyCode === SC.Event.KEY_RETURN) {
      return this.tryToPerform('insertNewline', event);
    } else if (event.keyCode === SC.Event.KEY_ESC) {
      return this.tryToPerform('cancel', event);
    }
  }
};


/* >>>>>>>>>> BEGIN source/panes/pane.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/view');
sc_require('mixins/responder_context');

/**
  Indicates a value has a mixed state of both on and off.

  @property {String}
*/
SC.MIXED_STATE = '__MIXED__' ;

/** @class
  A Pane is like a regular view except that it does not need to live within a
  parent view.  You usually use a Pane to form the root of a view hierarchy in
  your application, such as your main application view or for floating
  palettes, popups, menus, etc.

  Usually you will not work directly with the SC.Pane class, but with one of
  its subclasses such as SC.MainPane, SC.Panel, or SC.PopupPane.

  ## Showing a Pane

  To make a pane visible, you need to add it to your HTML document.  The
  simplest way to do this is to call the append() method:

      myPane = SC.Pane.create();
      myPane.append(); // adds the pane to the document

  This will insert your pane into the end of your HTML document body, causing
  it to display on screen.  It will also register your pane with the
  SC.RootResponder for the document so you can start to receive keyboard,
  mouse, and touch events.

  If you need more specific control for where you pane appears in the
  document, you can use several other insertion methods such as appendTo(),
  prependTo(), before() and after().  These methods all take a an element to
  indicate where in your HTML document you would like you pane to be inserted.

  Once a pane is inserted into the document, it will be sized and positioned
  according to the layout you have specified.  It will then automatically
  resize with the window if needed, relaying resize notifications to children
  as well.

  ## Hiding a Pane

  When you are finished with a pane, you can hide the pane by calling the
  remove() method.  This method will actually remove the Pane from the
  document body, as well as deregistering it from the RootResponder so that it
  no longer receives events.

  The isVisibleInWindow method will also change to NO for the Pane and all of
  its childViews and the views will no longer have their updateDisplay methods
  called.

  You can readd a pane to the document again any time in the future by using
  any of the insertion methods defined in the previous section.

  ## Receiving Events

  Your pane and its child views will automatically receive any mouse or touch
  events as long as it is on the screen.  To receive keyboard events, however,
  you must focus the keyboard on your pane by calling makeKeyPane() on the
  pane itself.  This will cause the RootResponder to route keyboard events to
  your pane.  The pane, in turn, will route those events to its current
  keyView, if there is any.

  Note that all SC.Views (anything that implements SC.ClassicResponder,
  really) will be notified when it is about or gain or lose keyboard focus.
  These notifications are sent both when the view is made keyView of a
  particular pane and when the pane is made keyPane for the entire
  application.

  You can prevent your Pane from becoming key by setting the acceptsKeyPane
  to NO on the pane.  This is useful when creating palettes and other popups
  that should not steal keyboard control from another view.

  @extends SC.View
  @extends SC.ResponderContext
  @since SproutCore 1.0
*/
SC.Pane = SC.View.extend(SC.ResponderContext,
/** @scope SC.Pane.prototype */ {

  /**
    Returns YES for easy detection of when you reached the pane.
    @property {Boolean}
  */
  isPane: YES,

  /**
    Set to the current page when the pane is instantiated from a page object.
    @property {SC.Page}
  */
  page: null,

  // .......................................................
  // ROOT RESPONDER SUPPORT
  //

  /**
    The rootResponder for this pane.  Whenever you add a pane to a document,
    this property will be set to the rootResponder that is now forwarding
    events to the pane.

    @property {SC.Responder}
  */
  rootResponder: null,

  /**
    Attempts to send the event down the responder chain for this pane.  If you
    pass a target, this method will begin with the target and work up the
    responder chain.  Otherwise, it will begin with the current rr
    and walk up the chain looking for any responder that implements a handler
    for the passed method and returns YES when executed.

    @param {String} action
    @param {SC.Event} evt
    @param {Object} target
    @returns {Object} object that handled the event
  */
  sendEvent: function(action, evt, target) {
    var handler;

    // walk up the responder chain looking for a method to handle the event
    if (!target) target = this.get('firstResponder') ;
    while(target) {
      if (action === 'touchStart') {
        // first, we must check that the target is not already touch responder
        // if it is, we don't want to have "found" it; that kind of recursion is sure to
        // cause really severe, and even worse, really odd bugs.
        if (evt.touchResponder === target) {
          target = null;
          break;
        }

        // now, only pass along if the target does not already have any touches, or is
        // capable of accepting multitouch.
        if (!target.get("hasTouch") || target.get("acceptsMultitouch")) {
          if (target.tryToPerform("touchStart", evt)) break;
        }
      } else if (action === 'touchEnd' && !target.get("acceptsMultitouch")) {
        if (!target.get("hasTouch")) {
          if (target.tryToPerform("touchEnd", evt)) break;
        }
      } else {
        if (target.tryToPerform(action, evt)) break;
      }

      // even if someone tries to fill in the nextResponder on the pane, stop
      // searching when we hit the pane.
      target = (target === this) ? null : target.get('nextResponder') ;
    }

    // if no handler was found in the responder chain, try the default
    if (!target && (target = this.get('defaultResponder'))) {
      if (typeof target === SC.T_STRING) {
        target = SC.objectForPropertyPath(target);
      }

      if (!target) target = null;
      else target = target.tryToPerform(action, evt) ? target : null ;
    }

    // if we don't have a default responder or no responders in the responder
    // chain handled the event, see if the pane itself implements the event
    else if (!target && !(target = this.get('defaultResponder'))) {
      target = this.tryToPerform(action, evt) ? this : null ;
    }

    return evt.mouseHandler || target ;
  },

  // .......................................................
  // RESPONDER CONTEXT
  //

  /**
    Pane's never have a next responder.

    @property {SC.Responder}
    @readOnly
  */
  nextResponder: function() {
    return null;
  }.property().cacheable(),

  /**
    The first responder.  This is the first view that should receive action
    events.  Whenever you click on a view, it will usually become
    firstResponder.

    @property {SC.Responder}
  */
  firstResponder: null,

  /**
    If YES, this pane can become the key pane.  You may want to set this to NO
    for certain types of panes.  For example, a palette may never want to
    become key.  The default value is YES.

    @property {Boolean}
  */
  acceptsKeyPane: YES,

  /**
    This is set to YES when your pane is currently the target of key events.

    @property {Boolean}
  */
  isKeyPane: NO,

  /**
    Make the pane receive key events.  Until you call this method, the
    keyView set for this pane will not receive key events.

    @returns {SC.Pane} receiver
  */
  becomeKeyPane: function() {
    if (this.get('isKeyPane')) return this ;
    if (this.rootResponder) this.rootResponder.makeKeyPane(this) ;
    return this ;
  },

  /**
    Remove the pane view status from the pane.  This will simply set the
    keyPane on the rootResponder to null.

    @returns {SC.Pane} receiver
  */
  resignKeyPane: function() {
    if (!this.get('isKeyPane')) return this ;
    if (this.rootResponder) this.rootResponder.makeKeyPane(null);
    return this ;
  },

  /**
    Makes the passed view (or any object that implements SC.Responder) into
    the new firstResponder for this pane.  This will cause the current first
    responder to lose its responder status and possibly keyResponder status as
    well.

    @param {SC.View} view
    @param {Event} evt that cause this to become first responder
    @returns {SC.Pane} receiver
  */
  makeFirstResponder: function(original, view, evt) {
    // firstResponder should never be null
    if(!view) view = this;

    var current=this.get('firstResponder'), isKeyPane=this.get('isKeyPane');
    if (current === view) return this ; // nothing to do
    if (SC.platform.touch && view && view.kindOf(SC.TextFieldView) && !view.get('focused')) return this;

    // if we are currently key pane, then notify key views of change also
    if (isKeyPane) {
      if (current) { current.tryToPerform('willLoseKeyResponderTo', view); }
      if (view) { 
        view.tryToPerform('willBecomeKeyResponderFrom', current); 
      }
    }

    if (current) {
      current.beginPropertyChanges();
      current.set('isKeyResponder', NO);
    }

    if (view) {
      view.beginPropertyChanges();
      view.set('isKeyResponder', isKeyPane);
    }

    original(view, evt);

    if(current) current.endPropertyChanges();
    if(view) view.endPropertyChanges();

    // and notify again if needed.
    if (isKeyPane) {
      if (view) { 
        view.tryToPerform('didBecomeKeyResponderFrom', current); }
      if (current) { 
        current.tryToPerform('didLoseKeyResponderTo', view); 
      }
    }

    return this ;
  }.enhance(),

  /**
    Called just before the pane loses it's keyPane status.  This will notify
    the current keyView, if there is one, that it is about to lose focus,
    giving it one last opportunity to save its state.

    @param {SC.Pane} pane
    @returns {SC.Pane} receiver
  */
  willLoseKeyPaneTo: function(pane) {
    this._forwardKeyChange(this.get('isKeyPane'), 'willLoseKeyResponderTo', pane, NO);
    return this ;
  },

  /**
    Called just before the pane becomes keyPane.  Notifies the current keyView
    that it is about to gain focus.  The keyView can use this opportunity to
    prepare itself, possibly stealing any value it might need to steal from
    the current key view.

    @param {SC.Pane} pane
    @returns {SC.Pane} receiver
  */
  willBecomeKeyPaneFrom: function(pane) {
    this._forwardKeyChange(!this.get('isKeyPane'), 'willBecomeKeyResponderFrom', pane, YES);
    return this ;
  },


  didBecomeKeyResponderFrom: function(responder) {},

  /**
    Called just after the pane has lost its keyPane status.  Notifies the
    current keyView of the change.  The keyView can use this method to do any
    final cleanup and changes its own display value if needed.

    @param {SC.Pane} pane
    @returns {SC.Pane} receiver
  */
  didLoseKeyPaneTo: function(pane) {
    var isKeyPane = this.get('isKeyPane');
    this.set('isKeyPane', NO);
    this._forwardKeyChange(isKeyPane, 'didLoseKeyResponderTo', pane);
    return this ;
  },

  /**
    Called just after the keyPane focus has changed to the receiver.  Notifies
    the keyView of its new status.  The keyView should use this method to
    update its display and actually set focus on itself at the browser level
    if needed.

    @param {SC.Pane} pane
    @returns {SC.Pane} receiver

  */
  didBecomeKeyPaneFrom: function(pane) {
    var isKeyPane = this.get('isKeyPane');
    this.set('isKeyPane', YES);
    this._forwardKeyChange(!isKeyPane, 'didBecomeKeyResponderFrom', pane, YES);
    return this ;
  },

  // .......................................................
  // MAIN PANE SUPPORT
  //

  /**
    Returns YES whenever the pane has been set as the main pane for the
    application.

    @property {Boolean}
  */
  isMainPane: NO,

  /**
    Invoked when the pane is about to become the focused pane.  Override to
    implement your own custom handling.

    @param {SC.Pane} pane the pane that currently have focus
    @returns {void}
  */
  focusFrom: function(pane) {},

  /**
    Invoked when the the pane is about to lose its focused pane status.
    Override to implement your own custom handling

    @param {SC.Pane} pane the pane that will receive focus next
    @returns {void}
  */
  blurTo: function(pane) {},

  /**
    Invoked when the view is about to lose its mainPane status.  The default
    implementation will also remove the pane from the document since you can't
    have more than one mainPane in the document at a time.

    @param {SC.Pane} pane
    @returns {void}
  */
  blurMainTo: function(pane) {
    this.set('isMainPane', NO) ;
  },

  /**
    Invokes when the view is about to become the new mainPane.  The default
    implementation simply updates the isMainPane property.  In your subclass,
    you should make sure your pane has been added to the document before
    trying to make it the mainPane.  See SC.MainPane for more information.

    @param {SC.Pane} pane
    @returns {void}
  */
  focusMainFrom: function(pane) {
    this.set('isMainPane', YES);
  },

  // .......................................................
  // ADDING/REMOVE PANES TO SCREEN
  //

  /**
    Inserts the pane at the end of the document.  This will also add the pane
    to the rootResponder.

    @param {SC.RootResponder} rootResponder
    @returns {SC.Pane} receiver
  */
  append: function() {
    return this.appendTo(document.body) ;
  },

  /**
    Removes the pane from the document.  This will remove the
    DOM node and deregister you from the document window.

    @returns {SC.Pane} receiver
  */
  remove: function() {
    if (!this.get('isVisibleInWindow')) return this ; // nothing to do
    if (!this.get('isPaneAttached')) return this ; // nothing to do

    // remove layer...
    var dom = this.get('layer') ;
    if (dom && dom.parentNode) dom.parentNode.removeChild(dom) ;
    dom = null ;

    // remove intercept
    this._removeIntercept();

    // resign keyPane status, if we had it
    this.resignKeyPane();

    // remove the pane
    var rootResponder = this.rootResponder ;
    if (this.get('isMainPane')) rootResponder.makeMainPane(null) ;
    rootResponder.panes.remove(this) ;
    this.rootResponder = null ;

    // clean up some of my own properties
    this.set('isPaneAttached', NO) ;
    this.parentViewDidChange();
    return this ;
  },

  /**
    Inserts the current pane into the page. The actual DOM insertion is done
    by a function passed into `insert`, which receives the layer as a
    parameter. This function is responsible for making sure a layer exists,
    is not already attached, and for calling `paneDidAttach` when done.

        pane = SC.Pane.create();
        pane.insert(function(layer) {
          jQuery(layer).insertBefore("#otherElement");
        });

    @param {Function} fn function which performs the actual DOM manipulation
      necessary in order to insert the pane's layer into the DOM.
    @returns {SC.Pane} receiver
   */
  insert: function(fn) {
    var layer = this.get('layer');
    if (!layer) { layer = this.createLayer().get('layer'); }

    fn(layer);
    if (!this.get('isPaneAttached')) { this.paneDidAttach(); }
    return this;
  },

  /**
    Inserts the pane into the DOM.

    @param {DOMElement|jQuery|String} elem the element to append the pane's layer to.
      This is passed to `jQuery()`, so any value supported by `jQuery()` will work.
    @returns {SC.Pane} receiver
  */
  appendTo: function(elem) {
    return this.insert(function(layer) {
      jQuery(elem).append(layer);
    });
  },

  /** @private
    Called when the pane is attached to a DOM element in a window, this will
    change the view status to be visible in the window and also register
    with the rootResponder.
  */
  paneDidAttach: function() {
    // hook into root responder
    var responder = (this.rootResponder = SC.RootResponder.responder);
    responder.panes.add(this);

    this.set('isPaneAttached', YES);

    this.recomputeDependentProperties();

    // notify that the layers have been appended to the document
    this._notifyDidAppendToDocument();

    // handle intercept if needed
    this._addIntercept();
    return this ;
  },

  /**
    This method is called after the pane is attached and before child views
    are notified that they were appended to the document. Override this
    method to recompute properties that depend on the pane's existence
    in the DOM but must be run prior to child view notification.
   */
  recomputeDependentProperties: function() {},

  /**
    YES when the pane is currently attached to a document DOM.  Read only.

    @property {Boolean}
    @readOnly
  */
  isPaneAttached: NO,

  /**
    If YES, a touch intercept pane will be added above this pane when on
    touch platforms.
  */
  wantsTouchIntercept: NO,

  /**
    Returns YES if wantsTouchIntercept and this is a touch platform.
  */
  hasTouchIntercept: function(){
    return this.get('wantsTouchIntercept') && SC.platform.touch;
  }.property('wantsTouchIntercept').cacheable(),

  /**
    The Z-Index of the pane. Currently, you have to match this in CSS.
    TODO: ALLOW THIS TO AUTOMATICALLY SET THE Z-INDEX OF THE PANE (as an option).
  */
  zIndex: 0,

  /**
    The amount over the pane's z-index that the touch intercept should be.
  */
  touchZ: 99,

  _addIntercept: function() {
    if (this.get('hasTouchIntercept')) {
      var div = document.createElement("div");
      var divStyle = div.style;
      divStyle.position = "absolute";
      divStyle.left = "0px";
      divStyle.top = "0px";
      divStyle.right = "0px";
      divStyle.bottom = "0px";
      divStyle.webkitTransform = "translateZ(0px)";
      divStyle.zIndex = this.get("zIndex") + this.get("touchZ");
      div.className = "touch-intercept";
      div.id = "touch-intercept-" + SC.guidFor(this);
      this._touchIntercept = div;
      document.body.appendChild(div);
    }
  },

  _removeIntercept: function() {
    if (this._touchIntercept) {
      document.body.removeChild(this._touchIntercept);
      this._touchIntercept = null;
    }
  },

  hideTouchIntercept: function() {
    if (this._touchIntercept) this._touchIntercept.style.display = "none";
  },

  showTouchIntercept: function() {
    if (this._touchIntercept) this._touchIntercept.style.display = "block";
  },

  /**
    Updates the isVisibleInWindow state on the pane and its childViews if
    necessary.  This works much like SC.View's default implementation, but it
    does not need a parentView to function.

    @returns {SC.Pane} receiver
  */
  recomputeIsVisibleInWindow: function() {
    if (this.get('designer') && SC.suppressMain) return arguments.callee.base.apply(this,arguments);
    var previous = this.get('isVisibleInWindow'),
        current  = this.get('isVisible') && this.get('isPaneAttached');

    // If our visibility has changed, then set the new value and notify our
    // child views to update their value.
    if (previous !== current) {
      this.set('isVisibleInWindow', current);

      var childViews = this.get('childViews'), len = childViews.length, idx, view;
      for(idx=0;idx<len;idx++) {
        view = childViews[idx];
        if (view.recomputeIsVisibleInWindow) {
          view.recomputeIsVisibleInWindow(current);
        }
      }


      // For historical reasons, we'll also layout the child views if
      // necessary.
      if (current) {
        if (this.get('childViewsNeedLayout')) {
          this.invokeOnce(this.layoutChildViewsIfNeeded);
        }
      }
      else {
        // Also, if we were previously visible and were the key pane, resign
        // it.  This more appropriately belongs in a 'isVisibleInWindow'
        // observer or some such helper method because this work is not
        // strictly related to computing the visibility, but view performance
        // is critical, so avoiding the extra observer is worthwhile.
        if (this.get('isKeyPane')) { this.resignKeyPane(); }
      }
    }

    // If we're in this function, then that means one of our ancestor views
    // changed, or changed its 'isVisibleInWindow' value.  That means that if
    // we are out of sync with the layer, then we need to update our state
    // now.
    //
    // For example, say we're isVisible=NO, but we have not yet added the
    // 'sc-hidden' class to the layer because of the "don't update the layer if
    // we're not visible in the window" check.  If any of our parent views
    // became visible, our layer would incorrectly be shown!
    this.updateLayerIfNeeded(YES);

    return this;
  },

  /** @private */
  updateLayerLocation: function() {
    if(this.get('designer') && SC.suppressMain) return arguments.callee.base.apply(this,arguments);
    // note: the normal code here to update node location is removed
    // because we don't need it for panes.
    return this ;
  },

  /** @private */
  init: function() {
    // Backwards compatibility
    if (this.hasTouchIntercept === YES) {
      SC.Logger.warn("Do not set hasTouchIntercept directly. Use wantsTouchIntercept instead.");
      this.hasTouchIntercept = SC.platform.touch;
    }

    // if a layer was set manually then we will just attach to existing
    // HTML.
    var hasLayer = !!this.get('layer') ;
    arguments.callee.base.apply(this,arguments) ;
    if (hasLayer) this.paneDidAttach();
  },

  /** @private */
  classNames: ['sc-pane']

}) ;


/* >>>>>>>>>> BEGIN source/panes/keyboard.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("panes/pane");

SC.Pane.reopen(
  /** @scope SC.Pane.prototype */ {

  performKeyEquivalent: function(keystring, evt) {
    var ret = arguments.callee.base.apply(this,arguments) ; // try normal view behavior first
    if (!ret) {
      var defaultResponder = this.get('defaultResponder') ;
      if (defaultResponder) {
        // try default responder's own performKeyEquivalent method,
        // if it has one...
        if (defaultResponder.performKeyEquivalent) {
          ret = defaultResponder.performKeyEquivalent(keystring, evt) ;
        }

        // even if it does have one, if it doesn't handle the event, give
        // methodName-style key equivalent handling a try
        if (!ret && defaultResponder.tryToPerform) {
          ret = defaultResponder.tryToPerform(keystring, evt) ;
        }
      }
    }
    return ret ;
  },

  /** @private
    If the user presses the tab key and the pane does not have a first
    responder, try to give it to the next eligible responder.

    If the keyDown event reaches the pane, we can assume that no responders in
    the responder chain, nor the default responder, handled the event.
  */
  keyDown: function(evt) {
    var nextValidKeyView;

    // Handle tab key presses if we don't have a first responder already
    if ((evt.which === 9 || (SC.browser.mozilla && evt.keyCode ===9)) && !this.get('firstResponder')) {
      // Cycle forwards by default, backwards if the shift key is held
      if (evt.shiftKey) {
        nextValidKeyView = this.get('previousValidKeyView');
      } else {
        nextValidKeyView = this.get('nextValidKeyView');
      }

      if (nextValidKeyView) {
        this.makeFirstResponder(nextValidKeyView);
        return YES;
      }else if(!SC.TABBING_ONLY_INSIDE_DOCUMENT){
        evt.allowDefault();
      }
    }

    return NO;
  },

  /** @private method forwards status changes in a generic way. */
  _forwardKeyChange: function(shouldForward, methodName, pane, isKey) {
    var keyView, responder, newKeyView;
    if (shouldForward && (responder = this.get('firstResponder'))) {
      newKeyView = (pane) ? pane.get('firstResponder') : null ;
      keyView = this.get('firstResponder') ;
      if (keyView && keyView[methodName]) { keyView[methodName](newKeyView); }

      if ((isKey !== undefined) && responder) {
        responder.set('isKeyResponder', isKey);
      }
    }
  }
});

/* >>>>>>>>>> BEGIN source/panes/layout.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("panes/pane");

SC.Pane.reopen(
  /** @scope SC.Pane.prototype */ {

  /**
    Last known window size.

    @property {Rect}
  */
  currentWindowSize: null,

  /**
    The parent dimensions are always the last known window size.

    @returns {Rect} current window size
  */
  computeParentDimensions: function(frame) {
    if(this.get('designer') && SC.suppressMain) { return arguments.callee.base.apply(this,arguments); }

    var wDim = {x: 0, y: 0, width: 1000, height: 1000},
        layout = this.get('layout');

    // There used to be a whole bunch of code right here to calculate
    // based first on a stored window size, then on root responder, then
    // from document... but a) it is incorrect because we don't care about
    // the window size, but instead, the clientWidth/Height of the body, and
    // b) the performance benefits are not worth complicating the code that much.
    if (document && document.body) {
      wDim.width = document.body.clientWidth;
      wDim.height = document.body.clientHeight;

      // IE7 is the only browser which reports clientHeight _including_ scrollbar.
      if (SC.browser.isIE && SC.browser.compareVersion("7.0") === 0) {
        var scrollbarSize = SC.platform.get('scrollbarSize');
        if (document.body.scrollWidth > wDim.width) {
          wDim.width -= scrollbarSize;
        }
        if (document.body.scrollHeight > wDim.height) {
          wDim.height -= scrollbarSize;
        }
      }
    }

    // If there is a minWidth or minHeight set on the pane, take that
    // into account when calculating dimensions.

    if (layout.minHeight || layout.minWidth) {
      if (layout.minHeight) {
        wDim.height = Math.max(wDim.height, layout.minHeight);
      }
      if (layout.minWidth) {
        wDim.width = Math.max(wDim.width, layout.minWidth);
      }
    }
    return wDim;
  },

  /** @private Disable caching due to an known bug in SC. */
  frame: function() {
    if(this.get('designer') && SC.suppressMain) { return arguments.callee.base.apply(this,arguments); }
    return this.computeFrameWithParentFrame(null) ;
  }.property(),

  /**
    Invoked by the root responder whenever the window resizes.  This should
    simply begin the process of notifying children that the view size has
    changed, if needed.

    @param {Rect} oldSize the old window size
    @param {Rect} newSize the new window size
    @returns {SC.Pane} receiver
  */
  windowSizeDidChange: function(oldSize, newSize) {
    this.set('currentWindowSize', newSize) ;
    this.parentViewDidResize(); // start notifications.
    return this ;
  },

  /** @private */
  paneLayoutDidChange: function() {
    this.invokeOnce(this.updateLayout);
  }.observes('layout'),

  recomputeDependentProperties: function(original) {
    this.set('currentWindowSize', this.rootResponder.computeWindowSize()) ;
    original();
  }.enhance()
});

/* >>>>>>>>>> BEGIN source/panes/manipulation.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("panes/pane");

SC.Pane.reopen(
  /** @scope SC.Pane.prototype */ {

  /**
    Inserts the pane's layer as the first child of the passed element.

    @param {DOMElement|jQuery|String} elem the element to prepend the pane's layer to.
      This is passed to `jQuery()`, so any value supported by `jQuery()` will work.
    @returns {SC.Pane} receiver
  */
  prependTo: function(elem) {
    return this.insert(function(layer) {
      jQuery(elem).prepend(layer);
    });
  },

  /**
    This method has no effect in the pane.  Instead use remove().

    @returns {void}
  */
  removeFromParent: function() {
    throw SC.Error.desc("SC.Pane cannot be removed from its parent, since it's the root. Did you mean remove()?");
  }
});

/* >>>>>>>>>> BEGIN source/panes/template.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  SC.TemplatePane is a helper that will create a new pane based on
  a single root TemplateView.

      function main() {
        MyApp.mainPane = SC.TemplatePane.append({
          layerId: 'my-root-id',
          templateName: 'app'
        })
      }

  @extends SC.Object
  @since SproutCore 1.5
*/
SC.TemplatePane = SC.Object.extend({});

SC.TemplatePane.mixin( /** @scope SC.TemplatePane */ {

  /**
    Creates a new pane with a single TemplateView.

    @param {Object} attrs describes the pane to create
    @returns {SC.MainPane} the created pane
  */
  append: function(attrs) {
    var pane = SC.MainPane.extend({
      childViews: ['contentView'],

      contentView: SC.TemplateView.design(attrs),

      touchStart: function(touch) {
        touch.allowDefault();
      },

      touchesDragged: function(evt, touches) {
        evt.allowDefault();
      },

      touchEnd: function(touch) {
        touch.allowDefault();
      }
    });

    pane = pane.create().append();

    // Normally the awake process is started in the Page, but we don't have a Page
    pane.awake();

    return pane;
  }
});

/* >>>>>>>>>> BEGIN source/panes/visibility.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("panes/pane");

SC.Pane.reopen(
  /** @scope SC.Pane.prototype */ {

  recomputeDependentProperties: function(original) {
    this.recomputeIsVisibleInWindow();
    original();
  }.enhance()

});

/* >>>>>>>>>> BEGIN source/protocols/observable_protocol.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  The SC.ObservableProtocol defines optional methods you can implement on your
  objects.  They will be used if defined but are not required for observing to
  work.
*/
SC.ObservableProtocol = {

  /**
    Generic property observer called whenever a property on the receiver
    changes.

    If you need to observe a large number of properties on your object, it
    is sometimes more efficient to implement this observer only and then to
    handle requests yourself.  Although this observer will be triggered
    more often than an observer registered on a specific property, it also
    does not need to be registered which can make it faster to setup your
    object instance.

    You will often implement this observer using a switch statement on the
    key parameter, taking appropriate action.

    @param observer {null} no longer used; usually null
    @param target {Object} the target of the change.  usually this
    @param key {String} the name of the property that changed
    @param value {Object} the new value of the property.
    @param revision {Number} a revision you can use to quickly detect changes.
    @returns {void}
  */
  propertyObserver: function(observer,target,key,value, revision) {

  }

};

/* >>>>>>>>>> BEGIN source/protocols/sparse_array_delegate.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @namespace

  Delegate that provides data for a sparse array.  If you set the delegate for
  a sparse array to an object that implements one or more of these methods,
  they will be invoked by the sparse array to fetch data or to update the
  array content as needed.

  Your object does not need to implement all of these methods, but it should
  at least implment the sparseArrayDidRequestIndex() method.

  @since SproutCore 1.0
*/
SC.SparseArrayDelegate = {

  /**
    Invoked when an object requests the length of the sparse array and the
    length has not yet been set.  You can implement this method to update
    the length property of the sparse array immediately or at a later time
    by calling the provideLength() method on the sparse array.

    This method will only be called once on your delegate unless you
    subsequently call provideLength(null) on the array, which will effectively
    "empty" the array and cause the array to invoke the delegate again the
    next time its length is request.

    If you do not set a length on the sparse array immediately, it will return
    a length of 0 until you provide the length.

    @param {SC.SparseArray} sparseArray the array that needs a length.
    @returns {void}
  */
  sparseArrayDidRequestLength: function(sparseArray) {
    // Default does nothing.
  },

  /**
    Invoked when an object requests an index on the sparse array that has not
    yet been set.  You should implement this method to set the object at the
    index using provideObjectsAtIndex() or provideObjectsInRange() on the
    sparse array.  You can call these methods immediately during this handler
    or you can wait and call them at a later time once you have loaded any
    data.

    This method will only be called when an index is requested on the sparse
    array that has not yet been filled.  If you have filled an index or range
    and you would like to reset it, call the objectsDidChangeInRange() method
    on the sparse array.

    Note that if you implement the sparseArrayDidRequestRange() method, that
    method will be invoked instead of this one whenever possible to allow you
    to fill in the array with the most efficiency possible.

    @param {SC.SparseArray} sparseArray the sparse array
    @param {Number} index the requested index
    @returns {void}
  */
  sparseArrayDidRequestIndex: function(sparseArray, index) {

  },

  /**
    Alternative method invoked when an object requests an index on the
    sparse array that has not yet been set.  If you set the
    rangeWindowSize property on the Sparse Array, then all object index
    requests will be expanded to to nearest range window and then this
    method will be called with that range.

    You should fill in the passed range by calling the provideObjectsInRange()
    method on the sparse array.

    If you do not implement this method but set the rangeWindowSize anyway,
    then the sparseArrayDidRequestIndex() method will be invoked instead.

    Note that the passed range is a temporary object.  Be sure to clone it if
    you want to keep the range for later use.

    @param {SC.SparseArray} sparseArray the sparse array
    @param {Range} range read only range.
    @returns {void}
  */
  sparseArrayDidRequestRange: function(sparseArray, range) {

  },

  /**
    Optional delegate method you can use to determine the index of a
    particular object.  If you do not implement this method, then the
    sparse array will just search the objects it has loaded already.

    @param {SC.SparseArray} sparseArray the sparse array
    @param {Object} object the object to find the index of
    @return {Number} the index or -1
    @returns {void}
  */
  sparseArrayDidRequestIndexOf: function(sparseArray, object) {

  },

  /**
    Optional delegate method invoked whenever the sparse array attempts to
    changes its contents.  If you do not implement this method or if you
    return NO from this method, then the edit will not be allowed.

    @param {SC.SparseArray} sparseArray the sparse array
    @param {Number} idx the starting index to replace
    @param {Number} amt the number if items to replace
    @param {Array} objects the array of objects to insert
    @returns {Boolean} YES to allow replace, NO to deny
  */
  sparseArrayShouldReplace: function(sparseArray, idx, amt, objects) {
    return NO ;
  },

  /**
    Invoked whenever the sparse array is reset.  Resetting a sparse array
    will cause it to flush its content and go back to the delegate for all
    property requests again.

    @param {SC.SparseArray} sparseArray the sparse array
    @returns {void}
  */
  sparseArrayDidReset: function(sparseArray) {
  }
};

/* >>>>>>>>>> BEGIN source/system/application.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  The root object for a SproutCore application. Usually you will create a
  single SC.Application instance as your root namespace. SC.Application is
  required if you intend to use SC.Responder to route events.

  ## Example

      Contacts = SC.Application.create({
        store: SC.Store.create(SC.Record.fixtures),

        // add other useful properties here
      });

  @extends SC.ResponderContext
  @since SproutCore 1.0
*/
SC.Application = SC.Responder.extend(SC.ResponderContext,
/** SC.Application.prototype */ {

});

/* >>>>>>>>>> BEGIN source/system/datetime.js */

/* >>>>>>>>>> BEGIN source/system/ready.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global main */

SC.BENCHMARK_LOG_READY = YES;

sc_require('system/event') ;

SC.mixin({
  isReady: NO,
  
  /**
    Allows apps to avoid automatically attach the ready handlers if they
    want to by setting this flag to YES
    
    @property {Boolean}
  */
  suppressOnReady: SC.suppressOnReady ? YES : NO,
  
  /**
    Allows apps to avoid automatically invoking main() when onReady is called
    
    @property {Boolean}
  */
  suppressMain: SC.suppressMain ? YES : NO,
  
  /**
    Add the passed target and method to the queue of methods to invoke when
    the document is ready.  These methods will be called after the document
    has loaded and parsed, but before the main() function is called.

    Methods are called in the order they are added.

    If you add a ready handler when the main document is already ready, then
    your handler will be called immediately.

    @param target {Object} optional target object
    @param method {Function} method name or function to execute
    @returns {SC}
  */
  ready: function(target, method) {
    var queue = SC._readyQueue;
    
    // normalize
    if (method === undefined) {
      method = target; target = null ;
    } else if (SC.typeOf(method) === SC.T_STRING) {
      method = target[method] ;
    }

    if(SC.isReady) {
      jQuery(document).ready(function() { method.call(target); });
    }
    else {
      if(!queue) SC._readyQueue = [];
      SC._readyQueue.push(function() { method.call(target); });
    }
    
    return this ;
  },

  onReady: {
    done: function() {
      if(SC.isReady) return;
      SC.isReady = true;
      
      SC.RunLoop.begin();
      
      SC.Locale.createCurrentLocale();
      jQuery("body").addClass(SC.Locale.currentLanguage.toLowerCase());
      
      jQuery("#loading").remove();
      
      var queue = SC._readyQueue, idx, len;
      
      if(queue) {
        for(idx=0,len=queue.length;idx<len;idx++) {
          queue[idx].call();
        }
        SC._readyQueue = null;
      }
      
      if(window.main && !SC.suppressMain && (SC.mode === SC.APP_MODE)) { window.main(); }
      SC.RunLoop.end();
    }
  }

}) ;

// let apps ignore the regular onReady handling if they need to
if(!SC.suppressOnReady) {
  jQuery.event.special.ready._default = SC.onReady.done;
}

// default to app mode.  When loading unit tests, this will run in test mode
SC.APP_MODE = "APP_MODE";
SC.TEST_MODE = "TEST_MODE";
SC.mode = SC.APP_MODE;

/* >>>>>>>>>> BEGIN source/system/platform.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  This platform object allows you to conditionally support certain HTML5
  features.

  Rather than relying on the user agent, it detects whether the given elements
  and events are supported by the browser, allowing you to create much more
  robust apps.
*/
SC.platform = SC.Object.create({
  /**
    The size of scrollbars in this browser.

    @property
  */
  scrollbarSize: function() {
    var tester = document.createElement("DIV");
    tester.innerHTML = "<div style='height:1px;'></div>";
    tester.style.cssText="position:absolute;width:100px;height:100px;overflow-y:visible;";

    document.body.appendChild(tester);
    var noScroller = tester.childNodes[0].innerWidth;
    tester.style.overflowY = 'scroll';
    var withScroller = tester.childNodes[0].innerWidth;
    document.body.removeChild(tester);

    return noScroller-withScroller;

  }.property().cacheable(),


  /*
    NOTES
     - A development version of Chrome 9 incorrectly reported supporting touch
     - Android is assumed to support touch, but incorrectly reports that it does not
  */
  /**
    YES if the current device supports touch events, NO otherwise.

    You can simulate touch events in environments that don't support them by
    calling SC.platform.simulateTouchEvents() from your browser's console.

    @property {Boolean}
  */
  touch: (('createTouch' in document) && SC.browser.chrome < 9) || SC.browser.android,
  
  bounceOnScroll: SC.browser.iOS,
  pinchToZoom: SC.browser.iOS,

  input: {
    placeholder: ('placeholder' in document.createElement('input'))
  },

  /**
    A hash that contains properties that indicate support for new HTML5
    input attributes.

    For example, to test to see if the placeholder attribute is supported,
    you would verify that SC.platform.input.placeholder is YES.
  */
  input: function(attributes) {
    var ret = {},
        len = attributes.length,
        elem = document.createElement('input'),
        attr, idx;

    for (idx=0; idx < len; idx++) {
      attr = attributes[idx];

      ret[attr] = !!(attr in elem);
    }

    return ret;
  }(['autocomplete', 'readonly', 'list', 'size', 'required', 'multiple', 'maxlength',
      'pattern', 'min', 'max', 'step', 'placeholder']),

  /**
    YES if the application is currently running as a standalone application.

    For example, if the user has saved your web application to their home
    screen on an iPhone OS-based device, this property will be true.
    @property {Boolean}
  */
  standalone: !!navigator.standalone,


  /**
    Prefix for browser specific CSS attributes. Calculated later.
  */
  cssPrefix: null,

  /**
    Prefix for browsew specific CSS attributes when used in the DOM. Calculated later.
  */
  domCSSPrefix: null,

  /**
    Call this method to swap out the default mouse handlers with proxy methods
    that will translate mouse events to touch events.

    This is useful if you are debugging touch functionality on the desktop.
  */
  simulateTouchEvents: function() {
    // Touch events are supported natively, no need for this.
    if (this.touch) {
      
      SC.Logger.info("Can't simulate touch events in an environment that supports them.");
      
      return;
    }
    
    SC.Logger.log("Simulating touch events");

    // Tell the app that we now "speak" touch
    SC.platform.touch = YES;
    SC.platform.bounceOnScroll = YES;

    // CSS selectors may depend on the touch class name being present
    document.body.className = document.body.className + ' touch';

    // Initialize a counter, which we will use to generate unique ids for each
    // fake touch.
    this._simtouch_counter = 1;

    // Remove events that don't exist in touch environments
    this.removeEvents(['click', 'dblclick', 'mouseout', 'mouseover', 'mousewheel']);

    // Replace mouse events with our translation methods
    this.replaceEvent('mousemove', this._simtouch_mousemove);
    this.replaceEvent('mousedown', this._simtouch_mousedown);
    this.replaceEvent('mouseup', this._simtouch_mouseup);

    // fix orientation handling
    SC.platform.windowSizeDeterminesOrientation = YES;
    SC.device.orientationHandlingShouldChange();
  },

  /** @private
    Removes event listeners from the document.

    @param {Array} events Array of strings representing the events to remove
  */
  removeEvents: function(events) {
    var idx, len = events.length, key;
    for (idx = 0; idx < len; idx++) {
      key = events[idx];
      SC.Event.remove(document, key, SC.RootResponder.responder, SC.RootResponder.responder[key]);
    }
  },

  /** @private
    Replaces an event listener with another.

    @param {String} evt The event to replace
    @param {Function} replacement The method that should be called instead
  */
  replaceEvent: function(evt, replacement) {
    SC.Event.remove(document, evt, SC.RootResponder.responder, SC.RootResponder.responder[evt]);
    SC.Event.add(document, evt, this, replacement);
  },

  /** @private
    When simulating touch events, this method is called when mousemove events
    are received.

    If the altKey is depresed and pinch center not yet established, we will capture the mouse position.
  */
  _simtouch_mousemove: function(evt) {
    if (!this._mousedown) {
      /*
        we need to capture when was the first spot that the altKey was pressed and use it as
        the center point of a pinch
       */
      if(evt.altKey && this._pinchCenter == null) {
        this._pinchCenter = {
          pageX: evt.pageX,
          pageY: evt.pageY,
          screenX: evt.screenX,
          screenY: evt.screenY,
          clientX: evt.clientX,
          clientY: evt.clientY
        };
      } else if(!evt.altKey && this._pinchCenter != null){
        this._pinchCenter = null;
      }
      return NO;
    }

    var manufacturedEvt = this.manufactureTouchEvent(evt, 'touchmove');
    return SC.RootResponder.responder.touchmove(manufacturedEvt);
  },

  /** @private
    When simulating touch events, this method is called when mousedown events
    are received.
  */
  _simtouch_mousedown: function(evt) {
    this._mousedown = YES;

    var manufacturedEvt = this.manufactureTouchEvent(evt, 'touchstart');
    return SC.RootResponder.responder.touchstart(manufacturedEvt);
  },

  /** @private
    When simulating touch events, this method is called when mouseup events
    are received.
  */
  _simtouch_mouseup: function(evt) {
    var manufacturedEvt = this.manufactureTouchEvent(evt, 'touchend'),
        ret = SC.RootResponder.responder.touchend(manufacturedEvt);

    this._mousedown = NO;
    this._simtouch_counter++;
    return ret;
  },

  /** @private
    Converts a mouse-style event to a touch-style event.

    Note that this method edits the passed event in place, and returns
    that same instance instead of a new, modified version.

    If altKey is depressed and we have previously captured a position for the center of
    the pivot point for the virtual second touch, we will manufacture an additional touch.
    The position of the virtual touch will be the reflection of the mouse position,
    relative to the pinch center.

    @param {Event} evt the mouse event to modify
    @param {String} type the type of event (e.g., touchstart)
    @returns {Event} the mouse event with an added changedTouches array
  */
  manufactureTouchEvent: function(evt, type) {
    var realTouch, virtualTouch, realTouchIdentifier = this._simtouch_counter;

    realTouch = {
      type: type,
      target: evt.target,
      identifier: realTouchIdentifier,
      pageX: evt.pageX,
      pageY: evt.pageY,
      screenX: evt.screenX,
      screenY: evt.screenY,
      clientX: evt.clientX,
      clientY: evt.clientY
    };
    evt.touches = [ realTouch ];

    /*
      simulate pinch gesture
     */
    if(evt.altKey && this._pinchCenter != null)
    {
      //calculate the mirror position of the virtual touch
      var pageX = this._pinchCenter.pageX + this._pinchCenter.pageX - evt.pageX ,
          pageY = this._pinchCenter.pageY + this._pinchCenter.pageY - evt.pageY,
          screenX = this._pinchCenter.screenX + this._pinchCenter.screenX - evt.screenX,
          screenY = this._pinchCenter.screenY + this._pinchCenter.screenY - evt.screenY,
          clientX = this._pinchCenter.clientX + this._pinchCenter.clientX - evt.clientX,
          clientY = this._pinchCenter.clientY + this._pinchCenter.clientY - evt.clientY,
          virtualTouchIdentifier = this._simtouch_counter + 1;

      virtualTouch = {
        type: type,
        target: evt.target,
        identifier: virtualTouchIdentifier,
        pageX: pageX,
        pageY: pageY,
        screenX: screenX,
        screenY: screenY,
        clientX: clientX,
        clientY: clientY
      };

      evt.touches = [ realTouch , virtualTouch];
    }
    evt.changedTouches = evt.touches;

    return evt;
  },

  /**
    Whether the browser supports CSS transitions. Calculated later.
  */
  supportsCSSTransitions: NO,

  /**
    Whether the browser supports 2D CSS transforms. Calculated later.
  */
  supportsCSSTransforms: NO,

  /**
    Whether the browser understands 3D CSS transforms.
    This does not guarantee that the browser properly handles them.
    Calculated later.
  */
  understandsCSS3DTransforms: NO,

  /**
    Whether the browser can properly handle 3D CSS transforms. Calculated later.
  */
  supportsCSS3DTransforms: NO,

  /**
    Whether the browser can handle accelerated layers. While supports3DTransforms tells us if they will
    work in principle, sometimes accelerated layers interfere with things like getBoundingClientRect.
    Then everything breaks.
  */
  supportsAcceleratedLayers: NO,

  /**
    Wether the browser supports the hashchange event.
  */
  supportsHashChange: function() {
    // Code copied from Modernizr which copied code from YUI (MIT licenses)
    // documentMode logic from YUI to filter out IE8 Compat Mode which false positives
    return ('onhashchange' in window) && (document.documentMode === undefined || document.documentMode > 7);
  }(),
  
  /**
    Wether the browser supports HTML5 history.
  */
  supportsHistory: function() {
    return !!(window.history && window.history.pushState);
  }(),
  
  supportsCanvas: function() {
    return !!document.createElement('canvas').getContext;
  }(),
  
  supportsOrientationChange: ('onorientationchange' in window),
  
  /**
    Because iOS is slow to dispatch the window.onorientationchange event,
    we use the window size to determine the orientation on iOS devices
    and desktop environments when SC.platform.touch is YES (ie. when
    SC.platform.simulateTouchEvents has been called)
    
    @property {Boolean}
    @default NO
  */
  windowSizeDeterminesOrientation: SC.browser.iOS || !('onorientationchange' in window)

});

/* Calculate CSS Prefixes */

(function(){
  var userAgent = navigator.userAgent.toLowerCase();
  if ((/webkit/).test(userAgent)) {
    SC.platform.cssPrefix = 'webkit';
    SC.platform.domCSSPrefix = 'Webkit';
  } else if((/opera/).test( userAgent )) {
    SC.platform.cssPrefix = 'opera';
    SC.platform.domCSSPrefix = 'O';
  } else if((/msie/).test( userAgent ) && !(/opera/).test( userAgent )) {
    SC.platform.cssPrefix = 'ms';
    SC.platform.domCSSPrefix = 'ms';
  } else if((/mozilla/).test( userAgent ) && !(/(compatible|webkit)/).test( userAgent )) {
    SC.platform.cssPrefix = 'moz';
    SC.platform.domCSSPrefix = 'Moz';
  }
})();

/* Calculate transform support */

(function(){
  // a test element
  var el = document.createElement("div");

  // the css and javascript to test
  var css_browsers = ["-moz-", "-moz-", "-o-", "-ms-", "-webkit-"];
  var test_browsers = ["moz", "Moz", "o", "ms", "webkit"];

  // prepare css
  var css = "", i = null;
  for (i = 0; i < css_browsers.length; i++) {
    css += css_browsers[i] + "transition:all 1s linear;";
    css += css_browsers[i] + "transform: translate(1px, 1px);";
    css += css_browsers[i] + "perspective: 500px;";
  }

  // set css text
  el.style.cssText = css;

  // test
  for (i = 0; i < test_browsers.length; i++)
  {
    if (el.style[test_browsers[i] + "TransitionProperty"] !== undefined) SC.platform.supportsCSSTransitions = YES;
    if (el.style[test_browsers[i] + "Transform"] !== undefined) SC.platform.supportsCSSTransforms = YES;
    if (el.style[test_browsers[i] + "Perspective"] !== undefined || el.style[test_browsers[i] + "PerspectiveProperty"] !== undefined) {
      SC.platform.understandsCSS3DTransforms = YES;
      SC.platform.supportsCSS3DTransforms = YES;
    }
  }

  // unfortunately, we need a bit more to know FOR SURE that 3D is allowed
  try{
    if (window.media && window.media.matchMedium) {
      if (!window.media.matchMedium('(-webkit-transform-3d)')) SC.platform.supportsCSS3DTransforms = NO;
    } else if(window.styleMedia && window.styleMedia.matchMedium) {
      if (!window.styleMedia.matchMedium('(-webkit-transform-3d)')) SC.platform.supportsCSS3DTransforms = NO;
    }
  }catch(e){
    //Catch to support IE9 exception
    SC.platform.supportsCSS3DTransforms = NO;
  }

  // Unfortunately, this has to be manual, as I can't think of a good way to test it
  // webkit-only for now.
  if (SC.platform.supportsCSSTransforms && SC.platform.cssPrefix === "webkit") {
    SC.platform.supportsAcceleratedLayers = YES;
  }
})();

/* >>>>>>>>>> BEGIN source/system/root_responder.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/ready');
sc_require('system/platform');

/** Set to NO to leave the backspace key under the control of the browser.*/
SC.CAPTURE_BACKSPACE_KEY = NO ;

/** @class

  The RootResponder captures events coming from a web browser and routes them
  to the correct view in the view hierarchy.  Usually you do not work with a
  RootResponder directly.  Instead you will work with Pane objects, which
  register themselves with the RootResponder as needed to receive events.

  RootResponder and Platforms
  ---

  RootResponder contains core functionality common among the different web
  platforms. You will likely be working with a subclass of RootResponder that
  implements functionality unique to that platform.

  The correct instance of RootResponder is detected at runtime and loaded
  transparently.

  Event Types
  ---

  RootResponders can route four types of events:

   - Direct events, such as mouse and touch events.  These are routed to the
     nearest view managing the target DOM elment. RootResponder also handles
     multitouch events so that they are delegated to the correct views.
   - Keyboard events. These are sent to the keyPane, which will then send the
     event to the current firstResponder and up the responder chain.
   - Resize events. When the viewport resizes, these events will be sent to all
     panes.
   - Keyboard shortcuts. Shortcuts are sent to the keyPane first, which
     will go down its view hierarchy. Then they go to the mainPane, which will
     go down its view hierarchy.
   - Actions. Actions are generic messages that your application can send in
     response to user action or other events. You can either specify an
     explicit target, or allow the action to traverse the hierarchy until a
     view is found that handles it.
*/
SC.RootResponder = SC.Object.extend(
  /** @scope SC.RootResponder.prototype */{

  /**
    Contains a list of all panes currently visible on screen.  Everytime a
    pane attaches or detaches, it will update itself in this array.
  */
  panes: null,

  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.panes = SC.Set.create();

    if (SC.platform.supportsCSSTransitions) {
      this[SC.platform.cssPrefix+'TransitionEnd'] = this.transitionEnd;
      this['transitionend'] = this.transitionEnd;
    }
  },

  // .......................................................
  // MAIN PANE
  //

  /**
    The main pane.  This pane receives shortcuts and actions if the
    focusedPane does not respond to them.  There can be only one main pane.
    You can swap main panes by calling makeMainPane() here.

    Usually you will not need to edit the main pane directly.  Instead, you
    should use a MainPane subclass, which will automatically make itself main
    when you append it to the document.
    
    @type SC.MainPane
  */
  mainPane: null,

  /**
    Swaps the main pane.  If the current main pane is also the key pane, then
    the new main pane will also be made key view automatically.  In addition
    to simply updating the mainPane property, this method will also notify the
    panes themselves that they will lose/gain their mainView status.

    Note that this method does not actually change the Pane's place in the
    document body.  That will be handled by the Pane itself.

    @param {SC.Pane} pane
    @returns {SC.RootResponder}
  */
  makeMainPane: function(pane) {
    var currentMain = this.get('mainPane') ;
    if (currentMain === pane) return this ; // nothing to do

    this.beginPropertyChanges() ;

    // change key focus if needed.
    if (this.get('keyPane') === currentMain) this.makeKeyPane(pane) ;

    // change setting
    this.set('mainPane', pane) ;

    // notify panes.  This will allow them to remove themselves.
    if (currentMain) currentMain.blurMainTo(pane) ;
    if (pane) pane.focusMainFrom(currentMain) ;

    this.endPropertyChanges() ;
    return this ;
  },

  // ..........................................................
  // MENU PANE
  //

  /**
    The current menu pane. This pane receives keyboard events before all other
    panes, but tends to be transient, as it is only set when a pane is open.

    @type SC.MenuPane
  */
  menuPane: null,

  /**
    Sets a pane as the menu pane. All key events will be directed to this
    pane, but the current key pane will not lose focus.

    Usually you would not call this method directly, but allow instances of
    SC.MenuPane to manage the menu pane for you. If your pane does need to
    become menu pane, you should relinquish control by calling this method
    with a null parameter. Otherwise, key events will always be delivered to
    that pane.

    @param {SC.MenuPane} pane
    @returns {SC.RootResponder} receiver
  */
  makeMenuPane: function(pane) {
    // Does the specified pane accept being the menu pane?  If not, there's
    // nothing to do.
    if (pane  &&  !pane.get('acceptsMenuPane')) {
      return this;
    } else {
      var currentMenu = this.get('menuPane');
      if (currentMenu === pane) return this; // nothing to do

      this.set('menuPane', pane);
    }

    return this;
  },

  // .......................................................
  // KEY PANE
  //

  /**
    The current key pane. This pane receives keyboard events, shortcuts, and
    actions first, unless a menu is open. This pane is usually the highest
    ordered pane or the mainPane.

    @type SC.Pane
  */
  keyPane: null,

  /** @property
    A stack of the previous key panes.

    *IMPORTANT: Property is not observable*
  */
  previousKeyPanes: [],

  /**
    Makes the passed pane the new key pane.  If you pass null or if the pane
    does not accept key focus, then key focus will transfer to the previous
    key pane (if it is still attached), and so on down the stack.  This will
    notify both the old pane and the new root View that key focus has changed.

    @param {SC.Pane} pane
    @returns {SC.RootResponder} receiver
  */
  makeKeyPane: function(pane) {
    // Was a pane specified?
    var newKeyPane, previousKeyPane, previousKeyPanes ;

    if (pane) {
      // Does the specified pane accept being the key pane?  If not, there's
      // nothing to do.
      if (!pane.get('acceptsKeyPane')) {
        return this ;
      }
      else {
        // It does accept key pane status?  Then push the current keyPane to
        // the top of the stack and make the specified pane the new keyPane.
        // First, though, do a sanity-check to make sure it's not already the
        // key pane, in which case we have nothing to do.
        previousKeyPane = this.get('keyPane') ;
        if (previousKeyPane === pane) {
          return this ;
        }
        else {
          if (previousKeyPane) {
            previousKeyPanes = this.get('previousKeyPanes') ;
            previousKeyPanes.push(previousKeyPane) ;
          }

          newKeyPane = pane ;
        }
      }
    }
    else {
      // No pane was specified?  Then pop the previous key pane off the top of
      // the stack and make it the new key pane, assuming that it's still
      // attached and accepts key pane (its value for acceptsKeyPane might
      // have changed in the meantime).  Otherwise, we'll keep going up the
      // stack.
      previousKeyPane = this.get('keyPane') ;
      previousKeyPanes = this.get('previousKeyPanes') ;

      newKeyPane = null ;
      while (previousKeyPanes.length > 0) {
        var candidate = previousKeyPanes.pop();
        if (candidate.get('isPaneAttached')  &&  candidate.get('acceptsKeyPane')) {
          newKeyPane = candidate ;
          break ;
        }
      }
    }


    // If we found an appropriate candidate, make it the new key pane.
    // Otherwise, make the main pane the key pane (if it accepts it).
    if (!newKeyPane) {
      var mainPane = this.get('mainPane') ;
      if (mainPane && mainPane.get('acceptsKeyPane')) newKeyPane = mainPane ;
    }

    // now notify old and new key views of change after edit
    if (previousKeyPane) previousKeyPane.willLoseKeyPaneTo(newKeyPane) ;
    if (newKeyPane) newKeyPane.willBecomeKeyPaneFrom(previousKeyPane) ;

    this.set('keyPane', newKeyPane) ;

    if (newKeyPane) newKeyPane.didBecomeKeyPaneFrom(previousKeyPane) ;
    if (previousKeyPane) previousKeyPane.didLoseKeyPaneTo(newKeyPane) ;

    return this ;
  },

  // ..........................................................
  // VIEWPORT STATE
  //

  /**
    The last known window size.
    @type Rect
    @isReadOnly
  */
  currentWindowSize: null,

  /**
    Computes the window size from the DOM.

    @returns Rect
  */
    computeWindowSize: function() {
      var size, bod, docElement;
      if(!this._bod || !this._docElement){
        bod = document.body;
        docElement = document.documentElement;
        this._bod=bod;
        this._docElement=docElement;
      }else{
        bod = this._bod;
        docElement = this._docElement;
      }
      if (window.innerHeight) {
        size = {
          width: window.innerWidth,
          height: window.innerHeight
        } ;
      } else if (docElement && docElement.clientHeight) {
        size = {
          width: docElement.clientWidth,
          height: docElement.clientHeight
        };
      } else if (bod) {
        size = {
          width: bod.clientWidth,
          height: bod.clientHeight
        } ;
      }
      return size;
    },

  /**
    On window resize, notifies panes of the change.

    @returns {Boolean}
  */
  resize: function() {
    this._resize();
    //this.invokeLater(this._resize, 10);
    return YES; //always allow normal processing to continue.
  },

  _resize: function() {
    // calculate new window size...
    var newSize = this.computeWindowSize(), oldSize = this.get('currentWindowSize');
    this.set('currentWindowSize', newSize); // update size

    if (!SC.rectsEqual(newSize, oldSize)) {
      //Notify orientation change. This is faster than waiting for the orientation
      //change event.
      SC.device.windowSizeDidChange(newSize);

      // notify panes
      if (this.panes) {
        SC.run(function() {
          this.panes.invoke('windowSizeDidChange', oldSize, newSize) ;
        }, this);
      }
    }
  },

  /**
    Indicates whether or not the window currently has focus.  If you need
    to do something based on whether or not the window is in focus, you can
    setup a binding or observer to this property.  Note that the SproutCore
    automatically adds an sc-focus or sc-blur CSS class to the body tag as
    appropriate.  If you only care about changing the appearance of your
    controls, you should use those classes in your CSS rules instead.
  */
  hasFocus: NO,

  /**
    Handle window focus.  Change hasFocus and add sc-focus CSS class
    (removing sc-blur).  Also notify panes.
  */
  focus: function() {
    
    if (!this.get('hasFocus')) {
      SC.$('body').addClass('sc-focus').removeClass('sc-blur');

      // If the app is getting focus again set the first responder to the first
      // valid firstResponder view in the view's tree
      if(!SC.TABBING_ONLY_INSIDE_DOCUMENT){
        var mainPane = this.get('mainPane'),
            nextValidKeyView = mainPane ? mainPane.get('nextValidKeyView') : null;
        if (nextValidKeyView) mainPane.makeFirstResponder(nextValidKeyView);
      }
      
      SC.run(function() {
        this.set('hasFocus', YES);
      }, this);
    }
    return YES ; // allow default
  },

  /**
    Handle window focus event for IE. Listening to the focus event is not
    reliable as per every focus event you receive you inmediately get a blur
    event (Only on IE of course ;)
  */
  focusin: function() {
    this.focus();
  },

  /**
    Handle window blur event for IE. Listening to the focus event is not
    reliable as per every focus event you receive you inmediately get a blur
    event (Only on IE of course ;)
  */
  focusout: function() {
    this.blur();
  },


  /**
    Handle window focus.  Change hasFocus and add sc-focus CSS class (removing
    sc-blur).  Also notify panes.
  */
  blur: function() {
    if (this.get('hasFocus')) {
      SC.$('body').addClass('sc-blur').removeClass('sc-focus');

      SC.run(function() {
        this.set('hasFocus', NO);
      }, this);
    }
    return YES ; // allow default
  },

  dragDidStart: function(drag) {
    this._mouseDownView = drag ;
    this._drag = drag ;
  },

  // .......................................................
  // ACTIONS
  //

  /**
    Set this to a delegate object that can respond to actions as they are sent
    down the responder chain.

    @type SC.Object
  */
  defaultResponder: null,

  /**
    Route an action message to the appropriate responder.  This method will
    walk the responder chain, attempting to find a responder that implements
    the action name you pass to this method.  Set 'target' to null to search
    the responder chain.

    **IMPORTANT**: This method's API and implementation will likely change
    significantly after SproutCore 1.0 to match the version found in
    SC.ResponderContext.

    You generally should not call or override this method in your own
    applications.

    @param {String} action The action to perform - this is a method name.
    @param {SC.Responder} target object to set method to (can be null)
    @param {Object} sender The sender of the action
    @param {SC.Pane} pane optional pane to start search with
    @param {Object} context optional. only passed to ResponderContexts
    @returns {Boolean} YES if action was performed, NO otherwise
    @test in targetForAction
  */
  sendAction: function( action, target, sender, pane, context, firstResponder) {
    target = this.targetForAction(action, target, sender, pane, firstResponder) ;

    // HACK: If the target is a ResponderContext, forward the action.
    if (target && target.isResponderContext) {
      return !!target.sendAction(action, sender, context, firstResponder);
    } else return target && target.tryToPerform(action, sender);
  },

  _responderFor: function(target, methodName, firstResponder) {
    var defaultResponder = target ? target.get('defaultResponder') : null;

    if (target) {
      target = firstResponder || target.get('firstResponder') || target;
      do {
        if (target.respondsTo(methodName)) return target ;
      } while ((target = target.get('nextResponder'))) ;
    }

    // HACK: Eventually we need to normalize the sendAction() method between
    // this and the ResponderContext, but for the moment just look for a
    // ResponderContext as the defaultResponder and return it if present.
    if (typeof defaultResponder === SC.T_STRING) {
      defaultResponder = SC.objectForPropertyPath(defaultResponder);
    }

    if (!defaultResponder) return null;
    else if (defaultResponder.isResponderContext) return defaultResponder;
    else if (defaultResponder.respondsTo(methodName)) return defaultResponder;
    else return null;
  },

  /**
    Attempts to determine the initial target for a given action/target/sender
    tuple.  This is the method used by sendAction() to try to determine the
    correct target starting point for an action before trickling up the
    responder chain.

    You send actions for user interface events and for menu actions.

    This method returns an object if a starting target was found or null if no
    object could be found that responds to the target action.

    Passing an explicit target or pane constrains the target lookup to just
    them; the defaultResponder and other panes are *not* searched.

    @param {Object|String} target or null if no target is specified
    @param {String} method name for target
    @param {Object} sender optional sender
    @param {SC.Pane} optional pane
    @param {firstResponder} a first responder to use
    @returns {Object} target object or null if none found
  */
  targetForAction: function(methodName, target, sender, pane, firstResponder) {

    // 1. no action, no target...
    if (!methodName || (SC.typeOf(methodName) !== SC.T_STRING)) {
      return null ;
    }

    // 2. an explicit target was passed...
    if (target) {
      if (SC.typeOf(target) === SC.T_STRING) {
        target =  SC.objectForPropertyPath(target) ||
                  SC.objectForPropertyPath(target, sender);
      }

      if (target && !target.isResponderContext) {
        if (target.respondsTo && !target.respondsTo(methodName)) {
          target = null ;
        } else if (SC.typeOf(target[methodName]) !== SC.T_FUNCTION) {
          target = null ;
        }
      }

      return target ;
    }

    // 3. an explicit pane was passed...
    if (pane) {
      target = this._responderFor(pane, methodName, firstResponder);
      if (target) return target;
    }

    // 4. no target or pane passed... try to find target in the active panes
    // and the defaultResponder
    var keyPane = this.get('keyPane'), mainPane = this.get('mainPane') ;

    // ...check key and main panes first
    if (keyPane && (keyPane !== pane)) {
      target = this._responderFor(keyPane, methodName) ;
    }
    if (!target && mainPane && (mainPane !== keyPane)) {
      target = this._responderFor(mainPane, methodName) ;
    }

    // ...still no target? check the defaultResponder...
    if (!target && (target = this.get('defaultResponder'))) {
      if (SC.typeOf(target) === SC.T_STRING) {
        target = SC.objectForPropertyPath(target) ;
        if (target) this.set('defaultResponder', target) ; // cache if found
      }
      if (target && !target.isResponderContext) {
        if (target.respondsTo && !target.respondsTo(methodName)) {
          target = null ;
        } else if (SC.typeOf(target[methodName]) !== SC.T_FUNCTION) {
          target = null ;
        }
      }
    }

    return target ;
  },

  /**
    Finds the view that appears to be targeted by the passed event.  This only
    works on events with a valid target property.

    @param {SC.Event} evt
    @returns {SC.View} view instance or null
  */
  targetViewForEvent: function(evt) {
    return evt.target ? SC.$(evt.target).view()[0] : null ;
  },

  /**
    Attempts to send an event down the responder chain.  This method will
    invoke the sendEvent() method on either the keyPane or on the pane owning
    the target view you pass in.  It will also automatically begin and end
    a new run loop.

    If you want to trap additional events, you should use this method to
    send the event down the responder chain.

    @param {String} action
    @param {SC.Event} evt
    @param {Object} target
    @returns {Object} object that handled the event or null if not handled
  */
  sendEvent: function(action, evt, target) {
    var pane, ret ;

    SC.run(function() {
      // get the target pane
      if (target) pane = target.get('pane') ;
      else pane = this.get('menuPane') || this.get('keyPane') || this.get('mainPane') ;

      // if we found a valid pane, send the event to it
      ret = (pane) ? pane.sendEvent(action, evt, target) : null ;
    }, this);

    return ret ;
  },

  // .......................................................
  // EVENT LISTENER SETUP
  //

  /**
    Default method to add an event listener for the named event.  If you simply
    need to add listeners for a type of event, you can use this method as
    shorthand.  Pass an array of event types to listen for and the element to
    listen in.  A listener will only be added if a handler is actually installed
    on the RootResponder (or receiver) of the same name.

    @param {Array} keyNames
    @param {Element} target
    @param {Object} receiver - optional if you don't want 'this'
    @param {Boolean} useCapture
    @returns {SC.RootResponder} receiver
  */
  listenFor: function(keyNames, target, receiver, useCapture) {
    receiver = receiver ? receiver : this;
    keyNames.forEach( function(keyName) {
      var method = receiver[keyName] ;
      if (method) SC.Event.add(target, keyName, receiver, method, null, useCapture) ;
    },this) ;
    target = null ;
    return receiver ;
  },

  /**
    Called when the document is ready to begin handling events.  Setup event
    listeners in this method that you are interested in observing for your
    particular platform.  Be sure to call arguments.callee.base.apply(this,arguments).

    @returns {void}
  */
  setup: function() {
    // handle touch events
    this.listenFor(['touchstart', 'touchmove', 'touchend', 'touchcancel'], document);

    // handle basic events
    this.listenFor(['keydown', 'keyup', 'beforedeactivate', 'mousedown', 'mouseup', 'click', 'dblclick', 'mousemove', 'selectstart', 'contextmenu'], document)
        .listenFor(['resize'], window);

    if(SC.browser.msie) this.listenFor('focusin focusout'.w(), document);
    else this.listenFor(['focus', 'blur'], window);

    // handle animation events
    this.listenFor(['webkitAnimationStart', 'webkitAnimationIteration', 'webkitAnimationEnd'], document);

    // CSS Transitions
    if (SC.platform.supportsCSSTransitions) {
      this.listenFor(['transitionend', SC.platform.cssPrefix+'TransitionEnd'], document);
    }

    // handle special case for keypress- you can't use normal listener to block the backspace key on Mozilla
    if (this.keypress) {
      if (SC.CAPTURE_BACKSPACE_KEY && SC.browser.mozilla) {
        var responder = this ;
        document.onkeypress = function(e) {
          e = SC.Event.normalizeEvent(e);
          return responder.keypress.call(responder, e);
        };

        // SC.Event.add(window, 'unload', this, function() { document.onkeypress = null; }); // be sure to cleanup memory leaks

      // Otherwise, just add a normal event handler.
      } else SC.Event.add(document, 'keypress', this, this.keypress);
    }

    // handle these two events specially in IE
    ['drag', 'selectstart'].forEach(function(keyName) {
      var method = this[keyName] ;
      if (method) {
        if (SC.browser.msie) {
          var responder = this ;
          document.body['on' + keyName] = function(e) {
            // return method.call(responder, SC.Event.normalizeEvent(e));
            return method.call(responder, SC.Event.normalizeEvent(event || window.event)); // this is IE :(
          };

          // be sure to cleanup memory leaks
           SC.Event.add(window, 'unload', this, function() {
            document.body['on' + keyName] = null;
          });

        } else {
          SC.Event.add(document, keyName, this, method);
        }
      }
    }, this);

    var mousewheel = 'mousewheel';

    // Firefox emits different mousewheel events than other browsers
    if (SC.browser.mozilla) {
      // For Firefox <3.5, subscribe to DOMMouseScroll events
      if (SC.browser.compareVersion(1,9,1) < 0) {
        mousewheel = 'DOMMouseScroll';

      // For Firefox 3.5 and greater, we can listen for MozMousePixelScroll,
      // which supports pixel-precision scrolling devices, like MacBook
      // trackpads.
      } else {
        mousewheel = 'MozMousePixelScroll';
      }
    }
    SC.Event.add(document, mousewheel, this, this.mousewheel);

    // do some initial set
    this.set('currentWindowSize', this.computeWindowSize()) ;

    if (SC.browser.mobileSafari) {

      // If the browser is identifying itself as a touch-enabled browser, but
      // touch events are not present, assume this is a desktop browser doing
      // user agent spoofing and simulate touch events automatically.
      if (SC.platform && !SC.platform.touch) {
        SC.platform.simulateTouchEvents();
      }

      // Monkey patch RunLoop if we're in MobileSafari
      var f = SC.RunLoop.prototype.endRunLoop, patch;

      patch = function() {
        // Call original endRunLoop implementation.
        if (f) f.apply(this, arguments);

        // This is a workaround for a bug in MobileSafari.
        // Specifically, if the target of a touchstart event is removed from the DOM,
        // you will not receive future touchmove or touchend events. What we do is, at the
        // end of every runloop, check to see if the target of any touches has been removed
        // from the DOM. If so, we re-append it to the DOM and hide it. We then mark the target
        // as having been moved, and it is de-allocated in the corresponding touchend event.
        var touches = SC.RootResponder.responder._touches, touch, elem, target, textNode, view, found = NO;
        if (touches) {
          // Iterate through the touches we're currently tracking
          for (touch in touches) {
            if (touches[touch]._rescuedElement) continue; // only do once

            target = elem = touches[touch].target;

            // Travel up the hierarchy looking for the document body
            while (elem && (elem = elem.parentNode) && !found) {
              found = (elem === document.body);
            }

            // If we aren't part of the body, move the element back
            // but make sure we hide it from display.
            if (!found && target) {

              // Actually clone this node and replace it in the original
              // layer if needed
              if (target.parentNode && target.cloneNode) {
                var clone = target.cloneNode(true);
                target.parentNode.replaceChild(clone, target);
                target.swapNode = clone; // save for restore later
              }

              // Create a holding pen if needed for these views...
              var pen = SC.touchHoldingPen;
              if (!pen) {
                pen = SC.touchHoldingPen = document.createElement('div');
                pen.style.display = 'none';
                document.body.appendChild(pen);
              }

              // move element back into document...
              pen.appendChild(target);

              // // In MobileSafari, our target can sometimes
              // // be a text node, so make sure we handle that case.
              // textNode = (target.nodeType === 3);
              //
              // if (textNode && target.parentElement) {
              //   // Hide the text node's parent element if it has one
              //   target = target.parentElement;
              //   target.style.display = 'none';
              // } else if (textNode) {
              //   // We have a text node with no containing element,
              //   // so just erase its text content.
              //   target.nodeValue = '';
              // } else {
              //   // Standard Element, just toggle its display off.
              //   target.style.display = 'none';
              // }
              //
              // // Now move the captured and hidden element back to the DOM.
              // document.body.appendChild(target);

              // ...and save the element to be garbage collected on
              // touchEnd.
              touches[touch]._rescuedElement = target;
            }
          }
        }
      };
      SC.RunLoop.prototype.endRunLoop = patch;
    }
  },

  // ................................................................................
  // TOUCH SUPPORT
  //
  /*
    This touch support is written to meet the following specifications. They are actually
    simple, but I decided to write out in great detail all of the rules so there would
    be no confusion.

    There are three events: touchStart, touchEnd, touchDragged. touchStart and End are called
    individually for each touch. touchDragged events are sent to whatever view owns the touch
    event
  */

  /**
    @private
    A map from views to internal touch entries.

    Note: the touch entries themselves also reference the views.
  */
  _touchedViews: {},

  /**
    @private
    A map from internal touch ids to the touch entries themselves.

    The touch entry ids currently come from the touch event's identifier.
  */
  _touches: {},

  /**
    Returns the touches that are registered to the specified view or responder; undefined if none.

    When views receive a touch event, they have the option to subscribe to it.
    They are then mapped to touch events and vice-versa. This returns touches mapped to the view.
  */
  touchesForView: function(view) {
    if (this._touchedViews[SC.guidFor(view)]) {
      return this._touchedViews[SC.guidFor(view)].touches;
    }
  },

  /**
    Computes a hash with x, y, and d (distance) properties, containing the average position
    of all touches, and the average distance of all touches from that average.

    This is useful for implementing scaling.
  */
  averagedTouchesForView: function(view, added) {
    var t = this.touchesForView(view),

    // cache per view to avoid gc
    averaged = view._scrr_averagedTouches || (view._scrr_averagedTouches = {});

    if ((!t || t.length === 0) && !added) {
      averaged.x = 0;
      averaged.y = 0;
      averaged.d = 0;
      averaged.touchCount = 0;

    } else {
      // make array of touches using cached array
      var touches = this._averagedTouches_touches || (this._averagedTouches_touches = []);
      touches.length = 0;

      // copy touches into array
      if (t) {
        var i, len = t.length;
        for(i = 0; i < len; i++) {
          touches.push(t[i]);
        }
      }

      // add added if needed
      if (added) touches.push(added);

      // prepare variables for looping
      var idx, touch,
          ax = 0, ay = 0, dx, dy, ad = 0;
      len = touches.length;

      // first, add
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];
        ax += touch.pageX; ay += touch.pageY;
      }

      // now, average
      ax /= len;
      ay /= len;

      // distance
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];

        // get distance from average
        dx = Math.abs(touch.pageX - ax);
        dy = Math.abs(touch.pageY - ay);

        // Pythagoras was clever...
        ad += Math.pow(dx * dx + dy * dy, 0.5);
      }

      // average
      ad /= len;

      averaged.x = ax;
      averaged.y = ay;
      averaged.d = ad;
      averaged.touchCount = len;
    }

    return averaged;
  },

  assignTouch: function(touch, view) {
    // sanity-check
    if (touch.hasEnded) throw "Attemt to assign a touch that is already finished.";

    // unassign from old view if necessary
    if (touch.view === view) return;
    if (touch.view) {
      this.unassignTouch(touch);
    }

    // create view entry if needed
    if (!this._touchedViews[SC.guidFor(view)]) {
      this._touchedViews[SC.guidFor(view)] = {
        view: view,
        touches: SC.CoreSet.create([]),
        touchCount: 0
      };
      view.set("hasTouch", YES);
    }

    // add touch
    touch.view = view;
    this._touchedViews[SC.guidFor(view)].touches.add(touch);
    this._touchedViews[SC.guidFor(view)].touchCount++;
  },

  unassignTouch: function(touch) {
    // find view entry
    var view, viewEntry;

    // get view
    if (!touch.view) return; // touch.view should===touch.touchResponder eventually :)
    view = touch.view;

    // get view entry
    viewEntry = this._touchedViews[SC.guidFor(view)];
    viewEntry.touches.remove(touch);
    viewEntry.touchCount--;

    // remove view entry if needed
    if (viewEntry.touchCount < 1) {
      view.set("hasTouch", NO);
      viewEntry.view = null;
      delete this._touchedViews[SC.guidFor(view)];
    }

    // clear view
    touch.view = undefined;
  },

  _flushQueuedTouchResponder: function(){
    if (this._queuedTouchResponder) {
      var queued = this._queuedTouchResponder;
      this._queuedTouchResponder = null;
      this.makeTouchResponder.apply(this, queued);
    }
  },

  /**
    The touch responder for any given touch is the view which will receive touch events
    for that touch. Quite simple.

    makeTouchResponder takes a potential responder as an argument, and, by calling touchStart on each
    nextResponder, finds the actual responder. As a side-effect of how it does this, touchStart is called
    on the new responder before touchCancelled is called on the old one (touchStart has to accept the touch
    before it can be considered cancelled).

    You usually don't have to think about this at all. However, if you don't want your view to,
    for instance, prevent scrolling in a ScrollView, you need to make sure to transfer control
    back to the previous responder:

        if (Math.abs(touch.pageY - touch.startY) > this.MAX_SWIPE)
          touch.restoreLastTouchResponder();

    You don't call makeTouchResponder on RootResponder directly. Instead, it gets called for you
    when you return YES to captureTouch or touchStart.

    You do, however, use a form of makeTouchResponder to return to a previous touch responder. Consider
    a button view inside a ScrollView: if the touch moves too much, the button should give control back
    to the scroll view.

        if (Math.abs(touch.pageX - touch.startX) > 4) {
          if (touch.nextTouchResponder)
            touch.makeTouchResponder(touch.nextTouchResponder);
        }

    This will give control back to the containing view. Maybe you only want to do it if it is a ScrollView?

        if (
          Math.abs(touch.pageX - touch.startX) > 4 &&
          touch.nextTouchResponder &&
          touch.nextTouchResponder.isScrollable
        )
          touch.makeTouchResponder(touch.nextTouchResponder);

    Possible gotcha: while you can do touch.nextTouchResponder, the responders are not chained in a linked list like
    normal responders, because each touch has its own responder stack. To navigate through the stack (or, though
    it is not recommended, change it), use touch.touchResponders (the raw stack array).

    makeTouchResponder is called with an event object. However, it usually triggers custom touchStart/touchCancelled
    events on the views. The event object is passed so that functions such as stopPropagation may be called.
  */
  makeTouchResponder: function(touch, responder, shouldStack, upViewChain) {

    // In certain cases (SC.Gesture being one), we have to call makeTouchResponder
    // from inside makeTouchResponder so we queue it up here.
    if (this._isMakingTouchResponder) {
      this._queuedTouchResponder = [touch, responder, shouldStack, upViewChain];
      return;
    }
    this._isMakingTouchResponder = YES;


    var stack = touch.touchResponders, touchesForView;

    // find the actual responder (if any, I suppose)
    // note that the pane's sendEvent function is slightly clever:
    // if the target is already touch responder, it will just return it without calling touchStart
    // we must do the same.
    if (touch.touchResponder === responder) {
      this._isMakingTouchResponder = NO;
      this._flushQueuedTouchResponder();
      return;
    }

    // send touchStart
    // get the target pane
    var pane;
    if (responder) pane = responder.get('pane') ;
    else pane = this.get('keyPane') || this.get('mainPane') ;

    // if the responder is not already in the stack...

    if (stack.indexOf(responder) < 0) {
      // if we need to go up the view chain, do so
      if (upViewChain) {
        // if we found a valid pane, send the event to it
        try {
          responder = (pane) ? pane.sendEvent("touchStart", touch, responder) : null ;
        } catch (e) {
          SC.Logger.error("Error in touchStart: " + e);
          responder = null;
        }
      } else {

        if (responder && ((responder.get ? responder.get("acceptsMultitouch") : responder.acceptsMultitouch) || !responder.hasTouch)) {
          if (!responder.touchStart(touch)) responder = null;
        } else {
          // do nothing; the responder is the responder, and may stay the responder, and all will be fine
        }
      }
    }

    // if the item is in the stack, we will go to it (whether shouldStack is true or not)
    // as it is already stacked
    if (!shouldStack || (stack.indexOf(responder) > -1 && stack[stack.length - 1] !== responder)) {
      // first, we should unassign the touch. Note that we only do this IF WE ARE removing
      // the current touch responder. Otherwise we cause all sorts of headaches; why? Because,
      // if we are not (suppose, for instance, that it is stacked), then the touch does not
      // get passed back to the touch responder-- even while it continues to get events because
      // the touchResponder is still set!
      this.unassignTouch(touch);

      // pop all other items
      var idx = stack.length - 1, last = stack[idx];
      while (last && last !== responder) {
        // unassign the touch
        touchesForView = this.touchesForView(last); // won't even exist if there are no touches

        // send touchCancelled (or, don't, if the view doesn't accept multitouch and it is not the last touch)
        if ((last.get ? last.get("acceptsMultitouch") : last.acceptsMultitouch) || !touchesForView) {
          if (last.touchCancelled) last.touchCancelled(touch);
        }

        // go to next (if < 0, it will be undefined, so lovely)
        idx--;
        last = stack[idx];

        // update responders (for consistency)
        stack.pop();

        touch.touchResponder = stack[idx];
        touch.nextTouchResponder = stack[idx - 1];
      }

    }

    // now that we've popped off, we can push on
    if (responder) {
      this.assignTouch(touch, responder);

      // keep in mind, it could be one we popped off _to_ above...
      if (responder !== touch.touchResponder) {
        stack.push(responder);

        // update responder helpers
        touch.touchResponder = responder;
        touch.nextTouchResponder = stack[stack.length - 2];
      }
    }


    this._isMakingTouchResponder = NO;
    this._flushQueuedTouchResponder();

  },

  /**
    captureTouch is used to find the view to handle a touch. It starts at the starting point and works down
    to the touch's target, looking for a view which captures the touch. If no view is found, it uses the target
    view.

    Then, it triggers a touchStart event starting at whatever the found view was; this propagates up the view chain
    until a view responds YES. This view becomes the touch's owner.

    You usually do not call captureTouch, and if you do call it, you'd call it on the touch itself:
    touch.captureTouch(startingPoint, shouldStack)

    If shouldStack is YES, the previous responder will be kept so that it may be returned to later.
  */
  captureTouch: function(touch, startingPoint, shouldStack) {
    if (!startingPoint) startingPoint = this;

    var target = touch.targetView, view = target,
        chain = [], idx, len;

    if (SC.LOG_TOUCH_EVENTS) {
      SC.Logger.info('  -- Received one touch on %@'.fmt(target.toString()));
    }
    // work up the chain until we get the root
    while (view && (view !== startingPoint)) {
      chain.unshift(view);
      view = view.get('nextResponder');
    }

    // work down the chain
    for (len = chain.length, idx = 0; idx < len; idx++) {
      view = chain[idx];
      if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('  -- Checking %@ for captureTouch response…'.fmt(view.toString()));

      // see if it captured the touch
      if (view.tryToPerform('captureTouch', touch)) {
        if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('   -- Making %@ touch responder because it returns YES to captureTouch'.fmt(view.toString()));

        // if so, make it the touch's responder
        this.makeTouchResponder(touch, view, shouldStack, YES); // triggers touchStart/Cancel/etc. event.
        return; // and that's all we need
      }
    }

    if (SC.LOG_TOUCH_EVENTS) SC.Logger.info("   -- Didn't find a view that returned YES to captureTouch, so we're calling touchStart");
    // if we did not capture the touch (obviously we didn't)
    // we need to figure out what view _will_
    // Thankfully, makeTouchResponder does exactly that: starts at the view it is supplied and keeps calling startTouch
    this.makeTouchResponder(touch, target, shouldStack, YES);
  },

  /** @private
    Artificially calls endTouch for any touch which is no longer present. This is necessary because
    _sometimes_, WebKit ends up not sending endtouch.
  */
  endMissingTouches: function(presentTouches) {
    var idx, len = presentTouches.length, map = {}, end = [];

    // make a map of what touches _are_ present
    for (idx = 0; idx < len; idx++) {
      map[presentTouches[idx].identifier] = YES;
    }

    // check if any of the touches we have recorded are NOT present
    for (idx in this._touches) {
      var id = this._touches[idx].identifier;
      if (!map[id]) end.push(this._touches[idx]);
    }

    // end said touches
    for (idx = 0, len = end.length; idx < len; idx++) {
      this.endTouch(end[idx]);
      this.finishTouch(end[idx]);
    }
  },

  _touchCount: 0,
  /** @private
    Ends a specific touch (for a bit, at least). This does not "finish" a touch; it merely calls
    touchEnd, touchCancelled, etc. A re-dispatch (through recapture or makeTouchResponder) will terminate
    the process; it would have to be restarted separately, through touch.end().
  */
  endTouch: function(touchEntry, action, evt) {
    if (!action) { action = "touchEnd"; }

    var responderIdx, responders, responder, originalResponder;

    // unassign
    this.unassignTouch(touchEntry);

    // call end for all items in chain
    if (touchEntry.touchResponder) {
      originalResponder = touchEntry.touchResponder;

      responders = touchEntry.touchResponders;
      responderIdx = responders.length - 1;
      responder = responders[responderIdx];
      while (responder) {
        if (responder[action]) { responder[action](touchEntry, evt); }

        // check to see if the responder changed, and stop immediately if so.
        if (touchEntry.touchResponder !== originalResponder) { break; }

        // next
        responderIdx--;
        responder = responders[responderIdx];
        action = "touchCancelled"; // any further ones receive cancelled
      }
    }
  },

  /**
    @private
    "Finishes" a touch. That is, it eradicates it from our touch entries and removes all responder, etc. properties.
  */
  finishTouch: function(touch) {
    var elem;

    // ensure the touch is indeed unassigned.
    this.unassignTouch(touch);

    // If we rescued this touch's initial element, we should remove it
    // from the DOM and garbage collect now. See setup() for an
    // explanation of this bug/workaround.
    if (elem = touch._rescuedElement) {
      if (elem.swapNode && elem.swapNode.parentNode) {
        elem.swapNode.parentNode.replaceChild(elem, elem.swapNode);
      } else if (elem.parentNode === SC.touchHoldingPen) {
        SC.touchHoldingPen.removeChild(elem);
      }
      delete touch._rescuedElement;
      elem.swapNode = null;
      elem = null;
    }


    // clear responders (just to be thorough)
    touch.touchResponders = null;
    touch.touchResponder = null;
    touch.nextTouchResponder = null;
    touch.hasEnded = YES;

    // and remove from our set
    if (this._touches[touch.identifier]) delete this._touches[touch.identifier];
  },

  /** @private
    Called when the user touches their finger to the screen. This method
    dispatches the touchstart event to the appropriate view.

    We may receive a touchstart event for each touch, or we may receive a
    single touchstart event with multiple touches, so we may have to dispatch
    events to multiple views.

    @param {Event} evt the event
    @returns {Boolean}
  */
  touchstart: function(evt) {
    var hidingTouchIntercept = NO;

    SC.run(function() {
      // sometimes WebKit is a bit... iffy:
      this.endMissingTouches(evt.touches);

      // as you were...
      // loop through changed touches, calling touchStart, etc.
      var idx, touches = evt.changedTouches, len = touches.length,
          target, view, touch, touchEntry;

      // prepare event for touch mapping.
      evt.touchContext = this;

      // Loop through each touch we received in this event
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];

        // Create an SC.Touch instance for every touch.
        touchEntry = SC.Touch.create(touch, this);

        // skip the touch if there was no target
        if (!touchEntry.targetView) continue;

        // account for hidden touch intercept (passing through touches, etc.)
        if (touchEntry.hidesTouchIntercept) hidingTouchIntercept = YES;

        // set timestamp
        touchEntry.timeStamp = evt.timeStamp;

        // Store the SC.Touch object. We use the identifier property (provided
        // by the browser) to disambiguate between touches. These will be used
        // later to determine if the touches have changed.
        this._touches[touch.identifier] = touchEntry;

        // set the event (so default action, etc. can be stopped)
        touchEntry.event = evt; // will be unset momentarily

        // send out event thing: creates a chain, goes up it, then down it,
        // with startTouch and cancelTouch. in this case, only startTouch, as
        // there are no existing touch responders. We send the touchEntry
        // because it is cached (we add the helpers only once)
        this.captureTouch(touchEntry, this);

        // Unset the reference to the original event so we can garbage collect.
        touchEntry.event = null;
      }
    }, this);


    // hack for text fields
    if (hidingTouchIntercept) {
      return YES;
    }

    return evt.hasCustomEventHandling;
  },

  /**
    @private
    used to keep track of when a specific type of touch event was last handled, to see if it needs to be re-handled
  */
  touchmove: function(evt) {
    SC.run(function() {
      // pretty much all we gotta do is update touches, and figure out which views need updating.
      var touches = evt.changedTouches, touch, touchEntry,
          idx, len = touches.length, view, changedTouches, viewTouches, firstTouch,
          changedViews = {}, loc, guid, hidingTouchIntercept = NO;

      if (this._drag) {
        touch = SC.Touch.create(evt.changedTouches[0], this);
        this._drag.tryToPerform('mouseDragged', touch);
      }

      // figure out what views had touches changed, and update our internal touch objects
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];

        // get our touch
        touchEntry = this._touches[touch.identifier];

        // we may have no touch entry; this can happen if somehow the touch came to a non-SC area.
        if (!touchEntry) {
          continue;
        }

        if (touchEntry.hidesTouchIntercept) hidingTouchIntercept = YES;

        // update touch
        touchEntry.pageX = touch.pageX;
        touchEntry.pageY = touch.pageY;
        touchEntry.clientX = touch.clientX;
        touchEntry.clientY = touch.clientY;
        touchEntry.screenX = touch.screenX;
        touchEntry.screenY = touch.screenY;
        touchEntry.timeStamp = evt.timeStamp;
        touchEntry.event = evt;

        // if the touch entry has a view
        if (touchEntry.touchResponder) {
          view = touchEntry.touchResponder;

          guid = SC.guidFor(view);
          // create a view entry
          if (!changedViews[guid]) changedViews[guid] = { "view": view, "touches": [] };

          // add touch
          changedViews[guid].touches.push(touchEntry);
        }
      }

      // HACK: DISABLE OTHER TOUCH DRAGS WHILE MESSING WITH TEXT FIELDS
      if (hidingTouchIntercept) {
        evt.allowDefault();
        return YES;
      }

      // loop through changed views and send events
      for (idx in changedViews) {
        // get info
        view = changedViews[idx].view;
        changedTouches = changedViews[idx].touches;

        // prepare event; note that views often won't use this method anyway (they'll call touchesForView instead)
        evt.viewChangedTouches = changedTouches;

        // the first VIEW touch should be the touch info sent
        viewTouches = this.touchesForView(view);
        firstTouch = viewTouches.firstObject();
        evt.pageX = firstTouch.pageX;
        evt.pageY = firstTouch.pageY;
        evt.clientX = firstTouch.clientX;
        evt.clientY = firstTouch.clientY;
        evt.screenX = firstTouch.screenX;
        evt.screenY = firstTouch.screenY;
        evt.touchContext = this; // so it can call touchesForView

        // and go
        view.tryToPerform("touchesDragged", evt, viewTouches);
      }

      // clear references to event
      touches = evt.changedTouches;
      len = touches.length;
      for (idx = 0; idx < len; idx++) {
        touch = touches[idx];
        touchEntry = this._touches[touch.identifier];
        if (touchEntry) touchEntry.event = null;
      }
    }, this);

    return evt.hasCustomEventHandling;
  },

  touchend: function(evt) {
    var hidesTouchIntercept = NO;

    SC.run(function() {
      var touches = evt.changedTouches, touch, touchEntry,
          idx, len = touches.length,
          view, elem,
          action = evt.isCancel ? "touchCancelled" : "touchEnd", a,
          responderIdx, responders, responder;

      for (idx = 0; idx < len; idx++) {
        //get touch+entry
        touch = touches[idx];
        touch.type = 'touchend';
        touchEntry = this._touches[touch.identifier];

        // check if there is an entry
        if (!touchEntry) continue;

        // continue work
        touchEntry.timeStamp = evt.timeStamp;
        touchEntry.pageX = touch.pageX;
        touchEntry.pageY = touch.pageY;
        touchEntry.clientX = touch.clientX;
        touchEntry.clientY = touch.clientY;
        touchEntry.screenX = touch.screenX;
        touchEntry.screenY = touch.screenY;
        touchEntry.type = 'touchend';
        touchEntry.event = evt;

        if (SC.LOG_TOUCH_EVENTS) SC.Logger.info('-- Received touch end');
        if (touchEntry.hidesTouchIntercept) {
          touchEntry.unhideTouchIntercept();
          hidesTouchIntercept = YES;
        }

        if (this._drag) {
          this._drag.tryToPerform('mouseUp', touch) ;
          this._drag = null ;
        }

        // unassign
        this.endTouch(touchEntry, action, evt);
        this.finishTouch(touchEntry);
      }
    }, this);


    // for text fields
    if (hidesTouchIntercept) {
      return YES;
    }

    return evt.hasCustomEventHandling;
  },

  /** @private
    Handle touch cancel event.  Works just like cancelling a touch for any other reason.
    touchend handles it as a special case (sending cancel instead of end if needed).
  */
  touchcancel: function(evt) {
    evt.isCancel = YES;
    this.touchend(evt);
  },

  // ..........................................................
  // KEYBOARD HANDLING
  //


  /**
    Invoked on a keyDown event that is not handled by any actual value.  This
    will get the key equivalent string and then walk down the keyPane, then
    the focusedPane, then the mainPane, looking for someone to handle it.
    Note that this will walk DOWN the view hierarchy, not up it like most.

    @returns {Object} Object that handled evet or null
  */
  attemptKeyEquivalent: function(evt) {
    var ret = null ;

    // keystring is a method name representing the keys pressed (i.e
    // 'alt_shift_escape')
    var keystring = evt.commandCodes()[0];

    // couldn't build a keystring for this key event, nothing to do
    if (!keystring) return NO;

    var menuPane = this.get('menuPane'),
        keyPane  = this.get('keyPane'),
        mainPane = this.get('mainPane');

    if (menuPane) {
      ret = menuPane.performKeyEquivalent(keystring, evt) ;
      if (ret) return ret;
    }

    // Try the keyPane.  If it's modal, then try the equivalent there but on
    // nobody else.
    if (keyPane) {
      ret = keyPane.performKeyEquivalent(keystring, evt) ;
      if (ret || keyPane.get('isModal')) return ret ;
    }

    // if not, then try the main pane
    if (!ret && mainPane && (mainPane!==keyPane)) {
      ret = mainPane.performKeyEquivalent(keystring, evt);
      if (ret || mainPane.get('isModal')) return ret ;
    }

    return ret ;
  },

  _lastModifiers: null,

  /** @private
    Modifier key changes are notified with a keydown event in most browsers.
    We turn this into a flagsChanged keyboard event.  Normally this does not
    stop the normal browser behavior.
  */
  _handleModifierChanges: function(evt) {
    // if the modifier keys have changed, then notify the first responder.
    var m;
    m = this._lastModifiers = (this._lastModifiers || { alt: false, ctrl: false, shift: false });

    var changed = false;
    if (evt.altKey !== m.alt) { m.alt = evt.altKey; changed=true; }
    if (evt.ctrlKey !== m.ctrl) { m.ctrl = evt.ctrlKey; changed=true; }
    if (evt.shiftKey !== m.shift) { m.shift = evt.shiftKey; changed=true;}
    evt.modifiers = m; // save on event

    return (changed) ? (this.sendEvent('flagsChanged', evt) ? evt.hasCustomEventHandling : YES) : YES ;
  },

  /** @private
    Determines if the keyDown event is a nonprintable or function key. These
    kinds of events are processed as keyboard shortcuts.  If no shortcut
    handles the event, then it will be sent as a regular keyDown event.
  */
  _isFunctionOrNonPrintableKey: function(evt) {
    return !!(evt.altKey || evt.ctrlKey || evt.metaKey || ((evt.charCode !== evt.which) && SC.FUNCTION_KEYS[evt.which]));
  },

  /** @private
    Determines if the event simply reflects a modifier key change.  These
    events may generate a flagsChanged event, but are otherwise ignored.
  */
  _isModifierKey: function(evt) {
    return !!SC.MODIFIER_KEYS[evt.charCode];
  },

  /** @private
    The keydown event occurs whenever the physically depressed key changes.
    This event is used to deliver the flagsChanged event and to with function
    keys and keyboard shortcuts.

    All actions that might cause an actual insertion of text are handled in
    the keypress event.
  */
  keydown: function(evt) {
    if (SC.none(evt)) return YES;
    var keyCode = evt.keyCode;
    if(SC.browser.mozilla && evt.keyCode===9){
      this.keydownCounter=1;
    }
    // Fix for IME input (japanese, mandarin).
    // If the KeyCode is 229 wait for the keyup and
    // trigger a keyDown if it is is enter onKeyup.
    if (keyCode===229){
      this._IMEInputON = YES;
      return this.sendEvent('keyDown', evt);
    }

    // If user presses the escape key while we are in the middle of a
    // drag operation, cancel the drag operation and handle the event.
    if (keyCode === 27 && this._drag) {
      this._drag.cancelDrag();
      this._drag = null;
      this._mouseDownView = null;
      return YES;
    }

    // Firefox does NOT handle delete here...
    if (SC.browser.mozilla && (evt.which === 8)) return true ;

    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this
    // is only a modifier change
    var ret = this._handleModifierChanges(evt),
        target = evt.target || evt.srcElement,
        forceBlock = (evt.which === 8) && !SC.allowsBackspaceToPreviousPage && (target === document.body);

    if (this._isModifierKey(evt)) return (forceBlock ? NO : ret);

    // if this is a function or non-printable key, try to use this as a key
    // equivalent.  Otherwise, send as a keyDown event so that the focused
    // responder can do something useful with the event.
    ret = YES ;
    if (this._isFunctionOrNonPrintableKey(evt)) {
      // otherwise, send as keyDown event.  If no one was interested in this
      // keyDown event (probably the case), just let the browser do its own
      // processing.

      // Arrow keys are handled in keypress for firefox
      if (keyCode>=37 && keyCode<=40 && SC.browser.mozilla) return YES;


      ret = this.sendEvent('keyDown', evt) ;

      // attempt key equivalent if key not handled
      if (!ret) {
        ret = !this.attemptKeyEquivalent(evt) ;
      } else {
        ret = evt.hasCustomEventHandling ;
        if (ret) forceBlock = NO ; // code asked explicitly to let delete go
      }
    }

    return forceBlock ? NO : ret ;
  },

  /** @private
    The keypress event occurs after the user has typed something useful that
    the browser would like to insert.  Unlike keydown, the input codes here
    have been processed to reflect that actual text you might want to insert.

    Normally ignore any function or non-printable key events.  Otherwise, just
    trigger a keyDown.
  */
  keypress: function(evt) {
    var ret,
        keyCode   = evt.keyCode,
        isFirefox = !!SC.browser.mozilla;

    if(SC.browser.mozilla && evt.keyCode===9){
      this.keydownCounter++;
      if(this.keydownCounter==2) return YES;
    }
    // delete is handled in keydown() for most browsers
    if (isFirefox && (evt.which === 8)) {
      //get the keycode and set it for which.
      evt.which = keyCode;
      ret = this.sendEvent('keyDown', evt);
      return ret ? (SC.allowsBackspaceToPreviousPage || evt.hasCustomEventHandling) : YES ;

    // normal processing.  send keyDown for printable keys...
    //there is a special case for arrow key repeating of events in FF.
    } else {
      var isFirefoxArrowKeys = (keyCode >= 37 && keyCode <= 40 && isFirefox),
          charCode           = evt.charCode;
      if ((charCode !== undefined && charCode === 0 && evt.keyCode!==9) && !isFirefoxArrowKeys) return YES;
      if (isFirefoxArrowKeys) evt.which = keyCode;
      return this.sendEvent('keyDown', evt) ? evt.hasCustomEventHandling:YES;
    }
  },

  keyup: function(evt) {
    // to end the simulation of keypress in firefox set the _ffevt to null
    if(this._ffevt) this._ffevt=null;
    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this is only a modifier change
    var ret = this._handleModifierChanges(evt);
    if (this._isModifierKey(evt)) return ret;
    // Fix for IME input (japanese, mandarin).
    // If the KeyCode is 229 wait for the keyup and
    // trigger a keyDown if it is is enter onKeyup.
    if (this._IMEInputON && evt.keyCode===13){
      evt.isIMEInput = YES;
      this.sendEvent('keyDown', evt);
      this._IMEInputON = NO;
    }
    return this.sendEvent('keyUp', evt) ? evt.hasCustomEventHandling:YES;
  },

  /**
    IE's default behavior to blur textfields and other controls can only be
    blocked by returning NO to this event. However we don't want to block
    its default behavior otherwise textfields won't loose focus by clicking on
    an empty area as it's expected. If you want to block IE from bluring another
    control set blockIEDeactivate to true on the especific view in which you
    want to avoid this. Think of an autocomplete menu, you want to click on
    the menu but don't loose focus.
  */
  beforedeactivate: function(evt) {
    var toElement = evt.toElement;
    if (toElement && toElement.tagName && toElement.tagName!=="IFRAME") {
      var view = SC.$(toElement).view()[0];
      //The following line is neccesary to allow/block text selection for IE,
      // in combination with the selectstart event.
      if (view && view.get('blocksIEDeactivate')) return NO;
    }
    return YES;
  },

  // ..........................................................
  // MOUSE HANDLING
  //

  mousedown: function(evt) {
    if (SC.platform.touch) {
      evt.allowDefault();
      this._lastMouseDownCustomHandling = YES;
      return YES;
    }

    // First, save the click count. The click count resets if the mouse down
    // event occurs more than 250 ms later than the mouse up event or more
    // than 8 pixels away from the mouse down event.
    this._clickCount += 1 ;
    if (!this._lastMouseUpAt || ((Date.now()-this._lastMouseUpAt) > 250)) {
      this._clickCount = 1 ;
    } else {
      var deltaX = this._lastMouseDownX - evt.clientX,
          deltaY = this._lastMouseDownY - evt.clientY,
          distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY) ;
      if (distance > 8.0) this._clickCount = 1 ;
    }
    evt.clickCount = this._clickCount ;

    this._lastMouseDownX = evt.clientX ;
    this._lastMouseDownY = evt.clientY ;

    var fr, view = this.targetViewForEvent(evt) ;

    // InlineTextField needs to loose firstResponder whenever you click outside
    // the view. This is a special case as textfields are not supposed to loose
    // focus unless you click on a list, another textfield or an special
    // view/control.

    if(view) fr=view.getPath('pane.firstResponder');

    if(fr && fr.kindOf(SC.InlineTextFieldView) && fr!==view){
      fr.resignFirstResponder();
    }

    view = this._mouseDownView = this.sendEvent('mouseDown', evt, view) ;
    if (view && view.respondsTo('mouseDragged')) this._mouseCanDrag = YES ;

    // Determine if any views took responsibility for the
    // event. If so, save that information so we can prevent
    // the next click event we receive from propagating to the browser.
    var ret = view ? evt.hasCustomEventHandling : YES;
    this._lastMouseDownCustomHandling = ret;

    return ret;
  },

  /**
    mouseUp only gets delivered to the view that handled the mouseDown evt.
    we also handle click and double click notifications through here to
    ensure consistant delivery.  Note that if mouseDownView is not
    implemented, then no mouseUp event will be sent, but a click will be
    sent.
  */
  mouseup: function(evt) {
    if (SC.platform.touch) {
      evt.allowDefault();
      this._lastMouseUpCustomHandling = YES;
      return YES;
    }

    if (this._drag) {
      this._drag.tryToPerform('mouseUp', evt) ;
      this._drag = null ;
    }

    var handler = null, view = this._mouseDownView,
        targetView = this.targetViewForEvent(evt);

    // record click count.
    evt.clickCount = this._clickCount ;

    // attempt the mouseup call only if there's a target.
    // don't want a mouseup going to anyone unless they handled the mousedown...
    if (view) {
      handler = this.sendEvent('mouseUp', evt, view) ;

      // try doubleClick
      if (!handler && (this._clickCount === 2)) {
        handler = this.sendEvent('doubleClick', evt, view) ;
      }

      // try single click
      if (!handler) {
        handler = this.sendEvent('click', evt, view) ;
      }
    }

    // try whoever's under the mouse if we haven't handle the mouse up yet
    if (!handler) {

      // try doubleClick
      if (this._clickCount === 2) {
        handler = this.sendEvent('doubleClick', evt, targetView);
      }

      // try singleClick
      if (!handler) {
        handler = this.sendEvent('click', evt, targetView) ;
      }
    }

    // cleanup
    this._mouseCanDrag = NO; this._mouseDownView = null ;

    // Save timestamp of mouseup at last possible moment.
    // (This is used to calculate double click events)
    this._lastMouseUpAt = Date.now() ;

    // Determine if any views took responsibility for the
    // event. If so, save that information so we can prevent
    // the next click event we receive from propagating to the browser.
    var ret = handler ? evt.hasCustomEventHandling : YES;
    this._lastMouseUpCustomHandling = ret;

    return ret;
  },

  /**
    Certain browsers ignore us overriding mouseup and mousedown events and
    still allow default behavior (such as navigating away when the user clicks
    on a link). To block default behavior, we store whether or not the last
    mouseup or mousedown events resulted in us calling preventDefault() or
    stopPropagation(), in which case we make the same calls on the click event.

    @param {Event} evt the click event
    @returns {Boolean} whether the event should be propagated to the browser
  */
  click: function(evt) {
    if (!this._lastMouseUpCustomHandling || !this._lastMouseDownCustomHandling) {
      evt.preventDefault();
      evt.stopPropagation();
      return NO;
    }

    return YES;
  },

  dblclick: function(evt){
    if (SC.browser.isIE) {
      this._clickCount = 2;
      // this._onmouseup(evt);
      this.mouseup(evt);
    }
  },

  mousewheel: function(evt) {
    var view = this.targetViewForEvent(evt) ,
        handler = this.sendEvent('mouseWheel', evt, view) ;

    return (handler) ? evt.hasCustomEventHandling : YES ;
  },

  _lastHovered: null,

  /**
   This will send mouseEntered, mouseExited, mousedDragged and mouseMoved
   to the views you hover over.  To receive these events, you must implement
   the method. If any subviews implement them and return true, then you won't
   receive any notices.

   If there is a target mouseDown view, then mouse moved events will also
   trigger calls to mouseDragged.
  */
  mousemove: function(evt) {
    if (SC.platform.touch) {
      evt.allowDefault();
      return YES;
    }

    if (SC.browser.msie) {
      if (this._lastMoveX === evt.clientX && this._lastMoveY === evt.clientY) return;
    }

    // We'll record the last positions in all browsers, in case a special pane
    // or some such UI absolutely needs this information.
    this._lastMoveX = evt.clientX;
    this._lastMoveY = evt.clientY;

    SC.run(function() {
       // make sure the view gets focus no matter what.  FF is inconsistant
       // about this.
      // this.focus();
       // only do mouse[Moved|Entered|Exited|Dragged] if not in a drag session
       // drags send their own events, e.g. drag[Moved|Entered|Exited]
       if (this._drag) {
         //IE triggers mousemove at the same time as mousedown
         if(SC.browser.msie){
           if (this._lastMouseDownX !== evt.clientX || this._lastMouseDownY !== evt.clientY) {
             this._drag.tryToPerform('mouseDragged', evt);
           }
         }
         else {
           this._drag.tryToPerform('mouseDragged', evt);
         }
       } else {
         var lh = this._lastHovered || [] , nh = [] , exited, loc, len,
             view = this.targetViewForEvent(evt) ;

         // first collect all the responding view starting with the
         // target view from the given mouse move event
         while (view && (view !== this)) {
           nh.push(view);
           view = view.get('nextResponder');
         }

         // next exit views that are no longer part of the
         // responding chain
         for (loc=0, len=lh.length; loc < len; loc++) {
           view = lh[loc] ;
           exited = view.respondsTo('mouseExited');
           if (exited && nh.indexOf(view) === -1) {
             view.tryToPerform('mouseExited', evt);
           }
         }

         // finally, either perform mouse moved or mouse entered depending on
         // whether a responding view was or was not part of the last
         // hovered views
         for (loc=0, len=nh.length; loc < len; loc++) {
           view = nh[loc];
           if (lh.indexOf(view) !== -1) {
             view.tryToPerform('mouseMoved', evt);
           } else {
             view.tryToPerform('mouseEntered', evt);
           }
         }

         // Keep track of the view that were last hovered
         this._lastHovered = nh;

         // also, if a mouseDownView exists, call the mouseDragged action, if
         // it exists.
         if (this._mouseDownView) {
           if(SC.browser.msie){
             if (this._lastMouseDownX !== evt.clientX && this._lastMouseDownY !== evt.clientY) {
               this._mouseDownView.tryToPerform('mouseDragged', evt);
             }
           }
           else {
             this._mouseDownView.tryToPerform('mouseDragged', evt);
           }
         }
       }
    }, this);
  },

  // these methods are used to prevent unnecessary text-selection in IE,
  // there could be some more work to improve this behavior and make it
  // a bit more useful; right now it's just to prevent bugs when dragging
  // and dropping.

  _mouseCanDrag: YES,

  selectstart: function(evt) {
    var targetView = this.targetViewForEvent(evt),
        result = this.sendEvent('selectStart', evt, targetView);

    // If the target view implements mouseDragged, then we want to ignore the
    // 'selectstart' event.
    if (targetView && targetView.respondsTo('mouseDragged')) {
      return (result !==null ? YES: NO) && !this._mouseCanDrag;
    }
    else {
      return (result !==null ? YES: NO);
    }
  },

  drag: function() { return false; },

  contextmenu: function(evt) {
    var view = this.targetViewForEvent(evt) ;
    return this.sendEvent('contextMenu', evt, view);
  },

  // ..........................................................
  // ANIMATION HANDLING
  //
  webkitAnimationStart: function(evt) {
    try {
      var view = this.targetViewForEvent(evt) ;
      this.sendEvent('animationDidStart', evt, view) ;
    } catch (e) {
      SC.Logger.warn('Exception during animationDidStart: %@'.fmt(e)) ;
      throw e;
    }

    return view ? evt.hasCustomEventHandling : YES;
  },

  webkitAnimationIteration: function(evt) {
    try {
      var view = this.targetViewForEvent(evt) ;
      this.sendEvent('animationDidIterate', evt, view) ;
    } catch (e) {
      SC.Logger.warn('Exception during animationDidIterate: %@'.fmt(e)) ;
      throw e;
    }

    return view ? evt.hasCustomEventHandling : YES;
  },

  webkitAnimationEnd: function(evt) {
    try {
      var view = this.targetViewForEvent(evt) ;
      this.sendEvent('animationDidEnd', evt, view) ;
    } catch (e) {
      SC.Logger.warn('Exception during animationDidEnd: %@'.fmt(e)) ;
      throw e;
    }

    return view ? evt.hasCustomEventHandling : YES;
  },

  transitionEnd: function(evt){
    try {
      var view = this.targetViewForEvent(evt) ;
      this.sendEvent('transitionDidEnd', evt, view) ;
    } catch (e) {
      SC.Logger.warn('Exception during transitionDidEnd: %@'.fmt(e)) ;
      throw e;
    }

    return view ? evt.hasCustomEventHandling : YES;
  }

});

/**
  @class SC.Touch
  Represents a touch.

  Views receive touchStart and touchEnd.
*/
SC.Touch = function(touch, touchContext) {
  // get the raw target view (we'll refine later)
  this.touchContext = touchContext;
  this.identifier = touch.identifier; // for now, our internal id is WebKit's id.

  var target = touch.target, targetView;
  if (target && SC.$(target).hasClass("touch-intercept")) {
    touch.target.style.webkitTransform = "translate3d(0px,-5000px,0px)";
    target = document.elementFromPoint(touch.pageX, touch.pageY);
    if (target) targetView = SC.$(target).view()[0];

    this.hidesTouchIntercept = NO;
    if (target.tagName === "INPUT") {
      this.hidesTouchIntercept = touch.target;
    } else {
      touch.target.style.webkitTransform = "translate3d(0px,0px,0px)";
    }
  } else {
    targetView = touch.target ? SC.$(touch.target).view()[0] : null;
  }
  this.targetView = targetView;
  this.target = target;
  this.hasEnded = NO;
  this.type = touch.type;
  this.clickCount = 1;

  this.view = undefined;
  this.touchResponder = this.nextTouchResponder = undefined;
  this.touchResponders = [];

  this.startX = this.pageX = touch.pageX;
  this.startY = this.pageY = touch.pageY;
  this.clientX = touch.clientX;
  this.clientY = touch.clientY;
  this.screenX = touch.screenX;
  this.screenY = touch.screenY;
};

SC.Touch.prototype = {
  /**@scope SC.Touch.prototype*/

  unhideTouchIntercept: function() {
    var intercept = this.hidesTouchIntercept;
    if (intercept) {
      setTimeout(function() { intercept.style.webkitTransform = "translate3d(0px,0px,0px)"; }, 500);
    }
  },

  /**
    Indicates that you want to allow the normal default behavior.  Sets
    the hasCustomEventHandling property to YES but does not cancel the event.
  */
  allowDefault: function() {
    if (this.event) this.event.hasCustomEventHandling = YES ;
  },

  /**
    If the touch is associated with an event, prevents default action on the event.
  */
  preventDefault: function() {
    if (this.event) this.event.preventDefault();
  },

  stopPropagation: function() {
    if (this.event) this.event.stopPropagation();
  },

  stop: function() {
    if (this.event) this.event.stop();
  },

  /**
    Removes from and calls touchEnd on the touch responder.
  */
  end: function() {
    this.touchContext.endTouch(this);
  },

  /**
    Changes the touch responder for the touch. If shouldStack === YES,
    the current responder will be saved so that the next responder may
    return to it.
  */
  makeTouchResponder: function(responder, shouldStack, upViewChain) {
    this.touchContext.makeTouchResponder(this, responder, shouldStack, upViewChain);
  },


  /**
    Captures, or recaptures, the touch. This works from the touch's raw target view
    up to the startingPoint, and finds either a view that returns YES to captureTouch() or
    touchStart().
  */
  captureTouch: function(startingPoint, shouldStack) {
    this.touchContext.captureTouch(this, startingPoint, shouldStack);
  },

  /**
    Returns all touches for a specified view. Put as a convenience on the touch itself; this method
    is also available on the event.
  */
  touchesForView: function(view) {
    return this.touchContext.touchesForView(view);
  },

  /**
    Same as touchesForView, but sounds better for responders.
  */
  touchesForResponder: function(responder) {
    return this.touchContext.touchesForView(responder);
  },

  /**
    Returns average data--x, y, and d (distance)--for the touches owned by the supplied view.

    addSelf adds this touch to the set being considered. This is useful from touchStart. If
    you use it from anywhere else, it will make this touch be used twice--so use caution.
  */
  averagedTouchesForView: function(view, addSelf) {
    return this.touchContext.averagedTouchesForView(view, (addSelf ? this : null));
  }
};

SC.mixin(SC.Touch, {
  create: function(touch, touchContext) {
    return new SC.Touch(touch, touchContext);
  }
});

/*
  Invoked when the document is ready, but before main is called.  Creates
  an instance and sets up event listeners as needed.
*/
SC.ready(SC.RootResponder, SC.RootResponder.ready = function() {
  var r;
  r = SC.RootResponder.responder = SC.RootResponder.create() ;
  r.setup() ;
});

/* >>>>>>>>>> BEGIN source/system/device.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/core_query');
sc_require('system/ready');
sc_require('system/root_responder');
sc_require('system/platform');

SC.PORTRAIT_ORIENTATION = 'portrait';
SC.LANDSCAPE_ORIENTATION = 'landscape';
SC.NO_ORIENTATION = 'desktop'; // value 'desktop' for backwards compatibility

/**
  The device object allows you to check device specific properties such as 
  orientation and if the device is offline, as well as observe when they change 
  state.
  
  ## Orientation
  When a touch device changes orientation, the orientation property will be
  set accordingly which you can observe
  
  ## Offline support
  In order to build a good offline-capable web application, you need to know 
  when your app has gone offline so you can for instance queue your server 
  requests for a later time or provide a specific UI/message.
  
  Similarly, you also need to know when your application has returned to an 
  'online' state again, so that you can re-synchronize with the server or do 
  anything else that might be needed.
  
  By observing the 'isOffline' property you can be notified when this state
  changes. Note that this property is only connected to the navigator.onLine
  property, which is available on most modern browsers.
  
*/
SC.device = SC.Object.create({
  
  /**
    Sets the orientation for touch devices, either SC.LANDSCAPE_ORIENTATION
    or SC.PORTRAIT_ORIENTATION. Will be SC.NO_ORIENTATION in the case of
    non-touch devices that are also not simulating touch events.
  
    @property {String}
    @default SC.NO_ORIENTATION
  */
  orientation: SC.NO_ORIENTATION,
  
  /**
    Indicates whether the device is currently online or offline. For browsers
    that do not support this feature, the default value is NO.
    
    Is currently inverse of the navigator.onLine property. Most modern browsers
    will update this property when switching to or from the browser's Offline 
    mode, and when losing/regaining network connectivity.
    
    @property {Boolean}
    @default NO
  */
  isOffline: NO,

  /**
    Returns a Point containing the last known X and Y coordinates of the
    mouse, if present.

    @property {Point}
  */
  mouseLocation: function() {
    var responder = SC.RootResponder.responder,
        lastX = responder._lastMoveX,
        lastY = responder._lastMoveY;

    if (SC.empty(lastX) || SC.empty(lastY)) {
      return null;
    }

    return { x: lastX, y: lastY };
  }.property(),

  /**
    Initialize the object with some properties up front
  */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    
    if (navigator && navigator.onLine === false) {
      this.set('isOffline', YES);
    }
  },
  
  /**
    As soon as the DOM is up and running, make sure we attach necessary
    event handlers
  */
  setup: function() {
    var responder = SC.RootResponder.responder;
    responder.listenFor(['online', 'offline'], window, this);
    
    this.orientationHandlingShouldChange();
  },
  
  // ..........................................................
  // ORIENTATION HANDLING
  //
  
  /**
    Determines which method to use for orientation changes.
    Either detects orientation changes via the current size
    of the window, or by the window.onorientationchange event.
  */
  orientationHandlingShouldChange: function() {
    if (SC.platform.windowSizeDeterminesOrientation) {
      SC.Event.remove(window, 'orientationchange', this, this.orientationchange);
      this.windowSizeDidChange(SC.RootResponder.responder.get('currentWindowSize'));
    } else if (SC.platform.supportsOrientationChange) {
      SC.Event.add(window, 'orientationchange', this, this.orientationchange);
      this.orientationchange();
    }
  },
  
  /**
    @param {Hash} newSize The new size of the window
    @returns YES if the method altered the orientation, NO otherwise
  */
  windowSizeDidChange: function(newSize) {
    if (SC.platform.windowSizeDeterminesOrientation) {
      if (!SC.browser.iOS) {
        // in any browser other than iOS, use height vs. width test
        SC.run(function() {
          if (SC.platform.touch) {
            if (newSize.height >= newSize.width) {
              SC.device.set('orientation', SC.PORTRAIT_ORIENTATION);
            } else {
              SC.device.set('orientation', SC.LANDSCAPE_ORIENTATION);
            }
          } else {
            SC.device.set('orientation', SC.NO_ORIENTATION);
          }
        });
      } else {
        // in mobile safari, because some of its chrome can make the
        // above match landscape falsely, we compare to screen.width
        SC.run(function() {
          if (newSize.width === window.screen.width) {
            SC.device.set('orientation', SC.PORTRAIT_ORIENTATION);
          } else {
            SC.device.set('orientation', SC.LANDSCAPE_ORIENTATION);
          }
        });
      }
      return YES;
    }
    return NO;
  },
  
  /**
    Called when the window.onorientationchange event is fired.
  */
  orientationchange: function(evt) {
    SC.run(function() {
      if (window.orientation === 0 || window.orientation === 180) {
        SC.device.set('orientation', SC.PORTRAIT_ORIENTATION);
      } else {
        SC.device.set('orientation', SC.LANDSCAPE_ORIENTATION);
      }
    });
  },
  
  orientationObserver: function(){
    var body = SC.$(document.body),
        orientation = this.get('orientation');
    
    if (orientation === SC.PORTRAIT_ORIENTATION) {
      body.addClass('portrait');
    } else {
      body.removeClass('portrait');
    }
    
    if (orientation === SC.LANDSCAPE_ORIENTATION) {
      body.addClass('landscape');
    } else {
      body.removeClass('landscape');
    }
  }.observes('orientation'),
  
  
  // ..........................................................
  // CONNECTION HANDLING
  // 
  
  online: function(evt) {
    this.set('isOffline', NO);
  },
  
  offline: function(evt) {
    this.set('isOffline', YES);
  }

});

/*
  Invoked when the document is ready, but before main is called.  Creates
  an instance and sets up event listeners as needed.
*/
SC.ready(function() {
  SC.device.setup() ;
});

/* >>>>>>>>>> BEGIN source/system/page.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class SC.Page

  A Page object is used to store a set of views that can be lazily configured
  as needed.  The page object works by overloading the get() method.  The
  first time you try to get the page
  
  @extends SC.Object
*/
SC.Page = SC.Object.extend(
/** @scope SC.Page.prototype */ {
  
  /**
    When you create a page, you can set it's "owner" property to an
    object outside the page definition. This allows views in the page
    to use the owner object as a target, (as well as other objects
    accessible through the owner object). E.g.
    
        myButton: SC.ButtonView.design({
          title: 'Click me',
          target: SC.outlet('page.owner'),
          action: 'buttonClicked'
        })
    
    Usually, you'll set 'owner' to the object defined in core.js.
  */
  owner: null,
  
  get: function(key) {
    var value = this[key] ;
    if (value && value.isClass) {
      this[key] = value = value.create({ page: this }) ;
      if (!this.get('inDesignMode')) value.awake() ;
      return value ;
    } else return arguments.callee.base.apply(this,arguments);
  },
  
  /**
    Finds all views defined on this page instances and builds them.  This is 
    a quick, brute force way to wake up all of the views in a page object.  It
    is not generally recommended. Instead, you should use get() or getPath() 
    to retrieve views and rely on the lazy creation process to set them up.
    
    @return {SC.Page} receiver
  */
  awake: function() {
    // step through all views and build them
    var value, key;
    for(key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      value = this[key] ;
      if (value && value.isViewClass) {
        this[key] = value = value.create({ page: this }) ;
      }
    }
    return this;
  },

  /**
    Returns the named property unless the property is a view that has not yet
    been configured.  In that case it will return undefined.  You can use this
    method to safely get a view without waking it up.
  */
  getIfConfigured: function(key) {
    var ret = this[key] ;
    return (ret && ret.isViewClass) ? null : this.get(key);
  },

  /**
    Applies a localization to every view builder defined on the page.  You must call this before you construct a view to apply the localization.
  */
  loc: function(locs) {
    var view, key;
    for(key in locs) {
      if (!locs.hasOwnProperty(key)) continue ;
      view = this[key] ;
      if (!view || !view.isViewClass) continue ;
      view.loc(locs[key]);
    }
    return this ;
  }

  //needsDesigner: YES,
  
  //inDesignMode: YES
    
}) ;

// ..........................................................
// SUPPORT FOR LOADING PAGE DESIGNS
// 

/** Calling design() on a page is the same as calling create() */
SC.Page.design = SC.Page.create ;

/** Calling localization returns passed attrs. */
SC.Page.localization = function(attrs) { return attrs; };



/* >>>>>>>>>> BEGIN source/system/render_context.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/builder');

/** set update mode on context to replace content (preferred) */
SC.MODE_REPLACE = 'replace';

/** set update mode on context to append content */
SC.MODE_APPEND = 'append';

/** set update mode on context to prepend content */
SC.MODE_PREPEND = 'prepend';

/** list of numeric properties that should not have 'px' appended */
SC.NON_PIXEL_PROPERTIES = ['zIndex', 'fontWeight', 'opacity'];

/** a list of styles that get expanded into multiple properties, add more as you discover them */
SC.COMBO_STYLES = {
  WebkitTransition: ['WebkitTransitionProperty', 'WebkitTransitionDuration', 'WebkitTransitionDelay', 'WebkitTransitionTimingFunction']
};

/**
  @namespace

  A RenderContext is a builder that can be used to generate HTML for views or
  to update an existing element.  Rather than making changes to an element
  directly, you use a RenderContext to queue up changes to the element,
  finally applying those changes or rendering the new element when you are
  finished.

  You will not usually create a render context yourself but you will be passed
  a render context as the first parameter of your render() method on custom
  views.

  Render contexts are essentially arrays of strings.  You can add a string to
  the context by calling push().  You can retrieve the entire array as a
  single string using join().  This is basically the way the context is used
  for views.  You are passed a render context and expected to add strings of
  HTML to the context like a normal array.  Later, the context will be joined
  into a single string and converted into real HTML for display on screen.

  In addition to the core push and join methods, the render context also
  supports some extra methods that make it easy to build tags.

  context.begin() <-- begins a new tag context
  context.end() <-- ends the tag context...
*/
SC.RenderContext = SC.Builder.create(
  /** @lends SC.RenderContext */ {

  SELF_CLOSING: SC.CoreSet.create().addEach(['area', 'base', 'basefront', 'br', 'hr', 'input', 'img', 'link', 'meta']),

  /**
    When you create a context you should pass either a tag name or an element
    that should be used as the basis for building the context.  If you pass
    an element, then the element will be inspected for class names, styles
    and other attributes.  You can also call update() or replace() to
    modify the element with you context contents.

    If you do not pass any parameters, then we assume the tag name is 'div'.

    A second parameter, parentContext, is used internally for chaining.  You
    should never pass a second argument.

    @param {String|DOMElement} tagNameOrElement
    @returns {SC.RenderContext} receiver
  */
  init: function(tagNameOrElement, prevContext) {
    var strings, tagNameOrElementIsString;

    // if a prevContext was passed, setup with that first...
    if (prevContext) {
      this.prevObject = prevContext ;
      this.strings    = prevContext.strings ;
      this.offset     = prevContext.length + prevContext.offset ;
    }

    if (!this.strings) this.strings = [] ;

    // if tagName is string, just setup for rendering new tagName
    if (tagNameOrElement === undefined) {
      tagNameOrElement = 'div' ;
      tagNameOrElementIsString = YES ;
    }
    else if (tagNameOrElement === 'div'  ||  tagNameOrElement === 'label'  ||  tagNameOrElement === 'a') {
      // Fast path for common tags.
      tagNameOrElementIsString = YES ;
    }
    else if (SC.typeOf(tagNameOrElement) === SC.T_STRING) {
      tagNameOrElement = tagNameOrElement.toLowerCase() ;
      tagNameOrElementIsString = YES ;
    }

    if (tagNameOrElementIsString) {
      this._tagName     = tagNameOrElement ;
      this._needsTag    = YES ; // used to determine if end() needs to wrap tag
      this.needsContent = YES ;

      // increase length of all contexts to leave space for opening tag
      var c = this;
      while(c) { c.length++; c = c.prevObject; }

      this.strings.push(null);
      this._selfClosing = this.SELF_CLOSING.contains(tagNameOrElement);
    }
    else {
      this._elem        = tagNameOrElement ;
      this._needsTag    = NO ;
      this.length       = 0 ;
      this.needsContent = NO ;
    }
    return this ;
  },

  // ..........................................................
  // PROPERTIES
  //

  // NOTE: We store this as an actual array of strings so that browsers that
  // support dense arrays will use them.
  /**
    The current working array of strings.

    @property {Array}
  */
  strings: null,

  /**
    this initial offset into the strings array where this context instance
    has its opening tag.

    @property {Number}
  */
  offset: 0,

  /**
    the current number of strings owned by the context, including the opening
    tag.

    @property {Number}
  */
  length: 0,

  /**
    Specify the method that should be used to update content on the element.
    In almost all cases you want to replace the content.  Very carefully
    managed code (such as in CollectionView) can append or prepend content
    instead.

    You probably do not want to change this propery unless you know what you
    are doing.

    @property {String}
  */
  updateMode: SC.MODE_REPLACE,

  /**
    YES if the context needs its content filled in, not just its outer
    attributes edited.  This will be set to YES anytime you push strings into
    the context or if you don't create it with an element to start with.
  */
  needsContent: NO,

  // ..........................................................
  // CORE STRING API
  //

  /**
    Returns the string at the designated index.  If you do not pass anything
    returns the string array.  This index is an offset from the start of the
    strings owned by this context.

    @param {Number} idx the index
    @returns {String|Array}
  */
  get: function(idx) {
    var strings = this.strings || [];
    return (idx === undefined) ? strings.slice(this.offset, this.length) : strings[idx+this.offset];
  },

  /**
    Adds a string to the render context for later joining.  Note that you can
    pass multiple arguments to this method and each item will be pushed.

    @param {String} line the liene to add to the string.
    @returns {SC.RenderContext} receiver
  */
  push: function(line) {
    var strings = this.strings, len = arguments.length;
    if (!strings) this.strings = strings = []; // create array lazily

    if (len > 1) {
      strings.push.apply(strings, arguments) ;
    } else strings.push(line);

    // adjust string length for context and all parents...
    var c = this;
    while(c) { c.length += len; c = c.prevObject; }

    this.needsContent = YES;

    return this;
  },

  /**
    Pushes the passed string onto the array, but first escapes the string
    to ensure that no user-entered HTML is processed as HTML.

    @param {String} line one or mroe lines of text to add
    @returns {SC.RenderContext} receiver
  */
  text: function(line) {
    var len = arguments.length, idx=0;
    for(idx=0;idx<len;idx++) {
      this.push(SC.RenderContext.escapeHTML(arguments[idx]));
    }
    return this ;
  },

  /**
    Joins the strings together, returning the result.  But first, this will
    end any open tags.

    @param {String} joinChar optional string to use in joins. def empty string
    @returns {String} joined string
  */
  join: function(joinChar) {
    // generate tag if needed...
    if (this._needsTag) this.end();

    var strings = this.strings;
    return strings ? strings.join(joinChar || '') : '' ;
  },

  // ..........................................................
  // GENERATING
  //

  /**
    Begins a new render context based on the passed tagName or element.
    Generate said context using end().

    @returns {SC.RenderContext} new context
  */
  begin: function(tagNameOrElement) {
    // console.log('%@.begin(%@) called'.fmt(this, tagNameOrElement));
    return SC.RenderContext(tagNameOrElement, this);
  },

  /**
    If the current context targets an element, this method returns the
    element.  If the context does not target an element, this method will
    render the context into an offscreen element and return it.

    @returns {DOMElement} the element
  */
  element: function() {
    return this._elem ? this._elem : SC.$(this.join())[0];
  },

  /**
    Removes an element with the passed id in the currently managed element.
  */
  remove: function(elementId) {
    // console.log('remove('+elementId+')');
    if (!elementId) return ;

    var el, elem = this._elem ;
    if (!elem || !elem.removeChild) return ;

    el = document.getElementById(elementId) ;
    if (el) {
      el = elem.removeChild(el) ;
      el = null;
    }
  },

  /**
    If an element was set on this context when it was created, this method
    will actually apply any changes to the element itself.  If you have not
    written any inner html into the context, then the innerHTML of the
    element will not be changed, otherwise it will be replaced with the new
    innerHTML.

    Also, any attributes, id, classNames or styles you've set will be
    updated as well.  This also ends the editing context session and cleans
    up.

    @returns {SC.RenderContext} previous context or null if top
  */
  update: function() {
    var elem = this._elem,
        mode = this.updateMode,
        cq, value, factory, cur, next;

    this._innerHTMLReplaced = NO;

    if (!elem) {
      // throw "Cannot update context because there is no source element";
      return ;
    }

    cq = this.$();

    // console.log('%@#update() called'.fmt(this));
    // if (this.length>0) console.log(this.join());
    // else console.log('<no length>');

    // replace innerHTML
    if (this.length>0) {
      this._innerHTMLReplaced = YES;
      if (mode === SC.MODE_REPLACE) {
        cq.html(this.join());
      } else {
        factory = elem.cloneNode(false);
        factory.innerHTML = this.join() ;
        cur = factory.firstChild ;
        while(cur) {
          next = cur.nextSibling ;
          elem.insertBefore(cur, next);
          cur = next ;
        }
        cur = next = factory = null ; // cleanup
      }
    }

    // attributes, styles, and class naems will already have been set.

    // id="foo"
    if (this._idDidChange && (value = this._id)) {
      cq.attr('id', value);
    }

    // flush jQuery buffers
    jQuery.Buffer.flush();


    // now cleanup element...
    elem = this._elem = null ;
    return this.prevObject || this ;
  },

  // these are temporary objects are reused by end() to avoid memory allocs.
  _DEFAULT_ATTRS: {},
  _TAG_ARRAY: [],
  _JOIN_ARRAY: [],
  _STYLE_PAIR_ARRAY: [],

  /**
    Ends the current tag editing context.  This will generate the tag string
    including any attributes you might have set along with a closing tag.

    The generated HTML will be added to the render context strings.  This will
    also return the previous context if there is one or the receiver.

    If you do not have a current tag, this does nothing.

    @returns {SC.RenderContext}
  */
  end: function() {
    // console.log('%@.end() called'.fmt(this));
    // NOTE: If you modify this method, be careful to consider memory usage
    // and performance here.  This method is called frequently during renders
    // and we want it to be as fast as possible.

    // generate opening tag.

    // get attributes first.  Copy in className + styles...
    var tag = this._TAG_ARRAY, pair, joined, key , value,
        attrs = this._attrs, className = this._classNames,
        id = this._id, styles = this._styles;

    // add tag to tag array
    tag[0] = '<';  tag[1] = this._tagName ;

    // add any attributes...
    if (attrs || className || styles || id) {
      if (!attrs) attrs = this._DEFAULT_ATTRS ;
      if (id) attrs.id = id ;
      if (className) attrs['class'] = className.join(' ');

      // add in styles.  note how we avoid memory allocs here to keep things
      // fast...
      if (styles) {
        joined = this._JOIN_ARRAY ;
        pair = this._STYLE_PAIR_ARRAY;
        for(key in styles) {
          if(!styles.hasOwnProperty(key)) continue ;
          value = styles[key];
          if (value === null) continue; // skip empty styles
          if (typeof value === SC.T_NUMBER && !SC.NON_PIXEL_PROPERTIES.contains(key)) value += "px";

          pair[0] = this._dasherizeStyleName(key);
          pair[1] = value;
          joined.push(pair.join(': '));
        }
        attrs.style = joined.join('; ') ;

        // reset temporary object.  pair does not need to be reset since it
        // is always overwritten
        joined.length = 0;
      }

      // now convert attrs hash to tag array...
      tag.push(' '); // add space for joining0
      for(key in attrs) {
        if (!attrs.hasOwnProperty(key)) continue ;
        value = attrs[key];
        if (value === null) continue ; // skip empty attrs
        tag.push(key, '="', value, '" ');
      }

      // if we are using the DEFAULT_ATTRS temporary object, make sure we
      // reset.
      if (attrs === this._DEFAULT_ATTRS) {
        delete attrs.style;  delete attrs['class']; delete attrs.id;
      }

    }

    // this is self closing if there is no content in between and selfClosing
    // is not set to false.
    var strings = this.strings;
    var selfClosing = (this._selfClosing === NO) ? NO : (this.length === 1) ;
    tag.push(selfClosing ? ' />' : '>') ;

    // console.log('selfClosing == %@'.fmt(selfClosing));
    strings[this.offset] = tag.join('');
    tag.length = 0 ; // reset temporary object

    // now generate closing tag if needed...
    if (!selfClosing) {
      tag[0] = '</' ;
      tag[1] = this._tagName;
      tag[2] = '>';
      strings.push(tag.join(''));

      // increase length of receiver and all parents
      var c = this;
      while(c) { c.length++; c = c.prevObject; }
      tag.length = 0; // reset temporary object again
    }

    // if there was a source element, cleanup to avoid memory leaks
    this._elem = null;
    return this.prevObject || this ;
  },

  /**
    Generates a tag with the passed options.  Like calling context.begin().end().

    @param {String} tagName optional tag name.  default 'div'
    @param {Hash} opts optional tag options.  defaults to empty options.
    @returns {SC.RenderContext} receiver
  */
  tag: function(tagName, opts) {
    return this.begin(tagName, opts).end();
  },

  // ..........................................................
  // BASIC HELPERS
  //

  /**
    Reads outer tagName if no param is passed, sets tagName otherwise.

    @param {String} tagName pass to set tag name.
    @returns {String|SC.RenderContext} tag name or receiver
  */
  tagName: function(tagName) {
    if (tagName === undefined) {
      if (!this._tagName && this._elem) this._tagName = this._elem.tagName;
      return this._tagName;
    } else {
      this._tagName = tagName;
      this._tagNameDidChange = YES;
      return this ;
    }
  },

  /**
    Reads the outer tag id if no param is passed, sets the id otherwise.

    @param {String} idName the id or set
    @returns {String|SC.RenderContext} id or receiver
  */
  id: function(idName) {
    if (idName === undefined) {
      if (!this._id && this._elem) this._id = this._elem.id;
      return this._id ;
    } else {
      this._id = idName;
      this._idDidChange = YES;
      return this;
    }
  },

  // ..........................................................
  // CSS CLASS NAMES SUPPORT
  //

  /**
    Reads the current classNames array or sets the array if a param is passed.
    Note that if you get the classNames array and then modify it, you MUST
    call this method again to set the array or else it may not be copied to
    the element.

    If you do pass a classNames array, you can also pass YES for the
    cloneOnModify param.  This will cause the context to clone the class names
    before making any further edits.  This is useful is you have a shared
    array of class names you want to start with but edits should not change
    the shared array.

    @param {Array} classNames array
    @param {Boolean} cloneOnModify
    @returns {Array|SC.RenderContext} classNames array or receiver
  */
  classNames: function(classNames, cloneOnModify) {
    if (this._elem) {
      if (classNames) {
        this.$().resetClassNames().addClass(classNames);
        return this;
      } else {
        return this.$().attr('class').split(' ');
      }
    }

    if (classNames === undefined) {
      if (this._cloneClassNames) {
        this._classNames = (this._classNames || []).slice();
        this._cloneClassNames = NO ;
      }

      // if there are no class names, create an empty array but don't modify.
      if (!this._classNames) this._classNames = [];

      return this._classNames ;
    } else {
      this._classNames = classNames ;
      this._cloneClassNames = cloneOnModify || NO ;
      this._classNamesDidChange = YES ;
      return this ;
    }
  },

  /**
    Returns YES if the outer tag current has the passed class name, NO
    otherwise.

    @param {String} className the class name
    @returns {Boolean}
  */
  hasClass: function(className) {
    if (this._elem) {
      return this.$().hasClass(className);
    }
    return this.classNames().indexOf(className) >= 0;
  },

  /**
    Adds the specified className to the current tag, if it does not already
    exist.  This method has no effect if there is no open tag.

    If there is an element backing this RenderContext, buffered jQuery is
    used to perform the update.

    @param {String|Array} nameOrClasses the class name or an array of classes
    @returns {SC.RenderContext} receiver
  */
  addClass: function(nameOrClasses) {
    if(nameOrClasses === undefined || nameOrClasses === null) {
      SC.Logger.warn('You are adding an undefined or empty class'+ this.toString());
      return this;
    }

    if (this._elem) {
      if (SC.typeOf(nameOrClasses) === SC.T_STRING) {
        this.$().addClass(nameOrClasses);
      } else {
        var idx, len = nameOrClasses.length;
        for (idx = 0; idx < len; idx++) this.$().addClass(nameOrClasses[idx]);
      }
      return this;
    }

    var classNames = this.classNames() ; // handles cloning ,etc.
    if(SC.typeOf(nameOrClasses) === SC.T_STRING){
      if (classNames.indexOf(nameOrClasses)<0) {
        classNames.push(nameOrClasses);
        this._classNamesDidChange = YES ;
      }
    } else {
      var cl;
      for(var i = 0, iLen= nameOrClasses.length; i<iLen; i++){
        cl = nameOrClasses[i];
        if (classNames.indexOf(cl)<0) {
          classNames.push(cl);
          this._classNamesDidChange = YES ;
        }
      }
    }

    return this;
  },

  /**
    Removes the specified className from the current tag.  This method has
    no effect if there is not an open tag.

    If there is an actual DOM element backing this render context,
    the modification will be written immediately to a buffered jQuery instance.

    @param {String} className the class to add
    @returns {SC.RenderContext} receiver
  */
  removeClass: function(className) {
    if (this._elem) {
      this.$().removeClass(className);
      return this;
    }

    var classNames = this._classNames, idx;
    if (classNames && (idx=classNames.indexOf(className))>=0) {
      if (this._cloneClassNames) {
        classNames = this._classNames = classNames.slice();
        this._cloneClassNames = NO ;
      }

      // if className is found, just null it out.  This will end up adding an
      // extra space to the generated HTML but it is faster than trying to
      // recompact the array.
      classNames[idx] = null;
      this._classNamesDidChange = YES ;
    }

    return this;
  },

  /**
    Removes all classnames from the context. If the context represents an
    element, this will be handled in CoreQuery.

    @returns {SC.RenderContext} receiver
  */
  resetClassNames: function() {
    if (this._elem) {
      this.$().resetClassNames();
      return this;
    }

    this._classNames = [];
    this._classNamesDidChange = YES ;
    return this;
  },

  /**
    You can either pass a single class name and a boolean indicating whether
    the value should be added or removed, or you can pass a hash with all
    the class names you want to add or remove with a boolean indicating
    whether they should be there or not.

    This is far more efficient than using addClass/removeClass.

    If this context represents an element, this uses the buffered jQuery to
    ensure all planned DOM operations stay in-sync.

    @param {String|Hash} className class name or hash of classNames + bools
    @param {Boolean} shouldAdd for class name if a string was passed
    @returns {SC.RenderContext} receiver
  */
  setClass: function(className, shouldAdd) {
    if (this._elem) {
      this.$().setClass(className, shouldAdd);
      return this;
    }

    var classNames, idx, key, didChange;

    // simple form
    if (shouldAdd !== undefined) {
      return shouldAdd ? this.addClass(className) : this.removeClass(className);
    // bulk form
    } else {
      classNames = this._classNames ;
      if (!classNames) classNames = this._classNames = [];

      if (this._cloneClassNames) {
        classNames = this._classNames = classNames.slice();
        this._cloneClassNames = NO ;
      }

      didChange = NO;
      for(key in className) {
        if (!className.hasOwnProperty(key)) continue ;
        idx = classNames.indexOf(key);
        if (className[key]) {
          if (idx<0) { classNames.push(key); didChange = YES; }
        } else {
          if (idx>=0) { classNames[idx] = null; didChange = YES; }
        }
      }
      if (didChange) this._classNamesDidChange = YES;
    }

    return this ;
  },

  // ..........................................................
  // CSS Styles Support
  //

  _STYLE_REGEX: /-?\s*([^:\s]+)\s*:\s*([^;]+)\s*;?/g,

  /**
    Retrieves or sets the current styles for the outer tag.  If you retrieve
    the styles hash to edit it, you must set the hash again in order for it
    to be applied to the element on rendering.

    Optionally you can also pass YES to the cloneOnModify param to cause the
    styles has to be cloned before it is edited.  This is useful if you want
    to start with a shared style hash and then optionally modify it for each
    context.

    @param {Hash} styles styles hash
    @param {Boolean} cloneOnModify
    @returns {Hash|SC.RenderContext} styles hash or receiver
  */
  styles: function(styles, cloneOnModify) {
    if (this._elem) {
      if (styles) {
        this.$().resetStyles().css(styles);
      }
      return this.$().styles();
    }

    var attr, regex, match;
    if (styles === undefined) {

      // no styles are defined yet but we do have a source element.  Lazily
      // extract styles from element.
      if (!this._styles && this._elem) {
        // parse style...
        attr = this.$().attr('style');

        if (attr && (attr = attr.toString()).length>0) {
          if(SC.browser.msie){
            attr = attr.toLowerCase();
          }
          styles = {};

          regex = this._STYLE_REGEX ;
          regex.lastIndex = 0;

          while(match = regex.exec(attr)) styles[this._camelizeStyleName(match[1])] = match[2];

          this._styles = styles;
          this._cloneStyles = NO;

        } else {
          this._styles = {};
        }

      // if there is no element or we do have styles, possibly clone them
      // before returning.
      } else {
        if (!this._styles) {
          this._styles = {};
        } else {
          if (this._cloneStyles) {
            this._styles = SC.clone(this._styles);
            this._cloneStyles = NO ;
          }
        }
      }

      return this._styles ;

    // set the styles if passed.
    } else {
      this._styles = styles ;
      this._cloneStyles = cloneOnModify || NO ;
      this._stylesDidChange = YES ;
      return this ;
    }
  },

  _deleteComboStyles: function(styles, key) {
    var comboStyles = SC.COMBO_STYLES[key],
        didChange = NO;

    if (comboStyles) {
      var idx;
      for (idx=0; idx < comboStyles.length; idx++) {
        if (styles[comboStyles[idx]]) {
          delete styles[comboStyles[idx]];
          didChange = YES;
        }
      }
    }
    return didChange;
  },

  /**
    Clears all of the tag's styles.
    @returns {SC.RenderContext} receiver
   */
  resetStyles: function() {
    this.styles({});
    return this;
  },


  /**
    Apply the passed styles to the tag.  You can pass either a single key
    value pair or a hash of styles.  Note that if you set a style on an
    existing element, it will replace any existing styles on the element.

    @param {String|Hash} nameOrStyles the style name or a hash of styles
    @param {String|Number} value style value if string name was passed
    @returns {SC.RenderContext} receiver
  */
  addStyle: function(nameOrStyles, value) {
    if (this._elem) {
      this.$().css(nameOrStyles, value);
      return this;
    }

    // get the current hash of styles.  This will extract the styles and
    // clone them if needed.  This will get the actual styles hash so we can
    // edit it directly.
    var key, didChange = NO, styles = this.styles();

    // simple form
    if (typeof nameOrStyles === SC.T_STRING) {
      if (value === undefined) { // reader
        return styles[nameOrStyles];
      } else { // writer
        didChange = this._deleteComboStyles(styles, nameOrStyles);
        if (styles[nameOrStyles] !== value) {
          styles[nameOrStyles] = value ;
          didChange = YES ;
        }
        if (didChange) this._stylesDidChange = YES;
      }

    // bulk form
    } else {
      for(key in nameOrStyles) {
        if (!nameOrStyles.hasOwnProperty(key)) continue ;
        didChange = didChange || this._deleteComboStyles(styles, key);
        value = nameOrStyles[key];
        if (styles[key] !== value) {
          styles[key] = value;
          didChange = YES;
        }
      }
      if (didChange) this._stylesDidChange = YES ;
    }

    return this ;
  },

  /**
    Removes the named style from the style hash.

    Note that if you delete a style, the style will not actually be removed
    from the style hash.  Instead, its value will be set to null.

    @param {String} styleName
    @returns {SC.RenderContext} receiver
  */
  removeStyle: function(styleName) {
    if (this._elem) {
      this.$().css(styleName, null);
      return this;
    }

    // avoid case where no styles have been defined
    if (!this._styles) return this;

    // get styles hash.  this will clone if needed.
    var styles = this.styles();
    if (styles[styleName]) {
      styles[styleName] = null;
      this._stylesDidChange = YES ;
    }
  },

  // ..........................................................
  // ARBITRARY ATTRIBUTES SUPPORT
  //

  /**
    Sets the named attribute on the tag.  Note that if you set the 'class'
    attribute or the 'styles' attribute, it will be ignored.  Use the
    relevant class name and style methods instead.

    @param {String|Hash} nameOrAttrs the attr name or hash of attrs.
    @param {String} value attribute value if attribute name was passed
    @returns {SC.RenderContext} receiver
  */
  attr: function(nameOrAttrs, value) {
    if (this._elem) {
      this.$().attr(nameOrAttrs, value);
      return this;
    }


    var key, attrs = this._attrs, didChange = NO ;
    if (!attrs) this._attrs = attrs = {} ;

    // simple form
    if (typeof nameOrAttrs === SC.T_STRING) {
      if (value === undefined) { // getter
        return attrs[nameOrAttrs];
      } else { // setter
        if (attrs[nameOrAttrs] !== value) {
          attrs[nameOrAttrs] = value ;
          this._attrsDidChange = YES ;
        }
      }

    // bulk form
    } else {
      for(key in nameOrAttrs) {
        if (!nameOrAttrs.hasOwnProperty(key)) continue ;
        value = nameOrAttrs[key];
        if (attrs[key] !== value) {
          attrs[key] = value ;
          didChange = YES ;
        }
      }
      if (didChange) this._attrsDidChange = YES ;
    }

    return this ;
  },

  //
  // COREQUERY SUPPORT
  //
  /**
    Returns a CoreQuery instance for the element this context wraps (if
    it wraps any). If a selector is passed, the CoreQuery instance will
    be for nodes matching that selector.

    Renderers may use this to modify DOM.
   */
  $: function(sel) {
    var ret, elem = this._elem;
    ret = !elem ? SC.$.buffer([]) : (sel === undefined) ? SC.$.buffer(elem) : SC.$.buffer(sel, elem);
    elem = null;
    return ret;
  },


  /** @private
  */
  _camelizeStyleName: function(name) {
    // IE wants the first letter lowercase so we can allow normal behavior
    var needsCap = name.match(/^-(webkit|moz|o)-/),
        camelized = SC.String.camelize(name);

    if (needsCap) {
      return camelized.substr(0,1).toUpperCase() + camelized.substr(1);
    } else {
      return camelized;
    }
  },

  /** @private
    Converts camelCased style names to dasherized forms
  */
  _dasherizeStyleName: function(name) {
    var dasherized = SC.String.dasherize(name);
    if (dasherized.match(/^(webkit|moz|ms|o)-/)) { dasherized = '-'+dasherized; }
    return dasherized;
  }

});

/**
  html is an alias for push().  Makes thie object more CoreQuery like
*/
SC.RenderContext.fn.html = SC.RenderContext.fn.push;

/**
  css is an alias for addStyle().  This this object more CoreQuery like.
*/
SC.RenderContext.fn.css = SC.RenderContext.fn.addStyle;

/**
  Helper method escapes the passed string to ensure HTML is displayed as
  plain text.  You should make sure you pass all user-entered data through
  this method to avoid errors.  You can also do this with the text() helper
  method on a render context.
*/


if (!SC.browser.isSafari || parseInt(SC.browser.version, 10) < 526) {
  SC.RenderContext._safari3 = YES;
}

SC.RenderContext.escapeHTML = function(text) {
  var elem, node, ret ;

  if (SC.none(text)) { return text; } // ignore empty

  elem = this.escapeHTMLElement;
  if (!elem) { elem = this.escapeHTMLElement = document.createElement('div'); }

  node = this.escapeTextNode;
  if (!node) {
    node = this.escapeTextNode = document.createTextNode('');
    elem.appendChild(node);
  }

  node.data = text ;
  ret = elem.innerHTML ;

  // Safari 3 does not escape the '>' character
  if (SC.RenderContext._safari3) { ret = ret.replace(/>/g, '&gt;'); }

  node = elem = null;
  return ret ;
};

/* >>>>>>>>>> BEGIN source/system/selection_set.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  A SelectionSet contains a set of objects that represent the current
  selection.  You can select objects by either adding them to the set directly
  or indirectly by selecting a range of indexes on a source object.

  @extends SC.Object
  @extends SC.Enumerable
  @extends SC.Freezable
  @extends SC.Copyable
  @since SproutCore 1.0
*/
SC.SelectionSet = SC.Object.extend(SC.Enumerable, SC.Freezable, SC.Copyable,
  /** @scope SC.SelectionSet.prototype */ {

  /**
    Walk like a duck.

    @property {Boolean}
  */
  isSelectionSet: YES,

  /**
    Total number of indexes in the selection set

    @property {Number}
  */
  length: function() {
    var ret     = 0,
        sets    = this._sets,
        objects = this._objects;
    if (objects) ret += objects.get('length');
    if (sets) sets.forEach(function(s) { ret += s.get('length'); });
    return ret ;
  }.property().cacheable(),

  // ..........................................................
  // INDEX-BASED SELECTION
  //

  /**
    A set of all the source objects used in the selection set.  This
    property changes automatically as you add or remove index sets.

    @property {SC.Array}
  */
  sources: function() {
    var ret  = [],
        sets = this._sets,
        len  = sets ? sets.length : 0,
        idx, set, source;

    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set && set.get('length')>0 && set.source) ret.push(set.source);
    }
    return ret ;
  }.property().cacheable(),

  /**
    Returns the index set for the passed source object or null if no items are
    seleted in the source.

    @param {SC.Array} source the source object
    @returns {SC.IndexSet} index set or null
  */
  indexSetForSource: function(source) {
    if (!source || !source.isSCArray) return null; // nothing to do

    var cache   = this._indexSetCache,
        objects = this._objects,
        ret, idx;

    // try to find in cache
    if (!cache) cache = this._indexSetCache = {};
    ret = cache[SC.guidFor(source)];
    if (ret && ret._sourceRevision && (ret._sourceRevision !== source.propertyRevision)) {
      ret = null;
    }

    // not in cache.  generate from index sets and any saved objects
    if (!ret) {
      ret = this._indexSetForSource(source, NO);
      if (ret && ret.get('length')===0) ret = null;

      if (objects) {
        if (ret) ret = ret.copy();
        objects.forEach(function(o) {
          if ((idx = source.indexOf(o)) >= 0) {
            if (!ret) ret = SC.IndexSet.create();
            ret.add(idx);
          }
        }, this);
      }

      if (ret) {
        ret = cache[SC.guidFor(source)] = ret.frozenCopy();
        ret._sourceRevision = source.propertyRevision;
      }
    }

    return ret;
  },

  /**
    @private

    Internal method gets the index set for the source, ignoring objects
    that have been added directly.
  */
  _indexSetForSource: function(source, canCreate) {
    if (canCreate === undefined) canCreate = YES;

    var guid  = SC.guidFor(source),
        index = this[guid],
        sets  = this._sets,
        len   = sets ? sets.length : 0,
        ret   = null;

    if (index >= len) index = null;
    if (SC.none(index)) {
      if (canCreate && !this.isFrozen) {
        this.propertyWillChange('sources');
        if (!sets) sets = this._sets = [];
        ret = sets[len] = SC.IndexSet.create();
        ret.source = source ;
        this[guid] = len;
        this.propertyDidChange('sources');
      }

    } else ret = sets ? sets[index] : null;
    return ret ;
  },

  /**
    Add the passed index, range of indexSet belonging to the passed source
    object to the selection set.

    The first parameter you pass must be the source array you are selecting
    from.  The following parameters may be one of a start/length pair, a
    single index, a range object or an IndexSet.  If some or all of the range
    you are selecting is already in the set, it will not be selected again.

    You can also pass an SC.SelectionSet to this method and all the selected
    sets will be added from their instead.

    @param {SC.Array} source source object or object to add.
    @param {Number} start index, start of range, range or IndexSet
    @param {Number} length length if passing start/length pair.
    @returns {SC.SelectionSet} receiver
  */
  add: function(source, start, length) {

    if (this.isFrozen) throw SC.FROZEN_ERROR ;

    var sets, len, idx, set, oldlen, newlen, setlen, objects;

    // normalize
    if (start === undefined && length === undefined) {
      if (!source) throw "Must pass params to SC.SelectionSet.add()";
      if (source.isIndexSet) return this.add(source.source, source);
      if (source.isSelectionSet) {
        sets = source._sets;
        objects = source._objects;
        len  = sets ? sets.length : 0;

        this.beginPropertyChanges();
        for(idx=0;idx<len;idx++) {
          set = sets[idx];
          if (set && set.get('length')>0) this.add(set.source, set);
        }
        if (objects) this.addObjects(objects);
        this.endPropertyChanges();
        return this ;

      }
    }

    set    = this._indexSetForSource(source, YES);
    oldlen = this.get('length');
    setlen = set.get('length');
    newlen = oldlen - setlen;

    set.add(start, length);

    this._indexSetCache = null;

    newlen += set.get('length');
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
      if (setlen === 0) this.notifyPropertyChange('sources');
    }

    return this ;
  },

  /**
    Removes the passed index, range of indexSet belonging to the passed source
    object from the selection set.

    The first parameter you pass must be the source array you are selecting
    from.  The following parameters may be one of a start/length pair, a
    single index, a range object or an IndexSet.  If some or all of the range
    you are selecting is already in the set, it will not be selected again.

    @param {SC.Array} source source object. must not be null
    @param {Number} start index, start of range, range or IndexSet
    @param {Number} length length if passing start/length pair.
    @returns {SC.SelectionSet} receiver
  */
  remove: function(source, start, length) {

    if (this.isFrozen) throw SC.FROZEN_ERROR ;

    var sets, len, idx, set, oldlen, newlen, setlen, objects;

    // normalize
    if (start === undefined && length === undefined) {
      if (!source) throw "Must pass params to SC.SelectionSet.remove()";
      if (source.isIndexSet) return this.remove(source.source, source);
      if (source.isSelectionSet) {
        sets = source._sets;
        objects = source._objects;
        len  = sets ? sets.length : 0;

        this.beginPropertyChanges();
        for(idx=0;idx<len;idx++) {
          set = sets[idx];
          if (set && set.get('length')>0) this.remove(set.source, set);
        }
        if (objects) this.removeObjects(objects);
        this.endPropertyChanges();
        return this ;
      }
    }

    // save starter info
    set    = this._indexSetForSource(source, YES);
    oldlen = this.get('length');
    newlen = oldlen - set.get('length');

    // if we have objects selected, determine if they are in the index
    // set and remove them as well.
    if (set && (objects = this._objects)) {

      // convert start/length to index set so the iterator below will work...
      if (length !== undefined) {
        start = SC.IndexSet.create(start, length);
        length = undefined;
      }

      objects.forEach(function(object) {
        idx = source.indexOf(object);
        if (start.contains(idx)) {
          objects.remove(object);
          newlen--;
        }
      }, this);
    }

    // remove indexes from source index set
    set.remove(start, length);
    setlen = set.get('length');
    newlen += setlen;

    // update caches; change enumerable...
    this._indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
      if (setlen === 0) this.notifyPropertyChange('sources');
    }

    return this ;
  },


  /**
    Returns YES if the selection contains the named index, range of indexes.

    @param {Object} source source object for range
    @param {Number} start index, start of range, range object, or indexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  contains: function(source, start, length) {
    if (start === undefined && length === undefined) {
      return this.containsObject(source);
    }

    var set = this.indexSetForSource(source);
    if (!set) return NO ;
    return set.contains(start, length);
  },

  /**
    Returns YES if the index set contains any of the passed indexes.  You
    can pass a single index, a range or an index set.

    @param {Object} source source object for range
    @param {Number} start index, range, or IndexSet
    @param {Number} length optional range length
    @returns {Boolean}
  */
  intersects: function(source, start, length) {
    var set = this.indexSetForSource(source, NO);
    if (!set) return NO ;
    return set.intersects(start, length);
  },


  // ..........................................................
  // OBJECT-BASED API
  //

  _TMP_ARY: [],

  /**
    Adds the object to the selection set.  Unlike adding an index set, the
    selection will actually track the object independent of its location in
    the array.

    @param {Object} object
    @returns {SC.SelectionSet} receiver
  */
  addObject: function(object) {
    var ary = this._TMP_ARY, ret;
    ary[0] = object;

    ret = this.addObjects(ary);
    ary.length = 0;

    return ret;
  },

  /**
    Adds objects in the passed enumerable to the selection set.  Unlike adding
    an index set, the seleciton will actually track the object independent of
    its location the array.

    @param {SC.Enumerable} objects
    @returns {SC.SelectionSet} receiver
  */
  addObjects: function(objects) {
    var cur = this._objects,
        oldlen, newlen;
    if (!cur) cur = this._objects = SC.CoreSet.create();
    oldlen = cur.get('length');

    cur.addEach(objects);
    newlen = cur.get('length');

    this._indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
    }
    return this;
  },

  /**
    Removes the object from the selection set.  Note that if the selection
    set also selects a range of indexes that includes this object, it may
    still be in the selection set.

    @param {Object} object
    @returns {SC.SelectionSet} receiver
  */
  removeObject: function(object) {
    var ary = this._TMP_ARY, ret;
    ary[0] = object;

    ret = this.removeObjects(ary);
    ary.length = 0;

    return ret;
  },

  /**
    Removes the objects from the selection set.  Note that if the selection
    set also selects a range of indexes that includes this object, it may
    still be in the selection set.

    @param {Object} object
    @returns {SC.SelectionSet} receiver
  */
  removeObjects: function(objects) {
    var cur = this._objects,
        oldlen, newlen, sets;

    if (!cur) return this;

    oldlen = cur.get('length');

    cur.removeEach(objects);
    newlen = cur.get('length');

    // also remove from index sets, if present
    if (sets = this._sets) {
      sets.forEach(function(set) {
        oldlen += set.get('length');
        set.removeObjects(objects);
        newlen += set.get('length');
      }, this);
    }

    this._indexSetCache = null;
    if (newlen !== oldlen) {
      this.propertyDidChange('length');
      this.enumerableContentDidChange();
    }
    return this;
  },

  /**
    Returns YES if the selection contains the passed object.  This will search
    selected ranges in all source objects.

    @param {Object} object the object to search for
    @returns {Boolean}
  */
  containsObject: function(object) {
    // fast path
    var objects = this._objects ;
    if (objects && objects.contains(object)) return YES ;

    var sets = this._sets,
        len  = sets ? sets.length : 0,
        idx, set;
    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set && set.indexOf(object)>=0) return YES;
    }

    return NO ;
  },


  // ..........................................................
  // GENERIC HELPER METHODS
  //

  /**
    Constrains the selection set to only objects found in the passed source
    object.  This will remove any indexes selected in other sources, any
    indexes beyond the length of the content, and any objects not found in the
    set.

    @param {Object} source the source to limit
    @returns {SC.SelectionSet} receiver
  */
  constrain: function(source) {
    var set, len, max, objects;

    this.beginPropertyChanges();

    // remove sources other than this one
    this.get('sources').forEach(function(cur) {
      if (cur === source) return; //skip
      var set = this._indexSetForSource(source, NO);
      if (set) this.remove(source, set);
    },this);

    // remove indexes beyond end of source length
    set = this._indexSetForSource(source, NO);
    if (set && ((max=set.get('max'))>(len=source.get('length')))) {
      this.remove(source, len, max-len);
    }

    // remove objects not in source
    if (objects = this._objects) {
      objects.forEach(function(cur) {
        if (source.indexOf(cur)<0) this.removeObject(cur);
      },this);
    }

    this.endPropertyChanges();
    return this ;
  },

  /**
    Returns YES if the passed index set or selection set contains the exact
    same source objects and indexes as  the receiver.  If you pass any object
    other than an IndexSet or SelectionSet, returns NO.

    @param {Object} obj another object.
    @returns {Boolean}
  */
  isEqual: function(obj) {
    var left, right, idx, len, sources, source;

    // fast paths
    if (!obj || !obj.isSelectionSet) return NO ;
    if (obj === this) return YES;
    if ((this._sets === obj._sets) && (this._objects === obj._objects)) return YES;
    if (this.get('length') !== obj.get('length')) return NO;

    // check objects
    left = this._objects;
    right = obj._objects;
    if (left || right) {
      if ((left ? left.get('length'):0) !== (right ? right.get('length'):0)) {
        return NO;
      }
      if (left && !left.isEqual(right)) return NO ;
    }

    // now go through the sets
    sources = this.get('sources');
    len     = sources.get('length');
    for(idx=0;idx<len;idx++) {
      source = sources.objectAt(idx);
      left = this._indexSetForSource(source, NO);
      right = this._indexSetForSource(source, NO);
      if (!!right !== !!left) return NO ;
      if (left && !left.isEqual(right)) return NO ;
    }

    return YES ;
  },

  /**
    Clears the set.  Removes all IndexSets from the object

    @returns {SC.SelectionSet}
  */
  clear: function() {
    if (this.isFrozen) throw SC.FROZEN_ERROR;
    if (this._sets) this._sets.length = 0 ; // truncate
    if (this._objects) this._objects = null;

    this._indexSetCache = null;
    this.propertyDidChange('length');
    this.enumerableContentDidChange();
    this.notifyPropertyChange('sources');

    return this ;
  },

  /**
   Clones the set into a new set.

   @returns {SC.SelectionSet}
  */
  copy: function() {
    var ret  = this.constructor.create(),
        sets = this._sets,
        len  = sets ? sets.length : 0 ,
        idx, set;

    if (sets && len>0) {
      sets = ret._sets = sets.slice();
      for(idx=0;idx<len;idx++) {
        if (!(set = sets[idx])) continue ;
        set = sets[idx] = set.copy();
        ret[SC.guidFor(set.source)] = idx;
      }
    }

    if (this._objects) ret._objects = this._objects.copy();
    return ret ;
  },

  /**
    @private

    Freezing a SelectionSet also freezes its internal sets.
  */
  freeze: function() {
    if (this.get('isFrozen')) { return this ; }
    var sets = this._sets,
        loc  = sets ? sets.length : 0,
        set ;

    while(--loc >= 0) {
      set = sets[loc];
      if (set) { set.freeze(); }
    }

    if (this._objects) { this._objects.freeze(); }
    this.set('isFrozen', YES);
    return this;
    // return arguments.callee.base.apply(this,arguments);
  },

  // ..........................................................
  // ITERATORS
  //

  /** @private */
  toString: function() {
    var sets = this._sets || [];
    sets = sets.map(function(set) {
      return set.toString().replace("SC.IndexSet", SC.guidFor(set.source));
    }, this);
    if (this._objects) sets.push(this._objects.toString());
    return "SC.SelectionSet:%@<%@>".fmt(SC.guidFor(this), sets.join(','));
  },

  /** @private */
  firstObject: function() {
    var sets    = this._sets,
        objects = this._objects;

    // if we have sets, get the first one
    if (sets && sets.get('length')>0) {
      var set  = sets ? sets[0] : null,
          src  = set ? set.source : null,
          idx  = set ? set.firstObject() : -1;
      if (src && idx>=0) return src.objectAt(idx);
    }

    // otherwise if we have objects, get the first one
    return objects ? objects.firstObject() : undefined;

  }.property(),

  /** @private
    Implement primitive enumerable support.  Returns each object in the
    selection.
  */
  nextObject: function(count, lastObject, context) {
    var objects, ret;

    // TODO: Make this more efficient.  Right now it collects all objects
    // first.

    if (count === 0) {
      objects = context.objects = [];
      this.forEach(function(o) { objects.push(o); }, this);
      context.max = objects.length;
    }

    objects = context.objects ;
    ret = objects[count];

    if (count+1 >= context.max) {
      context.objects = context.max = null;
    }

    return ret ;
  },

  /**
    Iterates over the selection, invoking your callback with each __object__.
    This will actually find the object referenced by each index in the
    selection, not just the index.

    The callback must have the following signature:

        function callback(object, index, source, indexSet) { ... }

    If you pass a target, it will be used when the callback is called.

    @param {Function} callback function to invoke.
    @param {Object} target optional content. otherwise uses window
    @returns {SC.SelectionSet} receiver
  */
  forEach: function(callback, target) {
    var sets = this._sets,
        objects = this._objects,
        len = sets ? sets.length : 0,
        set, idx;

    for(idx=0;idx<len;idx++) {
      set = sets[idx];
      if (set) set.forEachObject(callback, target);
    }

    if (objects) objects.forEach(callback, target);
    return this ;
  }

});

/** @private */
SC.SelectionSet.prototype.clone = SC.SelectionSet.prototype.copy;

/**
  Default frozen empty selection set

  @property {SC.SelectionSet}
*/
SC.SelectionSet.EMPTY = SC.SelectionSet.create().freeze();


/* >>>>>>>>>> BEGIN source/system/sparse_array.js */
// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/delegate_support') ;

/**
  @class

  A dynamically filled array.  A SparseArray makes it easy for you to create
  very large arrays of data but then to defer actually populating that array
  until it is actually needed.  This is often much faster than generating an
  array up front and paying the cost to load your data then.

  Although technically all arrays in JavaScript are "sparse" (in the sense
  that you can read and write properties at arbitrary indexes), this array
  keeps track of which elements in the array have been populated already
  and which ones have not.  If you try to get a value at an index that has
  not yet been populated, the SparseArray will notify a delegate object first,
  giving the delegate a chance to populate the component.

  Most of the time, you will use a SparseArray to incrementally load data
  from the server.  For example, if you have a contact list with 3,000
  contacts in it, you may create a SparseArray with a length of 3,000 and set
  that as the content for a ListView.  As the ListView tries to display the
  visible contacts, it will request them from the SparseArray, which will in
  turn notify your delegate, giving you a chance to load the contact data from
  the server.

  @extends SC.Enumerable
  @extends SC.Array
  @extends SC.Observable
  @extends SC.DelegateSupport
  @since SproutCore 1.0
*/

SC.SparseArray = SC.Object.extend(SC.Observable, SC.Enumerable, SC.Array,
  SC.DelegateSupport, /** @scope SC.SparseArray.prototype */ {

  // ..........................................................
  // LENGTH SUPPORT
  //

  _requestingLength: 0,
  _requestingIndex: 0,

  /**
    The length of the sparse array.  The delegate for the array should set
    this length.

    @property {Number}
  */
  length: function() {
    var del = this.delegate ;
    if (del && SC.none(this._length) && del.sparseArrayDidRequestLength) {
      this._requestingLength++ ;
      del.sparseArrayDidRequestLength(this);
      this._requestingLength-- ;
    }
    return this._length || 0 ;
  }.property().cacheable(),

  /**
    Call this method from a delegate to provide a length for the sparse array.
    If you pass null for this property, it will essentially "reset" the array
    causing your delegate to be called again the next time another object
    requests the array length.

    @param {Number} length the length or null
    @returns {SC.SparseArray} receiver
  */
  provideLength: function(length) {
    var oldLength;
    if (SC.none(length)) this._sa_content = null ;
    if (length !== this._length) {
      oldLength = this._length;
      this._length = length ;
      if (this._requestingLength <= 0) { this.arrayContentDidChange(0, oldLength||0, length||0) ; }
    }
    return this ;
  },

  // ..........................................................
  // READING CONTENT
  //

  /**
    The minimum range of elements that should be requested from the delegate.
    If this value is set to larger than 1, then the sparse array will always
    fit a requested index into a range of this size and request it.

    @property {Number}
  */
  rangeWindowSize: 1,

  /**
    This array contains all the start_indexes of ranges requested. This is to
    avoid calling sparseArrayDidRequestRange to often. Indexes are removed and
    added as range requests are completed.
  */
  requestedRangeIndex: null,

  /**
    Make sure to create the index array during init so that it is not shared
    between all instances.
  */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.requestedRangeIndex = [];

    this._TMP_PROVIDE_ARRAY = [];
    this._TMP_PROVIDE_RANGE = { length: 1 };
    this._TMP_RANGE = {};
  },

  /**
    Returns the object at the specified index.  If the value for the index
    is currently undefined, invokes the didRequestIndex() method to notify
    the delegate.

    The omitMaterializing flag ensures that the object will not be materialized,
    but it simply checks for the presence of an object at the specified index
    and will return YES (or undefined if not found). This is useful in the case
    of SparseArrays, where you might NOT want to request the index to be loaded,
    but simply need a shallow check to see if the position has been filled.

    @param {Number} idx the index to get
    @param {Boolean} omitMaterializing
    @return {Object} the object
  */
  objectAt: function(idx, omitMaterializing) {
    var content = this._sa_content, ret ;
    if (!content) content = this._sa_content = [] ;
    if ((ret = content[idx]) === undefined) {
      if(!omitMaterializing) this.requestIndex(idx);
      ret = content[idx]; // just in case the delegate provided immediately
    }
    return ret ;
  },

  /**
    Returns the set of indexes that are currently defined on the sparse array.
    If you pass an optional index set, the search will be limited to only
    those indexes.  Otherwise this method will return an index set containing
    all of the defined indexes.  Currently this can be quite expensive if
    you have a lot of indexes defined.

    @param {SC.IndexSet} indexes optional from indexes
    @returns {SC.IndexSet} defined indexes
  */
  definedIndexes: function(indexes) {
    var ret = SC.IndexSet.create(),
        content = this._sa_content,
        idx, len;

    if (!content) return ret.freeze(); // nothing to do

    if (indexes) {
      indexes.forEach(function(idx) {
        if (content[idx] !== undefined) ret.add(idx);
      });
    } else {
      len = content.length;
      for(idx=0;idx<len;idx++) {
        if (content[idx] !== undefined) ret.add(idx);
      }
    }

    return ret.freeze();
  },

  _TMP_RANGE: {},

  /**
    Called by objectAt() whenever you request an index that has not yet been
    loaded.  This will possibly expand the index into a range and then invoke
    an appropriate method on the delegate to request the data.

    It will check if the range has been already requested.

    @param {Number} idx the index to retrieve
    @returns {SC.SparseArray} receiver
  */
  requestIndex: function(idx) {
    var del = this.delegate;
    if (!del) return this; // nothing to do

    // adjust window
    var len = this.get('rangeWindowSize'), start = idx;
    if (len > 1) start = start - Math.floor(start % len);
    if (len < 1) len = 1 ;

    // invoke appropriate callback
    this._requestingIndex++;
    if (del.sparseArrayDidRequestRange) {
      var range = this._TMP_RANGE;
      if(this.wasRangeRequested(start)===-1){
        range.start = start;
        range.length = len;
        this.requestedRangeIndex.push(start);
        del.sparseArrayDidRequestRange(this, range);
      }
    } else if (del.sparseArrayDidRequestIndex) {
      while(--len >= 0) del.sparseArrayDidRequestIndex(this, start + len);
    }
    this._requestingIndex--;

    return this ;
  },

  /*
    This method is called by requestIndex to check if the range has already
    been requested. We assume that rangeWindowSize is not changed often.

     @param {Number} startIndex
     @return {Number} index in requestRangeIndex
  */
  wasRangeRequested: function(rangeStart) {
    var i, ilen;
    for(i=0, ilen=this.requestedRangeIndex.length; i<ilen; i++){
      if(this.requestedRangeIndex[i]===rangeStart) return i;
    }
    return -1;
  },

  /*
    This method has to be called after a request for a range has completed.
    To remove the index from the sparseArray to allow future updates on the
    range.

     @param {Number} startIndex
     @return {Number} index in requestRangeIndex
  */
  rangeRequestCompleted: function(start) {
    var i = this.wasRangeRequested(start);
    if(i>=0) {
      this.requestedRangeIndex.removeAt(i,1);
      return YES;
    }
    return NO;
  },

  /**
    This method sets the content for the specified to the objects in the
    passed array.  If you change the way SparseArray implements its internal
    tracking of objects, you should override this method along with
    objectAt().

    @param {Range} range the range to apply to
    @param {Array} array the array of objects to insert
    @returns {SC.SparseArray} receiver
  */
  provideObjectsInRange: function(range, array) {
    var content = this._sa_content ;
    if (!content) content = this._sa_content = [] ;
    var start = range.start, len = range.length;
    while(--len >= 0) content[start+len] = array.objectAt(len);
    if (this._requestingIndex <= 0) this.arrayContentDidChange(range.start, range.length, range.length);
    return this ;
  },

  /**
    Convenience method to provide a single object at a specified index.  Under
    the covers this calls provideObjectsInRange() so you can override only
    that method and this one will still work.

    @param {Number} index the index to insert
    @param {Object} the object to insert
    @return {SC.SparseArray} receiver
  */
  provideObjectAtIndex: function(index, object) {
    var array = this._TMP_PROVIDE_ARRAY, range = this._TMP_PROVIDE_RANGE;
    array[0] = object;
    range.start = index;
    return this.provideObjectsInRange(range, array);
  },

  /**
    Invalidates the array content in the specified range.  This is not the
    same as editing an array.  Rather it will cause the array to reload the
    content from the delegate again when it is requested.

    @param {Range} the range
    @returns {SC.SparseArray} receiver
  */
  objectsDidChangeInRange: function(range) {

    // delete cached content
    var content = this._sa_content ;
    if (content) {
      // if range covers entire length of cached content, just reset array
      if (range.start === 0 && SC.maxRange(range)>=content.length) {
        this._sa_content = null ;

      // otherwise, step through the changed parts and delete them.
      } else {
        var start = range.start, loc = Math.min(start + range.length, content.length);
        while (--loc>=start) content[loc] = undefined;
      }
    }
    this.arrayContentDidChange(range.start, range.length, range.length) ; // notify
    return this ;
  },

  /**
    Optimized version of indexOf().  Asks the delegate to provide the index
    of the specified object.  If the delegate does not implement this method
    then it will search the internal array directly.

    @param {Object} obj the object to search for
    @returns {Number} the discovered index or -1 if not found
  */
  indexOf: function(obj) {
    var del = this.delegate ;
    if (del && del.sparseArrayDidRequestIndexOf) {
      return del.sparseArrayDidRequestIndexOf(this, obj);
    } else {
      var content = this._sa_content ;
      if (!content) content = this._sa_content = [] ;
      return content.indexOf(obj) ;
    }
  },

  // ..........................................................
  // EDITING
  //

  /**
    Array primitive edits the objects at the specified index unless the
    delegate rejects the change.

    @param {Number} idx the index to begin to replace
    @param {Number} amt the number of items to replace
    @param {Array} objects the new objects to set instead
    @returns {SC.SparseArray} receiver
  */
  replace: function(idx, amt, objects) {
    objects = objects || [] ;

    // if we have a delegate, get permission to make the replacement.
    var del = this.delegate ;
    if (del) {
      if (!del.sparseArrayShouldReplace ||
          !del.sparseArrayShouldReplace(this, idx, amt, objects)) {
            return this;
      }
    }

    // go ahead and apply to local content.
    var content = this._sa_content ;
    if (!content) content = this._sa_content = [] ;
    content.replace(idx, amt, objects) ;

    // update length
    var len = objects ? (objects.get ? objects.get('length') : objects.length) : 0;
    var delta = len - amt ;

    this.arrayContentWillChange(idx, amt, len) ;

    if (!SC.none(this._length)) {
      this.propertyWillChange('length');
      this._length += delta;
      this.propertyDidChange('length');
    }

    this.arrayContentDidChange(idx, amt, len) ;
    this.enumerableContentDidChange(idx, amt, delta) ;
    return this ;
  },

  /**
    Resets the SparseArray, causing it to reload its content from the
    delegate again.

    @returns {SC.SparseArray} receiver
  */
  reset: function() {
    var oldLength;
    this._sa_content = null ;
    oldLength = this._length;
    this._length = null ;
    this.arrayContentDidChange(0, oldLength, 0);
    this.invokeDelegateMethod(this.delegate, 'sparseArrayDidReset', this);
    return this ;
  }

}) ;

/**
  Convenience metohd returns a new sparse array with a default length already
  provided.

  @param {Number} len the length of the array
  @returns {SC.SparseArray}
*/
SC.SparseArray.array = function(len) {
  return this.create({ _length: len||0 });
};

/* >>>>>>>>>> BEGIN source/system/timer.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A Timer executes a method after a defined period of time.  Timers are
  significantly more efficient than using setTimeout() or setInterval()
  because they are cooperatively scheduled using the run loop.  Timers are
  also gauranteed to fire at the same time, making it far easier to keep
  multiple timers in sync.

  ## Overview

  Timers were created for SproutCore as a way to efficiently defer execution
  of code fragments for use in Animations, event handling, and other tasks.

  Browsers are typically fairly inconsistant about when they will fire a
  timeout or interval based on what the browser is currently doing.  Timeouts
  and intervals are also fairly expensive for a browser to execute, which
  means if you schedule a large number of them it can quickly slow down the
  browser considerably.

  Timers, on the other handle, are scheduled cooperatively using the
  SC.RunLoop, which uses exactly one timeout to fire itself when needed and
  then executes by timers that need to fire on its own.  This approach can
  be many timers faster than using timers and gaurantees that timers scheduled
  to execute at the same time generally will do so, keeping animations and
  other operations in sync.

  ## Scheduling a Timer

  To schedule a basic timer, you can simply call SC.Timer.schedule() with
  a target and action you wish to have invoked:

      var timer = SC.Timer.schedule({
        target: myObject, action: 'timerFired', interval: 100
      });

  When this timer fires, it will call the timerFired() method on myObject.

  In addition to calling a method on a particular object, you can also use
  a timer to execute a variety of other types of code:

   - If you include an action name, but not a target object, then the action will be passed down the responder chain.
   - If you include a property path for the action property (e.g. 'MyApp.someController.someMethod'), then the method you name will be executed.
   - If you include a function in the action property, then the function will be executed.  If you also include a target object, the function will be called with this set to the target object.

  In general these properties are read-only.  Changing an interval, target,
  or action after creating a timer will have an unknown effect.

  ## Scheduling Repeating Timers

  In addition to scheduling one time timers, you can also schedule timers to
  execute periodically until some termination date.  You make a timer
  repeating by adding the repeats: YES property:

      var timer = SC.Timer.schedule({
        target: myObject,
        action: 'updateAnimation',
        interval: 100,
        repeats: YES,
        until: Time.now() + 1000
      }) ;

  The above example will execute the myObject.updateAnimation() every 100msec
  for 1 second from the current time.

  If you want a timer to repeat without expiration, you can simply omit the
  until: property.  The timer will then repeat until you invalidate it.

  ## Pausing and Invalidating Timers

  If you have created a timer but you no longer want it to execute, you can
  call the invalidate() method on it.  This will remove the timer from the
  run loop and clear certain properties so that it will not run again.

  You can use the invalidate() method on both repeating and one-time timers.

  If you do not want to invalidate a timer completely but you just want to
  stop the timer from execution temporarily, you can alternatively set the
  isPaused property to YES:

      timer.set('isPaused', YES) ;
      // Perform some critical function; timer will not execute
      timer.set('isPaused', NO) ;

  When a timer is paused, it will be scheduled and will fire like normal,
  but it will not actually execute the action method when it fires.  For a
  one time timer, this means that if you have the timer paused when it fires,
  it may never actually execute the action method.  For repeating timers,
  this means the timer will remain scheduled but simply will not execute its
  action while the timer is paused.

  ## Firing Timers

  If you need a timer to execute immediately, you can always call the fire()
  method yourself.  This will execute the timer action, if the timer is not
  paused.  For a one time timer, it will also invalidate the timer and remove
  it from the run loop.  Repeating timers can be fired anytime and it will
  not interrupt their regular scheduled times.


  @extends SC.Object
  @author Charles Jolley
  @version 1.0
  @since version 1.0
*/
SC.Timer = SC.Object.extend(
/** @scope SC.Timer.prototype */ {

  /**
    The target object whose method will be invoked when the time fires.

    You can set either a target/action property or you can pass a specific
    method.

    @type {Object}
    @field
  */
  target: null,

  /**
    The action to execute.

    The action can be a method name, a property path, or a function.  If you
    pass a method name, it will be invoked on the target object or it will
    be called up the responder chain if target is null.  If you pass a
    property path and it resolves to a function then the function will be
    called.  If you pass a function instead, then the function will be
    called in the context of the target object.

    @type {String, Function}
  */
  action: null,

  /**
    Set if the timer should be created from a memory pool.  Normally you will
    want to leave this set, but if you plan to use bindings or observers with
    this timer, then you must set isPooled to NO to avoid reusing your timer.

    @property {Boolean}
  */
  isPooled: NO,

  /**
    The time interval in milliseconds.

    You generally set this when you create the timer.  If you do not set it
    then the timer will fire as soon as possible in the next run loop.

    @type {Number}
  */
  interval: 0,

  /**
    Timer start date offset.

    The start date determines when the timer will be scheduled.  The first
    time the timer fires will be interval milliseconds after the start
    date.

    Generally you will not set this property yourself.  Instead it will be
    set automatically to the current run loop start date when you schedule
    the timer.  This ensures that all timers scheduled in the same run loop
    cycle will execute in the sync with one another.

    The value of this property is an offset like what you get if you call
    Date.now().

    @type {Number}
  */
  startTime: null,

  /**
    YES if you want the timer to execute repeatedly.

    @type {Boolean}
  */
  repeats: NO,

  /**
    Last date when the timer will execute.

    If you have set repeats to YES, then you can also set this property to
    have the timer automatically stop executing past a certain date.

    This property should contain an offset value like startOffset.  However if
    you set it to a Date object on create, it will be converted to an offset
    for you.

    If this property is null, then the timer will continue to repeat until you
    call invalidate().

    @type {Date, Number}
  */
  until: null,

  /**
    Set to YES to pause the timer.

    Pausing a timer does not remove it from the run loop, but it will
    temporarily suspend it from firing.  You should use this property if
    you will want the timer to fire again the future, but you want to prevent
    it from firing temporarily.

    If you are done with a timer, you should call invalidate() instead of
    setting this property.

    @type {Boolean}
  */
  isPaused: NO,

  /**
    YES onces the timer has been scheduled for the first time.
  */
  isScheduled: NO,

  /**
    YES if the timer can still execute.

    This read only property will return YES as long as the timer may possibly
    fire again in the future.  Once a timer has become invalid, it cannot
    become valid again.

    @field
    @type {Boolean}
  */
  isValid: YES,

  /**
    Set to the current time when the timer last fired.  Used to find the
    next 'frame' to execute.
  */
  lastFireTime: 0,

  /**
    Computed property returns the next time the timer should fire.  This
    property resets each time the timer fires.  Returns -1 if the timer
    cannot fire again.

    @property {Time}
  */
  fireTime: function() {
    if (!this.get('isValid')) { return -1 ; }  // not valid - can't fire

    // can't fire w/o startTime (set when schedule() is called).
    var start = this.get('startTime');
    if (!start || start === 0) { return -1; }

    // fire interval after start.
    var interval = this.get('interval'), last = this.get('lastFireTime');
    if (last < start) { last = start; } // first time to fire

    // find the next time to fire
    var next ;
    if (this.get('repeats')) {
      if (interval === 0) { // 0 means fire as fast as possible.
        next = last ; // time to fire immediately!

      // find the next full interval after start from last fire time.
      } else {
        next = start + (Math.floor((last - start) / interval)+1)*interval;
      }

    // otherwise, fire only once interval after start
    } else {
      next = start + interval ;
    }

    // can never have a fireTime after until
    var until = this.get('until');
    if (until && until>0 && next>until) next = until;

    return next ;
  }.property('interval', 'startTime', 'repeats', 'until', 'isValid', 'lastFireTime').cacheable(),

  /**
    Schedules the timer to execute in the runloop.

    This method is called automatically if you create the timer using the
    schedule() class method.  If you create the timer manually, you will
    need to call this method yourself for the timer to execute.

    @returns {SC.Timer} The receiver
  */
  schedule: function() {
    if (!this.get('isValid')) return this; // nothing to do

    this.beginPropertyChanges();

    // if start time was not set explicitly when the timer was created,
    // get it from the run loop.  This way timer scheduling will always
    // occur in sync.
    if (!this.startTime) this.set('startTime', SC.RunLoop.currentRunLoop.get('startTime')) ;

    // now schedule the timer if the last fire time was < the next valid
    // fire time.  The first time lastFireTime is 0, so this will always go.
    var next = this.get('fireTime'), last = this.get('lastFireTime');
    if (next >= last) {
      this.set('isScheduled', YES);
      SC.RunLoop.currentRunLoop.scheduleTimer(this, next);
    }

    this.endPropertyChanges() ;

    return this ;
  },
  /**
    Invalidates the timer so that it will not execute again.  If a timer has
    been scheduled, it will be removed from the run loop immediately.

    @returns {SC.Timer} The receiver
  */
  invalidate: function() {
    this.beginPropertyChanges();
    this.set('isValid', NO);
    SC.RunLoop.currentRunLoop.cancelTimer(this);
    this.action = this.target = null ; // avoid memory leaks
    this.endPropertyChanges();

    // return to pool...
    if (this.get('isPooled')) SC.Timer.returnTimerToPool(this);
    return this ;
  },

  /**
    Immediately fires the timer.

    If the timer is not-repeating, it will be invalidated.  If it is repeating
    you can call this method without interrupting its normal schedule.

    @returns {void}
  */
  fire: function() {

    // this will cause the fireTime to recompute
    var last = Date.now();
    this.set('lastFireTime', last);

    var next = this.get('fireTime');

    // now perform the fire action unless paused.
    if (!this.get('isPaused')) this.performAction() ;

     // reschedule the timer if needed...
     if (next > last) {
       this.schedule();
     } else {
       this.invalidate();
     }
  },

  /**
    Actually fires the action. You can override this method if you need
    to change how the timer fires its action.
  */
  performAction: function() {
    var typeOfAction = SC.typeOf(this.action);

    // if the action is a function, just try to call it.
    if (typeOfAction == SC.T_FUNCTION) {
      this.action.call((this.target || this), this) ;

    // otherwise, action should be a string.  If it has a period, treat it
    // like a property path.
    } else if (typeOfAction === SC.T_STRING) {
      if (this.action.indexOf('.') >= 0) {
        var path = this.action.split('.') ;
        var property = path.pop() ;

        var target = SC.objectForPropertyPath(path, window) ;
        var action = target.get ? target.get(property) : target[property];
        if (action && SC.typeOf(action) == SC.T_FUNCTION) {
          action.call(target, this) ;
        } else {
          throw '%@: Timer could not find a function at %@'.fmt(this, this.action) ;
        }

      // otherwise, try to execute action direction on target or send down
      // responder chain.
      } else {
        SC.RootResponder.responder.sendAction(this.action, this.target, this);
      }
    }
  },

  init: function() {
    arguments.callee.base.apply(this,arguments);

    // convert startTime and until to times if they are dates.
    if (this.startTime instanceof Date) {
      this.startTime = this.startTime.getTime() ;
    }

    if (this.until instanceof Date) {
      this.until = this.until.getTime() ;
    }
  },

  /** @private - Default values to reset reused timers to. */
  RESET_DEFAULTS: {
    target: null, action: null,
    isPooled: NO, isPaused: NO, isScheduled: NO, isValid: YES,
    interval: 0, repeats: NO, until: null,
    startTime: null, lastFireTime: 0
  },

  /**
    Resets the timer settings with the new settings.  This is the method
    called by the Timer pool when a timer is reused.  You will not normally
    call this method yourself, though you could override it if you need to
    reset additonal properties when a timer is reused.

    @params {Hash} props properties to copy over
    @returns {SC.Timer} receiver
  */
  reset: function(props) {
    if (!props) props = SC.EMPTY_HASH;

    // note: we copy these properties manually just to make them fast.  we
    // don't expect you to use observers on a timer object if you are using
    // pooling anyway so this won't matter.  Still notify of property change
    // on fireTime to clear its cache.
    this.propertyWillChange('fireTime');
    var defaults = this.RESET_DEFAULTS ;
    for(var key in defaults) {
      if (!defaults.hasOwnProperty(key)) continue ;
      this[key] = SC.none(props[key]) ? defaults[key] : props[key];
    }
    this.propertyDidChange('fireTime');
    return this ;
  },

  // ..........................................................
  // TIMER QUEUE SUPPORT
  //

  /** @private - removes the timer from its current timerQueue if needed.
    return value is the new "root" timer.
  */
  removeFromTimerQueue: function(timerQueueRoot) {
    var prev = this._timerQueuePrevious, next = this._timerQueueNext ;

    if (!prev && !next && timerQueueRoot !== this) return timerQueueRoot ; // not in a queue...

    // else, patch up to remove...
    if (prev) prev._timerQueueNext = next ;
    if (next) next._timerQueuePrevious = prev ;
    this._timerQueuePrevious = this._timerQueueNext = null ;
    return (timerQueueRoot === this) ? next : timerQueueRoot ;
  },

  /** @private - schedules the timer in the queue based on the runtime. */
  scheduleInTimerQueue: function(timerQueueRoot, runTime) {
    this._timerQueueRunTime = runTime ;

    // find the place to begin
    var beforeNode = timerQueueRoot;
    var afterNode = null ;
    while(beforeNode && beforeNode._timerQueueRunTime < runTime) {
      afterNode = beforeNode ;
      beforeNode = beforeNode._timerQueueNext;
    }

    if (afterNode) {
      afterNode._timerQueueNext = this ;
      this._timerQueuePrevious = afterNode ;
    }

    if (beforeNode) {
      beforeNode._timerQueuePrevious = this ;
      this._timerQueueNext = beforeNode ;
    }

    // I am the new root if beforeNode === root
    return (beforeNode === timerQueueRoot) ? this : timerQueueRoot ;
  },

  /** @private
    adds the receiver to the passed array of expired timers based on the
    current time and then recursively calls the next timer.  Returns the
    first timer that is not expired.  This is faster than iterating through
    the timers because it does some faster cleanup of the nodes.
  */
  collectExpiredTimers: function(timers, now) {
    if (this._timerQueueRunTime > now) return this ; // not expired!
    timers.push(this);  // add to queue.. fixup next. assume we are root.
    var next = this._timerQueueNext ;
    this._timerQueueNext = null;
    if (next) next._timerQueuePrevious = null;
    return next ? next.collectExpiredTimers(timers, now) : null;
  }

}) ;

/** @scope SC.Timer */

/*
  Created a new timer with the passed properties and schedules it to
  execute.  This is the same as calling SC.Time.create({ props }).schedule().

  Note that unless you explicitly set isPooled to NO, this timer will be
  pulled from a shared memory pool of timers.  You cannot using bindings or
  observers on these timers as they may be reused for future timers at any
  time.

  @params {Hash} props Any properties you want to set on the timer.
  @returns {SC.Timer} new timer instance.
*/
SC.Timer.schedule = function(props) {
  // get the timer.
  var timer ;
  if (!props || SC.none(props.isPooled) || props.isPooled) {
    timer = this.timerFromPool(props);
  } else timer = this.create(props);
  return timer.schedule();
} ;

/**
  Returns a new timer from the timer pool, copying the passed properties onto
  the timer instance.  If the timer pool is currently empty, this will return
  a new instance.
*/
SC.Timer.timerFromPool = function(props) {
  var timers = this._timerPool;
  if (!timers) timers = this._timerPool = [] ;
  var timer = timers.pop();
  if (!timer) timer = this.create();
  return timer.reset(props) ;
};

/**
  Returns a timer instance to the timer pool for later use.  This is done
  automatically when a timer is invalidated if isPooled is YES.
*/
SC.Timer.returnTimerToPool = function(timer) {
  if (!this._timerPool) this._timerPool = [];

  this._timerPool.push(timer);
  return this ;
};



/* >>>>>>>>>> BEGIN source/system/utils.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// These are helpful utility functions for calculating range and rect values
sc_require('system/browser');

SC.mixin( /** @scope SC */ {

  /**
    Takes a URL of any type and normalizes it into a fully qualified URL with
    hostname.  For example:

        "some/path" => "http://localhost:4020/some/path"
        "/some/path" => "http://localhost:4020/some/path"
        "http://localhost:4020/some/path" => "http://localhost:4020/some/path"

    @param url {String} the URL
    @returns {String} the normalized URL
  */
  normalizeURL: function(url) {
    if (url.slice(0,1) == '/') {
      url = window.location.protocol + '//' + window.location.host + url ;
    } else if ((url.slice(0,5) == 'http:') || (url.slice(0,6) == 'https:')) {
      // no change
    } else {
      url = window.location.href + '/' + url ;
    }
    return url ;
  },

  /** Return true if the number is between 0 and 1 */
  isPercentage: function(val){
    return (val<1 && val>0);
  },

  /** Return the left edge of the frame */
  minX: function(frame) {
    return frame.x || 0;
  },

  /** Return the right edge of the frame. */
  maxX: function(frame) {
    return (frame.x || 0) + (frame.width || 0);
  },

  /** Return the midpoint of the frame. */
  midX: function(frame) {
    return (frame.x || 0) + ((frame.width || 0) / 2) ;
  },

  /** Return the top edge of the frame */
  minY: function(frame) {
    return frame.y || 0 ;
  },

  /** Return the bottom edge of the frame */
  maxY: function(frame) {
    return (frame.y || 0) + (frame.height || 0) ;
  },

  /** Return the midpoint of the frame */
  midY: function(frame) {
    return (frame.y || 0) + ((frame.height || 0) / 2) ;
  },

  /** Returns the point that will center the frame X within the passed frame. */
  centerX: function(innerFrame, outerFrame) {
    return (outerFrame.width - innerFrame.width) / 2 ;
  },

  /** Return the point that will center the frame Y within the passed frame. */
  centerY: function(innerFrame, outerFrame) {
    return (outerFrame.height - innerFrame.height) /2  ;
  },

  /**
    The offset of an element.

    This function returns the left and top offset of an element with respect to either the document, the
    viewport or the element's parent element.  In standard SproutCore applications, the coordinates of the
    viewport are equivalent to the document, but a HTML5 application that wishes to use this component
    of SproutCore might need to properly distinguish between the two.

    For a useful discussion on the concepts of offsets and coordinates, see:
    http://www.quirksmode.org/mobile/viewports.html.

    @param {DOMElement|jQuery|String} elem the element to find the offset of.
      This is passed to `jQuery()`, so any value supported by `jQuery()` will work.
    @param {String} relativeToFlag flag to determine which relative element to determine offset by.
      One of either: 'document', 'viewport' or 'parent' (default: 'document').
    @returns {Object} the offset of the element as an Object (ie. Hash) in the form { x: value, y: value }.
   */
  offset: function(elem, relativeToFlag) {
    var userAgent,
        index,
        mobileBuildNumber,
        result;

    relativeToFlag = relativeToFlag || 'document';

    if (relativeToFlag === 'parent') {
      result = jQuery(elem).position();
    } else {
      result = jQuery(elem).offset();

      // jQuery does not workaround a problem with Mobile Safari versions prior to 4.1 that add the scroll
      // offset to the results of getBoundingClientRect.
      //
      // See http://dev.jquery.it/ticket/6446
      if (SC.browser.mobileSafari) {
        userAgent = navigator.userAgent;
        index = userAgent.indexOf('Mobile/');
        mobileBuildNumber = userAgent.substring(index + 7, index + 9);

        if (parseInt(SC.browser.mobileSafari, 0) <= 532 || (mobileBuildNumber <= "8A")) {
          result.left -= window.pageXOffset;
          result.top -= window.pageYOffset;
        }
      }

      // Subtract the scroll offset for viewport coordinates
      if (relativeToFlag === 'viewport') {
        
        if(SC.browser.isIE8OrLower){
          result.left -= $(window).scrollLeft();
          result.top -= $(window).scrollTop();
        }else{
          result.left -= window.pageXOffset;
          result.top -= window.pageYOffset;
        }
      }
    }

    // Translate 'left', 'top' to 'x', 'y'
    
    try{
      result.x = result.left;
      result.y = result.top;
    } catch (e) {
      // We need this for IE, when the element is detached, for some strange 
      // reason the object returned by element.getBoundingClientRect() 
      // is read-only
      result = {x:result.left, y:result.top};
    }
    delete result.left;
    delete result.top;

    return result;
  },

  /**
    @deprecated Use SC.offset instead.

    SC.offset() is more accurate, more flexible in the value for the element parameter and
    easier to understand.

    @param el The DOM element
    @returns {Point} A hash with x, y offsets.
  */
  viewportOffset: function(el) {
    console.warn("SC.viewportOffset() has been deprecated in favor of SC.offset().  Please use SC.offset() from here on.");
    var result = SC.offset(el, 'viewport');

    return {x: result.left, y: result.top};
  }

}) ;

/* >>>>>>>>>> BEGIN source/system/utils/rect.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
SC.mixin( /** @scope SC */ {
  /** A Point at {0,0} */
  ZERO_POINT: { x: 0, y: 0 },

  /** Check if the given point is inside the rect. */
  pointInRect: function(point, f) {
    return  (point.x >= SC.minX(f)) &&
            (point.y >= SC.minY(f)) &&
            (point.x <= SC.maxX(f)) &&
            (point.y <= SC.maxY(f)) ;
  },

  /** Return true if the two frames match.  You can also pass only points or sizes.

    @param r1 {Rect} the first rect
    @param r2 {Rect} the second rect
    @param delta {Float} an optional delta that allows for rects that do not match exactly. Defaults to 0.1
    @returns {Boolean} true if rects match
   */
  rectsEqual: function(r1, r2, delta) {
    if (!r1 || !r2) return (r1 == r2) ;
    if (!delta && delta !== 0) delta = 0.1;
    if ((r1.y != r2.y) && (Math.abs(r1.y - r2.y) > delta)) return NO ;
    if ((r1.x != r2.x) && (Math.abs(r1.x - r2.x) > delta)) return NO ;
    if ((r1.width != r2.width) && (Math.abs(r1.width - r2.width) > delta)) return NO ;
    if ((r1.height != r2.height) && (Math.abs(r1.height - r2.height) > delta)) return NO ;
    return YES ;
  },

  /** Returns the insersection between two rectangles.

    @param r1 {Rect} The first rect
    @param r2 {Rect} the second rect
    @returns {Rect} the intersection rect.  width || height will be 0 if they do not interset.
  */
  intersectRects: function(r1, r2) {
    // find all four edges
    var ret = {
      x: Math.max(SC.minX(r1), SC.minX(r2)),
      y: Math.max(SC.minY(r1), SC.minY(r2)),
      width: Math.min(SC.maxX(r1), SC.maxX(r2)),
      height: Math.min(SC.maxY(r1), SC.maxY(r2))
    } ;

    // convert edges to w/h
    ret.width = Math.max(0, ret.width - ret.x) ;
    ret.height = Math.max(0, ret.height - ret.y) ;
    return ret ;
  },

  /** Returns the union between two rectangles

    @param r1 {Rect} The first rect
    @param r2 {Rect} The second rect
    @returns {Rect} The union rect.
  */
  unionRects: function(r1, r2) {
    // find all four edges
    var ret = {
      x: Math.min(SC.minX(r1), SC.minX(r2)),
      y: Math.min(SC.minY(r1), SC.minY(r2)),
      width: Math.max(SC.maxX(r1), SC.maxX(r2)),
      height: Math.max(SC.maxY(r1), SC.maxY(r2))
    } ;

    // convert edges to w/h
    ret.width = Math.max(0, ret.width - ret.x) ;
    ret.height = Math.max(0, ret.height - ret.y) ;
    return ret ;
  },

  /** Duplicates the passed rect.

    This is faster than Object.clone().

    @param r {Rect} The rect to clone.
    @returns {Rect} The cloned rect
  */
  cloneRect: function(r) {
    return { x: r.x, y: r.y, width: r.width, height: r.height } ;
  },

  /** Returns a string representation of the rect as {x, y, width, height}.

    @param r {Rect} The rect to stringify.
    @returns {String} A string representation of the rect.
  */
  stringFromRect: function(r) {
    if (!r) {
      return "(null)";
    }
    else {
      return '{x:'+r.x+', y:'+r.y+', width:'+r.width+', height:'+r.height+'}';
    }
  }


});

/* >>>>>>>>>> BEGIN source/views/bindable_span.js */
sc_require('views/template');

/** @private
  @class

  SC._BindableSpan is a private view created by the Handlebars {{bind}} helpers
  that is used to keep track of bound properties.

  Every time a property is bound using a {{mustache}}, an anonymous subclass of
  SC._BindableSpan is created with the appropriate sub-template and context
  set up. When the associated property changes, just the template for this view
  will re-render.
*/
SC._BindableSpan = SC.TemplateView.extend(
  /** @scope SC._BindableSpan.prototype */{
  /**
   The type of HTML tag to use. To ensure compatibility with
   Internet Explorer 7, a <span> tag is used to ensure that inline elements are
   not rendered with display: block.

   @property {String}
  */
  tagName: 'span',

  /**
    The function used to determine if the +displayTemplate+ or
    +inverseTemplate+ should be rendered. This should be a function that takes
    a value and returns a Boolean.

    @property {Function}
  */
  shouldDisplayFunc: null,

  /**
    Whether the template rendered by this view gets passed the context object
    of its parent template, or gets passed the value of retrieving +property+
    from the previous context.

    For example, this is YES when using the {{#if}} helper, because the template
    inside the helper should look up properties relative to the same object as
    outside the block. This would be NO when used with +{{#with foo}}+ because
    the template should receive the object found by evaluating +foo+.

    @property {Boolean}
  */
  preserveContext: NO,

  /**
    The template to render when +shouldDisplayFunc+ evaluates to YES.

    @property {Function}
  */
  displayTemplate: null,

  /**
    The template to render when +shouldDisplayFunc+ evaluates to NO.

    @property {Function}
  */
  inverseTemplate: null,

  /**
    The key to look up on +previousContext+ that is passed to
    +shouldDisplayFunc+ to determine which template to render.

    In addition, if +preserveContext+ is NO, this object will be passed to the
    template when rendering.

    @property {String}
  */
  property: null,

  /**
    Determines which template to invoke, sets up the correct state based on
    that logic, then invokes the default SC.TemplateView +render+
    implementation.

    This method will first look up the +property+ key on +previousContext+,
    then pass that value to the +shouldDisplayFunc+ function. If that returns
    YES, the +displayTemplate+ function will be rendered to DOM. Otherwise,
    +inverseTemplate+, if specified, will be rendered.

    For example, if this SC._BindableSpan represented the {{#with foo}} helper,
    it would look up the +foo+ property of its context, and +shouldDisplayFunc+
    would always return true. The object found by looking up +foo+ would be
    passed to +displayTemplate+.

    @param {SC.RenderContext} renderContext}
  */
  render: function(renderContext) {
    var shouldDisplay = this.get('shouldDisplayFunc'),
        property = this.get('property'),
        preserveContext = this.get('preserveContext'),
        context = this.get('previousContext');

    var inverseTemplate = this.get('inverseTemplate'),
        displayTemplate = this.get('displayTemplate');

    var result = context.getPath(property);

    // First, test the conditional to see if we should
    // render the template or not.
    if (shouldDisplay(result)) {
      this.set('template', displayTemplate);

      // If we are preserving the context (for example, if this
      // is an #if block, call the template with the same object.
      if (preserveContext) {
        this.set('context', context);
      } else {
      // Otherwise, determine if this is a block bind or not.
      // If so, pass the specified object to the template
        if (displayTemplate) {
          this.set('context', result);
        } else {
        // This is not a bind block, just push the result of the
        // expression to the render context and return.
          renderContext.push(Handlebars.Utils.escapeExpression(result));
          return;
        }
      }
    } else if (inverseTemplate) {
      this.set('template', inverseTemplate);

      if (preserveContext) {
        this.set('context', context);
      } else {
        this.set('context', result);
      }
    } else {
      this.set('template', function() { return ''; });
    }

    return arguments.callee.base.apply(this,arguments);
  },

  /**
    Called when the property associated with this <span> changes.

    We destroy all registered children, then render the view again and insert
    it into DOM.
  */
  rerender: function() {
    var idx, len, childViews, childView;

    childViews = this.get('childViews');
    len = childViews.get('length');
    for (idx = len-1; idx >= 0; idx--){
      childView = childViews[idx];
      childView.$().remove();
      childView.removeFromParent();
      childView.destroy();
    }

    var context = this.renderContext(this.get('tagName'));
    var elem;
    this.renderToContext(context);

    elem = context.element();
    this.$().replaceWith(elem);
    this.set('layer', elem);
    this._notifyDidCreateLayer();
  }
});


/* >>>>>>>>>> BEGIN source/views/template_collection.js */
sc_require('views/template');

/** @class

  @author Tom Dale
  @author Yehuda Katz
  @extends SC.TemplateView
  @since SproutCore 1.5
*/
SC.TemplateCollectionView = SC.TemplateView.extend(
  /** @scope SC.TemplateCollectionView.prototype */{
  /**
    Name of the tag that is used for the collection

    If the tag is a list ('ul' or 'ol') each item will be wrapped into a 'li' tag.
    If the tag is a table ('table', 'thead', 'tbody') each item will be wrapped into a 'tr' tag.

    @property {String}
    @default ul
  */
  tagName: 'ul',
  content: null,
  template: SC.Handlebars.compile(''),
  emptyView: null,

  /**
    @private
    When the view is initialized, set up array observers on the content array.

    @returns SC.TemplateCollectionView
  */
  init: function() {
    var templateCollectionView = arguments.callee.base.apply(this,arguments);
    this._sctcv_contentDidChange();
    return templateCollectionView;
  },

  // In case a default content was set, trigger the child view creation
  // as soon as the empty layer was created
  didCreateLayer: function() {
    // FIXME: didCreateLayer gets called multiple times when template collection
    // views are nested - this is a hack to avoid rendering the content more
    // than once.
    if (this._sctcv_layerCreated) { return; }
    this._sctcv_layerCreated = true;

    var content = this.get('content');
    if(content) {
      this.arrayContentDidChange(0, 0, content.get('length'));
    }
  },

  itemView: 'SC.TemplateView',

  /**
    The template used to render each item in the collection.

    This should be a function that takes a content object and returns
    a string of HTML that will be inserted into the DOM.

    In general, you should set the `itemViewTemplateName` property instead of
    setting the `itemViewTemplate` property yourself. If you created the
    SC.TemplateCollectionView using the Handlebars {{#collection}} helper, this
    will be set for you automatically.

    @type Function
  */
  itemViewTemplate: null,

  /**
    The name of the template to lookup if no item view template is provided.

    The collection will look for a template with this name in the global
    `SC.TEMPLATES` hash. Usually this hash will be populated for you
    automatically when you include `.handlebars` files in your project.

    @type String
  */
  itemViewTemplateName: null,

  /**
    A template to render when there is no content or the content length is 0.
  */
  inverseTemplate: function(key, value) {
    if (value !== undefined) {
      return value;
    }

    var templateName = this.get('inverseTemplateName'),
        template = this.get('templates').get(templateName);

    if (!template) {
      
      if (templateName) {
        SC.Logger.warn('%@ - Unable to find template "%@".'.fmt(this, templateName));
      }
      

      return function() { return ''; };
    }

    return template;
  }.property('inverseTemplateName').cacheable(),

  /**
    The name of a template to lookup if no inverse template is provided.

    @property {String}
  */
  inverseTemplateName: null,

  itemContext: null,

  itemViewClass: function() {
    var itemView = this.get('itemView');
    var itemViewTemplate = this.get('itemViewTemplate');
    var itemViewTemplateName = this.get('itemViewTemplateName');

    // hash of properties to override in our
    // item view class
    var extensions = {};

    if(SC.typeOf(itemView) === SC.T_STRING) {
      itemView = SC.objectForPropertyPath(itemView);
    }

    if (!itemViewTemplate && itemViewTemplateName) {
      itemViewTemplate = this.get('templates').get(itemViewTemplateName);
    }

    if (itemViewTemplate) {
      extensions.template = itemViewTemplate;
    }

    if (this.get('tagName') === 'ul' || this.get('tagName') === 'ol') {
      extensions.tagName = 'li';
    } else if (this.get('tagName') === 'table' || this.get('tagName') === 'thead' || this.get('tagName') === 'tbody') {
      extensions.tagName = 'tr';
    }

    return itemView.extend(extensions);
  }.property('itemView').cacheable(),

  /**
    @private

    When the content property of the collection changes, remove any existing
    child views and observers, then set up an observer on the new content, if
    needed.
  */
  _sctcv_contentDidChange: function() {

    this.$().empty();

    var oldContent = this._content, oldLen = 0;
    var content = this.get('content'), newLen = 0;

    if (oldContent) {
      oldContent.removeArrayObservers({
        target: this,
        willChange: 'arrayContentWillChange',
        didChange: 'arrayContentDidChange'
      });

      oldLen = oldContent.get('length');
    }

    if (content) {
      content.addArrayObservers({
        target: this,
        willChange: 'arrayContentWillChange',
        didChange: 'arrayContentDidChange'
      });

      newLen = content.get('length');
    }

    this.arrayContentWillChange(0, oldLen, newLen);
    this._content = this.get('content');
    this.arrayContentDidChange(0, oldLen, newLen);
  }.observes('content'),

  arrayContentWillChange: function(start, removedCount, addedCount) {
    if (!this.get('layer')) { return; }

    // If the contents were empty before and this template collection has an empty view
    // remove it now.
    var emptyView = this.get('emptyView');
    if (emptyView) { emptyView.$().remove(); emptyView.removeFromParent(); }

    // Loop through child views that correspond with the removed items.
    // Note that we loop from the end of the array to the beginning because
    // we are mutating it as we go.
    var childViews = this.get('childViews'), childView, idx, len;

    len = childViews.get('length');
    for (idx = start+removedCount-1; idx >= start; idx--) {
      childView = childViews[idx];
      childView.$().remove();
      childView.removeFromParent();
      childView.destroy();
    }
  },

  /**
    Called when a mutation to the underlying content array occurs.

    This method will replay that mutation against the views that compose the
    SC.TemplateCollectionView, ensuring that the view reflects the model.

    This enumerable observer is added in contentDidChange.

    @param {Array} addedObjects the objects that were added to the content
    @param {Array} removedObjects the objects that were removed from the content
    @param {Number} changeIndex the index at which the changes occurred
  */
  arrayContentDidChange: function(start, removedCount, addedCount) {
    if (!this.get('layer')) { return; }

    var content       = this.get('content'),
        itemViewClass = this.get('itemViewClass'),
        childViews    = this.get('childViews'),
        addedViews    = [],
        renderFunc, childView, itemOptions, elem, insertAtElement, item, itemElem, idx, len;

    if (content) {
      var addedObjects = content.slice(start, start+addedCount);

      // If we have content to display, create a view for
      // each item.
      itemOptions = this.get('itemViewOptions') || {};

      elem = this.$();
      insertAtElement = elem.find('li')[start-1] || null;
      len = addedObjects.get('length');

      // TODO: This logic is duplicated from the view helper. Refactor
      // it so we can share logic.
      var itemAttrs = {
        "id": itemOptions.id,
        "class": itemOptions['class'],
        "classBinding": itemOptions.classBinding
      };

      renderFunc = function(context) {
        arguments.callee.base.apply(this,arguments);
        SC.Handlebars.ViewHelper.applyAttributes(itemAttrs, this, context);
      };

      itemOptions = SC.clone(itemOptions);
      delete itemOptions.id;
      delete itemOptions['class'];
      delete itemOptions.classBinding;

    for (idx = 0; idx < len; idx++) {
      item = addedObjects.objectAt(idx);
      childView = this.createChildView(itemViewClass.extend(itemOptions, {
        content: item,
        render: renderFunc,
        tagName: itemViewClass.prototype.tagName || this.get('itemTagName')
      }));

      var contextProperty = childView.get('contextProperty');
      if (contextProperty) {
        childView.set('context', childView.get(contextProperty));
      }

      itemElem = childView.createLayer().$();
      if (!insertAtElement) {
        elem.append(itemElem);
      } else {
        itemElem.insertAfter(insertAtElement);
      }
      insertAtElement = itemElem;

      addedViews.push(childView);
    }

      childViews.replace(start, 0, addedViews);
    }

    var inverseTemplate = this.get('inverseTemplate');
    if (childViews.get('length') === 0 && inverseTemplate) {
      childView = this.createChildView(SC.TemplateView.extend({
        template: inverseTemplate,
        content: this
      }));
      this.set('emptyView', childView);
      childView.createLayer().$().appendTo(elem);
      this.childViews = [childView];
    }

    // Because the layer has been modified, we need to invalidate the frame
    // property, if it exists, at the end of the run loop. This allows it to
    // be used inside of SC.ScrollView.
    this.invokeLast('invalidateFrame');
  },

  itemTagName: function() {
    switch(this.get('tagName')) {
      case 'ul':
      case 'ol':
        return 'li';
      case 'table':
      case 'thead':
      case 'tbody':
      case 'tfoot':
        return 'tr';
    }
  }.property('tagName'),

  invalidateFrame: function() {
    this.notifyPropertyChange('frame');
  }
});


/* >>>>>>>>>> BEGIN source/views/view/layout_style.js */

sc_require('ext/string');
sc_require('views/view');
sc_require('views/view/animation');

/**
  Map to CSS Transforms
*/

SC.CSS_TRANSFORM_MAP = {
  rotate: function(val){
    return null;
  },

  rotateX: function(val){
    if (SC.typeOf(val) === SC.T_NUMBER) val += 'deg';
    return 'rotateX('+val+')';
  },

  rotateY: function(val){
    if (SC.typeOf(val) === SC.T_NUMBER) val += 'deg';
    return 'rotateY('+val+')';
  },

  rotateZ: function(val){
    if (SC.typeOf(val) === SC.T_NUMBER) val += 'deg';
    return 'rotateZ('+val+')';
  },

  scale: function(val){
    if (SC.typeOf(val) === SC.T_ARRAY) val = val.join(', ');
    return 'scale('+val+')';
  }
};

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  layoutStyleCalculator: null,

  /**
    layoutStyle describes the current styles to be written to your element
    based on the layout you defined.  Both layoutStyle and frame reset when
    you edit the layout property.  Both are read only.

    Computes the layout style settings needed for the current anchor.

    @property {Hash}
    @readOnly
  */
  layoutStyle: function() {
    var props = {
      layout:       this.get('layout'),
      turbo:        this.get('hasAcceleratedLayer'),
      staticLayout: this.get('useStaticLayout')
    };

    var calculator = this.get('layoutStyleCalculator');
    calculator.set(props);

    return calculator.calculate();
  }.property().cacheable()
});

SC.View.LayoutStyleCalculator = SC.Object.extend({

  _layoutDidUpdate: function(){
    var layout = this.get('layout');
    if (!layout) { return; }

    this.dims = SC._VIEW_DEFAULT_DIMS;
    this.loc = this.dims.length;

    // loose comparison used instead of (value === null || value === undefined)

    var right = (this.right = layout.right);
    this.hasRight = (right != null);

    var left = (this.left = layout.left);
    this.hasLeft = (left != null);

    var top = (this.top = layout.top);
    this.hasTop = (top != null);

    var bottom = (this.bottom = layout.bottom);
    this.hasBottom = (bottom != null);

    var width = (this.width = layout.width);
    this.hasWidth = (width != null);

    var height = (this.height = layout.height);
    this.hasHeight = (height != null);

    this.minWidth = ((layout.minWidth === undefined) ? null : layout.minWidth);

    var maxWidth = (this.maxWidth = (layout.maxWidth === undefined) ? null : layout.maxWidth);
    this.hasMaxWidth = (maxWidth != null);

    this.minHeight = (layout.minHeight === undefined) ? null : layout.minHeight;

    var maxHeight = (this.maxHeight = (layout.maxHeight === undefined) ? null : layout.maxHeight);
    this.hasMaxHeight = (maxHeight != null);

    var centerX = (this.centerX = layout.centerX);
    this.hasCenterX = (centerX != null);

    var centerY = (this.centerY = layout.centerY);
    this.hasCenterY = (centerY != null);

    var borderTop = (this.borderTop = ((layout.borderTop !== undefined) ? layout.borderTop : layout.border) || 0);
    var borderRight = (this.borderRight = ((layout.borderRight !== undefined) ? layout.borderRight : layout.border) || 0);
    var borderBottom = (this.borderBottom = ((layout.borderBottom !== undefined) ? layout.borderBottom : layout.border) || 0);
    var borderLeft = (this.borderLeft = ((layout.borderLeft !== undefined) ? layout.borderLeft : layout.border) || 0);

    // the toString here is to ensure that it doesn't get px added to it
    this.zIndex  = (layout.zIndex  != null) ? layout.zIndex.toString() : null;
    this.opacity = (layout.opacity != null) ? layout.opacity.toString() : null;

    this.backgroundPosition = (layout.backgroundPosition != null) ? layout.backgroundPosition : null;

    this.ret = {
      marginTop: null,
      marginLeft: null
    };

  }.observes('layout'),

  // handles the case where you do width:auto or height:auto and are not using "staticLayout"
  _invalidAutoValue: function(property){
    var error = SC.Error.desc("%@.layout() you cannot use %@:auto if staticLayout is disabled".fmt(
      this.get('view'), property), "%@".fmt(this.get('view')),-1);
    SC.Logger.error(error.toString());
    throw error ;
  },

  _handleMistakes: function() {
    var layout = this.get('layout');

    // handle invalid use of auto in absolute layouts
    if(!this.staticLayout) {
      if (this.width === SC.LAYOUT_AUTO) { this._invalidAutoValue("width"); }
      if (this.height === SC.LAYOUT_AUTO) { this._invalidAutoValue("height"); }
    }

    if (SC.platform.supportsCSSTransforms) {
      // Check to see if we're using transforms
      var animations = layout.animate,
          transformAnimationDuration,
          key;

      if (animations) {
        for(key in animations){
          if (SC.CSS_TRANSFORM_MAP[key]) {
            // To prevent:
            //   this.animate('scale', ...);
            //   this.animate('rotate', ...);
            // Use this instead
            //   this.animate({ scale: ..., rotate: ... }, ...);
            if (this._pendingAnimations && this._pendingAnimations['-'+SC.platform.cssPrefix+'-transform']) {
              throw "Animations of transforms must be executed simultaneously!";
            }

            // Because multiple transforms actually share one CSS property, we can't animate multiple transforms
            // at different speeds. So, to handle that case, we just force them to all have the same length.

            // First time around this will never be true, but we're concerned with subsequent runs.
            if (transformAnimationDuration && animations[key].duration !== transformAnimationDuration) {
              SC.Logger.warn("Can't animate transforms with different durations! Using first duration specified.");
              animations[key].duration = transformAnimationDuration;
            }

            transformAnimationDuration = animations[key].duration;
          }
        }
      }
    }
  },

  _calculatePosition: function(direction) {
    var translate = null, turbo = this.get('turbo'), ret = this.ret;

    var start, finish, size, maxSize, margin,
        hasStart, hasFinish, hasSize, hasMaxSize,
        startBorder, startBorderVal,
        finishBorder, finishBorderVal,
        sizeNum;

    if (direction === 'x') {
      start      = 'left';
      finish     = 'right';
      size       = 'width';
      maxSize    = 'maxWidth';
      margin     = 'marginLeft';
      startBorder  = 'borderLeft';
      finishBorder = 'borderRight';
      hasStart   = this.hasLeft;
      hasFinish  = this.hasRight;
      hasSize    = this.hasWidth;
      hasMaxSize = this.hasMaxWidth;
    } else {
      start      = 'top';
      finish     = 'bottom';
      size       = 'height';
      maxSize    = 'maxHeight';
      margin     = 'marginTop';
      startBorder  = 'borderTop';
      finishBorder = 'borderBottom';
      hasStart   = this.hasTop;
      hasFinish  = this.hasBottom;
      hasSize    = this.hasHeight;
      hasMaxSize = this.hasMaxHeight;
    }

    ret[start]  = this._cssNumber(this[start]);
    ret[finish] = this._cssNumber(this[finish]);

    startBorderVal = this._cssNumber(this[startBorder]);
    finishBorderVal = this._cssNumber(this[finishBorder]);
    ret[startBorder+'Width'] = startBorderVal || null;
    ret[finishBorder+'Width'] = finishBorderVal || null;

    sizeNum = this[size];
    // This is a normal number
    if (sizeNum >= 1) { sizeNum -= (startBorderVal + finishBorderVal); }
    ret[size] = this._cssNumber(sizeNum);


    if(hasStart) {
      if (turbo) {
        translate = ret[start];
        ret[start] = 0;
      }

      // top, bottom, height -> top, bottom
      if (hasFinish && hasSize)  { ret[finish] = null; }
    } else {
      // bottom aligned
      if(!hasFinish || (hasFinish && !hasSize && !hasMaxSize)) {
        // no top, no bottom
        ret[start] = 0;
      }
    }

    if (!hasSize && !hasFinish) { ret[finish] = 0; }

    return translate;
  },

  _calculateCenter: function(direction) {
    var ret = this.ret,
        size, center, start, finish, margin,
        startBorder, startBorderVal,
        finishBorder, finishBorderVal;

    if (direction === 'x') {
        size   = 'width';
        center = 'centerX';
        start  = 'left';
        finish = 'right';
        margin = 'marginLeft';
        startBorder  = 'borderLeft';
        finishBorder = 'borderRight';
    } else {
        size   = 'height';
        center = 'centerY';
        start  = 'top';
        finish = 'bottom';
        margin = 'marginTop';
        startBorder  = 'borderTop';
        finishBorder = 'borderBottom';
    }

    ret[start] = "50%";

    startBorderVal = this._cssNumber(this[startBorder]);
    finishBorderVal = this._cssNumber(this[finishBorder]);
    ret[startBorder+'Width'] = startBorderVal || null;
    ret[finishBorder+'Width'] = finishBorderVal || null;


    var sizeValue   = this[size],
        centerValue = this[center],
        startValue  = this[start];

    var sizeIsPercent = SC.isPercentage(sizeValue), centerIsPercent = SC.isPercentage(centerValue, YES);

    // If > 1 then it should be a normal number value
    if (sizeValue > 1) { sizeValue -= (startBorderVal + finishBorderVal); }

    if((sizeIsPercent && centerIsPercent) || (!sizeIsPercent && !centerIsPercent)) {
      var value = centerValue - sizeValue/2;
      ret[margin] = (sizeIsPercent) ? Math.floor(value * 100) + "%" : Math.floor(value);
    } else {
      // This error message happens whenever height is not set.
      SC.Logger.warn("You have to set "+size+" and "+center+" using both percentages or pixels");
      ret[margin] = "50%";
    }

    ret[size] = this._cssNumber(sizeValue) || 0;
    ret[finish] = null;
  },

  _calculateTransforms: function(translateLeft, translateTop){
    if (SC.platform.supportsCSSTransforms) {
      // Handle transforms
      var layout = this.get('layout');
      var transformAttribute = SC.platform.domCSSPrefix+'Transform';
      var transforms = [];

      if (this.turbo) {
        // FIXME: Can we just set translateLeft / translateTop to 0 earlier?
        transforms.push('translateX('+(translateLeft || 0)+'px)', 'translateY('+(translateTop || 0)+'px)');

        // double check to make sure this is needed
        if (SC.platform.supportsCSS3DTransforms) { transforms.push('translateZ(0px)'); }
      }

      // normalizing transforms like rotateX: 5 to rotateX(5deg)
      var transformMap = SC.CSS_TRANSFORM_MAP;
      for(var transformName in transformMap) {
        var layoutTransform = layout[transformName];

        if(layoutTransform != null) {
          transforms.push(transformMap[transformName](layoutTransform));
        }
      }

      this.ret[transformAttribute] = transforms.length > 0 ? transforms.join(' ') : null;
    }
  },

  _calculateAnimations: function(translateLeft, translateTop){
    var layout = this.layout,
        animations = layout.animate,
        key;

    // we're checking to see if the layout update was triggered by a call to .animate
    if (!animations) { return; }

    // TODO: Deprecate SC.Animatable
    if(this.getPath('view.isAnimatable')) { return; }

    // Handle animations
    var transitions = [], animation;
    this._animatedTransforms = [];

    if (!this._pendingAnimations) { this._pendingAnimations = {}; }

    var platformTransform = "-" + SC.platform.cssPrefix + "-transform";


    // animate({ scale: 2, rotateX: 90 })
    // both scale and rotateX are transformProperties
    // so they both actually are animating the same CSS key, i.e. -webkit-transform

    if (SC.platform.supportsCSSTransitions) {
      for(key in animations) {
        // FIXME: If we want to allow it to be set as just a number for duration we need to add support here
        animation = animations[key];

        var isTransformProperty = SC.CSS_TRANSFORM_MAP[key];
        var isTurboProperty = (key === 'top' && translateTop != null) || (key === 'left' && translateLeft != null);

        if (SC.platform.supportsCSSTransforms && (isTurboProperty || isTransformProperty)) {
          this._animatedTransforms.push(key);
          key = platformTransform;
        }

        // We're actually storing the css for the animation on layout.animate[key].css
        animation.css = key + " " + animation.duration + "s " + animation.timing;

        // If there are multiple transform properties, we only need to set this key once.
        // We already checked before to make sure they have the same duration.
        if (!this._pendingAnimations[key]) {
          this._pendingAnimations[key] = animation;
          transitions.push(animation.css);
        }
      }

      this.ret[SC.platform.domCSSPrefix+"Transition"] = transitions.join(", ");

    } else {
      // TODO: Do it the JS way

      // For now we're just sticking them in so the callbacks can be run
      for(key in animations) {
        this._pendingAnimations[key] = animations[key];
      }
    }

    delete layout.animate;
  },

  // return "auto" for "auto", null for null, converts 0.XY into "XY%".
  // otherwise returns the original number, rounded down
  _cssNumber: function(val){
    if (val == null) { return null; }
    else if (val === SC.LAYOUT_AUTO) { return SC.LAYOUT_AUTO; }
    else if (SC.isPercentage(val)) { return (val*100)+"%"; }
    else { return Math.floor(val); }
  },

  calculate: function() {
    var layout = this.get('layout'), pdim = null,
        translateTop = null,
        translateLeft = null,
        turbo = this.get('turbo'),
        ret = this.ret,
        dims = this.dims,
        loc = this.loc,
        view = this.get('view'),
        key, value;

    this._handleMistakes(layout);


    // X DIRECTION

    if (this.hasLeft || this.hasRight || !this.hasCenterX) {
      translateLeft = this._calculatePosition("x");
    } else {
      this._calculateCenter("x");
    }


    // Y DIRECTION

    if (this.hasTop || this.hasBottom || !this.hasCenterY) {
      translateTop = this._calculatePosition("y");
    } else {
      this._calculateCenter("y");
    }


    // these properties pass through unaltered (after prior normalization)
    ret.minWidth   = this.minWidth;
    ret.maxWidth   = this.maxWidth;
    ret.minHeight  = this.minHeight;
    ret.maxHeight  = this.maxHeight;

    ret.zIndex     = this.zIndex;
    ret.opacity    = this.opacity;
    ret.mozOpacity = this.opacity;

    ret.backgroundPosition = this.backgroundPosition;

    this._calculateTransforms(translateLeft, translateTop);
    this._calculateAnimations(translateLeft, translateTop);


    // convert any numbers into a number + "px".
    for(key in ret) {
      value = ret[key];
      if (typeof value === SC.T_NUMBER) { ret[key] = (value + "px"); }
    }

    return ret ;
  },

  willRenderAnimations: function(){
    if (SC.platform.supportsCSSTransitions) {
      var view = this.get('view'),
          layer = view.get('layer'),
          currentStyle = layer ? layer.style : null,
          newStyle = view.get('layoutStyle'),
          activeAnimations = this._activeAnimations, activeAnimation,
          pendingAnimations = this._pendingAnimations, pendingAnimation,
          animatedTransforms = this._animatedTransforms,
          transformsLength = animatedTransforms ? animatedTransforms.length : 0,
          transitionStyle = newStyle[SC.platform.domCSSPrefix+"Transition"],
          layout = view.get('layout'),
          key, callback, idx, shouldCancel;

      if (pendingAnimations) {
        if (!activeAnimations) activeAnimations = {};
        
        for (key in pendingAnimations) {
          if (!pendingAnimations.hasOwnProperty(key)) continue;
          
          pendingAnimation = pendingAnimations[key];
          activeAnimation = activeAnimations[key];
          shouldCancel = NO;
          
          if (newStyle[key] !== (currentStyle ? currentStyle[key] : null)) shouldCancel = YES;
          
          // if we have a new animation (an animation property has changed), cancel current
          if (activeAnimation && (activeAnimation.duration !== pendingAnimation.duration || activeAnimation.timing !== pendingAnimation.timing)) {
            shouldCancel = YES;
          }
          
          if (shouldCancel && activeAnimation) {
            if (callback = activeAnimation.callback) {
              if (transformsLength > 0) {
                for (idx=0; idx < transformsLength; idx++) {
                  this.runAnimationCallback(callback, null, animatedTransforms[idx], YES);
                }
                this._animatedTransforms = null;
              } else {
                this.runAnimationCallback(callback, null, key, YES);
              }
            }
            
            this.removeAnimationFromLayout(key, YES);
          }
          
          activeAnimations[key] = pendingAnimation;
        }
      }
      
      this._activeAnimations = activeAnimations;
      this._pendingAnimations = null;
    }
  },

  didRenderAnimations: function(){
    if (!SC.platform.supportsCSSTransitions) {
      var key, callback;
      // Transitions not supported
      for (key in this._pendingAnimations) {
        callback = this._pendingAnimations[key].callback;
        if (callback) this.runAnimationCallback(callback, null, key, NO);
        this.removeAnimationFromLayout(key, NO, YES);
      }
      this._activeAnimations = this._pendingAnimations = null;
    }
  },

  runAnimationCallback: function(callback, evt, propertyName, cancelled) {
    var view = this.get('view');
    if (callback) {
      if (SC.typeOf(callback) !== SC.T_HASH) { callback = { action: callback }; }
      callback.source = view;
      if (!callback.target) { callback.target = this; }
    }
    SC.View.runCallback(callback, { event: evt, propertyName: propertyName, view: view, isCancelled: cancelled });
  },

  transitionDidEnd: function(evt) {
    var propertyName = evt.originalEvent.propertyName,
        animation, idx;

    animation = this._activeAnimations ? this._activeAnimations[propertyName] : null;

    if (animation) {
      if (animation.callback) {
        // Charles says this is a good idea
        SC.RunLoop.begin();
        // We're using invokeLater so we don't trigger any layout changes from the callbacks until the animations are done
        if (this._animatedTransforms && this._animatedTransforms.length > 0) {
          for (idx=0; idx < this._animatedTransforms.length; idx++) {
            this.invokeLater('runAnimationCallback', 1, animation.callback, evt, this._animatedTransforms[idx], NO);
          }
        } else {
          this.invokeLater('runAnimationCallback', 1, animation.callback, evt, propertyName, NO);
        }
        SC.RunLoop.end();
      }

      this.removeAnimationFromLayout(propertyName, YES);
    }
  },

  removeAnimationFromLayout: function(propertyName, updateStyle, isPending) {
    if (updateStyle) {
      var layer = this.getPath('view.layer'),
          updatedCSS = [], key;
      for(key in this._activeAnimations) {
        if (key !== propertyName) { updatedCSS.push(this._activeAnimations[key].css); }
      }

      // FIXME: Not really sure this is the right way to do it, but we don't want to trigger a layout update
      if (layer) { layer.style[SC.platform.domCSSPrefix+"Transition"] = updatedCSS.join(', '); }
    }


    var layout = this.getPath('view.layout'),
        idx;

    if (propertyName === '-'+SC.platform.cssPrefix+'-transform' && this._animatedTransforms && this._animatedTransforms.length > 0) {
      for(idx=0; idx < this._animatedTransforms.length; idx++) {
        delete layout['animate' + SC.String.capitalize(this._animatedTransforms[idx])];
      }
      this._animatedTransforms = null;
    }
    delete layout['animate' + SC.String.capitalize(propertyName)];

    if (!isPending) { delete this._activeAnimations[propertyName]; }
  }

});

SC.CoreView.runCallback = function(callback)/** @scope SC.View.prototype */{
  var additionalArgs = SC.$A(arguments).slice(1),
      typeOfAction = SC.typeOf(callback.action);

  // if the action is a function, just try to call it.
  if (typeOfAction == SC.T_FUNCTION) {
    callback.action.apply(callback.target, additionalArgs);

  // otherwise, action should be a string.  If it has a period, treat it
  // like a property path.
  } else if (typeOfAction === SC.T_STRING) {
    if (callback.action.indexOf('.') >= 0) {
      var path = callback.action.split('.') ;
      var property = path.pop() ;

      var target = SC.objectForPropertyPath(path, window) ;
      var action = target.get ? target.get(property) : target[property];
      if (action && SC.typeOf(action) == SC.T_FUNCTION) {
        action.apply(target, additionalArgs);
      } else {
        throw 'SC.runCallback could not find a function at %@'.fmt(callback.action) ;
      }

    // otherwise, try to execute action direction on target or send down
    // responder chain.
    // FIXME: Add support for additionalArgs to this
    // } else {
    //  SC.RootResponder.responder.sendAction(callback.action, callback.target, callback.source, callback.source.get("pane"), null, callback.source);
    }
  }
};

SC.View.runCallback = SC.CoreView.runCallback;

/* >>>>>>>>>> BEGIN source/views/view/animation.js */
sc_require("views/view");
sc_require("views/view/layout_style");

/**
  Properties that can be animated
  (Hash for faster lookup)
*/
SC.ANIMATABLE_PROPERTIES = {
  top:     YES,
  left:    YES,
  bottom:  YES,
  right:   YES,
  width:   YES,
  height:  YES,
  centerX: YES,
  centerY: YES,
  opacity: YES,
  scale:   YES,
  rotate:  YES,
  rotateX: YES,
  rotateY: YES,
  rotateZ: YES
};

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  didCreateLayerMixin: function() {
    // Animation prep
    if (SC.platform.supportsCSSTransitions) { this.resetAnimation(); }
  },

  /**
    Animate a given property using CSS animations.

    Takes a key, value and either a duration, or a hash of options.
    The options hash has the following parameters

     - duration: Duration of animation in seconds
     - callback: Callback method to run when animation completes
     - timing: Animation timing function

    @param {String|Hash} key
    @param {Object} value
    @params {Number|Hash} duration or options
    @returns {SC.View} receiver
  */
  animate: function(keyOrHash, valueOrOptions, optionsOrCallback, callback) {
    var hash, options;

    if (typeof keyOrHash === SC.T_STRING) {
      hash = {};
      hash[keyOrHash] = valueOrOptions;
      options = optionsOrCallback;
    } else {
      hash = keyOrHash;
      options = valueOrOptions;
      callback = optionsOrCallback;
    }

    var optionsType = SC.typeOf(options);
    if (optionsType === SC.T_NUMBER) {
      options = { duration: options };
    } else if (optionsType !== SC.T_HASH) {
      throw "Must provide options hash or duration!";
    }

    if (callback) { options.callback = callback; }

    var timing = options.timing;
    if (timing) {
      if (typeof timing !== SC.T_STRING) {
        options.timing = "cubic-bezier("+timing[0]+", "+timing[1]+", "+
                                         timing[2]+", "+timing[3]+")";
      }
    } else {
      options.timing = 'linear';
    }

    var layout = SC.clone(this.get('layout')), didChange = NO, value, cur, animValue, curAnim, key;

    if (!layout.animate) { layout.animate = {}; }

    // Very similar to #adjust
    for(key in hash) {
      if (!hash.hasOwnProperty(key) || !SC.ANIMATABLE_PROPERTIES[key]) { continue; }
      value = hash[key];
      cur = layout[key];
      curAnim = layout.animate[key];

      // loose comparison used instead of (value === null || value === undefined)
      if (value == null) { throw "Can only animate to an actual value!"; }

      // FIXME: We should check more than duration
      if (cur !== value || (curAnim && curAnim.duration !== options.duration)) {
        didChange = YES;
        layout.animate[key] = options;
        layout[key] = value;
      }
    }

    // now set adjusted layout
    if (didChange) { this.set('layout', layout) ; }

    return this ;
  },

  /**
  Resets animation, stopping all existing animations.
  */
  resetAnimation: function() {
    var layout = this.get('layout'),
        animations = layout.animate,
        didChange = NO, key;

    if (!animations) { return; }

    var hasAnimations;

    for (key in animations) {
      didChange = YES;
      delete animations[key];
    }

    if (didChange) {
      this.set('layout', layout);
      this.notifyPropertyChange('layout');
    }

    return this;
  },

  /**
    Called when animation ends, should not usually be called manually
  */
  transitionDidEnd: function(evt){
    // WARNING: Sometimes this will get called more than once for a property. Not sure why.
    this.get('layoutStyleCalculator').transitionDidEnd(evt);
  },

  /**
    Setting wantsAcceleratedLayer to YES will use transforms to move the
    layer when available. On some platforms transforms are hardware accelerated.
  */
  wantsAcceleratedLayer: NO,

  /**
    Specifies whether transforms can be used to move the layer.
  */
  hasAcceleratedLayer: function(){
    if (this.get('wantsAcceleratedLayer') && SC.platform.supportsAcceleratedLayers) {
      var layout = this.get('layout'),
          animations = layout.animate,
          AUTO = SC.LAYOUT_AUTO,
          key;

      if (animations && (animations.top || animations.left)) {
        for (key in animations) {
          // If we're animating other transforms at different speeds, don't use acceleratedLayer
          if (
            SC.CSS_TRANSFORM_MAP[key] &&
            ((animations.top && animations.top.duration !== animations[key].duration) ||
             (animations.left && animations.left.duration !== animations[key].duration))
          ) {
            return NO;
          }
        }
      }

      // loose comparison used instead of (layout.X === null || layout.X === undefined)
      if (
        layout.left != null && !SC.isPercentage(layout.left) && layout.left !== AUTO &&
        layout.top != null && !SC.isPercentage(layout.top) && layout.top !== AUTO &&
        layout.width != null && !SC.isPercentage(layout.width) && layout.width !== AUTO &&
        layout.height != null && !SC.isPercentage(layout.height) && layout.height !== AUTO
      ) {
       return YES;
      }
    }
    return NO;
  }.property('wantsAcceleratedLayer').cacheable()
});

/* >>>>>>>>>> BEGIN source/views/view/cursor.js */
sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  /**
    You can set this to an SC.Cursor instance; whenever that SC.Cursor's
    'cursorStyle' changes, the cursor for this view will automatically
    be updated to match. This allows you to coordinate the cursors of
    many views by making them all share the same cursor instance.

    For example, SC.SplitView uses this ensure that it and all of its
    children have the same cursor while dragging, so that whether you are
    hovering over the divider or another child of the split view, the
    proper cursor is visible.

    @property {SC.Cursor String}
  */
  cursor: function(key, value) {
    var parent;

    if (value) { this._setCursor = value; }
    if (this._setCursor !== undefined) { return this._setCursor; }

    parent = this.get('parentView');
    if (this.get('shouldInheritCursor') && parent) {
      return parent.get('cursor');
    }

    return null;
  }.property('parentView', 'shouldInheritCursor').cacheable(),

  applyAttributesToContext: function(original, context) {
    var cursor = this.get('cursor');
    if (cursor) { context.addClass(cursor.get('className')); }

    original(context);
  }.enhance(),

  /**
    A child view without a cursor of its own inherits its parent's cursor by
    default.  Set this to NO to prevent this behavior.

    @property {Boolean}
  */
  shouldInheritCursor: YES

});

/* >>>>>>>>>> BEGIN source/views/view/enabled.js */
sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {
  // ..........................................................
  // IS ENABLED SUPPORT
  //

  /**
    Set to true when the item is enabled.   Note that changing this value
    will alter the isVisibleInWindow property for this view and any
    child views as well as to automatically add or remove a 'disabled' CSS
    class name.

    This property is observable and bindable.

    @property {Boolean}
  */
  isEnabled: YES,
  isEnabledBindingDefault: SC.Binding.oneWay().bool(),

  /**
    Computed property returns YES if the view and all of its parent views
    are enabled in the pane.  You should use this property when deciding
    whether to respond to an incoming event or not.

    This property is not observable.

    @property {Boolean}
  */
  isEnabledInPane: function() {
    var ret = this.get('isEnabled'), pv ;
    if (ret && (pv = this.get('parentView'))) { ret = pv.get('isEnabledInPane'); }
    return ret ;
  }.property('parentView', 'isEnabled'),

  /** @private
    Observes the isEnabled property and resigns first responder if set to NO.
    This will avoid cases where, for example, a disabled text field retains
    its focus rings.

    @observes isEnabled
  */
  _sc_view_isEnabledDidChange: function(){
    if(!this.get('isEnabled') && this.get('isFirstResponder')){
      this.resignFirstResponder();
    }
  }.observes('isEnabled'),

  applyAttributesToContext: function(original, context) {
    var isEnabled = this.get('isEnabled');

    original(context);

    context.setClass('disabled', !isEnabled);
    context.attr('aria-disabled', !isEnabled ? 'true' : null);
  }.enhance()
});

/* >>>>>>>>>> BEGIN source/views/view/keyboard.js */
sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {
  // ..........................................................
  // KEY RESPONDER
  //

  /** @property
    YES if the view is currently first responder and the pane the view belongs
    to is also key pane.  While this property is set, you should expect to
    receive keyboard events.
  */
  isKeyResponder: NO,

  /**
    This method is invoked just before you lost the key responder status.
    The passed view is the view that is about to gain keyResponder status.
    This gives you a chance to do any early setup. Remember that you can
    gain/lose key responder status either because another view in the same
    pane is becoming first responder or because another pane is about to
    become key.

    @param {SC.Responder} responder
  */
  willLoseKeyResponderTo: function(responder) {},

  /**
    This method is invoked just before you become the key responder.  The
    passed view is the view that is about to lose keyResponder status.  You
    can use this to do any setup before the view changes.
    Remember that you can gain/lose key responder status either because
    another view in the same pane is becoming first responder or because
    another pane is about to become key.

    @param {SC.Responder} responder
  */
  willBecomeKeyResponderFrom: function(responder) {},

  /**
    Invokved just after the responder loses key responder status.
    @param {SC.Responder} responder
  */
  didLoseKeyResponderTo: function(responder) {},

  /**
    Invoked just after the responder gains key responder status.
    By default, it calls focus on the view root element. For accessibility 
    purposes.
  
    @param {SC.Responder} responder
  */
  didBecomeKeyResponderFrom: function(responder) {
    this.$().focus();
  },

  /**
    This method will process a key input event, attempting to convert it to
    an appropriate action method and sending it up the responder chain.  The
    event is converted using the SC.KEY_BINDINGS hash, which maps key events
    into method names.  If no key binding is found, then the key event will
    be passed along using an insertText() method.

    @param {SC.Event} event
    @returns {Object} object that handled event, if any
  */
  interpretKeyEvents: function(event) {
    var codes = event.commandCodes(), cmd = codes[0], chr = codes[1], ret;

    if (!cmd && !chr) { return null ; } //nothing to do.

    // if this is a command key, try to do something about it.
    if (cmd) {
      var methodName = SC.MODIFIED_KEY_BINDINGS[cmd] || SC.BASE_KEY_BINDINGS[cmd.match(/[^_]+$/)[0]];
      if (methodName) {
        var target = this, pane = this.get('pane'), handler = null;
        while(target && !(handler = target.tryToPerform(methodName, event))){
          target = (target===pane)? null: target.get('nextResponder') ;
        }
        return handler ;
      }
    }

    if (chr && this.respondsTo('insertText')) {
      // if we haven't returned yet and there is plain text, then do an insert
      // of the text.  Since this is not an action, do not send it up the
      // responder chain.
      ret = this.insertText(chr, event);
      return ret ? (ret===YES ? this : ret) : null ; // map YES|NO => this|nil
    }

    return null ; //nothing to do.
  },

  /**
    This method is invoked by interpretKeyEvents() when you receive a key
    event matching some plain text.  You can use this to actually insert the
    text into your application, if needed.

    @param {SC.Event} event
    @returns {Object} receiver or object that handled event
  */
  insertText: function(chr) {
    return NO ;
  },

  /**
    Recursively travels down the view hierarchy looking for a view that
    implements the key equivalent (returning to YES to indicate it handled
    the event).  You can override this method to handle specific key
    equivalents yourself.

    The keystring is a string description of the key combination pressed.
    The evt is the event itself. If you handle the equivalent, return YES.
    Otherwise, you should just return sc_super.

    @param {String} keystring
    @param {SC.Event} evt
    @returns {Boolean}
  */
  performKeyEquivalent: function(keystring, evt) {
    var ret = NO,
        childViews = this.get('childViews'),
        len = childViews.length,
        idx = -1, view ;
    while (!ret && (++idx < len)) {
      view = childViews[idx];

      ret = view.tryToPerform('performKeyEquivalent', keystring, evt);
    }

    return ret ;
  },

  /**
    The first child of this view for the purposes of tab ordering. If not
    provided, the first element of childViews is used. Override this if
    your view displays its child views in an order different from that
    given in childViews.

    @type SC.View
    @default null
  */
  firstKeyView: null,

  /**
    @private

    Actually calculates the firstKeyView as described in firstKeyView.

    @returns {SC.View}
  */
  _getFirstKeyView: function() {
    // if first was given, just return it
    var firstKeyView = this.get('firstKeyView');
    if(firstKeyView) return firstKeyView;

    // otherwise return the first childView
    var childViews = this.get('childViews');
    if(childViews) return childViews[0];
  },

  /**
    The last child of this view for the purposes of tab ordering. If not set, can be generated two different ways:
    1. If firstKeyView is provided, it will be generated by starting from firstKeyView and traversing the childViews nextKeyView properties.
    2. If firstKeyView is not provided, it will simply return the last element of childViews.

    The first way is not very efficient, so if you provide firstKeyView you should also provide lastKeyView.

    @type SC.View
    @default null
  */
  lastKeyView: null,

  /**
    @private

    Actually calculates the lastKeyView as described in lastKeyView.

    @returns {SC.View}
  */
  _getLastKeyView: function() {
    // if last was given, just return it
    var lastKeyView = this.get('lastKeyView');
    if(lastKeyView) return lastKeyView;

    var view,
    prev = this.get('firstKeyView');

    // if first was given but not last, build by starting from first and
    // traversing until we hit the end. this is obviously the least efficient
    // way
    if(prev) {
      while(view = prev._getNextKeyView()) {
        prev = view;
      }

      return prev;
    }

    // if neither was given, it's more efficient to just return the last
    // childView
    else {
      var childViews = this.get('childViews');

      if(childViews) return childViews[childViews.length - 1];
    }
  },

  /**
    Optionally points to the next key view that should gain focus when tabbing
    through an interface.  If this is not set, then the next key view will
    be set automatically to the next sibling as defined by its parent's
    childViews property.

    If any views define this, all of their siblings should define it as well,
    otherwise undefined behavior may occur. Their parent view should also define
    a firstKeyView.

    This may also be set to a view that is not a sibling, but once again all
    views in the chain must define it or undefined behavior will occur.

    Likewise, any view that sets nextKeyView should also set previousKeyView.

    @type SC.View
    @default null
  */

  nextKeyView: undefined,

  /**
    @private

    Gets the next key view by checking if the user set it and otherwise just
    getting the next by index in childViews.

    @return {SC.View}
  */
  _getNextKeyView: function() {
    var pv = this.get('parentView'),
    nextKeyView = this.get('nextKeyView');

    // if the parent defines lastKeyView, it takes priority over this views
    // nextKeyView
    if(pv && pv.get('lastKeyView') === this) return null;

    // if this view defines a nextKeyView, use it
    if(nextKeyView !== undefined) return nextKeyView;

    // otherwise generate one based on parent view's childViews
    if(pv) {
      var childViews = pv.get('childViews');
      return childViews[childViews.indexOf(this) + 1];
    }
  },

  /**
    Computes the next valid key view. This is the next key view that
    acceptsFirstResponder. Computed using depth first search. If the current view
    is not valid, it will first traverse its children before trying siblings. If
    the current view is the only valid view, the current view will be returned. Will
    return null if no valid view can be found.

    @property
    @type SC.View
  */
  nextValidKeyView: function() {
    var cur = this, next;

    while(next !== this) {
      next = null;

      // only bother to check children if we are visible
      if(cur.get('isVisibleInWindow')) next = cur._getFirstKeyView();

      // if we have no children, check our sibling
      if(!next) next = cur._getNextKeyView();

      // if we have no children or siblings, unroll up closest parent that has a
      // next sibling
      if(!next) while(cur = cur.get('parentView')) {
        if(next = cur._getNextKeyView()) break;
      }

      // if no parents have a next sibling, start over from the beginning
      if(!next) {
        if(!SC.TABBING_ONLY_INSIDE_DOCUMENT) break;
        else next = this.get('pane');
      }

      // if it's a valid firstResponder, we're done!
      if(next.get('isVisibleInWindow') && next.get('acceptsFirstResponder')) return next;

      // otherwise keep looking
      cur = next;
    }

    // this will only happen if no views are visible and accept first responder
    return null;
  }.property('nextKeyView'),

  /**
    Optionally points to the previous key view that should gain focus when tabbing
    through an interface.  If this is not set, then the previous key view will
    be set automatically to the previous sibling as defined by its parent's
    childViews property.

    If any views define this, all of their siblings should define it as well,
    otherwise undefined behavior may occur. Their parent view should also define
    a lastKeyView.

    This may also be set to a view that is not a sibling, but once again all
    views in the chain must define it or undefined behavior will occur.

    Likewise, any view that sets previousKeyView should also set nextKeyView.

    @type SC.View
    @default null
  */
  previousKeyView: undefined,

  /**
    @private

    Gets the previous key view by checking if the user set it and otherwise just
    getting the previous by index in childViews.

    @return {SC.View}
  */
  _getPreviousKeyView: function() {
    var pv = this.get('parentView'),
    previousKeyView = this.get('previousKeyView');

    // if the parent defines firstKeyView, it takes priority over this views
    // previousKeyView
    if(pv && pv.get('firstKeyView') === this) return null;

    // if this view defines a previousKeyView, use it
    if(previousKeyView !== undefined) return previousKeyView;

    // otherwise generate one based on parent view's childViews
    if(pv) {
      var childViews = pv.get('childViews');
      return childViews[childViews.indexOf(this) - 1];
    }
  },

  /**
    Computes the previous valid key view. This is the previous key view that
    acceptsFirstResponder. Traverse views in the opposite order from
    nextValidKeyView. If the current view is the pane, tries deepest child. If the
    current view has a previous view, tries its last child. If this view is the
    first child, tries the parent. Will return null if no valid view can be
    found.

    @property
    @type SC.View
  */
  // TODO: clean this up
  previousValidKeyView: function() {
    var cur = this, prev;

    while(prev !== this) {
      // normally, just try to get previous view's last child
      if(cur.get('parentView')) prev = cur._getPreviousKeyView();

      // if we are the pane and address bar tabbing is enabled, trigger it now
      else if(!SC.TABBING_ONLY_INSIDE_DOCUMENT) break;

      // if we are the pane, get our own last child
      else prev = cur;

      // loop down to the last valid child
      if(prev) {
        do {
          cur = prev;
          prev = prev._getLastKeyView();
        } while(prev && prev.get('isVisibleInWindow'));

        // if we ended on a null, unroll to the last one
        // we don't unroll if we ended on a hidden view because we need
        // to traverse to its previous view next iteration
        if(!prev) prev = cur;
      }

      // if there is no previous view, traverse to the parent
      else prev = cur.get('parentView');

      // if the view is valid, return it
      if(prev.get('isVisibleInWindow') && prev.get('acceptsFirstResponder')) return prev;

      // otherwise, try to find its previous valid keyview
      cur = prev;
    }

    // if none of the views accept first responder and we make it back to where
    // we started, just return null
    return null;
  }.property('previousKeyView')
});


/* >>>>>>>>>> BEGIN source/views/view/layout.js */
sc_require("views/view");
sc_require('views/view/layout_style') ;

/** Select a horizontal layout for various views.*/
SC.LAYOUT_HORIZONTAL = 'sc-layout-horizontal';

/** Select a vertical layout for various views.*/
SC.LAYOUT_VERTICAL = 'sc-layout-vertical';

/** @private */
SC._VIEW_DEFAULT_DIMS = ['marginTop', 'marginLeft'];

/**
  Layout properties to take up the full width of a parent view.
*/
SC.FULL_WIDTH = { left: 0, right: 0 };

/**
  Layout properties to take up the full height of a parent view.
*/
SC.FULL_HEIGHT = { top: 0, bottom: 0 };

/**
  Layout properties to center.  Note that you must also specify a width and
  height for this to work.
*/
SC.ANCHOR_CENTER = { centerX: 0, centerY: 0 };

/**
  Layout property for width, height
*/

SC.LAYOUT_AUTO = 'auto';

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  /**
    Set to YES to indicate the view has visibility support added.
  */
  hasLayout: YES,

  concatenatedProperties: ["layoutProperties"],

  /**
    Optional background color.  Will be applied to the view's element if
    set.  This property is intended for one-off views that need a background
    element.  If you plan to create many view instances it is probably better
    to use CSS.

    @property {String}
  */
  backgroundColor: null,

  displayProperties: ['backgroundColor'],

  /**
    Activates use of brower's static layout. To activate, set this
    property to YES.

    @property {Boolean}
  */
  useStaticLayout: NO,

  // ...........................................
  // LAYOUT
  //

  init: function(original) {
    original();

    // TODO: This makes it impossible to override
    this.layoutStyleCalculator = SC.View.LayoutStyleCalculator.create({ view: this });

    this._previousLayout = this.get('layout');
  }.enhance(),

  /**
    The 'frame' property depends on the 'layout' property as well as the
    parent view's frame.  In order to properly invalidate any cached values,
    we need to invalidate the cache whenever 'layout' changes.  However,
    observing 'layout' does not guarantee that; the observer might not be run
    immediately.

    In order to avoid any window of opportunity where the cached frame could
    be invalid, we need to force layoutDidChange() to always immediately run
    whenever 'layout' is set.
  */
  propertyDidChange: function(key, value, _keepCache) {
    // If the key is 'layout', we need to call layoutDidChange() immediately
    // so that if the frame has changed any cached values (for both this view
    // and any child views) can be appropriately invalidated.

    // To allow layout to be a computed property, we check if any property has
    // changed and if layout is dependent on the property.
    // If it is we call layoutDidChange.
    var layoutChange = false;
    if(typeof this.layout === "function" && this._kvo_dependents) {
      var dependents = this._kvo_dependents[key];
      if(dependents && dependents.indexOf('layout')!=-1) { layoutChange = true; }
    }
    if(key==='layout' || layoutChange) { this.layoutDidChange(); }
    // Resume notification as usual.
    arguments.callee.base.apply(this,arguments);
  },


  /**
    This convenience method will take the current layout, apply any changes
    you pass and set it again.  It is more convenient than having to do this
    yourself sometimes.

    You can pass just a key/value pair or a hash with several pairs.  You can
    also pass a null value to delete a property.

    This method will avoid actually setting the layout if the value you pass
    does not edit the layout.

    @param {String|Hash} key
    @param {Object} value
    @returns {SC.View} receiver
  */
  adjust: function(key, value) {
    var layout = this.get('layout'), didChange = NO, cur, hash;

    if (key === undefined) { return this ; } // nothing to do.

    // handle string case
    if (SC.typeOf(key) === SC.T_STRING) {
      // this is copied from below
      cur = layout[key];

      if(value === undefined || cur == value) return this;

      layout = SC.clone(layout);

      if(value === null) {
        delete layout[key];
      } else {
        layout[key] = value;
      }

      didChange = YES;
    }

    else {
      hash = key;

      for(key in hash) {
        if (!hash.hasOwnProperty(key)) { continue; }

        value = hash[key] ;
        cur = layout[key] ;

        if (value === undefined || cur == value) { continue; }

        // only clone the layout the first time we see a change
        if(!didChange) layout = SC.clone(layout);

        if (value === null) {
          delete layout[key] ;
        } else {
          layout[key] = value ;
        }

        didChange = YES;
      }
    }

    // now set adjusted layout
    if (didChange) {
      this.set('layout', layout) ;
    }

    return this ;
  },

  /**
    The layout describes how you want your view to be positioned on the
    screen.  You can define the following properties:

     - left: the left edge
     - top: the top edge
     - right: the right edge
     - bottom: the bottom edge
     - height: the height
     - width: the width
     - centerX: an offset from center X
     - centerY: an offset from center Y
     - minWidth: a minimum width
     - minHeight: a minimum height
     - maxWidth: a maximum width
     - maxHeight: a maximum height
     - border: border on all sides
     - borderTop: top border
     - borderRight: right border
     - borderBottom: bottom border
     - borderLeft: bottom left
     - zIndex: position above or below other views

    Note that you can only use certain combinations to set layout.  For
    example, you may set left/right or left/width, but not left/width/right,
    since that combination doesn't make sense.

    Likewise, you may set a minWidth/minHeight, or maxWidth/maxHeight, but
    if you also set the width/height explicitly, then those constraints won't
    matter as much.

    Layout is designed to maximize reliance on the browser's rendering
    engine to keep your app up to date.

    @test in layoutStyle
  */
  layout: { top: 0, left: 0, bottom: 0, right: 0 },

  /**
    Returns whether the layout is 'fixed' or not.  A fixed layout has a fixed
    left & top position within its parent's frame as well as a fixed width and height.
    Fixed layouts are therefore unaffected by changes to their parent view's
    layout.

    @returns {Boolean} YES if fixed, NO otherwise
    @test in layoutStyle
  */
  isFixedLayout: function() {
    var layout = this.get('layout'),
        ret;

    // Layout is fixed if it has width + height !== SC.LAYOUT_AUTO and left + top
    ret = (
      ((layout.width !== undefined) && (layout.height !== undefined)) &&
      ((layout.width !== SC.LAYOUT_AUTO) && (layout.height !== SC.LAYOUT_AUTO)) &&
      ((layout.left !== undefined) && (layout.top !== undefined))
    );

    // The layout may appear fixed, but only if none of the values are percentages
    if (ret) {
      ret = (
        !SC.isPercentage(layout.top) &&
        !SC.isPercentage(layout.left) &&
        !SC.isPercentage(layout.width) &&
        !SC.isPercentage(layout.height)
      );
    }

    return ret;
  }.property('layout').cacheable(),

  /**
    Converts a frame from the receiver's offset to the target offset.  Both
    the receiver and the target must belong to the same pane.  If you pass
    null, the conversion will be to the pane level.

    Note that the context of a view's frame is the view's parent frame.  In
    other words, if you want to convert the frame of your view to the global
    frame, then you should do:

        var pv = this.get('parentView'), frame = this.get('frame');
        var newFrame = pv ? pv.convertFrameToView(frame, null) : frame;

    @param {Rect} frame the source frame
    @param {SC.View} targetView the target view to convert to
    @returns {Rect} converted frame
    @test in convertFrames
  */
  convertFrameToView: function(frame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, f ;

    // walk up this side
    while (view) {
      f = view.get('frame'); myX += f.x; myY += f.y ;
      view = view.get('layoutView') ;
    }

    // walk up other size
    if (targetView) {
      view = targetView ;
      while (view) {
        f = view.get('frame'); targetX += f.x; targetY += f.y ;
        view = view.get('layoutView') ;
      }
    }

    // now we can figure how to translate the origin.
    myX = frame.x + myX - targetX ;
    myY = frame.y + myY - targetY ;
    return { x: myX, y: myY, width: frame.width, height: frame.height } ;
  },

  /**
    Converts a frame offset in the coordinates of another view system to the
    receiver's view.

    Note that the convext of a view's frame is relative to the view's
    parentFrame.  For example, if you want to convert the frame of view that
    belongs to another view to the receiver's frame you would do:

        var frame = view.get('frame');
        var newFrame = this.convertFrameFromView(frame, view.get('parentView'));

    @param {Rect} frame the source frame
    @param {SC.View} targetView the target view to convert to
    @returns {Rect} converted frame
    @test in converFrames
  */
  convertFrameFromView: function(frame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, f ;

    // walk up this side
    //Note: Intentional assignment of variable f
    while (view && (f = view.get('frame'))) {
      myX += f.x; myY += f.y ;
      view = view.get('parentView') ;
    }

    // walk up other size
    if (targetView) {
      view = targetView ;
      while(view) {
        f = view.get('frame'); targetX += f.x; targetY += f.y ;
        view = view.get('parentView') ;
      }
    }

    // now we can figure how to translate the origin.
    myX = frame.x - myX + targetX ;
    myY = frame.y - myY + targetY ;
    return { x: myX, y: myY, width: frame.width, height: frame.height } ;
  },

  /**
    Attempt to scroll the view to visible.  This will walk up the parent
    view hierarchy looking looking for a scrollable view.  It will then
    call scrollToVisible() on it.

    Returns YES if an actual scroll took place, no otherwise.

    @returns {Boolean}
  */
  scrollToVisible: function() {
    var pv = this.get('parentView');
    while(pv && !pv.get('isScrollable')) { pv = pv.get('parentView'); }

    // found view, first make it scroll itself visible then scroll this.
    if (pv) {
      pv.scrollToVisible();
      return pv.scrollToVisible(this);
    } else {
      return NO ;
    }
  },

  _adjustForBorder: function(frame, layout){
    var borderTop = ((layout.borderTop !== undefined) ? layout.borderTop : layout.border) || 0,
        borderLeft = ((layout.borderLeft !== undefined) ? layout.borderLeft : layout.border) || 0,
        borderBottom = ((layout.borderBottom !== undefined) ? layout.borderBottom : layout.border) || 0,
        borderRight = ((layout.borderRight !== undefined) ? layout.borderRight : layout.border) || 0;

    frame.x += borderLeft; // The border on the left pushes the frame to the right
    frame.y += borderTop; // The border on the top pushes the frame down
    frame.width -= (borderLeft + borderRight); // Border takes up space
    frame.height -= (borderTop + borderBottom); // Border takes up space

    return frame;
  },

  /**
    Computes what the frame of this view would be if the parent were resized
    to the passed dimensions.  You can use this method to project the size of
    a frame based on the resize behavior of the parent.

    This method is used especially by the scroll view to automatically
    calculate when scrollviews should be visible.

    Passing null for the parent dimensions will use the actual current
    parent dimensions.  This is the same method used to calculate the current
    frame when it changes.

    @param {Rect} pdim the projected parent dimensions
    @returns {Rect} the computed frame
  */
  computeFrameWithParentFrame: function(original, pdim) {
    var f, layout = this.get('layout');

    // We can't predict the frame for static layout, so just return the view's
    // current frame (see original computeFrameWithParentFrame in views/view.js)
    if (this.get('useStaticLayout')) {
      f = original();
      return f ? this._adjustForBorder(f, layout) : null;
    } else {
      f = {};
    }

    var error, layer, AUTO = SC.LAYOUT_AUTO,
        pv = this.get('parentView'),
        dH, dW, //shortHand for parentDimensions
        lR = layout.right,
        lL = layout.left,
        lT = layout.top,
        lB = layout.bottom,
        lW = layout.width,
        lH = layout.height,
        lcX = layout.centerX,
        lcY = layout.centerY;

    if (lW === AUTO) {
      error = SC.Error.desc(("%@.layout() cannot use width:auto if "+
                "staticLayout is disabled").fmt(this), "%@".fmt(this), -1);
      SC.Logger.error(error.toString()) ;
      throw error ;
    }

    if (lH === AUTO) {
       error = SC.Error.desc(("%@.layout() cannot use height:auto if "+
                "staticLayout is disabled").fmt(this),"%@".fmt(this), -1);
       SC.Logger.error(error.toString())  ;
      throw error ;
    }

    if (!pdim) { pdim = this.computeParentDimensions(layout) ; }
    dH = pdim.height;
    dW = pdim.width;

    // handle left aligned and left/right
    if (!SC.none(lL)) {
      if(SC.isPercentage(lL)){
        f.x = dW*lL;
      }else{
        f.x = lL ;
      }
      if (lW !== undefined) {
        if(lW === AUTO) { f.width = AUTO ; }
        else if(SC.isPercentage(lW)) { f.width = dW*lW ; }
        else { f.width = lW ; }
      } else { // better have lR!
        f.width = dW - f.x ;
        if(lR && SC.isPercentage(lR)) { f.width = f.width - (lR*dW) ; }
        else { f.width = f.width - (lR || 0) ; }
      }
    // handle right aligned
    } else if (!SC.none(lR)) {
      if (SC.none(lW)) {
        if (SC.isPercentage(lR)) {
          f.width = dW - (dW*lR) ;
        }
        else f.width = dW - lR ;
        f.x = 0 ;
      } else {
        if(lW === AUTO) f.width = AUTO ;
        else if(SC.isPercentage(lW)) f.width = dW*lW ;
        else f.width = (lW || 0) ;
        if (SC.isPercentage(lW)) f.x = dW - (lR*dW) - f.width ;
        else f.x = dW - lR - f.width ;
      }

    // handle centered
    } else if (!SC.none(lcX)) {
      if(lW === AUTO) f.width = AUTO ;
      else if (SC.isPercentage(lW)) f.width = lW*dW ;
      else f.width = (lW || 0) ;
      if(SC.isPercentage(lcX)) f.x = (dW - f.width)/2 + (lcX*dW) ;
      else f.x = (dW - f.width)/2 + lcX ;
    } else {
      f.x = 0 ; // fallback
      if (SC.none(lW)) {
        f.width = dW ;
      } else {
        if(lW === AUTO) f.width = AUTO ;
        if (SC.isPercentage(lW)) f.width = lW*dW ;
        else f.width = (lW || 0) ;
      }
    }

    // handle top aligned and top/bottom
    if (!SC.none(lT)) {
      if(SC.isPercentage(lT)) f.y = lT*dH ;
      else f.y = lT ;
      if (lH !== undefined) {
        if(lH === AUTO) f.height = AUTO ;
        else if(SC.isPercentage(lH)) f.height = lH*dH ;
        else f.height = lH ;
      } else { // better have lB!
        if(lB && SC.isPercentage(lB)) f.height = dH - f.y - (lB*dH) ;
        else f.height = dH - f.y - (lB || 0) ;
      }

    // handle bottom aligned
    } else if (!SC.none(lB)) {
      if (SC.none(lH)) {
        if (SC.isPercentage(lB)) f.height = dH - (lB*dH) ;
        else f.height = dH - lB ;
        f.y = 0 ;
      } else {
        if(lH === AUTO) f.height = AUTO ;
        if (lH && SC.isPercentage(lH)) f.height = lH*dH ;
        else f.height = (lH || 0) ;
        if (SC.isPercentage(lB)) f.y = dH - (lB*dH) - f.height ;
        else f.y = dH - lB - f.height ;
      }

    // handle centered
    } else if (!SC.none(lcY)) {
      if(lH === AUTO) f.height = AUTO ;
      if (lH && SC.isPercentage(lH)) f.height = lH*dH ;
      else f.height = (lH || 0) ;
      if (SC.isPercentage(lcY)) f.y = (dH - f.height)/2 + (lcY*dH) ;
      else f.y = (dH - f.height)/2 + lcY ;

    // fallback
    } else {
      f.y = 0 ; // fallback
      if (SC.none(lH)) {
        f.height = dH ;
      } else {
        if(lH === AUTO) f.height = AUTO ;
        if (SC.isPercentage(lH)) f.height = lH*dH ;
        else f.height = lH || 0 ;
      }
    }

    f.x = Math.floor(f.x);
    f.y = Math.floor(f.y);
    if(f.height !== AUTO) f.height = Math.floor(f.height);
    if(f.width !== AUTO) f.width = Math.floor(f.width);

    // if width or height were set to auto and we have a layer, try lookup
    if (f.height === AUTO || f.width === AUTO) {
      layer = this.get('layer');
      if (f.height === AUTO) f.height = layer ? layer.clientHeight : 0;
      if (f.width === AUTO) f.width = layer ? layer.clientWidth : 0;
    }

    f = this._adjustForBorder(f, layout);

    // Account for special cases inside ScrollView, where we adjust the
    // element's scrollTop/scrollLeft property for performance reasons.
    if (pv && pv.isScrollContainer) {
      pv = pv.get('parentView');
      f.x -= pv.get('horizontalScrollOffset');
      f.y -= pv.get('verticalScrollOffset');
    }

    // make sure the width/height fix min/max...
    if (!SC.none(layout.maxHeight) && (f.height > layout.maxHeight)) {
      f.height = layout.maxHeight ;
    }

    if (!SC.none(layout.minHeight) && (f.height < layout.minHeight)) {
      f.height = layout.minHeight ;
    }

    if (!SC.none(layout.maxWidth) && (f.width > layout.maxWidth)) {
      f.width = layout.maxWidth ;
    }

    if (!SC.none(layout.minWidth) && (f.width < layout.minWidth)) {
      f.width = layout.minWidth ;
    }

    // make sure width/height are never < 0
    if (f.height < 0) f.height = 0 ;
    if (f.width < 0) f.width = 0 ;

    return f;
  }.enhance(),

  computeParentDimensions: function(frame) {
    var ret, pv = this.get('parentView'), pf = (pv) ? pv.get('frame') : null ;

    if (pf) {
      ret = { width: pf.width, height: pf.height };
    } else {
      var f = frame || {};
      ret = {
        width: (f.left || 0) + (f.width || 0) + (f.right || 0),
        height: (f.top || 0) + (f.height || 0) + (f.bottom || 0)
      };
    }
    return ret ;
  },

  /**
    The frame of the view including the borders
  */
  borderFrame: function(){
    var layout = this.get('layout'),
        frame = this.get('frame'),
        defaultBorder = layout.border,
        topBorder = ((layout.topBorder !== undefined) ? layout.topBorder : layout.border) || 0,
        rightBorder = ((layout.rightBorder !== undefined) ? layout.rightBorder : layout.border) || 0,
        bottomBorder = ((layout.bottomBorder !== undefined) ? layout.bottomBorder : layout.border) || 0,
        leftBorder = ((layout.leftBorder !== undefined) ? layout.leftBorder : layout.border) || 0;

    return {
      x: frame.x - leftBorder,
      y: frame.y - topBorder,
      width: frame.width + leftBorder + rightBorder,
      height: frame.height + topBorder + bottomBorder
    };
  }.property('frame').cacheable(),

  /**
    This method may be called on your view whenever the parent view resizes.

    The default version of this method will reset the frame and then call
    viewDidResize().  You will not usually override this method, but you may
    override the viewDidResize() method.

    @returns {void}
    @test in viewDidResize
  */
  parentViewDidResize: function() {
    var frameMayHaveChanged;

    // If this view uses static layout, our "do we think the frame changed?"
    // result of isFixedLayout is not applicable and we simply have to assume
    // that the frame may have changed.
    frameMayHaveChanged = this.useStaticLayout || !this.get('isFixedLayout');

    // Do we think there's a chance our frame will have changed as a result?
    if (frameMayHaveChanged) {
      // There's a chance our frame changed.  Invoke viewDidResize(), which
      // will notify about our change to 'frame' (if it actually changed) and
      // appropriately notify our child views.
      this.viewDidResize();
    }
  },



  /**
    This method is invoked on your view when the view resizes due to a layout
    change or potentially due to the parent view resizing (if your view’s size
    depends on the size of your parent view).  You can override this method
    to implement your own layout if you like, such as performing a grid
    layout.

    The default implementation simply notifies about the change to 'frame' and
    then calls parentViewDidResize on all of your children.

    @returns {void}
  */
  viewDidResize: function() {
    this._viewFrameDidChange();

    // Also notify our children.
    var cv = this.childViews, len, idx, view ;
    for (idx=0; idx<(len= cv.length); ++idx) {
      view = cv[idx];
      view.tryToPerform('parentViewDidResize');
    }
  },

  /** @private
    Invoked by other views to notify this view that its frame has changed.

    This notifies the view that its frame property has changed,
    then propagates those changes to its child views.
  */
  _viewFrameDidChange: function() {
    this.notifyPropertyChange('frame');
    this._sc_view_clippingFrameDidChange();
  },

  // Implementation note: As a general rule, paired method calls, such as
  // beginLiveResize/endLiveResize that are called recursively on the tree
  // should reverse the order when doing the final half of the call. This
  // ensures that the calls are propertly nested for any cleanup routines.
  //
  // -> View A.beginXXX()
  //   -> View B.beginXXX()
  //     -> View C.begitXXX()
  //   -> View D.beginXXX()
  //
  // ...later on, endXXX methods are called in reverse order of beginXXX...
  //
  //   <- View D.endXXX()
  //     <- View C.endXXX()
  //   <- View B.endXXX()
  // <- View A.endXXX()
  //
  // See the two methods below for an example implementation.

  /**
    Call this method when you plan to begin a live resize.  This will
    notify the receiver view and any of its children that are interested
    that the resize is about to begin.

    @returns {SC.View} receiver
    @test in viewDidResize
  */
  beginLiveResize: function() {
    // call before children have been notified...
    if (this.willBeginLiveResize) this.willBeginLiveResize() ;

    // notify children in order
    var ary = this.get('childViews'), len = ary.length, idx, view ;
    for (idx=0; idx<len; ++idx) {
      view = ary[idx] ;
      if (view.beginLiveResize) view.beginLiveResize();
    }
    return this ;
  },

  /**
    Call this method when you are finished with a live resize.  This will
    notify the receiver view and any of its children that are interested
    that the live resize has ended.

    @returns {SC.View} receiver
    @test in viewDidResize
  */
  endLiveResize: function() {
    // notify children in *reverse* order
    var ary = this.get('childViews'), len = ary.length, idx, view ;
    for (idx=len-1; idx>=0; --idx) { // loop backwards
      view = ary[idx] ;
      if (view.endLiveResize) view.endLiveResize() ;
    }

    // call *after* all children have been notified...
    if (this.didEndLiveResize) this.didEndLiveResize() ;
    return this ;
  },

  /**
    The view responsible for laying out this view.  The default version
    returns the current parent view.
  */
  layoutView: function() {
    return this.get('parentView') ;
  }.property('parentView').cacheable(),

  /**
    This method is called whenever a property changes that invalidates the
    layout of the view.  Changing the layout will do this automatically, but
    you can add others if you want.

    Implementation Note:  In a traditional setup, we would simply observe
    'layout' here, but as described above in the documentation for our custom
    implementation of propertyDidChange(), this method must always run
    immediately after 'layout' is updated to avoid the potential for stale
    (incorrect) cached 'frame' values.

    @returns {SC.View} receiver
  */
  layoutDidChange: function() {
    // Did our layout change in a way that could cause us to be resized?  If
    // not, then there's no need to invalidate the frames of our child views.
    var previousLayout = this._previousLayout,
        currentLayout  = this.get('layout'),
        didResize      = YES,
        previousWidth, previousHeight, currentWidth, currentHeight;


    // Handle old style rotation
    if (!SC.none(currentLayout.rotate)) {
      if (SC.none(currentLayout.rotateX)) {
        currentLayout.rotateX = currentLayout.rotate;
        SC.Logger.warn('Please set rotateX instead of rotate');
      }
    }
    if (!SC.none(currentLayout.rotateX)) {
      currentLayout.rotate = currentLayout.rotateX;
    } else {
      delete currentLayout.rotate;
    }

    var animations = currentLayout.animations;
    if (animations) {
      if (!SC.none(animations.rotate)) {
        if (SC.none(animations.rotateX)) {
          animations.rotateX = animations.rotate;
          SC.Logger.warn('Please animate rotateX instead of rotate');
        }
      }
      if (!SC.none(animations.rotateX)) {
        animations.rotate = animations.rotateX;
      } else {
        delete animations.rotate;
      }
    }

    if (previousLayout  &&  previousLayout !== currentLayout) {
      // This is a simple check to see whether we think the view may have
      // resized.  We could look for a number of cases, but for now we'll
      // handle only one simple case:  if the width and height are both
      // specified, and they have not changed.
      previousWidth = previousLayout.width;
      if (previousWidth !== undefined) {
        currentWidth = currentLayout.width;
        if (previousWidth === currentWidth) {
          previousHeight = previousLayout.height;
          if (previousLayout !== undefined) {
            currentHeight = currentLayout.height;
            if (previousHeight === currentHeight) didResize = NO;
          }
        }
      }
    }

    this.beginPropertyChanges() ;
    this.notifyPropertyChange('hasAcceleratedLayer');
    this.notifyPropertyChange('layoutStyle') ;
    if (didResize) {
      this.viewDidResize();
    }
    else {
      // Even if we didn't resize, our frame might have changed.
      // viewDidResize() handles this in the other case.
      this._viewFrameDidChange();
    }
    this.endPropertyChanges() ;

    // notify layoutView...
    var layoutView = this.get('layoutView');
    if (layoutView) {
      layoutView.set('childViewsNeedLayout', YES);
      layoutView.layoutDidChangeFor(this) ;
      if (layoutView.get('childViewsNeedLayout')) {
        layoutView.invokeOnce(layoutView.layoutChildViewsIfNeeded);
      }
    }

    this._previousLayout = currentLayout;

    return this ;
  },

  /**
    This this property to YES whenever the view needs to layout its child
    views.  Normally this property is set automatically whenever the layout
    property for a child view changes.

    @property {Boolean}
  */
  childViewsNeedLayout: NO,

  /**
    One of two methods that are invoked whenever one of your childViews
    layout changes.  This method is invoked everytime a child view's layout
    changes to give you a chance to record the information about the view.

    Since this method may be called many times during a single run loop, you
    should keep this method pretty short.  The other method called when layout
    changes, layoutChildViews(), is invoked only once at the end of
    the run loop.  You should do any expensive operations (including changing
    a childView's actual layer) in this other method.

    Note that if as a result of running this method you decide that you do not
    need your layoutChildViews() method run later, you can set the
    childViewsNeedsLayout property to NO from this method and the layout
    method will not be called layer.

    @param {SC.View} childView the view whose layout has changed.
    @returns {void}
  */
  layoutDidChangeFor: function(childView) {
    var set = this._needLayoutViews ;
    if (!set) set = this._needLayoutViews = SC.CoreSet.create();
    set.add(childView);
  },

  /**
    Called your layout method if the view currently needs to layout some
    child views.

    @param {Boolean} isVisible if true assume view is visible even if it is not.
    @returns {SC.View} receiver
    @test in layoutChildViews
  */
  layoutChildViewsIfNeeded: function(isVisible) {
    if (!isVisible) isVisible = this.get('isVisibleInWindow');
    if (isVisible && this.get('childViewsNeedLayout')) {
      this.set('childViewsNeedLayout', NO);
      this.layoutChildViews();
    }
    return this ;
  },

  /**
    Applies the current layout to the layer.  This method is usually only
    called once per runloop.  You can override this method to provide your
    own layout updating method if you want, though usually the better option
    is to override the layout method from the parent view.

    The default implementation of this method simply calls the renderLayout()
    method on the views that need layout.

    @returns {void}
  */
  layoutChildViews: function() {
    var set = this._needLayoutViews,
        len = set ? set.length : 0,
        i;
    for (i = 0; i < len; ++i) {
      set[i].updateLayout();
    }
    set.clear(); // reset & reuse
  },

  /**
    Invoked by the layoutChildViews method to update the layout on a
    particular view.  This method creates a render context and calls the
    renderLayout() method, which is probably what you want to override instead
    of this.

    You will not usually override this method, but you may call it if you
    implement layoutChildViews() in a view yourself.

    @returns {SC.View} receiver
    @test in layoutChildViews
  */
  updateLayout: function() {
    var layer = this.get('layer'), context;
    if (layer) {
      context = this.renderContext(layer);
      this.renderLayout(context, NO);
      context.update();

      // If this view uses static layout, then notify if the frame changed.
      // (viewDidResize will do a comparison)
      if (this.useStaticLayout) this.viewDidResize();
    }
    layer = null ;
    return this ;
  },

  /**
    Default method called by the layout view to actually apply the current
    layout to the layer.  The default implementation simply assigns the
    current layoutStyle to the layer.  This method is also called whenever
    the layer is first created.

    @param {SC.RenderContext} the render context
    @returns {void}
    @test in layoutChildViews
  */
  renderLayout: function(context, firstTime) {
    this.get('layoutStyleCalculator').willRenderAnimations();
    context.addStyle(this.get('layoutStyle'));
    this.get('layoutStyleCalculator').didRenderAnimations();
  },

  _renderLayerSettings: function(original, context, firstTime) {
    original(context, firstTime);
    this.renderLayout(context, firstTime);
  }.enhance(),

  applyAttributesToContext: function(original, context) {
    original(context);

    if (this.get('useStaticLayout')) { context.addClass('sc-static-layout'); }
    if (this.get('backgroundColor')) {
      context.css('backgroundColor', this.get('backgroundColor'));
    }
  }.enhance()
});

SC.View.mixin(
  /** @scope SC.View */ {

  /**
    Convert any layout to a Top, Left, Width, Height layout
  */
  convertLayoutToAnchoredLayout: function(layout, parentFrame){
    var ret = {top: 0, left: 0, width: parentFrame.width, height: parentFrame.height},
        pFW = parentFrame.width, pFH = parentFrame.height, //shortHand for parentDimensions
        lR = layout.right,
        lL = layout.left,
        lT = layout.top,
        lB = layout.bottom,
        lW = layout.width,
        lH = layout.height,
        lcX = layout.centerX,
        lcY = layout.centerY;

    // X Conversion
    // handle left aligned and left/right
    if (!SC.none(lL)) {
      if(SC.isPercentage(lL)) ret.left = lL*pFW;
      else ret.left = lL;
      if (lW !== undefined) {
        if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else if(SC.isPercentage(lW)) ret.width = lW*pFW ;
        else ret.width = lW ;
      } else {
        if (lR && SC.isPercentage(lR)) ret.width = pFW - ret.left - (lR*pFW);
        else ret.width = pFW - ret.left - (lR || 0);
      }

    // handle right aligned
    } else if (!SC.none(lR)) {

      // if no width, calculate it from the parent frame
      if (SC.none(lW)) {
        ret.left = 0;
        if(lR && SC.isPercentage(lR)) ret.width = pFW - (lR*pFW);
        else ret.width = pFW - (lR || 0);

      // If has width, calculate the left anchor from the width and right and parent frame
      } else {
        if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else {
          if (SC.isPercentage(lW)) ret.width = lW*pFW;
          else ret.width = lW;
          if (SC.isPercentage(lR)) ret.left = pFW - (ret.width + lR);
          else ret.left = pFW - (ret.width + lR);
        }
      }

    // handle centered
    } else if (!SC.none(lcX)) {
      if(lW && SC.isPercentage(lW)) ret.width = (lW*pFW) ;
      else ret.width = (lW || 0) ;
      ret.left = ((pFW - ret.width)/2);
      if (SC.isPercentage(lcX)) ret.left = ret.left + lcX*pFW;
      else ret.left = ret.left + lcX;

    // if width defined, assume left of zero
    } else if (!SC.none(lW)) {
      ret.left =  0;
      if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
      else {
        if(SC.isPercentage(lW)) ret.width = lW*pFW;
        else ret.width = lW;
      }

    // fallback, full width.
    } else {
      ret.left = 0;
      ret.width = 0;
    }

    // handle min/max
    if (layout.minWidth !== undefined) ret.minWidth = layout.minWidth ;
    if (layout.maxWidth !== undefined) ret.maxWidth = layout.maxWidth ;

    // Y Conversion
    // handle left aligned and top/bottom
    if (!SC.none(lT)) {
      if(SC.isPercentage(lT)) ret.top = lT*pFH;
      else ret.top = lT;
      if (lH !== undefined) {
        if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else if (SC.isPercentage(lH)) ret.height = lH*pFH;
        else ret.height = lH ;
      } else {
        ret.height = pFH - ret.top;
        if(lB && SC.isPercentage(lB)) ret.height = ret.height - (lB*pFH);
        else ret.height = ret.height - (lB || 0);
      }

    // handle bottom aligned
    } else if (!SC.none(lB)) {

      // if no height, calculate it from the parent frame
      if (SC.none(lH)) {
        ret.top = 0;
        if (lB && SC.isPercentage(lB)) ret.height = pFH - (lB*pFH);
        else ret.height = pFH - (lB || 0);

      // If has height, calculate the top anchor from the height and bottom and parent frame
      } else {
        if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else {
          if (SC.isPercentage(lH)) ret.height = lH*pFH;
          else ret.height = lH;
          ret.top = pFH - ret.height;
          if (SC.isPercentage(lB)) ret.top = ret.top - (lB*pFH);
          else ret.top = ret.top - lB;
        }
      }

    // handle centered
    } else if (!SC.none(lcY)) {
      if(lH && SC.isPercentage(lH)) ret.height = (lH*pFH) ;
      else ret.height = (lH || 0) ;
      ret.top = ((pFH - ret.height)/2);
      if(SC.isPercentage(lcY)) ret.top = ret.top + lcY*pFH;
      else ret.top = ret.top + lcY;

    // if height defined, assume top of zero
    } else if (!SC.none(lH)) {
      ret.top =  0;
      if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
      else if (SC.isPercentage(lH)) ret.height = lH*pFH;
      else ret.height = lH;

    // fallback, full height.
    } else {
      ret.top = 0;
      ret.height = 0;
    }

    if(ret.top) ret.top = Math.floor(ret.top);
    if(ret.bottom) ret.bottom = Math.floor(ret.bottom);
    if(ret.left) ret.left = Math.floor(ret.left);
    if(ret.right) ret.right = Math.floor(ret.right);
    if(ret.width !== SC.LAYOUT_AUTO) ret.width = Math.floor(ret.width);
    if(ret.height !== SC.LAYOUT_AUTO) ret.height = Math.floor(ret.height);

    // handle min/max
    if (layout.minHeight !== undefined) ret.minHeight = layout.minHeight ;
    if (layout.maxHeight !== undefined) ret.maxHeight = layout.maxHeight ;

    return ret;
  },

  /**
    For now can only convert Top/Left/Width/Height to a Custom Layout
  */
  convertLayoutToCustomLayout: function(layout, layoutParams, parentFrame){
    // TODO: [EG] Create Top/Left/Width/Height to a Custom Layout conversion
  }
});

/* >>>>>>>>>> BEGIN source/views/view/manipulation.js */
sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */{

  /**
    This code exists to make it possible to pool SC.Views. We are not going to pool SC.Views in Amber
    */
  _lastLayerId: null,

  /**
    Handles changes in the layer id.
  */
  layerIdDidChange: function() {
    var layer  = this.get('layer'),
        lid    = this.get('layerId'),
        lastId = this._lastLayerId;

    if (lid !== lastId) {
      // if we had an earlier one, remove from view hash.
      if (lastId && SC.View.views[lastId] === this) {
        delete SC.View.views[lastId];
      }

      // set the current one as the new old one
      this._lastLayerId = lid;

      // and add the new one
      SC.View.views[lid] = this;

      // and finally, set the actual layer id.
      if (layer) { layer.id = lid; }
    }
  }.observes("layerId"),

  /**
    This method is called whenever the receiver's parentView has changed.
    The default implementation of this method marks the view's display
    location as dirty so that it will update at the end of the run loop.

    You will not usually need to override or call this method yourself, though
    if you manually patch the parentView hierarchy for some reason, you should
    call this method to notify the view that it's parentView has changed.

    @returns {SC.View} receiver
  */
  parentViewDidChange: function() {
    this.recomputeIsVisibleInWindow() ;

    this.resetBuildState();
    this.set('layerLocationNeedsUpdate', YES) ;
    this.invokeOnce(this.updateLayerLocationIfNeeded) ;

    // We also need to iterate down through the view hierarchy and invalidate
    // all our child view's caches for 'pane', since it could have changed.
    //
    // Note:  In theory we could try to avoid this invalidation if we
    //        do this only in cases where we "know" the 'pane' value might
    //        have changed, but those cases are few and far between.

    this._invalidatePaneCacheForSelfAndAllChildViews();

    return this ;
  },

  /** @private
    We want to cache the 'pane' property, but it's impossible for us to
    declare a dependence on all properties that can affect the value.  (For
    example, if our grandparent gets attached to a new pane, our pane will
    have changed.)  So when there's the potential for the pane changing, we
    need to invalidate the caches for all our child views, and their child
    views, and so on.
  */
  _invalidatePaneCacheForSelfAndAllChildViews: function () {
    var childView, childViews = this.get('childViews'),
        len = childViews.length, idx ;

    this.notifyPropertyChange('pane');

    for (idx=0; idx<len; ++idx) {
      childView = childViews[idx];
      if (childView._invalidatePaneCacheForSelfAndAllChildViews) {
        childView._invalidatePaneCacheForSelfAndAllChildViews();
      }
    }
  },

  // ..........................................................
  // LAYER LOCATION
  //

  /**
    Insert the view into the the receiver's childNodes array.

    The view will be added to the childNodes array before the beforeView.  If
    beforeView is null, then the view will be added to the end of the array.
    This will also add the view's rootElement DOM node to the receivers
    containerElement DOM node as a child.

    If the specified view already belongs to another parent, it will be
    removed from that view first.

    @param {SC.View} view
    @param {SC.View} beforeView
    @returns {SC.View} the receiver
  */
  insertBefore: function(view, beforeView) {
    view.beginPropertyChanges(); // limit notifications

    // remove view from old parent if needed.  Also notify views.
    if (view.get('parentView')) { view.removeFromParent() ; }
    if (this.willAddChild) { this.willAddChild(view, beforeView) ; }
    if (view.willAddToParent) { view.willAddToParent(this, beforeView) ; }

    // set parentView of child
    view.set('parentView', this);

    // add to childView's array.
    var idx, childViews = this.get('childViews') ;
    if (childViews.needsClone) { this.set(childViews = []); }
    idx = (beforeView) ? childViews.indexOf(beforeView) : childViews.length;
    if (idx<0) { idx = childViews.length ; }
    childViews.insertAt(idx, view) ;

    // The DOM will need some fixing up, note this on the view.
    if(view.parentViewDidChange) view.parentViewDidChange();
    if(view.layoutDidChange) view.layoutDidChange();

    view.endPropertyChanges();

    // Make sure all notifications are delayed since the appending
    // doesn't complete until the end of the RunLoop
    // There may be better ways to do this than with invokeLast,
    // but it's the best I can do for now - PDW
    this.invokeLast(function(){
      var pane = view.get('pane');
      if(pane && pane.get('isPaneAttached')) {
        view._notifyDidAppendToDocument();
      }

      // notify views
      if (this.didAddChild) { this.didAddChild(view, beforeView) ; }
      if (view.didAddToParent) { view.didAddToParent(this, beforeView) ; }
    });

    return this ;
  },

  removeChild: function(original, view) {
    if (!view) { return this; } // nothing to do
    if (view.parentView !== this) {
      throw "%@.removeChild(%@) must belong to parent".fmt(this,view);
    }
    // notify views
    if (view.willRemoveFromParent) { view.willRemoveFromParent() ; }
    if (this.willRemoveChild) { this.willRemoveChild(view) ; }

    original(view);

    // The DOM will need some fixing up, note this on the view.
    if(view.parentViewDidChange) view.parentViewDidChange() ;

    // notify views
    if (this.didRemoveChild) { this.didRemoveChild(view); }
    if (view.didRemoveFromParent) { view.didRemoveFromParent(this) ; }

    return this;
  }.enhance(),

  /**
    Replace the oldView with the specified view in the receivers childNodes
    array. This will also replace the DOM node of the oldView with the DOM
    node of the new view in the receivers DOM.

    If the specified view already belongs to another parent, it will be
    removed from that view first.

    @param view {SC.View} the view to insert in the DOM
    @param view {SC.View} the view to remove from the DOM.
    @returns {SC.View} the receiver
  */
  replaceChild: function(view, oldView) {
    // suspend notifications
    view.beginPropertyChanges();
    oldView.beginPropertyChanges();
    this.beginPropertyChanges();

    this.insertBefore(view,oldView).removeChild(oldView) ;

    // resume notifications
    this.endPropertyChanges();
    oldView.endPropertyChanges();
    view.endPropertyChanges();

    return this;
  },

  /**
    Replaces the current array of child views with the new array of child
    views.

    @param {Array} views views you want to add
    @returns {SC.View} receiver
  */
  replaceAllChildren: function(views) {
    var len = views.get('length'), idx;

    this.beginPropertyChanges();
    this.destroyLayer().removeAllChildren();
    for(idx=0;idx<len;idx++) { this.appendChild(views.objectAt(idx)); }
    this.replaceLayer();
    this.endPropertyChanges();

    return this ;
  },

  /**
    Appends the specified view to the end of the receivers childViews array.
    This is equivalent to calling insertBefore(view, null);

    @param view {SC.View} the view to insert
    @returns {SC.View} the receiver
  */
  appendChild: function(view) {
    return this.insertBefore(view, null);
  },

  ///
  /// BUILDING IN/OUT
  ///

  /**
    Call this to append a child while building it in. If the child is not
    buildable, this is the same as calling appendChild.
  */
  buildInChild: function(view) {
    view.willBuildInToView(this);
    this.appendChild(view);
    view.buildInToView(this);
  },

  /**
    Call to remove a child after building it out. If the child is not buildable,
    this will simply call removeChild.
  */
  buildOutChild: function(view) {
    view.buildOutFromView(this);
  },

  /**
    Called by child view when build in finishes. By default, does nothing.

  */
  buildInDidFinishFor: function(child) {
  },

  /**
    @private
    Called by child view when build out finishes. By default removes the child view.
  */
  buildOutDidFinishFor: function(child) {
    this.removeChild(child);
  },

  /**
    Whether the view is currently building in.
  */
  isBuildingIn: NO,

  /**
    Whether the view is currently building out.
  */
  isBuildingOut: NO,

  /**
    Implement this, and call didFinishBuildIn when you are done.
  */
  buildIn: function() {
    this.buildInDidFinish();
  },

  /**
    Implement this, and call didFinsihBuildOut when you are done.
  */
  buildOut: function() {
    this.buildOutDidFinish();
  },

  /**
    This should reset (without animation) any internal states; sometimes called before.

    It is usually called before a build in, by the parent view.
  */
  resetBuild: function() {

  },

  /**
    Implement this if you need to do anything special when cancelling build out;
    note that buildIn will subsequently be called, so you usually won't need to do
    anything.

    This is basically called whenever build in happens.
  */
  buildOutDidCancel: function() {

  },

  /**
    Implement this if you need to do anything special when cancelling build in.
    You probably won't be able to do anything. I mean, what are you gonna do?

    If build in was cancelled, it means build out is probably happening.
    So, any timers or anything you had going, you can cancel.
    Then buildOut will happen.
  */
  buildInDidCancel: function() {

  },

  /**
    Call this when you have built in.
  */
  buildInDidFinish: function() {
    this.isBuildingIn = NO;
    this._buildingInTo.buildInDidFinishFor(this);
    this._buildingInTo = null;
  },

  /**
    Call this when you have finished building out.
  */
  buildOutDidFinish: function() {
    this.isBuildingOut = NO;
    this._buildingOutFrom.buildOutDidFinishFor(this);
    this._buildingOutFrom = null;
  },

  /**
    Usually called by parentViewDidChange, this resets the build state (calling resetBuild in the process).
  */
  resetBuildState: function() {
    if (this.isBuildingIn) {
      this.buildInDidCancel();
      this.isBuildingIn = NO;
    }
    if (this.isBuildingOut) {
      this.buildOutDidCancel();
      this.isBuildingOut = NO;
    }

    // finish cleaning up
    this.buildingInTo = null;
    this.buildingOutFrom = null;

    this.resetBuild();
  },

  /**
    @private (semi)
    Called by building parent view's buildInChild method. This prepares
    to build in, but unlike buildInToView, this is called _before_ the child
    is appended.

    Mostly, this cancels any build out _before_ the view is removed through parent change.
  */
  willBuildInToView: function(view) {
    // stop any current build outs (and if we need to, we also need to build in again)
    if (this.isBuildingOut) {
      this.buildOutDidCancel();
    }
  },

  /**
    @private (semi)
    Called by building parent view's buildInChild method.
  */
  buildInToView: function(view) {
    // if we are already building in, do nothing.
    if (this.isBuildingIn) { return; }

    this._buildingInTo = view;
    this.isBuildingOut = NO;
    this.isBuildingIn = YES;
    this.buildIn();
  },

  /**
    @private (semi)
    Called by building parent view's buildOutChild method.

    The supplied view should always be the parent view.
  */
  buildOutFromView: function(view) {
    // if we are already building out, do nothing.
    if (this.isBuildingOut) { return; }

    // cancel any build ins
    if (this.isBuildingIn) {
      this.buildInDidCancel();
    }

    // in any case, we need to build out
    this.isBuildingOut = YES;
    this.isBuildingIn = NO;
    this._buildingOutFrom = view;
    this.buildOut();
  }
});

/* >>>>>>>>>> BEGIN source/views/view/theming.js */
sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  init: function(original) {
    original();
    this._lastTheme = this.get('theme');
  }.enhance(),

  // ..........................................................
  // THEME SUPPORT
  //

  /**
    Names which theme this view should use; the theme named by this property
    will be set to the view's 'theme' property.

    Themes are identified by their name. In addition to looking for the
    theme globally, SproutCore will look for the theme inside 'baseTheme',
    which is almost always the parent view's theme.

    If null (the default), the view will set its 'theme' property to
    be equal to 'baseTheme'.

    Example: themeName: 'ace'

    @property {String}
  */
  themeName: null,

  /**
    Selects which theme to use as a 'base theme'. If null, the 'baseTheme'
    property will be set to the parent's theme. If there is no parent, the theme
    named by SC.defaultTheme is used.

    This property is private for the time being.

    @private
    @property {String}
  */
  baseThemeName: null,

  /**
    The SC.Theme instance which this view should use to render.

    Note: the actual code for this function is in _themeProperty for backwards-compatibility:
    some older views specify a string value for 'theme', which would override this property,
    breaking it.

    @property {SC.Theme}
  */
  theme: function() {
    var base = this.get('baseTheme'), themeName = this.get('themeName');

    // find theme, if possible
    if (themeName) {
      // Note: theme instance "find" function will search every parent
      // _except_ global (which is not a parent)
      var theme;
      if (base) {
        theme = base.find(themeName);
        if (theme) { return theme; }
      }

      theme = SC.Theme.find(themeName);
      if (theme) { return theme; }

      // Create a new invisible subtheme. This will cause the themeName to
      // be applied as a class name.
      return base.invisibleSubtheme(themeName);
    }

    // can't find anything, return base.
    return base;
  }.property('baseTheme', 'themeName').cacheable(),

  /**
    Detects when the theme changes. Replaces the layer if necessary.

    Also, because
  */
  _sc_view_themeDidChange: function() {
    if (this._lastTheme === this.get('theme')) { return; }
    this._lastTheme = this.get('theme');

    // invalidate child view base themes, if present
    var childViews = this.childViews, len = childViews.length, idx;
    for (idx = 0; idx < len; idx++) {
      childViews[idx].notifyPropertyChange('baseTheme');
    }

    if (this.get('layer')) { this.replaceLayer(); }
  }.observes('theme'),

  /**
    The SC.Theme instance in which the 'theme' property should look for the theme
    named by 'themeName'.

    For example, if 'baseTheme' is SC.AceTheme, and 'themeName' is 'popover',
    it will look to see if SC.AceTheme has a child theme named 'popover',
    and _then_, if it is not found, look globally.

    @private
    @property {SC.Theme}
  */
  baseTheme: function() {
    var parent;
    var baseThemeName = this.get('baseThemeName');
    if (baseThemeName) {
      return SC.Theme.find(baseThemeName);
    } else {
      parent = this.get('parentView');
      var theme  = parent && parent.get('theme');
      return   theme || SC.Theme.find(SC.defaultTheme);
    }
  }.property('baseThemeName', 'parentView').cacheable(),

  /**
    The object to which rendering and updating the HTML representation of this
    view should be delegated.

    By default, views are responsible for creating their own HTML
    representation. In some cases, however, you may want to create an object
    that is responsible for rendering all views of a certain type. For example,
    you may want rendering of SC.ButtonView to be controlled by an object that
    is specific to the current theme.

    By setting a render delegate, the render and update methods will be called
    on that object instead of the view itself.

    For your convenience, the view will provide its displayProperties to the
    RenderDelegate. In some cases, you may have a conflict between the RenderDelegate's
    API and your view's. For instance, you may have a 'value' property that is
    any number, but the render delegate expects a percentage. Make a 'displayValue'
    property, add _it_ to displayProperties instead of 'value', and the Render Delegate
    will automatically use that when it wants to find 'value.'

    You can also set the render delegate by using the 'renderDelegateName' property.

    @property {Object}
  */
  renderDelegate: function(key, value) {
    if (value) { this._setRenderDelegate = value; }
    if (this._setRenderDelegate) { return this._setRenderDelegate; }

    // If this view does not have a render delegate but has
    // renderDelegateName set, try to retrieve the render delegate from the
    // theme.
    var renderDelegateName = this.get('renderDelegateName'), renderDelegate;

    if (renderDelegateName) {
      renderDelegate = this.get('theme')[renderDelegateName];
      if (!renderDelegate) {
        throw "%@: Unable to locate render delegate \"%@\" in theme.".fmt(this, renderDelegateName);
      }

      return renderDelegate;
    }

    return null;
  }.property('renderDelegateName', 'theme'),

  /**
    The name of the property of the current theme that contains the render
    delegate to use for this view.

    By default, views are responsible for creating their own HTML
    representation. You can tell the view to instead delegate rendering to the
    theme by setting this property to the name of the corresponding property
    of the theme.

    For example, to tell the view that it should render using the
    SC.ButtonView render delegate, set this property to
    'buttonRenderDelegate'. When the view is created, it will retrieve the
    buttonRenderDelegate property from its theme and set the renderDelegate
    property to that object.
  */
  renderDelegateName: null,

  /**
    [RO] Pass this object as the data source for render delegates. This proxy object
    for the view relays requests for properties like 'title' to 'displayTitle'
    as necessary.

    If you ever communicate with your view's render delegate, you should pass this
    object as the data source.

    The proxy that forwards RenderDelegate requests for properties to the view,
    handling display*, keeps track of the delegate's state, etc.
  */
  renderDelegateProxy: function() {
    return SC.View._RenderDelegateProxy.createForView(this);
  }.property('renderDelegate').cacheable(),

  /**
    Invoked whenever your view needs to create its HTML representation.

    You will normally override this method in your subclassed views to
    provide whatever drawing functionality you will need in order to
    render your content.

    This method is usually only called once per view. After that, the update
    method will be called to allow you to update the existing HTML
    representation.


    The default implementation of this method calls renderChildViews().

    For backwards compatibility, this method will also call the appropriate
    method on a render delegate object, if your view has one.

    @param {SC.RenderContext} context the render context
    @returns {void}
  */
  render: function(context, firstTime) {
    var renderDelegate = this.get('renderDelegate');

    if (renderDelegate) {
      if (firstTime) {
        renderDelegate.render(this.get('renderDelegateProxy'), context);
      } else {
        renderDelegate.update(this.get('renderDelegateProxy'), context.$());
      }
    }
  },

  applyAttributesToContext: function(original, context) {
    var theme = this.get('theme');
    var themeClassNames = theme.classNames, idx, len = themeClassNames.length;

    for (idx = 0; idx < len; idx++) {
      context.addClass(themeClassNames[idx]);
    }

    original(context);

    var renderDelegate = this.get('renderDelegate');
    if (renderDelegate && renderDelegate.className) {
      context.addClass(renderDelegate.className);
    }
    
    
    if (renderDelegate && renderDelegate.name) {
      SC.Logger.error("Render delegates now use 'className' instead of 'name'.");
      SC.Logger.error("Name '%@' will be ignored.", renderDelegate.name);
    }
    
  }.enhance()
});

/**
  @class
  @private
  View Render Delegate Proxies are tool SC.Views use to:

  a) limit properties the render delegate can access to the displayProperties
  b) look up 'display*' ('displayTitle' instead of 'title') to help deal with
     differences between the render delegate's API and the view's.

  RenderDelegateProxies are fully valid data sources for render delegates. They
  act as proxies to the view, interpreting the .get and .didChangeFor commands
  based on the view's displayProperties.

  This tool is not useful outside of SC.View itself, and as such, is private.
*/
SC.View._RenderDelegateProxy = {

  // for testing:
  isViewRenderDelegateProxy: YES,

  /**
    Creates a View Render Delegate Proxy for the specified view.

    Implementation note: this creates a hash of the view's displayProperties
    array so that the proxy may quickly determine whether a property is a
    displayProperty or not. This could cause issues if the view's displayProperties
    array is modified after instantiation.

    @param {SC.View} view The view this proxy should proxy to.
    @returns SC.View._RenderDelegateProxy
  */
  createForView: function(view) {
    var ret = SC.beget(this);

    // set up displayProperty lookup for performance
    var dp = view.get('displayProperties'), lookup = {};
    for (var idx = 0, len = dp.length; idx < len; idx++) {
      lookup[dp[idx]] = YES;
    }

    // also allow the few special properties through
    lookup.theme = YES;

    ret._displayPropertiesLookup = lookup;
    ret.renderState = {};

    ret._view = view;
    return ret;
  },


  /**
    Provides the render delegate with any property it needs.

    This first looks up whether the property exists in the view's
    displayProperties, and whether it exists prefixed with 'display';
    for instance, if the render delegate asks for 'title', this will
    look for 'displayTitle' in the view's displayProperties array.

    If the property is not in `displayProperties`, but a property
    is defined on the view, an error will be thrown to assist in
    debugging.

   @param {String} property The name of the property the render delegate needs.
   @returns The value.
  */
  get: function(property) {
    if (this[property] !== undefined) { return this[property]; }

    var displayProperty = 'display' + property.capitalize();

    if (this._displayPropertiesLookup[displayProperty]) {
      return this._view.get(displayProperty);
    } else if (this._displayPropertiesLookup[property]) {
      return this._view.get(property);
    }

    return undefined;
  },

  /**
   Checks if any of the specified properties have changed.

   For each property passed, this first determines whether to use the
   'display' prefix. Then, it calls view.didChangeFor with context and that
   property name.
  */
  didChangeFor: function(context) {
    var len = arguments.length, idx;
    for (idx = 1; idx < len; idx++) {
      var property = arguments[idx],
          displayProperty = 'display' + property.capitalize();

      if (this._displayPropertiesLookup[displayProperty]) {
        if (this._view.didChangeFor(context, displayProperty)) { return YES; }
      } else if (this._displayPropertiesLookup[property]) {
        if (this._view.didChangeFor(context, property)) { return YES; }
      }
    }

    return NO;
  }
};

/**
  Generates a computed property that will look up the specified property from
  the view's render delegate, if present. You may specify a default value to
  return if there is no such property or is no render delegate.
  
  The generated property is read+write, so it may be overriden.
  
  @param {String} propertyName The name of the property to get from the render delegate..
  @param {Value} def The default value to use if the property is not present.
*/
SC.propertyFromRenderDelegate = function(propertyName, def) {
  return function(key, value) {
    // first, handle set() case
    if (value !== undefined) {
      this['_set_rd_' + key] = value;
    }

    // use any value set manually via set()  -- two lines ago.
    var ret = this['_set_rd_' + key];
    if (ret !== undefined) return ret;

    // finally, try to get it from the render delegate
    var renderDelegate = this.get('renderDelegate');
    if (renderDelegate && renderDelegate.get) {
      var proxy = this.get('renderDelegateProxy');
      ret = renderDelegate.getPropertyFor(proxy, propertyName);
    }

    if (ret !== undefined) return ret;
    
    return def;
  }.property('renderDelegate').cacheable();
};



/* >>>>>>>>>> BEGIN source/views/view/touch.js */
sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  // ..........................................................
  // MULTITOUCH SUPPORT
  //
  /**
    Set to YES if you want to receive touch events for each distinct touch (rather than only
    the first touch start and last touch end).
  */
  acceptsMultitouch: NO,

  /**
    Is YES if the view is currently being touched. NO otherwise.
  */
  hasTouch: NO,

  /**
    A boundary set of distances outside which the touch will not be considered "inside" the view anymore.

    By default, up to 50px on each side.
  */
  touchBoundary: { left: 50, right: 50, top: 50, bottom: 50 },

  /**
    @private
    A computed property based on frame.
  */
  _touchBoundaryFrame: function (){
    return this.get("parentView").convertFrameToView(this.get('frame'), null);
  }.property("frame", "parentView").cacheable(),

  /**
    Returns YES if the provided touch is within the boundary.
  */
  touchIsInBoundary: function(touch) {
    var f = this.get("_touchBoundaryFrame"), maxX = 0, maxY = 0, boundary = this.get("touchBoundary");
    var x = touch.pageX, y = touch.pageY;

    if (x < f.x) {
      x = f.x - x;
      maxX = boundary.left;
    } else if (x > f.x + f.width) {
      x = x - (f.x + f.width);
      maxX = boundary.right;
    } else {
      x = 0;
      maxX = 1;
    }

    if (y < f.y) {
      y = f.y - y;
      maxY = boundary.top;
    } else if (y > f.y + f.height) {
      y = y - (f.y + f.height);
      maxY = boundary.bottom;
    } else {
      y = 0;
      maxY = 1;
    }

    if (x > 100 || y > 100) return NO;
    return YES;
  }
});

/* >>>>>>>>>> BEGIN source/views/view/visibility.js */
sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  /**
    Set to YES to indicate the view has visibility support added.
  */
  hasVisibility: YES,

  /**
    YES only if the view and all of its parent views are currently visible
    in the window.  This property is used to optimize certain behaviors in
    the view.  For example, updates to the view layer are not performed
    if the view until the view becomes visible in the window.
  */
  isVisibleInWindow: NO,

  /**
   By default we don't disable the context menu. Overriding this property
   can enable/disable the context menu per view.
  */
  isContextMenuEnabled: function() {
    return SC.CONTEXT_MENU_ENABLED;
  }.property(),

  /**
    Recomputes the isVisibleInWindow property based on the visibility of the
    view and its parent.  If the recomputed value differs from the current
    isVisibleInWindow state, this method will also call
    recomputIsVisibleInWindow() on its child views as well.  As an optional
    optimization, you can pass the isVisibleInWindow state of the parentView
    if you already know it.

    You will not generally need to call or override this method yourself. It
    is used by the SC.View hierarchy to relay window visibility changes up
    and down the chain.

    @property {Boolean} parentViewIsVisible
    @returns {SC.View} receiver
  */
  recomputeIsVisibleInWindow: function(parentViewIsVisible) {
    var previous = this.get('isVisibleInWindow'),
        current  = this.get('isVisible'),
        parentView;

    // isVisibleInWindow = isVisible && parentView.isVisibleInWindow
    // this approach only goes up to the parentView if necessary.
    if (current) {
      // If we weren't passed in 'parentViewIsVisible' (we generally aren't;
      // it's an optimization), then calculate it.
      if (parentViewIsVisible === undefined) {
        parentView = this.get('parentView');
        parentViewIsVisible = parentView ? parentView.get('isVisibleInWindow') : NO;
      }
      current = current && parentViewIsVisible;
    }

    // If our visibility has changed, then set the new value and notify our
    // child views to update their value.
    if (previous !== current) {
      this.set('isVisibleInWindow', current);

      var childViews = this.get('childViews'), len = childViews.length, idx, view;
      for(idx=0;idx<len;idx++) {
        view = childViews[idx];
        if(view.recomputeIsVisibleInWindow) { view.recomputeIsVisibleInWindow(current); }
      }

      // For historical reasons, we'll also layout the child views if
      // necessary.
      if (current) {
        if (this.get('childViewsNeedLayout')) { this.invokeOnce(this.layoutChildViewsIfNeeded); }
      }
      else {
        // Also, if we were previously visible and were the first responder,
        // resign it.  This more appropriately belongs in a
        // 'isVisibleInWindow' observer or some such helper method because
        // this work is not strictly related to computing the visibility, but
        // view performance is critical, so avoiding the extra observer is
        // worthwhile.
        if (this.get('isFirstResponder')) { this.resignFirstResponder(); }
      }
    }

    // If we're in this function, then that means one of our ancestor views
    // changed, or changed its 'isVisibleInWindow' value.  That means that if
    // we are out of sync with the layer, then we need to update our state
    // now.
    //
    // For example, say we're isVisible=NO, but we have not yet added the
    // 'sc-hidden' class to the layer because of the "don't update the layer if
    // we're not visible in the window" check.  If any of our parent views
    // became visible, our layer would incorrectly be shown!
    this.updateLayerIfNeeded(YES);

    return this;
  },


  /** @private
    Whenever the view's visibility changes, we need to recompute whether it is
    actually visible inside the window (a view is only visible in the window
    if it is marked as visibile and its parent view is as well), in addition
    to updating the layer accordingly.
  */
  _sc_isVisibleDidChange: function() {
    // 'isVisible' is effectively a displayProperty, but we'll call
    // displayDidChange() manually here instead of declaring it as a
    // displayProperty because that avoids having two observers on
    // 'isVisible'.  A single observer is:
    //   a.  More efficient
    //   b.  More correct, because we can guarantee the order of operations
    this.displayDidChange();

    this.recomputeIsVisibleInWindow();
  }.observes('isVisible')
})

/* >>>>>>>>>> BEGIN source/panes/main.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('panes/pane');

/** @class

  Most SproutCore applications have a main pane, which dominates the 
  application page.  You can extend from this view to implement your own main 
  pane.  This class will automatically make itself main whenever you append it 
  to a document, removing any other main pane that might be currently in 
  place.  If you do have another already focused as the keyPane, this view 
  will also make itself key automatically.  The default way to use the main 
  pane is to simply add it to your page like this:
  
      SC.MainPane.create().append();
  
  This will cause your root view to display.  The default layout for a 
  MainPane is to cover the entire document window and to resize with the 
  window.

  @extends SC.Pane
  @since SproutCore 1.0
*/
SC.MainPane = SC.Pane.extend({
  /** @private */
  layout: { top: 0, left: 0, bottom: 0, right: 0, minHeight:200, minWidth:200 },
  
  /** @private - extends SC.Pane's method */
  paneDidAttach: function() {
    var ret = arguments.callee.base.apply(this,arguments);
    var responder = this.rootResponder;
    responder.makeMainPane(this);
    if (!responder.get('keyRootView')) responder.makeKeyPane(this);
    return ret ;
  },
  
  /** @private */
  acceptsKeyPane: YES,

  /** @private */
  classNames: ['sc-main'],
  
  ariaRole: 'application'
  
});

