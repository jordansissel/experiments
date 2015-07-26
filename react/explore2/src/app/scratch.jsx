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
var zws = require("lib/zws");

var Scratch = React.createClass({
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

  componentWillMount: function() { 
  },

  componentWillUnmount: function() { 
  },

  setBrightness: function(e, value) {
    console.log(value);
    var rpc = {
      method: "Screen.SetBrightness",
      params: [ { percent: value } ],
      id: { id: 1 /* generate rpc id */, ts: Date.now() },
    }
    var start = Date.now();
    console.log(rpc);
    this.state.mdc.send("screen", JSON.stringify(rpc), function(service, response) { 
      console.log("RPC latency: " + (Date.now() - start) + "ms");
      console.log(response) 
    });
  },

  render: function() {
    return (
      <div>
        <AppBar title="Screen Brightness"  iconElementLeft={<BackButton/>} />
        
        <Slider name="x" onChange={this.setBrightness}/>
      </div>
    );
  }

});

module.exports = Scratch;
