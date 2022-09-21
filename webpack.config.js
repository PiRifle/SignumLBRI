/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const fs = require('fs');

class MetaInfoPlugin {
  constructor(options) {
    this.options = { filename: 'meta.json', ...options };
  }

  apply(compiler) {
    compiler.hooks.done.tap(this.constructor.name, stats => {
      const metaInfo = {
        // add any other information if necessary
        hash: stats.hash
      };
      const json = JSON.stringify(metaInfo);
      return new Promise((resolve, reject) => {
        fs.writeFile(this.options.filename, json, 'utf8', error => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    });
  }
}

module.exports = [
  {
    plugins: [
      // new NodePolyfillPlugin(),
      new MiniCssExtractPlugin({
        filename: "[name].[hash].css",
      }),
      new MetaInfoPlugin({ filename: 'dist/meta.json' }),

    //   new webpack.ProvidePlugin({
    //     process: "process/browser",
    //     Buffer: ["buffer", "Buffer"],
    //   }),
    ],
    entry: {
      "js/main": "./src/public/js/main.ts",
        "css/main": "./src/public/css/main.scss",
      "js/print": "./src/public/js/print.ts",
        "css/print": "./src/public/css/print.scss",
      "js/admin": "./src/public/js/admin.ts",
        "css/admin": "./src/public/css/admin.scss",
    },

    devtool: "inline-source-map",
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            // // Creates `style` nodes from JS strings
            // "style-loader",
            // // Translates CSS into CommonJS
            MiniCssExtractPlugin.loader,
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
          ],
        },
        {
          test: /\.ts?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "[name].[hash].js",
      path: path.resolve(__dirname, "dist/public/"),
    },
  },
];
