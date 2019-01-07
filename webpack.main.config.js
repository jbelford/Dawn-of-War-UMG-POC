module.exports = {
  entry: './src/main/main.ts',
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