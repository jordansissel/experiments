/* >>>>>>>>>> BEGIN source/mixins/edit_mode.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/**
  Handles propagation of a property isEditing to all child views.
*/
SC.FormsEditMode = {
  
  /**
    Walks like a duck.
  */
  hasEditMode: YES,
  
  /**
    Whether we are in edit mode.
  */
  isEditing: NO,
  
  /**
    Handles changes to edit state. Alerts children.
  */
  editModeDidChange: function(){
    this._propagateEditMode();    
  }.observes("isEditing"),
  
  /**
    Ensures that edit mode is passed to all children.
  */
  _scfem_childViewsDidChange: function() {
    this._propagateEditMode();
  }.observes("childViews"),
  
  /**
    Propagates edit mode.
  */
  _propagateEditMode: function() {
    var isEditing = this.get("isEditing");
    var cv = this.get("childViews");
    if (!cv) { return; }

    var idx, len = cv.length, v;
    for (idx = 0; idx < len; idx++) {
      v = cv[idx];

      if (SC.typeOf(v) === SC.T_STRING || v.isClass) {
        return;
      }
      if (v.get("hasEditMode")) {
        v.set("isEditing", isEditing);
      }
    }
  }
  
};

/* >>>>>>>>>> BEGIN source/mixins/emptiness.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace 
  A view is empty if all of its children are empty. A view is automatically 
  counted as empty if it is not visible, and not empty if it is being edited.

  Any field that does not mix in CalculatesEmptiness will be considered empty.
*/
SC.CalculatesEmptiness = {
  
  hasCalculatesEmptiness: YES,
  
  /**
  YES if the value of the field is empty. Defaults to yes so if you don't override this, it will only consider child fields in emptiness calculation (this is the desired behavior for forms).
  */
  isValueEmpty: YES,
  
  /**
    Defaults to YES so that a field with no children will act properly.
  */
  _scce_childrenAreEmpty: YES,
  
  /**
    If YES, all visible fields are considered non-empty when editing.
    @type Boolean
    @default YES
  */
  isEditingAffectsIsEmpty: YES,


  _scce_isEditingDidChange: function() {
    if(this.get('isEditingAffectsIsEmpty')) {
      this.notifyPropertyChange('isEmpty');
    }
  }.observes('isEditing'),
  
  /**
    YES if the field itself is empty. Even if the value is non-empty, the field can be empty due to isVisible.
  */
  isEmpty: function() {
    // When not visible, it is empty. Period.
    if (!this.get('isVisible')) {
      return YES;
    }

    // if it is editing and edit mode affects emptiness, it is NOT empty.
    if (this.get('isEditingAffectsIsEmpty') && this.get('isEditing')) {
      return NO;
    }

    // otherwise, it is empty if its value AND all children are empty.
    return this.get('isValueEmpty') && this.get('_scce_childrenAreEmpty');
  }.property('isValueEmpty', 'isVisible', '_scce_childrenAreEmpty', 'isEditingAffectsIsEmpty').cacheable(),

  /**
    When emptiness changes tell the parent to re-check its own emptiness.
  */
  _scce_isEmptyDidChange: function() {
    var parentView = this.get('parentView');

    if (parentView && parentView._scce_emptinessDidChangeFor) {
      parentView._scce_emptinessDidChangeFor(this);
    }
  }.observes('isEmpty'),

  initMixin: function() {
    this._scce_emptinessDidChangeFor();
  },

  /**
  Called by fields when their emptiness changes.

  Always triggers (at end of run loop) a relayout of fields.
  */
  _scce_emptinessDidChangeFor: function(child) {
    this.invokeOnce('_scce_recalculateChildrensEmptiness');
  },

  /**
  By default, a view will check all of its fields to determine if it is empty. It is only empty if all of its value fields are.
  */
  _scce_recalculateChildrensEmptiness: function()
  {
    // in short, we get the value fields, if we come across one that is not empty
    // we cannot be empty.
    var views = this.get('childViews');

    var empty = YES,
    len = views.length,
    field;

    for (var i = 0; i < len; i++)
    {
      field = views[i];

      if (!field.get('isEmpty') && field.hasCalculatesEmptiness) {
        empty = NO;
        break;
      }
    }
    
    this.setIfChanged('_scce_childrenAreEmpty', empty);
  }
};


