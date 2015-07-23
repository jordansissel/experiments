var React = require("react/addons");
var mui = require("material-ui");
var ThemeManager = mui.Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);
var AppBar = mui.AppBar,
    IconButton = mui.IconButton,
    Slider = mui.Slider,
    Paper = mui.Paper,
    FontIcon = mui.FontIcon;
var BackButton = require("components/back_button");

var Scratch = React.createClass({
  getInitialState: function() {
    return { 
      x: 0,
      y: 0,
      z: 0
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
    var self = this;
    var ACCELERATION_DUE_TO_GRAVITY = 9.8067; // this varies by location on the earth, but whatever.
    window.ondevicemotion = function(event) {
      self.setState({
        x: event.accelerationIncludingGravity.x / (ACCELERATION_DUE_TO_GRAVITY*2) + 0.5,
        y: event.accelerationIncludingGravity.y / (ACCELERATION_DUE_TO_GRAVITY*2) + 0.5,
        z: event.accelerationIncludingGravity.z / (ACCELERATION_DUE_TO_GRAVITY*2) + 0.5,
        xa: event.acceleration.x / (ACCELERATION_DUE_TO_GRAVITY*2) + 0.5,
        ya: event.acceleration.y / (ACCELERATION_DUE_TO_GRAVITY*2) + 0.5,
        za: event.acceleration.z / (ACCELERATION_DUE_TO_GRAVITY*2) + 0.5
      })
    }
  },

  componentWillUnmount: function() { 
    window.ondevicemotion = undefined;
  },

  render: function() {
    return (
      <div>
        <AppBar title="Accelerometer"  iconElementLeft={<BackButton/>} />
        
        <Paper>
          With gravity:
          <Slider name="x" value={this.state.x} />
          <Slider name="y" value={this.state.y}  />
          <Slider name="z" value={this.state.z} />
        </Paper>

        <Paper>
          With out gravity:
          <Slider name="xa" value={this.state.xa} />
          <Slider name="ya" value={this.state.ya} />
          <Slider name="za" value={this.state.za} />
        </Paper>
      </div>
    );
  }

});

module.exports = Scratch;
