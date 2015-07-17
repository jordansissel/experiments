module.exports = {
  entry: "./src/app.jsx",
  output: {
    path: "./build/",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      { test: /\.jsx$/, loader: "jsx-loader" }
    ]
  }
};
