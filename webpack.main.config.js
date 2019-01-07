module.exports = {
  entry: './src/main/main.ts',
  resolve: {
    extensions: ['.ts', '.json', '.js']
  },
  module: {
    rules: [
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