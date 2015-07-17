// This require is to make sure webpack copies index.html and index.css into
// the build directory. It's weird.
require("file?name=[name].[ext]!./index.html");
require("file?name=[name].[ext]!./index.css");


var React = require("react/addons");
var mui = require("material-ui");
var RaisedButton = mui.RaisedButton;
var ThemeManager = mui.Styles.ThemeManager();

var Welcome = require("welcome");

var IconButton = mui.IconButton;
var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

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
      <div>
        <mui.AppBar title="fingerpoken" />
        <div class="inset">
          <Welcome />
        </div>
      </div>
    );
  }
});

React.render(<App />, document.body);
