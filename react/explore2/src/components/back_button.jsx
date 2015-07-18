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

  goBack: function() {
    document.location.hash = "#/";
    //window.history.back();
  },

  render: function() {
    return (
      <IconButton tooltip="Go Back" touch={true} onClick={this.goBack}>
        <FontIcon className="material-icons">keyboard_arrow_left</FontIcon>
      </IconButton>
    );
  }
});

module.exports = BackButton;
