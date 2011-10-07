/* >>>>>>>>>> BEGIN __sc_chance.js */
if (typeof CHANCE_SLICES === 'undefined') var CHANCE_SLICES = [];CHANCE_SLICES = CHANCE_SLICES.concat([]);

/* >>>>>>>>>> BEGIN source/theme.js */

/**
 * @class
 * SproutCore's Ace theme.
 */
SC.AceTheme = SC.BaseTheme.create({
  name: "ace",
  description: "A SproutCore built-in theme by Alex Iskander and contributors. Only supports browsers that implement CSS3."
});

// register the theme with SproutCore
SC.Theme.addTheme(SC.AceTheme);

// SC.ButtonView variants
SC.AceTheme.PointLeft = SC.AceTheme.subtheme("point-left", "point-left");
SC.AceTheme.PointRight = SC.AceTheme.subtheme("point-right", "point-right");
SC.AceTheme.Capsule = SC.AceTheme.subtheme("capsule", "capsule");

// Dark Variant
/**
 * @class SC.AceTheme.Dark
 * SproutCore's Ace theme's Dark Side. Used in popovers or wherever you
 * choose (use it by making the view or one of its parents have a
 * themeName of 'dark').
 */
SC.AceTheme.Dark = SC.AceTheme.subtheme("dark");

// for backwards-compatibility with apps that do not set their
// own default theme:
SC.defaultTheme = 'ace';

/* >>>>>>>>>> BEGIN source/resources/button/dark/button.js */
sc_require("theme");

SC.AceTheme.Dark.PointLeft = SC.AceTheme.Dark.subtheme("point-left", "point-left");
SC.AceTheme.Dark.PointRight = SC.AceTheme.Dark.subtheme("point-right", "point-right");
SC.AceTheme.Dark.PointRight = SC.AceTheme.Dark.subtheme("capsule", "capsule");

/* >>>>>>>>>> BEGIN source/resources/collection/source-list/source-list.js */
SC.AceTheme.SourceList = SC.AceTheme.subtheme('source-list');

// later we may define/override some constants here
/* >>>>>>>>>> BEGIN source/resources/picker/ace/picker.js */

/* >>>>>>>>>> BEGIN source/resources/picker/popover/popover.js */
sc_require("theme");

// it is derived from dark, but will be available both under Ace and not.
SC.AceTheme.Popover = SC.AceTheme.Dark.subtheme("popover");
SC.AceTheme.addTheme(SC.AceTheme.Popover);

// there is a solid variety
SC.AceTheme.SolidPopover = SC.AceTheme.Popover.subtheme('solid');

// and a shortcut to the solid variety.
SC.AceTheme.addTheme(SC.AceTheme.SolidPopover.create({ name: 'solid-popover' }));


/* >>>>>>>>>> BEGIN source/resources/picker/popover/picker.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("resources/picker/popover/popover");

SC.AceTheme.Popover.pickerRenderDelegate = SC.RenderDelegate.create({
  className: 'picker',
  
  render: function(dataSource, context) {
    var preferType = dataSource.get('preferType');
    var pointerPosition = dataSource.get('pointerPos');
    var pointerPositionY = dataSource.get('pointerPosY');

    if (preferType == SC.PICKER_POINTER || preferType == SC.PICKER_MENU_POINTER) {
      context.addClass(pointerPosition);
    }
  },
  
  update: function(dataSource, $) {
    var preferType = dataSource.get('preferType');
    var pointerPosition = dataSource.get('pointerPos');
    var pointerPositionY = dataSource.get('pointerPosY');
    
    if (preferType == SC.PICKER_POINTER || preferType == SC.PICKER_MENU_POINTER) {
      $.addClass(pointerPosition);
    }
    
  }
});
/* >>>>>>>>>> BEGIN source/resources/picker/popover/workspace.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.AceTheme.Popover.workspaceRenderDelegate = SC.RenderDelegate.create({
  className: 'workspace',
  render: function(dataSource, context) {
    context.setClass({
      'top-toolbar': dataSource.get('hasTopToolbar'),
      'bottom-toolbar': dataSource.get('hasBottomToolbar')
    });
    
    context = context.begin('div').addClass('popover-background');
    this.includeSlices(dataSource, context, SC.NINE_SLICE);
    context.push("<div class = 'sc-pointer'></div>");
    context = context.end();
  },

  update: function(dataSource, jquery) {
    jquery.setClass({
      'top-toolbar': dataSource.get('hasTopToolbar'),
      'bottom-toolbar': dataSource.get('hasBottomToolbar')
    });
  }
});