/* >>>>>>>>>> BEGIN source/render_delegates/form.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.BaseTheme.formRenderDelegate = SC.RenderDelegate.create({
  className: 'form',
  flowSpacing: { left: 5, top: 5, bottom: 5, right: 5 },

  render: function() {
  },

  update: function() {

  }
});

SC.BaseTheme.FORM_FLOW_SPACING = { left: 5, top: 5, bottom: 5, right: 5 };



/* >>>>>>>>>> BEGIN source/render_delegates/form_row.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.BaseTheme.formRowRenderDelegate = SC.RenderDelegate.create({
  className: 'form-row',
  flowSpacing: { right: 15, left: 0, top: 0, bottom: 0 },
  flowPadding: 0
});


/* >>>>>>>>>> BEGIN source/views/form_row.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2009 Alex Iskander and TPSi
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals Forms */

/** @class
  Represents a single row in a form. Rows have label and any number of other child views.

  
  @extends SC.FormView
  @author Alex Iskander
*/
sc_require("mixins/emptiness");
sc_require("mixins/edit_mode");

SC.FormRowView = SC.View.extend(SC.FlowedLayout, SC.CalculatesEmptiness, SC.FormsEditMode,
/** @scope Forms.FormRowView.prototype */ {
  classNames: ["sc-form-row-view"],
  renderDelegateName: 'formRowRenderDelegate',

  flowPadding: SC.propertyFromRenderDelegate('flowPadding'),
  defaultFlowSpacing: SC.propertyFromRenderDelegate('flowSpacing'),

  fillWidth: YES,
  layoutDirection: SC.LAYOUT_HORIZONTAL,

  layout: {left: 0, width: 0, height: 0},

  /**
    Walks like a duck.
  */
  isFormRow: YES,

  /**
    A value set so that FormView knows to tell us about the row label size change.
  */
  hasRowLabel: YES,

  
  /**
    The text to display next to the row. If undefined, SproutCore will try
    to set it automatically to the key corresponding to this row in the FormView.
  */
  label: undefined,
  
  /**
    The actual size for the label, as assigned by the parent FormView.
  */
  rowLabelSize: 0,
  
  /**
    The measured size of the label. The parent FormView may use this to
    determine the proper rowLabelSize.
  */
  rowLabelMeasuredSize: 0,
  
  /**
    If NO, the label will not automatically measure itself. The parent
    FormView normally manages this property for FormRowView.

    Note that FormRowView never changes its own rowLabelSize: it only 
    measures it. The measurement is placed into rowLabelMeasuredSize.

    The FormView then sets the rowLabelSize, which is used to set the
    width of the LabelView.
  */
  shouldMeasureLabel: YES,

  /**
    The label view. The default is an SC.FormRowView.LabelView, which is
    configured to handle resizing.
  */
  labelView: null, // NOTE: gets set at end of file.

  /**
    Updates keys, content, etc. on fields. Also, handles our "special" field (only-one case)
  */
  createChildViews: function() {
    // keep array of keys so we can pass on key to child.
    var cv = SC.clone(this.get('childViews'));
    
    // add label
    if (this.labelView.isClass) {
      this.labelView = this.createChildView(this.labelView, {
        value: this.get('label')
      });

      this.labelView.addObserver('measuredSize', this, 'labelSizeDidChange');
      this.labelView.bind('shouldMeasureSize', this, 'shouldMeasureLabel');
      this.get('childViews').unshift(this.labelView);
    }
    
    var content = this.get('content');
    
    arguments.callee.base.apply(this,arguments);
    
    
    // now, do the actual passing it
    var idx, len = cv.length, key, v;
    for (idx = 0; idx < len; idx++) {
      key = cv[idx];
      
      // if the view was originally declared as a string, then we have something to give it
      if (SC.typeOf(key) === SC.T_STRING) {
        // try to get the actual view
        v = this.get(key);

        // see if it does indeed exist, and if it doesn't have a value already
        if (v && !v.isClass) {
          if (!v.get('contentValueKey')) {
            //
            // NOTE: WE HAVE A SPECIAL CASE
            //       If this is the single field, pass through our formKey
            //       Single-field rows are created by the SC.FormView.row helper.
            if (key === "_singleField")  {
              v.set('contentValueKey', this.get('formKey'));
            } else {
              v.set('contentValueKey', key);
            }
          }

          if (!v.get('content')) {
            v.bind('content', this, 'content') ;
          }
        }

      }
    }

    this.rowLabelSizeDidChange();
  },
  
  labelDidChange: function() {
    this.get("labelView").set("value", this.get("label"));
  }.observes("label"),
  
  labelSizeDidChange: function() {
    var size = this.get("labelView").get("measuredSize");
    this.set("rowLabelMeasuredSize", size.width);
    
    // alert parent view if it is a row delegate
    var pv = this.get("parentView");
    if (pv && pv.get("isRowDelegate")) pv.rowLabelMeasuredSizeDidChange(this, size);
  },
  
  rowLabelSizeDidChange: function() {
    this.get("labelView").adjust({
      "width": this.get("rowLabelSize")
    });
  }.observes("rowLabelSize")

});

