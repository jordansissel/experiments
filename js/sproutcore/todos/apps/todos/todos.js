// ==========================================================================
// Project:   Todos
// Copyright: @2012 My Company, Inc.
// ==========================================================================
/*globals Todos */

Todos = SC.Application.create({
  store: SC.Store.create().from(SC.Record.fixtures)
});

Todos.Todo = SC.Record.extend({
  title: SC.Record.attr(String),
  isDone: SC.Record.attr(Boolean, { defaultValue: NO })
});

Todos.Todo.FIXTURES = [
    { "guid": "todo-1",
      "title": "Build my first SproutCore app",
      "isDone": false },
 
    { "guid": "todo-2",
      "title": "Build a really awesome SproutCore app",
      "isDone": false },
 
    { "guid": "todo-3",
      "title": "Next, the world!",
      "isDone": false }
];

Todos.todoListController = SC.ArrayController.create({
  content: [],
  createTodo: function(title) {
    Todos.store.createRecord(Todos.Todo, { title: title });
  },

  remaining: function() {
    return this.filterProperty("isDone", false).get("length");
  }.property("@each.isDone"),

  clearCompletedTodos: function() {
    this.filterProperty("isDone", true).forEach(function(item) {
      item.destroy();
    });
  },

  allAreDone: function(key, value) {
    if (value !== undefined) {
      this.setEach("isDone", value);
      return value;
    } else {
      return this.get("length") && this.everyProperty("isDone", true);
    }
  }.property("@each.isDone")
});

Todos.CreateTodoView = SC.TextField.extend({
  /* on "insert newline" (return keypress), add the todo */
  insertNewline: function() {
    var value = this.get("value");

    if (value) {
      Todos.todoListController.createTodo(value);
      /* Erase the input box */
      this.set("value", "");
    }
  }
});

Todos.MarkDoneView = SC.Checkbox.extend({
  titleBinding: ".parentView.content.title", /* the checkbox label */
  valueBinding: ".parentView.content.isDone", /* the checkbox checked value */
});

Todos.StatsView = SC.TemplateView.extend({
  remainingBinding: "Todos.todoListController.remaining",
  displayRemaining: function() {
    var remaining = this.get("remaining");
    return remaining + (remaining === 1 ? " item" : " items");
  }.property("remaining")
});

SC.ready(function() {
  Todos.mainPane = SC.TemplatePane.append({
    layerId: "todos",
    templateName: "todos"
  });

  /* Load the data store and push it into the controller */
  var todos = Todos.store.find(Todos.Todo);
  Todos.todoListController.set('content', todos);
});
