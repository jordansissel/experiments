var React = require("react/addons");
var mui = require("material-ui");
var ThemeManager = mui.Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);

var Paper = mui.Paper,
    AppBar = mui.AppBar,
    List = mui.List,
    ListItem = mui.ListItem,
    IconButton = mui.IconButton,
    FontIcon = mui.FontIcon;

var BackButton = require("components/back_button");
var ForeverSocket = require("lib/forever_socket");

var Notifications = React.createClass({
  getInitialState: function() {
    return {
      notifications: [
        { message: "Hello world", icon: "power_settings_new" },
        { message: "Hello world", subtext: "whoa" },
      ]
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
    this.foreverSocket = new ForeverSocket("ws://localhost:8000/ws", "notifications");
    var self = this;
    this.foreverSocket.onmessage = function(m) {
      console.log("whoa", m.data);
      var m = JSON.parse(m.data);
      self.state.notifications.push(m.params)
      self.setState({notifications: self.state.notifications});
    }
    //console.log(this.state);
  },
  componentWillUnmount: function() {
    this.foreverSocket.close();
  },

  render: function() {
    var items = this.state.notifications.map(function(n) {
      return <ListItem primaryText={n.message} secondaryText={n.subtext} leftIcon={<FontIcon className="material-icons">{n.icon}</FontIcon>} />
    });

    //console.log(items);
    return (
      <div>
        <AppBar title="notifications" iconElementLeft={<BackButton/>} />
        <div className="page">
          <List>
            {items}
          </List>
        </div>
      </div>
    );
  }

});

module.exports = Notifications;
