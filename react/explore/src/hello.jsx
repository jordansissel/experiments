var mui = require("material-ui");
var ThemeManager = new mui.Styles.ThemeManager();

var Hello = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  render: function() {
    return <div>
      <mui.AppBar title="Hello"/>
      <div className="interior">
        <mui.Slider />
      </div>
    </div>;
  }

});

React.render(
  <Hello />,
  document.getElementById('example')
);
