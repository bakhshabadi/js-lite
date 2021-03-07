const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  entry: "./src/app/app.module.js",
  mode: "development",

  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      // {
      //   test: /\.m?js$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: [
      //         ['babel-preset-env', { targets: "ie 11" }]
      //       ],
      //       plugins: ['@babel/plugin-proposal-class-properties']
      //     }
      //   }
      // },
      {
        test: /.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },

  plugins: [
    new CopyPlugin({
      patterns: [{ from: "./src/assets", to: "./" }],
    }),

    // new CopyPlugin({
    //   patterns: [{ from: "./src/app/@core", to: "./core" }],
    // }),

    new CopyPlugin({
      patterns: [
        { from: "./src/app/components/**/*.htm", to: "./views/[name].htm" },
      ],
    }),

    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),

    // new HtmlWebpackPlugin({
    //   export: __dirname + "/src/assets/index.html",
    // }),
  ],

  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin()],
  },

  target: "node",
};
