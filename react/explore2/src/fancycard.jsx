var React = require("react/addons");
var mui = require("material-ui");
var ThemeManager = mui.Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);
var Card = mui.Card,
    CardHeader = mui.CardHeader,
    Avatar = mui.Avatar,
    CardMedia = mui.CardMedia,
    CardTitle = mui.CardTitle,
    CardActions = mui.CardActions,
    CardText = mui.CardText,
    FontIcon = mui.FontIcon,
    FlatButton = mui.FlatButton;

var FancyCard = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  click: function(e) {
    e.preventDefault();
    console.log(e);
    alert("OK");
  },

  render: function() {
    console.log(this);
    return (
      <Card className="card">
        <CardMedia overlay={
            <CardTitle className="centered" title={this.props.primaryText || "<primaryText>"} subtitle={this.props.secondaryText}/>
          }>
          <img src={this.props.background}/>
        </CardMedia>
        <CardActions>
          <center> {this.props.children} </center>
        </CardActions>
      </Card>
    );
  }

});

module.exports = FancyCard;
