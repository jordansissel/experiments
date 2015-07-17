var React = require("react/addons");
var mui = require("material-ui");
var ThemeManager = mui.Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);
var IconButton = mui.IconButton,
    FontIcon = mui.FontIcon;

var BackButton = React.createClass({
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
      <IconButton tooltip="Go Back" touch={true} onClick={function() { window.history.back(); }}>
        <FontIcon className="material-icons">keyboard_arrow_left</FontIcon>
      </IconButton>
    );
  }
});

module.exports = BackButton;
