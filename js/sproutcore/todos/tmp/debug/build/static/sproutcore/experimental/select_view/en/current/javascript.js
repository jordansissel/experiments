/* >>>>>>>>>> BEGIN source/ext/menu.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  Enhances SC.MenuPane to add support for automatic resizing.
*/
SC.MenuPane = SC.MenuPane; // for docs

SC.MenuPane.reopen(
/** @scope SC.MenuPane.prototype */ {

  /**
    If YES, the menu should automatically resize its width to fit its items.

    This will swap out the default SC.MenuItemView. If you are using a custom
    exampleView, you will need to mix SC.AutoResize into your exampleView
    and set shouldAutoResize to NO (the actual resizing will be handled
    by SC.MenuPane).

    This property must be set before instantiation; any changes after instantiation
    will not function properly.
    
    @property
    @type {Boolean}
    @default YES
  */
  shouldAutoResize: YES,

  /**
    The minimum width for this menu if it is to be automatically resized.
    
    If no value is specified, it will be determined from the controlSize.
    
    @property {Number}
    @default minimumMenuWidth from render delegate, or 0.
  */
  minimumMenuWidth: SC.propertyFromRenderDelegate('minimumMenuWidth', 0),

  /**
    The amount to add to any calculated width.
    
    If no value is specified, it will be determined from the controlSize.
    
    @property {Number}
    @default menuWidthPadding from render delegate, or 0
  */
  menuWidthPadding: SC.propertyFromRenderDelegate('menuWidthPadding', 0),

  /**
    @private
    In addition to the normal init, we need to schedule an automatic resize.
  */
  init: function(orig) {
    orig();

    if (this.get('shouldAutoResize')) {
      this.invokeOnce('_updateMenuWidth');
    }
  }.enhance(),

  /**
    The array of child menu item views that compose the menu.

    This computed property parses @displayItems@ and constructs an SC.MenuItemView (or whatever class you have set as the @exampleView@) for every item.

    @property
    @type Array
    @readOnly
    @private
  */
  createMenuItemViews: function(orig) {
    // EXTENDED to set shouldMeasureSize to its initial value and to
    // observe the measured size.
    var views = orig();

    var idx, len = views.length, view;
    if (this.get('shouldAutoResize')) {
      for (idx = 0; idx < len; idx++) {
        view = views[idx];

        // set up resizing if we want
        view.set('shouldMeasureSize', YES);
        view.addObserver('measuredSize', this, this._menuItemMeasuredSizeDidChange);
      }
    }

    return views;
  }.enhance(),

  _menuItemViewsDidChange: function() {
    if (this.get('shouldAutoResize')) this.invokeOnce('_updateMenuWidth');
  }.observes('menuItemViews'),

  _menuItemMeasuredSizeDidChange: function(menuItem) {
    this.invokeOnce('_updateMenuWidth');
  },

  _menuMinimumMenuWidthDidChange: function() {
    this.invokeOnce('_updateMenuWidth');
  }.observes('minimumMenuWidth'),

  _updateMenuWidth: function() {
    var menuItemViews = this.get('menuItemViews');
    if (!menuItemViews) return;

    var len = menuItemViews.length, idx, view,
        width = this.get('minimumMenuWidth');

    for (idx = 0; idx < len; idx++) {
      view = menuItemViews[idx];
      width = Math.max(width, view.get('measuredSize').width + this.get('menuWidthPadding'));
    }

    this.adjust('width', width);
  }
});

/* >>>>>>>>>> BEGIN source/ext/menu_item.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  Enhances SC.MenuItemView to support auto resize.
*/
SC.MenuItemView = SC.MenuItemView; // for docs

