var React = require("react/addons");
var mui = require("material-ui");
var ThemeManager = mui.Styles.ThemeManager();
var Card = mui.Card,
    CardHeader = mui.CardHeader,
    Avatar = mui.Avatar,
    CardMedia = mui.CardMedia,
    CardTitle = mui.CardTitle,
    CardActions = mui.CardActions,
    CardText = mui.CardText,
    FlatButton = mui.FlatButton;
var FancyCard = require("fancycard");

var Welcome = React.createClass({
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
      <mui.Paper className="centered">
        <FancyCard />

      </mui.Paper>
    );
  }

});

module.exports = Welcome;
