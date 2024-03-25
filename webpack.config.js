const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = () => {
  configs = {
    entry: './src/index.ts',
    target: 'node',
    externals: [nodeExternals({
      allowlist: ['node-datachannel/polyfill', 'node-datachannel']
    })],
    devtool: false,
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
      minimize: true,
    },
  };

  return configs;
}
