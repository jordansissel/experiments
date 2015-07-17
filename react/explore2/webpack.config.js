var webpack = require("webpack");
module.exports = {
  entry: "./src/app.jsx",
  output: {
    path: "./build/",
    filename: "bundle.js"
  },
  externals: {
    "react/addons": "React",
    "react": "React",
  },
  module: {
    loaders: [
      { test: /\.jsx$/, loader: "jsx-loader" }
    ]
  },
  resolve: {
    modulesDirectories: ['node_modules', './src'],
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    //new webpack.optimize.UglifyJsPlugin([])
  ]
};
