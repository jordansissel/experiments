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
  },

  render: function() {
    return (
      <Card className="card">
        <CardMedia overlay={<CardTitle title="Title" />}>
          <img src="background.jpg"/>
        </CardMedia>
        <CardActions>
          <FlatButton label="Action1" onClick={this.click}/>
          <FlatButton label="Action2" onClick={this.click}/>
          <FlatButton label="Action3" onClick={this.click}/>
        </CardActions>
      </Card>
    );
  }

});

module.exports = FancyCard;
