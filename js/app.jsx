/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/
var app = app || {};

(function() {
  "use strict";

  app.ALL_TODOS = "all";
  app.ACTIVE_TODOS = "active";
  app.COMPLETED_TODOS = "completed";
  var TodoFooter = app.TodoFooter;
  var TodoItem = app.TodoItem;

  var ENTER_KEY = 13;

  var TodoApp = React.createClass({
    getInitialState: function() {
      return {
        nowShowing: app.ALL_TODOS,
        editing: null,
        addingTodo: false,
        newTodo: ""
      };
    },

    componentDidMount: function() {
      var setState = this.setState;
      var router = Router({
        "/": setState.bind(this, { nowShowing: app.ALL_TODOS }),
        "/active": setState.bind(this, { nowShowing: app.ACTIVE_TODOS }),
        "/completed": setState.bind(this, { nowShowing: app.COMPLETED_TODOS })
      });
      router.init("/");
    },

    handleChange: function(event) {
      this.setState({ newTodo: event.target.value });
    },

    handleNewTodoKeyDown: function(event) {
      if (event.keyCode !== ENTER_KEY) {
        return;
      }

      event.preventDefault();

      var val = this.state.newTodo.trim();

      if (val) {
        this.props.model.addTodo(val);
        this.setState({ newTodo: "", addingTodo: false });
      }
    },

    handleAddTask: function() {
      this.setState({ addingTodo: true });
    },

    toggle: function(todoToToggle) {
      this.props.model.toggle(todoToToggle);
    },

    destroy: function(todo) {
      this.props.model.destroy(todo);
    },

    edit: function(todo) {
      this.setState({ editing: todo.id });
    },

    save: function(todoToSave, text) {
      this.props.model.save(todoToSave, text);
      this.setState({ editing: null });
    },

    cancel: function() {
      this.setState({ editing: null });
    },

    clearCompleted: function() {
      this.props.model.clearCompleted();
    },

    render: function() {
      var footer;
      var main;
      var newTodo;
      var todos = this.props.model.todos;

      var shownTodos = todos.filter(function(todo) {
        switch (this.state.nowShowing) {
          case app.ACTIVE_TODOS:
            return !todo.completed;
          case app.COMPLETED_TODOS:
            return todo.completed;
          default:
            return true;
        }
      }, this);

      var todoItems = shownTodos.map(function(todo) {
        return (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={this.toggle.bind(this, todo)}
            onDestroy={this.destroy.bind(this, todo)}
            onEdit={this.edit.bind(this, todo)}
            editing={this.state.editing === todo.id}
            onSave={this.save.bind(this, todo)}
            onCancel={this.cancel}
          />
        );
      }, this);

      var activeTodoCount = todos.reduce(function(accum, todo) {
        return todo.completed ? accum : accum + 1;
      }, 0);

      var completedCount = todos.length - activeTodoCount;

      if (activeTodoCount || completedCount) {
        footer = <TodoFooter nowShowing={this.state.nowShowing} />;
      }

      if (todos.length) {
        main = (
          <section className="main">
            <ul className="todo-list">{todoItems}</ul>
          </section>
        );
      }

      if (this.state.addingTodo) {
        newTodo = (
          <input
            className="new-todo"
            placeholder="What needs to be done?"
            value={this.state.newTodo}
            onKeyDown={this.handleNewTodoKeyDown}
            onChange={this.handleChange}
            autoFocus={true}
          />
        );
      }

      return (
        <div>
          <header className="header">
            <h1>to do:</h1>
            {main}
            {newTodo}
            <button className="primary-btn" onClick={this.handleAddTask}>
              + Add Task
            </button>
          </header>

          {footer}
        </div>
      );
    }
  });

  var model = new app.TodoModel("react-todos");

  function render() {
    React.render(
      <TodoApp model={model} />,
      document.getElementsByClassName("todoapp")[0]
    );
  }

  model.subscribe(render);
  render();
})();
