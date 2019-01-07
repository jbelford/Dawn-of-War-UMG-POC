module.exports = {
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
      }
    ]
  }
};