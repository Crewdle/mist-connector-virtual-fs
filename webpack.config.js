const path = require('path');

module.exports = () => {
  configs = {
    entry: './src/index.ts',
    target: 'node',
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
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    optimization: {
      minimize: false,
    },
  };

  return configs;
}