SC.MenuItemView.reopen(SC.AutoResize);
SC.MenuItemView.reopen(
/** @scope SC.MenuItemView.prototype */{

  //
  // For automatic resizing, if enabled (to be enabled by parent menu)
  //
  /**
    The item view is capable of automatic resizing.
    
    @private
    @property
    @type {Boolean}
  */
  supportsAutoResize: YES,

  /**
    The menu item should NOT change its own width and height.
    
    @private
    @property
    @type {Boolean}
  */
  shouldAutoResize: NO,
  
  /**
    If YES, the menu item will measure its width and height so that the menu
    can automatically resize itself. This is usually set by the parent menu.
    
    @property
    @type {Boolean}
    @default NO
  */
  shouldMeasureSize: NO,

  // NOTE: this property could come from the theme at some point, but MenuItemView
  // would have to be migrated to render delegates first. MenuPane adds the
  // necessary padding for now.
  autoResizePadding: 0,
  
  /** @private */
  autoResizeText: function() {
    return this.get('title');
  }.property('title'),

  /** @private */
  autoResizeLayer: function() {
    return this.$('.value')[0];
  }.property('layer').cacheable(),

  /**
   * @private
   * When we render, we recreate all of the DOM, including the element that gets measured.
   * This is a problem because our autoResizeLayer changes. So, we must invalidate that
   * layer whenever we re-render.
   *
   * We need to move menu item rendering into a render delegate. When this happens, there
   * are a few ways we could do it:
   *
   * - Give render delegate method to find clientWidth and return it: 
   *   getMenuItemTitleWidth(dataSource, $)
   *
   * - Make render delegate provide the autoResizeLayer:
   *   In this case, the autoResizeLayer might be a computed property that we invalidate
   *   on didUpdateLayer, and that calls a method like getAutoResizeLayer. Alternatively,
   *   if render delegate properties are added, we could make this one of those, but it
   *   would need some way to access the DOM. Maybe data sources can have $ properties or
   *   methods? Maybe a jQuery property/method?
  */
  didUpdateLayer: function() {
    this.notifyPropertyChange('autoResizeLayer');
    this.scheduleMeasurement();
  }.enhance()

}) ;



/* >>>>>>>>>> BEGIN source/mixins/select_view_menu.js */
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
 * Binds a menu view to an owning SC.SelectView, and checks selected items.
 *
 * @mixin
 *
 */
SC.SelectViewMenu = {
  /**
    The SelectView to bind to.
    
    @property
    @type {SC.SelectView}
    @default null
  */
  selectView: null,

  //
  // CODE TO MAKE ITEMS BE CHECKED WHEN SELECTED:
  //
  
  /**
    The current value of the SelectView.
    
    @property
    @default null
  */
  value: null,
  valueBinding: '.selectView.value',


  /** 
    @private 
    Invalidates menu items' isChecked property when the selectView's value changes.
  */
  valueDidChange: function() {
    var items = this.get('menuItemViews'), idx, len = items.length, item;
    for (idx = 0; idx < len; idx++) {
      // if the item currently is checked, or if it _should_ be checked, we need to
      // invalidate the isChecked property.
      item = items[idx];
      if (item._lastIsChecked) {
        item.notifyPropertyChange('isChecked');
      }

      if (item.get('isChecked')) {
        item.notifyPropertyChange('isChecked');
      }
    }
  }.observes('value'),

  /**
    An overridden MenuItemView to create for each menu item that makes itself checked if
    it is selected.
    
    @property
    @type {SC.MenuItemView}
    @default SC.MenuItemView subclass
  */
  exampleView: SC.MenuItemView.extend({
    isChecked: function() {
      // _lastIsChecked is used by the SelectViewMenu mixin above to determine whether
      // the isChecked property needs to be invalidated.
      this._lastIsChecked = this.getContentProperty('itemValueKey') === this.getPath('parentMenu.rootMenu.value');
      return this._lastIsChecked;
    }.property(),

    displayProperties: ['isChecked']
  }),

  //
  // CODE TO BIND TO SELECTVIEW PROPERTIES
  //
  
  /** @private */
  _svm_bindToProperties: [
    'items',
    'itemTitleKey', 'itemIsEnabledKey', 'itemValueKey', 'itemIconKey', 
    'itemHeightKey', 'itemSubMenuKey', 'itemSeparatorKey', 'itemTargetKey',
    'itemActionKey', 'itemCheckboxKey', 'itemShortCutKey',
    'itemKeyEquivalentKey', 'itemDisableMenuFlashKey', 'minimumMenuWidth',
    
    'preferType', 'preferMatrix'
  ],

  /** @private */
  _svm_setupBindings: function() {
    var bindTo = this.get('selectView');
    if (!bindTo) {
      return;
    }

    var props = this._svm_bindToProperties, idx, len = props.length, key;

    for (idx = 0; idx < len; idx++) {
      key = props[idx];
      this[key + 'Binding'] = this.bind(key, bindTo, key);
    }

    this._svm_isBoundTo = bindTo;
  },

  /** @private */
  _svm_clearBindings: function() {
    var boundTo = this._svm_isBoundTo;
    if (!boundTo) {
      return;
    }

    var props = this._svm_bindToProperties, idx, len = props.length, key;

    for (idx = 0; idx < len; idx++) {
      key = props[idx];
      this[key + 'Binding'].disconnect();
    }
  },

  /** @private */
  _svm_selectViewDidChange: function() {
    this._svm_clearBindings();
    this._svm_setupBindings();
  }.observes('selectView'),

  /** @private */
  initMixin: function() {
    this._svm_setupBindings();
  },

  /** @private */
  destroyMixin: function() {
    this._svm_clearBindings();
  }
};



