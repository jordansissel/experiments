var React = require("react/addons");
var mui = require("material-ui");
var ThemeManager = mui.Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);
var AppBar = mui.AppBar,
    IconButton = mui.IconButton,
    FontIcon = mui.FontIcon;
var BackButton = require("components/back_button");
var zws = require("lib/zws");

var Scratch = React.createClass({
  getInitialState: function() {
    return {
      sub: new zws.Sub("ws://" + document.location.hostname + ":8111/zws/1.0")
    };
  },
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  componentWillMount: function() { 
    this.state.sub.setMessageHandler(function(message) {
      console.log(message)
    });
    this.state.sub.connect();
  },

  componentWillUnmount: function() { 
  },

  render: function() {
    return (
      <div>
        <AppBar title="fingerpoken" iconElementLeft={<BackButton/>} />
      </div>
    );
  }

});

module.exports = Scratch;
