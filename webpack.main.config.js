const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.bundle.js'
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader' }
    ]
  }
};