/* >>>>>>>>>> BEGIN source/render_delegates/select_button.js */
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  Renders and updates the DOM representation of a SelectView.
*/
SC.BaseTheme.selectRenderDelegate = SC.BaseTheme.buttonRenderDelegate.create({
  menuLeftOffset: -3,
  menuTopOffset: 2,
  menuMinimumWidthOffset: -18
});

/* >>>>>>>>>> BEGIN source/views/popup_button.js */
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
 * @class
 * @extends SC.ButtonView
 * @version 1.6
 * @author Alex Iskander
 */
SC.PopupButtonView = SC.ButtonView.extend({
  /** @scope SC.PopupButtonView.prototype */


  /**
    The render delegate to use to render and update the HTML for the PopupButton.
    
    @type String
    @default 'popupButtonRenderDelegate'
  */
  renderDelegateName: 'popupButtonRenderDelegate',

  /**
    The menu that will pop up when this button is clicked. This can be a class or
    an instance.
    
    @type {SC.MenuPane}
    @default SC.MenuPane
  */
  menu: SC.MenuPane,

  /**
    If YES, a menu instantiation task will be placed in SproutCore's
    `SC.backgroundTaskQueue` so the menu will be instantiated before 
    the user taps the button, improving response time.

    @type Boolean
    @default NO
    @property
  */
  shouldLoadInBackground: NO,

  /**
   * @private
   * If YES, the menu has been instantiated; if NO, the 'menu' property
   * still has a class instead of an instance.
  */
  _menuIsLoaded: NO,

  /** @private
    isActive is NO, but when the menu is instantiated, it is bound to the menu's isVisibleInWindow property.
  */
  isActive: NO,

  acceptsFirstResponder: YES,
  

  /**
    @private
  */
  init: function() {
    arguments.callee.base.apply(this,arguments);

    // keep track of the current instantiated menu separately from
    // our property. This allows us to destroy it when the property
    // changes, and to track if the property change was initiated by
    // us (since we set `menu` to the instantiated menu).
    this._currentMenu = null;
    this.invokeOnce('scheduleMenuSetupIfNeeded');
  },

  /**
    Adds menu instantiation to the background task queue if the menu
    is not already instantiated and if shouldLoadInBackground is YES.
    
    @method
    @private
   */
  scheduleMenuSetupIfNeeded: function() {
    var menu = this.get('menu');

    if (menu && menu.isClass && this.get('shouldLoadInBackground')) {
      SC.backgroundTaskQueue.push(SC.PopupButtonView.InstantiateMenuTask.create({ popupButton: this }));
    }
  },

  /** @private if the menu changes, it must be set up again. */
  menuDidChange: function() {
    // first, check if we are the ones who changed the property
    // by setting it to the instantiated menu
    var menu = this.get('menu');
    if (menu === this._currentMenu) { 
      return;
    }

    this.invokeOnce('scheduleMenuSetupIfNeeded');
  }.observes('menu'),

  /**
   Instantiates the menu if it exists and is not already instantiated.
   If another menu is already instantiated, it will be destroyed.
  */
  setupMenu: function() {
    var menu = this.get('menu');

    // handle our existing menu, if any
    if (menu === this._currentMenu) { return; }
    if (this._currentMenu) {
      this.isActiveBinding.disconnect();

      this._currentMenu.destroy();
      this._currentMenu = null;
    }

    // do not do anything if there is nothing to do.
    if (menu && menu.isClass) {
      menu = this.createMenu(menu);
    }

    this._currentMenu = menu;
    this.set('menu', menu);

    this.isActiveBinding = this.bind('isActive', menu, 'isVisibleInWindow');
  },

  /**
    Called to instantiate a menu. You can override this to set properties
    such as the menu's width or the currently selected item.
    
    @param {SC.MenuPane} menu The MenuPane class to instantiate.
  */
  createMenu: function(menu) {
    return menu.create();
  },


  /**
    Shows the PopupButton's menu. You can call this to show it manually.
    
    NOTE: The menu will not be shown until the end of the Run Loop.
  */
  showMenu: function() {
    // problem: menu's bindings may not flush
    this.setupMenu();

    // solution: pop up the menu later. Ugly-ish, but not too bad:
    this.invokeLast('_showMenu');
  },

  /**
    Hides the PopupButton's menu if it is currently showing.
  */
  hideMenu: function() {
    var menu = this.get('menu');
    if (menu && !menu.isClass) {
      menu.remove();
    }
  },

  /**
    The prefer matrix (positioning information) to use to pop up the new menu.
    
    @property
    @type Array
    @default [0, 0, 0]
  */
  menuPreferMatrix: [0, 0, 0],

  /**
    @private
    The actual showing of the menu is delayed because bindings may need
    to flush.
  */
  _showMenu: function() {
    var menu = this.get('menu');

    menu.popup(this, this.get('menuPreferMatrix'));
  },

  /** @private */
  mouseDown: function(evt) {
    // If disabled, handle mouse down but ignore it.
    if (!this.get('isEnabled')) return YES ;

    this.set('_mouseDown', YES);

    this.showMenu();

    this._mouseDownTimestamp = new Date().getTime();
    this.becomeFirstResponder();

    return YES;
  },

  /** @private */
  mouseUp: function(evt) {
    var menu = this.get('menu'), targetMenuItem, success;

    if (menu && this.get('_mouseDown')) {
      targetMenuItem = menu.getPath('rootMenu.targetMenuItem');

      if (targetMenuItem && menu.get('mouseHasEntered')) {
        // Have the menu item perform its action.
        // If the menu returns NO, it had no action to
        // perform, so we should close the menu immediately.
        if (!targetMenuItem.performAction()) {
          menu.remove();
        }
      } else {
        // If the user waits more than 200ms between mouseDown and mouseUp,
        // we can assume that they are clicking and dragging to the menu item,
        // and we should close the menu if they mouseup anywhere not inside
        // the menu.
        if (this._mouseDownTimestamp && evt.timeStamp - this._mouseDownTimestamp > 400) {
          menu.remove();
        }
      }
    }

    this._mouseDownTimestamp = undefined;
    return YES;
  },

  /**
    @private
    
    Shows the menu when the user presses Enter. Otherwise, hands it off to button
    to decide what to do.
  */
  keyDown: function(event) {
    if (event.which == 13) {
      this.showMenu();
      return YES;
    }

    return arguments.callee.base.apply(this,arguments);
  }
});

