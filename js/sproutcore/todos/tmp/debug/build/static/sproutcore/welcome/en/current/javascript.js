/* >>>>>>>>>> BEGIN source/lproj/strings.js */
// ==========================================================================
// Project:   Welcome Strings
// Copyright: ©2011 Apple Inc.
// ==========================================================================
/*globals Welcome */

// Place strings you want to localize here.  In your app, use the key and
// localize it using "key string".loc().  HINT: For your key names, use the
// english string with an underscore in front.  This way you can still see
// how your UI will look and you'll notice right away when something needs a
// localized string added to this file!
//
SC.stringsFor('English', {
  // "_String Key": "Localized String"
}) ;

/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore Test Runner
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals Welcome */

/** @namespace
  
  The Welcome app is displayed when you load the root URL and the dev server
  is visible.  It will fetch the list of targets from the server and list 
  them.
  
  @extends SC.Object
*/
Welcome = SC.Object.create(
  /** @scope Welcome.prototype */ {

  NAMESPACE: 'Welcome',
  VERSION: '1.0.0',
  
  store: SC.Store.create().from('CoreTools.DataSource'),
  
  displayTitle: function() {
    var hostname = (window.location.hostname || 'localhost').toString();
    return hostname.match(/sproutcore\.com/) ? "SproutCore Demos".loc() : "SproutCore Developer Tools";
  }.property().cacheable()

}) ;

/* >>>>>>>>>> BEGIN __sc_chance.js */
if (typeof CHANCE_SLICES === 'undefined') var CHANCE_SLICES = [];CHANCE_SLICES = CHANCE_SLICES.concat([]);

/* >>>>>>>>>> BEGIN source/controllers/targets.js */
// ==========================================================================
// Project:   Welcome.targetsController
// Copyright: ©2011 Apple Inc.
// ==========================================================================
/*globals CoreTools Welcome */

/** @class
  
  Manages the list of targets

  @extends SC.ArrayController
*/
Welcome.targetsController = SC.ArrayController.create(
/** @scope Welcome.targetsController.prototype */ {

  /**
    Call this method whenever you want to relaod the targets from the server.
  */
  reload: function() {
    var targets = Welcome.store.find(CoreTools.TARGETS_QUERY);
    this.set('content', targets);
  },
  
  appsOnly: function() {
    return this.filter(function(t) {
      return t.get('kind') === 'app' && !t.get('name').match(/sproutcore\/(welcome|experimental)/);
    });
  }.property('[]').cacheable(),
  
  loadApplication: function() {
    var app = this.get('selection').firstObject(),
        url = app ? app.get('appUrl') : null;
        
    if (url) {
      this.set('canLoadApp', NO);
      this.invokeLater(function() { 
        window.location.href = url; // load new app
      });
    }
  },
  
  launchEnabled: function() {
    var canLoadApp = this.get('canLoadApp'),
        selection = this.get('selection'),
        selectedObject = selection.firstObject();
    return canLoadApp && selectedObject && selectedObject.get('name') !== '/sproutcore';
  }.property('canLoadApp', 'selection').cacheable(),

  // used to disable all controls
  canLoadApp: YES,
  
  allowsEmptySelection: NO,
  allowsMultipleSelection: NO

}) ;

/* >>>>>>>>>> BEGIN source/lproj/main_page.js */
// ==========================================================================
// Project:   Welcome - mainPage
// Copyright: ©2011 Apple Inc.
// ==========================================================================
/*globals Welcome */

// This page describes the main user interface for your application.  
Welcome.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.MainPane.design({
    childViews: 'contentView'.w(),
    
    contentView: SC.View.design({
      layout: { width: 280, height: 340, centerX: 0, centerY: 0 },
      childViews: 'heading appSelector launchApplication'.w(),
      
      heading: SC.View.design({
        layout: { width: 271, centerX: 0, top: 0, height: 60 },
        tagName: 'img',
        render: function(context, firstTime) {
          context.attr('src', '/static/sproutcore/foundation/en/current/source/resources/images/sproutcore.png?1326308755');
        }
      }),
      
      appSelector: SC.View.design({
        layout: {top:80, left:0, right:0, bottom:46},
        childViews: 'scrollView'.w(),
        classNames: 'app-selector',
        
        scrollView: SC.ScrollView.design({
          layout: { left: 0, top: 0, right: 0, bottom: 0 },
          hasHorizontalScroller: NO,
        
          contentView: SC.ListView.design({  
            rowHeight: 40,

            contentBinding: "Welcome.targetsController.appsOnly",
            selectionBinding: "Welcome.targetsController.selection",
            isEnabledBinding: "Welcome.targetsController.canLoadApp",
          
            contentValueKey: "displayName",
            contentIconKey: "targetIcon",
            hasContentIcon: YES,
          
            target: "Welcome.targetsController",
            action: "loadApplication"
          })
        })
      }),
      
      launchApplication: SC.ButtonView.design({
        layout: {bottom:0, height:30, width:160, centerX:0},
        isEnabledBinding: "Welcome.targetsController.launchEnabled",
        controlSize: SC.HUGE_CONTROL_SIZE,
        title: "Launch Application",
        isDefault: YES,
        target: "Welcome.targetsController",
        action: "loadApplication"
      })
      
    }) 
  })

});

/* >>>>>>>>>> BEGIN source/main.js */
// ==========================================================================
// Project:   Welcome
// Copyright: ©2011 Apple Inc.
// ==========================================================================
/*globals Welcome */

// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//
Welcome.main = function main() {
  Welcome.getPath('mainPage.mainPane').append() ;
  Welcome.targetsController.reload();
} ;

function main() { Welcome.main(); }

