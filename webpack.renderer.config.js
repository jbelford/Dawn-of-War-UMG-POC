module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.css', '.html', '.json', '.js', 'jpg']
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
        test: /\.(png|jp(e*)g|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8000,
            name: 'img/[hash]-[name].[ext]'
          }
        }]
      }
    ]
  }
};