/**
  @class
  
  An SC.Task that handles instantiating a PopupButtonView's menu. It is used
  by SC.PopupButtonView to instantiate the menu in the backgroundTaskQueue.
*/
SC.PopupButtonView.InstantiateMenuTask = SC.Task.extend(
  /**@scope SC.PopupButtonView.InstantiateMenuTask.prototype */ {
    
  /**
    The popupButton whose menu should be instantiated.
    
    @property
    @type {SC.PopupButtonView}
    @default null
  */
  popupButton: null,
  
  /** Instantiates the menu. */
  run: function(queue) {
    this.popupButton.setupMenu();
  }
});


/* >>>>>>>>>> BEGIN source/views/select.js */
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/popup_button');
sc_require('mixins/select_view_menu');

/**
 * @class
 * @extends SC.PopupButtonView
 * @version 2.0
 * @author Alex Iskander
 */
SC.SelectView = SC.PopupButtonView.extend({
  /** @scope SC.SelectView.prototype */

  //
  // Properties
  //
  theme: 'popup',
  renderDelegateName: 'selectRenderDelegate',

  /**
    The array of items to populate the menu. This can be a simple array of strings,
    objects or hashes. If you pass objects or hashes, you can also set the
    various itemKey properties to tell the menu how to extract the information
    it needs.

    @property {Array}
    @default []
  */
  items: null,

  /**
    Binding default for an array of items

    @property
    @default SC.Binding.multiple()
  */
  itemsBindingDefault: SC.Binding.multiple(),

  /**
    They key in the items which maps to the title.
    This only applies for items that are hashes or SC.Objects.

    @property
    @type {String}
    @default 'title'
  */
  itemTitleKey: 'title',

  /**
    If you set this to a non-null value, then the value of this key will
    be used to sort the items.  If this is not set, then itemTitleKey will
    be used.

    @property
    @type: {String}
    @default null
  */
  itemSortKey: null,

  /**
    They key in the items which maps to the value.
    This only applies for items that are hashes or SC.Objects.

     @property
     @type {String}
     @default 'value'
  */
  itemValueKey: 'value',

  /**
     Key used to extract icons from the items array.
     
     @property
     @type {String}
     @default null
  */
  itemIconKey: null,
  
  /**
    Key to use to identify separators.
    
    Items that have this property set to YES will be drawn as separators.
    
    @property
    @type {String}
    @default null
  */
  itemSeparatorKey: "separator",
  
  /**
    Key used to indicate if the item is to be enabled.
    
    @property
    @type {String}
    @default null
  */
  itemIsEnabledKey: "isEnabled",


  /**
   The menu that will pop up when this button is clicked.
   
   The default menu has its properties bound to the SC.SelectView,
   meaning that it will get all its items from the SelectView.
   You may override the menu entirely with one of your own; if you
   mix in SC.SelectViewMenu, it'll get the bindings and the extended
   MenuItemView that draws its checkbox when it is the selected item.
   
   @property
   @type {SC.MenuPane}
   @default SC.MenuPane.extend(SC.SelectViewMenu)
  */
  menu: SC.MenuPane.extend(SC.SelectViewMenu),

  /**
    The currently selected item. If no item is selected, `null`.
    
    @private
    @property {SC.Object}
    @default null
    @isReadOnly
   */
  selectedItem: null,
  selectedItemBinding: '*menu.rootMenu.selectedItem',


  /**
    This is a property to enable/disable focus rings in buttons. 
    For SelectView, it is a default.
    
    @property
    @type {Boolean}
    @default YES
  */
  supportsFocusRing: YES,


  /**
    * @private
  */
  init: function() {
    arguments.callee.base.apply(this,arguments);

    // call valueDidChange to get the initial item, if any
    this._scsv_valueDidChange();
  },

  /**
    @private

    This gets the value for a specific menu item. This function allows a few different
    forms of input:

    - A string: returns the string.
    - A hash: returns hash[itemValueKey], using 'value' for the key if necessary.
    - An SC.Object: returns object.get(itemValueKey), using 'value' for the key if needed.

    This method therefore accepts both the menu items as created for the menupane's displayItems
    AND the raw items provided by the developer in `items`.
  */
  _scsv_getValueForMenuItem: function(item) {
    var valueKey = this.get('itemValueKey') || 'value';

    if (SC.typeOf(item) === SC.T_STRING) {
      return item;
    } else if (item.get) {
      return item.get(valueKey);
    } else {
      return item[valueKey];
    }
  },

  /**
    * When the selected item changes, we need to update our value.
    * @private
  */
  _scsv_selectedItemDidChange: function() {
    var sel = this.get('selectedItem'),
        last = this._scsv_lastSelection,
        titleKey = this.get('itemTitleKey') || 'title',
        valueKey = this.get('itemValueKey') || 'value';

    // selected item could be a menu item from SC.MenuPane's displayItems, or it could
    // be a raw item. So, we have to use _scsv_getValueForMenuItem to resolve it.
    if(sel) {
      this.setIfChanged('value', this._scsv_getValueForMenuItem(sel));
    }

    // add/remove observers for the title and value so we can invalidate.
    if (last && last.addObserver && sel !== last) {
      last.removeObserver(titleKey, this, this._scsv_selectedItemPropertyDidChange);
      last.removeObserver(valueKey, this, this._scsv_selectedItemPropertyDidChange);
    }
    
    if (sel && sel.addObserver && sel !== last) {
      sel.addObserver(titleKey, this, this._scsv_selectedItemPropertyDidChange);
      sel.addObserver(valueKey, this, this._scsv_selectedItemPropertyDidChange);
    }

    this._scsv_lastSelection = sel;
  }.observes('selectedItem'),

  // called when either title or value changes on the selected item
  _scsv_selectedItemPropertyDidChange: function(item) {
    this.notifyPropertyChange('title');
    this.set('value', item.get(this.get('itemValueKey') || 'value'));
  },

  /**
    The title to show when no item is selected.

    @property
    @type String
    @default ""
  */
  defaultTitle: "",

  /**
    The title of the button, derived from the selected item.
  */
  title: function() {
    var sel = this.get('selectedItem');

    if (!sel) {
      return this.get('defaultTitle');
    } else if (sel.get) {
      return sel.get(this.get('itemTitleKey') || 'title');
    } else if (SC.typeOf(sel) == SC.T_HASH) {
      return sel[this.get('itemTitleKey') || 'title'];
    } else {
      return sel;
    }
  }.property('selectedItem').cacheable(),

  /**
    * When the value changes, we need to update selectedItem.
    * @private
  */
  _scsv_valueDidChange: function() {
    var value = this.get('value');

    if (!this.get('items')) {
      return;
    }

    var items = this.get('items'), len = items.length, idx;
    for (idx = 0; idx < len; idx++) {
      if (this._scsv_getValueForMenuItem(items[idx]) === value) {
        this.setIfChanged('selectedItem', items[idx]);
        return;
      }
    }

    // if we got here, this means no item is selected
    this.setIfChanged('selectedItem', null);
  }.observes('value'),

  /**
    SelectView must set the selectView property on the menu so that the menu's
    properties get bound to the SelectView's. The bindings get set up by 
    the SelectViewMenu mixin, which should be mixed in to any SelectView menu.

    In addition, the initial selected item and the initial minimum menu width are set.
    @private
  */
  createMenu: function(klass) {
    var attrs = {
      selectView: this,
      selectedItem: this.get('selectedItem'),
      minimumMenuWidth: this.get('minimumMenuWidth')
    };

    return klass.create(attrs);
  },

  /**
    The amount by which to offset the menu's left position when displaying it.
    This can be used to make sure the selected menu item is directly on top of
    the label in the SelectView.

    By default, this comes from the render delegate's menuLeftOffset property. 
    If you are writing a theme, you should set the value there.
    
    @property
    @type Number
    @default 'menuLeftOffset' from render delegate if present, or 0.
  */
  menuLeftOffset: SC.propertyFromRenderDelegate('menuLeftOffset', 0),

  /**
    The amount by which to offset the menu's top position when displaying it.
    This is added to any amount calculated based on the 'top' of a menu item.

    This can be used to make sure the selected menu item's label is directly on
    top of the SelectView's label.

    By default, this comes from the render delegate's menuTopOffset property.
    If you are writing a theme, you should set the value there.

    @property
    @type Number
    @default 'menuTopOffset' from render delegate if present, or 0.
  */
  menuTopOffset: SC.propertyFromRenderDelegate('menuTopOffset', 0),

  /**
    An amount to add to the menu's minimum width. For instance, this could be
    set to a negative value to let arrows on the side of the SelectView be visible.

    By default, this comes from the render delegate's menuMinimumWidthOffset property.
    If you are writing a theme, you should set the value there.

    @property
    @type Number
    @default 'menuWidthOffset' from render delegate if present, or 0.
  */
  menuMinimumWidthOffset: SC.propertyFromRenderDelegate('menuMinimumWidthOffset', 0),

  /**
    The prefer matrix for menu positioning. It is calculated so that the selected
    menu item is positioned directly over the SelectView.
    
    @property
    @type Array
    @private
  */
  menuPreferMatrix: function() {
    var menu = this.get('menu'),
        leftPosition = this.get('menuLeftOffset'),
        topPosition = this.get('menuTopOffset');

    if (!menu) {
      return [leftPosition, topPosition, 2];
    }

    var idx = this.get('_selectedItemIndex'), itemViews = menu.get('menuItemViews');
    if (idx > -1) {
      return [leftPosition, topPosition - itemViews[idx].get('layout').top, 2];
    }

    return [leftPosition, topPosition, 2];

  }.property('value', 'menu').cacheable(),

  /**
    Used to calculate things like the menu's top position.

    @private
  */
  _selectedItemIndex: function() {
    var menu = this.get('menu');
    if (!menu) {
      return -1;
    }

    // We have to find the selected item, and then get its 'top' position so we
    // can position the menu correctly.
    var itemViews = menu.get('menuItemViews'), idx, len = itemViews.length, view;
    for (idx = 0; idx < len; idx++) {
      view = itemViews[idx];

      // we have to compare via value
      var value = view.get('content').get(this.get('itemValueKey'));
      if (value === this.get('value')) {
        break;
      }
    }

    if (idx < len) {
      return idx;
    }

    return -1;
  }.property('value', 'menu').cacheable(),


  /*
    Documented in base class; supplying documentation here will break the argument list.
  */
  showMenu: function(orig) {
    orig();

    var menu = this.get('menu'), itemViews = menu.get('menuItemViews');
  }.enhance(),

  /**
    The minimum width for the child menu. For instance, this property can make the
    menu always cover the entire SelectView--or, alternatively, cover all but the
    arrows on the side.

    By default, it is calculated by adding the menuMinimumWidthOffset to the view's 
    width. If you are writing a theme and want to change the width so the menu covers
    a specific part of the select view, change your render delegate's menuMinimumWidthOffset
    property.

    @type Number
    @property
  */
  minimumMenuWidth: function() {
    return this.get('frame').width + this.get('menuMinimumWidthOffset');
  }.property('frame', 'menuMinimumWidthOffset').cacheable(),

  //
  // KEY HANDLING
  //
  /**
    @private

    Handle Key event - Down arrow key
  */
  keyDown: function(event) {
    if ( this.interpretKeyEvents(event) ) {
      return YES;
    }
    else {
      arguments.callee.base.apply(this,arguments);
    }
  },

  /**
    @private

    Pressing the Up or Down arrow key should display the menu pane
  */
  interpretKeyEvents: function(event) {
    if (event) {
      if ((event.keyCode === 38 || event.keyCode === 40)) {
        this.showMenu();
        return YES;
      }
      else if (event.keyCode === 27) {
        this.resignFirstResponder() ;
        return YES;
      }
    }
    return arguments.callee.base.apply(this,arguments);
  },

  /** @private
   Function overridden - tied to the isEnabled state 
  */
  acceptsFirstResponder: function() {
    return this.get('isEnabled');
  }.property('isEnabled').cacheable()

});

