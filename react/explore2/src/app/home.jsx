var React = require("react/addons");
var mui = require("material-ui");
var ThemeManager = mui.Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);
var Card = mui.Card,
    CardHeader = mui.CardHeader,
    Avatar = mui.Avatar,
    FontIcon = mui.FontIcon,
    CardMedia = mui.CardMedia,
    CardTitle = mui.CardTitle,
    CardActions = mui.CardActions,
    CardText = mui.CardText,
    FlatButton = mui.FlatButton,
    AppBar = mui.AppBar;

function visit(path) {
  document.location.hash = "#" + path;
}


var FancyCard = require("fancycard");
var Home = React.createClass({
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
        <AppBar title="fingerpoken" />
        <div>
          <FancyCard primaryText="Video" background="movies.jpg">
            <FlatButton label={<FontIcon className="material-icons">power_settings_new</FontIcon>} onClick={this.click}/>
            <FlatButton label={<FontIcon className="material-icons">home</FontIcon>} onClick={this.click}/>
            <FlatButton label={<FontIcon className="material-icons">settings</FontIcon>} onClick={this.click}/>
          </FancyCard>
          <FancyCard primaryText="Music" background="music.jpg">
            <FlatButton label={<FontIcon className="material-icons">power_settings_new</FontIcon>} onClick={this.click}/>
            <FlatButton label={<FontIcon className="material-icons">home</FontIcon>} onClick={this.click}/>
            <FlatButton label={<FontIcon className="material-icons">settings</FontIcon>} onClick={this.click}/>
          </FancyCard>
          <FancyCard className="fancy-card" primaryText="Energy" background="power.jpg" onClick={function() { visit("/energy");}}>
            <FlatButton label={<FontIcon className="material-icons">power_settings_new</FontIcon>} onClick={this.click}/>
            <FlatButton label={<FontIcon className="material-icons">home</FontIcon>} onClick={function() { visit("/energy"); }} />
            <FlatButton label={<FontIcon className="material-icons">settings</FontIcon>} onClick={this.click}/>
          </FancyCard>
        </div>
      </div>
    );
  }

});

module.exports = Home;
