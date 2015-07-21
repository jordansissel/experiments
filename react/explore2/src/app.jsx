// This require() is to make sure webpack copies index.html and index.css into
// the build directory. It's weird. I'm probably doing it wrong. :)
require("file?name=[name].[ext]!./index.html");
require("file?name=[name].[ext]!./index.css");

var React = require("react/addons");
var Router = require('react-router');
var mui = require("material-ui");
var ThemeManager = mui.Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);

// Required according to material-ui until at least react 1.0
var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

var RouteHandler = Router.RouteHandler;
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Home = require("app/home");
var Energy = require("app/energy");
var Notifications = require("app/notifications");
var Touchpad = require("app/touchpad");
var routes = (
  <Route handler={App}>
    <DefaultRoute handler={Home}/>

    <Route name="energy" handler={Energy}/>
    <Route name="notifications" handler={Notifications}/>
    <Route name="touchpad" handler={Touchpad}/>
  </Route>
);

var App = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  render: function() {
    return (
      <RouteHandler />
    );
  }
});

Router.run(routes, Router.HashLocation, function (Root) {
  React.render(<Root/>, document.getElementById("content"));
});
