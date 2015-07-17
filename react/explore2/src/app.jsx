// This require is to make sure webpack copies index.html into the build
// directory
require("file?name=[name].[ext]!./index.html");
var React = require("react");

React.render(<h1>Hello world</h1>, document.body);
