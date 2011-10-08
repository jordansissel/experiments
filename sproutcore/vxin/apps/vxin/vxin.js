// ==========================================================================
// Project:   Vxin
// Copyright: @2011 My Company, Inc.
// ==========================================================================
/*globals Vxin */

Vxin = SC.Application.create();

SC.ready(function() {
  Vxin.mainPane = SC.TemplatePane.append({
    layerId: 'vxin',
    templateName: 'vxin'
  });
});
