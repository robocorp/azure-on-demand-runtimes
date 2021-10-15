'use strict';

const path = require('path');
const slsw = require(require.resolve('serverless-webpack', {
  paths: [process.cwd()],
}));

module.exports = {
  entry: slsw.lib.entries,
  devtool: 'nosources-source-map',
  mode: 'production',
  optimization: {
    minimize: false,
  },
  externals: [/^keytar$/],
  resolve: {
    extensions: ['.js', '.json', '.jsx', '.ts', '.tsx', '.wasm'],
  },
  output: {
    library: {
      type: 'commonjs2',
    },
    path: path.join(process.cwd(), '.webpack'),
    filename: '[name].js',
  },
  target: 'node12',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