SC.FormRowView.mixin({
  row: function(label, fieldType, ext) {
    if (label.isClass) {
      ext = fieldType;
      fieldType = label;
      label = null;
    }
    // now, create a hash (will be used by the parent form's exampleRow)
    if (!ext) {
      ext = {};
    } else {
      ext = SC.clone(ext);
    }
    ext.label = label;
    ext.childViews = ["_singleField"];
    ext._singleField = fieldType;
    return ext;
  },
  
  LabelView: SC.LabelView.extend(SC.AutoResize, SC.CalculatesEmptiness, {
    shouldAutoResize: NO, // only change the measuredSize so we can update.
    layout: { left:0, top:0, width: 0, height: 18 },
    fillHeight: YES,
    classNames: ["sc-form-label"],
    isValue: NO
  })
});

SC.FormRowView.prototype.labelView = SC.FormRowView.LabelView.design();

/* >>>>>>>>>> BEGIN source/views/form.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2009 Alex Iskander and TPSi
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals Forms */

sc_require("mixins/emptiness");
sc_require("mixins/edit_mode");
sc_require("views/form_row");

/** 
  @class
  FormView lays out rows, manages their label widths, binds their
  content properties, and sets up their contentValueKeys as needed.

  Usually, you will place rows into the FormView:
  
      childViews: "fullName gender".w(),
      contentBinding: 'MyApp.personController',

      fullName: SC.FormView.row("Name:", SC.TextFieldView.extend({
        layout: {height: 20, width: 150}
      })),

      gender: SC.FormView.row("Gender:", SC.RadioView.design({
        layout: {width: 150, height: 40, centerY: 0},
        items: ["male", "female"]
      }))

  The name of the row (ie. 'fullName'), is passed down to the fields, and used as the key
  to bind the value property to the content. In this case it will bind content.fullName to the
  value property of the textFieldView.


  @extends SC.View
  @implements SC.FlowedLayout, SC.CalculatesEmptiness, SC.FormsEditMode
*/

