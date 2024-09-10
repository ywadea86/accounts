const path = require('path');

module.exports = {
  entry: './src/index.js', // Your app's entry point
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js', // Name of the output file
  },
  resolve: {
    fallback: {
      https: false, // Disable https polyfill for the browser
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Transpile JS code using Babel
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // Support for CSS files
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 9000, // Port for local development
  },
  mode: 'development', // or 'production'
};

