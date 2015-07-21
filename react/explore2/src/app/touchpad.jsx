var React = require("react/addons");
var mui = require("material-ui");
var ThemeManager = mui.Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);
var Paper = mui.Paper,
    AppBar = mui.AppBar,
    IconButton = mui.IconButton,
    FontIcon = mui.FontIcon;
var zws = require("lib/zws");

var BackButton = require("components/back_button");

var Touchpad = React.createClass({
  getInitialState: function() {
    return {
      mdc: new zws.MajordomoClient("ws://" + document.location.hostname + ":8111/zws/1.0")
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

  touchStart: function(e) {
    e.preventDefault();
  },
  touchEnd: function(e) {
    e.preventDefault();
  },

  touchMove: function(e) {
    e.preventDefault();
    var text = "";
    touches = e.touches
    var x = touches[0].clientX;
    var y = touches[0].clientY;
    //this.setState({ x: x, y: y });
    //touch_el.innerHTML = "x: " + x + ", y: " + y;

    var rpc = {
      method: "Mouse.Move",
      params: [ { x: x * 4, y: y * 3 } ],
      id: { id: 1 /* generate rpc id */, ts: Date.now() },
    }
    var start = Date.now();
    console.log(rpc);
    this.state.mdc.send("mouse", JSON.stringify(rpc), function(service, response) { 
      console.log("RPC latency: " + (Date.now() - start) + "ms");
      console.log(response) 
    });
  },

  render: function() {
    return (
      <div>
        <AppBar title="fingerpoken" iconElementLeft={<BackButton/>} />
        <div id="touchpad" onTouchStart={this.touchStart} onTouchEnd={this.touchEnd} onTouchMove={this.touchMove}>
          <span>{this.state.x},{this.state.y}</span>
        </div>
      </div>
    );
  }

});

module.exports = Touchpad;
