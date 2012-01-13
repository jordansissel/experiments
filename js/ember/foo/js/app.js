var Heumon = Ember.Application.create();

Heumon.Event = Ember.Object.extend({
  name: null, /* The name of the event */

  init: function(data) {
    console.log(data);
    this._super(data);
  }
}); /* Heumon.Event */

Heumon.EventInstance = Ember.Object.extend({
  event_name: null, /* The name of the event (See Heumon.Event) */
  timestamp: null,

  init: function(data) {
    this.timestamp = new Date();
    this._super(data);
  }
}); /* Heumon.EventInstance */

Heumon.EventCollectionController = Ember.ArrayController.create({
  content: [], /* the array backing this controller */

  loadEvents: function() {
    this.pushObject(Heumon.Event.create({ name: "diaper" }));
    this.pushObject(Heumon.Event.create({ name: "ibuprofen" }));
  },
}); /* Heumon.EventCollectionController */

Heumon.EventCollectionView = Ember.View.extend({
});

Heumon.MyView = Ember.View.extend({
  mouseDown: function() {
    var e = Heumon.EventInstance.create({ name: "diaper" })
    console.log(e);
  }
});
