

module.exports = {
  packagerConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip'
    }
  ],
  plugins: [
    [
      '@electron-forge/plugin-webpack',
      {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/renderer/index.html',
              js: './src/renderer/index.tsx',
              name: 'main_window'
            }
          ]
        }
      }
    ]
  ]
}