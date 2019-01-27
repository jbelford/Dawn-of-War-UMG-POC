const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.css', '.html', '.json', '.js', '.jpg']
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      {
        test: /\.tsx?$/, use: {
          loader: 'ts-loader',
          options: {
            configFile: "tsconfig.json"
          }
        }
      },
      {
        test: /\.(?:png|jpeg|jpg)$/,
        use: 'url-loader'
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'scripts/mimgs', to: 'img/w40k/maps' }
    ])
  ]
};