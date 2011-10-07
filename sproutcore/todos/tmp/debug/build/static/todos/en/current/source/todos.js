// ==========================================================================
// Project:   Todos
// Copyright: @2011 My Company, Inc.
// ==========================================================================
/*globals Todos */

Todos = SC.Application.create();

Todos.Todo = SC.Object.extend({
  title: null,
  isDone: false
});

Todos.todoListController = SC.ArrayController.create({
  content: [],

  createTodo: function(title) {
    var todo = Todos.Todo.create({ title: title });
    this.pushObject(todo);
  },

  remaining: function() {
    return this.filterProperty("isDone", false).get("length");
  }.property("@each.isDone"),

  clearCompletedTodos: function() {
    this.filterProperty("isDone", true).forEach(this.removeObject, this);
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

Todos.MarkDoneView = SC.Checkbox.extend({
  titleBinding: '.parentView.content.title',
  valueBinding: '.parentView.content.isDone'
});

Todos.StatsView = SC.TemplateView.extend({
  remainingBinding: 'Todos.todoListController.remaining',

  displayRemaining: function() {
    var remaining = this.get('remaining');
    return remaining + (remaining == 1 ? " item" : " items");
  }.property("remaining")
});

Todos.CreateTodoView = SC.TextField.extend({
  insertNewline: function() {
    var value = this.get("value");

    if (value) {
      Todos.todoListController.createTodo(value);
      this.set("value", "");
    }
  }
});

SC.ready(function() {
  Todos.mainPane = SC.TemplatePane.append({
    layerId: 'todos',
    templateName: 'todos'
  });
});

; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('todos');