SC.FormView = SC.View.extend(SC.FlowedLayout, SC.CalculatesEmptiness, SC.FormsEditMode, /** @scope SC.FormView.prototype */ {
  // We lay out forms vertically. Each item gets its own "row". Wrapping makes
  // no sense, as the FormView should grow with each row.
  layoutDirection: SC.LAYOUT_VERTICAL,
  canWrap: NO,

  renderDelegateName: 'formRenderDelegate',

  /**
    The default padding around items in the form. By default, this comes from the theme.
    You can supply your own directly, or override the formRenderDelegate:

        // base it on the existing render delegate
        MyTheme.formRenderDelegate = SC.AceTheme.formRenderDelegate.create({
          flowSpacing: { left: 5, top: 5, right: 5, bottom: 5 }
        });
  */
  defaultFlowSpacing: SC.propertyFromRenderDelegate('flowSpacing', {}),

  classNames: ["sc-form-view"],

  /**
    Whether to automatically start editing.
  */
  editsByDefault: YES,

  /**
    The content to bind the form to. This content object is passed to all children.
  
    All child views, if added at design time via string-based childViews array, will get their
    contentValueKey set to their own key. Note that SC.RowView passes on its contentValueKey to its
    child field, and if its isNested property is YES, uses it to find its own content object.
  */
  content: null,
  
  /**
    Rows in the form do not have to be full SC.FormRowView at design time. They can also be hashes
    that get loaded into rows.
  */
  exampleRow: SC.FormRowView.extend({
    labelView: SC.FormRowView.LabelView.extend({ textAlign: SC.ALIGN_RIGHT })
  }),

  /**
     @private
  */
  init: function() {
    if (this.get("editsByDefault")) this.set("isEditing", YES);
    arguments.callee.base.apply(this,arguments);
  },

  /**
  */
  createChildViews: function() {
    var cv = SC.clone(this.get("childViews"));
    var idx, len = cv.length, key, v, exampleRow = this.get("exampleRow");

    // rows that are provided as plain hashes need to be created by passing them into
    // exampleRow.extend.
    for (idx = 0; idx < len; idx++) {
      key = cv[idx];
      if (SC.typeOf(key) === SC.T_STRING) {
        v = this.get(key);
        if (v && !v.isClass && SC.typeOf(v) === SC.T_HASH) {
          this[key] = exampleRow.extend(v);
        }
      }
    }

    // we will be initializing the 'content' property for all child views
    var content = this.get("content");
    arguments.callee.base.apply(this,arguments);

    for (idx = 0; idx < len; idx++) {
      key = cv[idx];

      // if the view was originally declared as a string, then we have something to give it
      if (SC.typeOf(key) === SC.T_STRING) {
        // try to get the actual view
        v = this.get(key);

        if (v && !v.isClass) {
          // we used to set contentValueKey on applicable children, but given that was too
          // implicit: any LabelView child of the form view would get the contentValueKey.
          // 
          // instead, we give ALL views a formKey for their convenience; if they want to
          // use contentValue support they should do so directly.
          v.set('formKey', key);

          // We used to try to be clever and bind child views' 'content' to 
          // individual properties if the views didn't have content value support.
          // For instance, a plain view named 'myView' would get bound to content.myView.
          //
          // Cleverness is evil, so, we have dropped this. Instead, we always bind content,
          // and always do so directly.
          if (!v.get("content")) {
            v.bind('content', this, 'content');
          }

          // for form rows, set up label measuring and the label itself.
          if (v.isFormRow) {
            // set label (if possible).
            if (SC.none(v.get('label'))) {
                v.set("label", key.humanize().titleize());
            }

            // set the label size measuring stuff
            if (this.get('labelWidth') !== null) {
              v.set("shouldMeasureLabel", NO);
            }
          }

        }
      }
    }

    this._hasCreatedRows = YES;
    this.recalculateLabelWidth();
  },

  
  /**
    Allows rows to use this to track label width.
  */
  isRowDelegate: YES,
  
  /**
    Supply a label width to avoid automatically calculating the widths of the labels
    in the form. Leave null to let SproutCore automatically determine the proper width
    for the label.

    @type Number
    @default null
  */
  labelWidth: null,
  
  /**
    Tells the child rows whether they should measure their labels or not.
  */
  labelWidthDidChange: function() {
    var childViews = this.get('childViews'), i, len = childViews.length,
    shouldMeasure = SC.none(this.get('labelWidth'));
    
    for(i = 0; i < len; i++) {
      childViews[i].set('shouldMeasureLabel', shouldMeasure);
    }
    
    this.recalculateLabelWidth();
  }.observes('labelWidth'),
  
  /**
    Propagates the label width to the child rows, finding the measured size if necessary.
  */
  recalculateLabelWidth: function() {
    if (!this._hasCreatedRows) {
      return;
    }
    
    var ret = this.get("labelWidth"), children = this.get("childViews"), idx, len = children.length, child;
    
    // calculate by looping through child views and getting size (if possible and if
    // no label width is explicitly set)
    if (ret === null) {
      ret = 0;
      for (idx = 0; idx < len; idx++) {
        child = children[idx];
      
        // if it has a measurable row label
        if (child.get("rowLabelMeasuredSize")) {
          ret = Math.max(child.get("rowLabelMeasuredSize"), ret);
        }
      }
    }
    
    // now set for all children
    if (this._rowLabelSize !== ret) {
      this._rowLabelSize = ret;
      
      // set by looping throuhg child views
      for (idx = 0; idx < len; idx++) {
        child = children[idx];

        // if it has a measurable row label
        if (child.get("hasRowLabel")) {
          child.set("rowLabelSize", ret);
        }
      }
      
    }
  },
  
  /**
    Rows call this when their label width changes.
  */
  rowLabelMeasuredSizeDidChange: function(row, labelSize) {
    this.invokeOnce("recalculateLabelWidth");
  }


});

SC.mixin(SC.FormView, {
  /**
  Creates a form row.

  Can be called in two ways: `row(optionalClass, properties)`, which creates
  a field with the properties, and puts it in a new row;
  and `row(properties)`, which creates a new row—and it is up to you to add
  any fields you want in the row.
  
  You can also supply some properties to extend the row itself with.
  */
  row: function(optionalClass, properties, rowExt)
  {
    return SC.FormRowView.row(optionalClass, properties, rowExt);
  }
});

