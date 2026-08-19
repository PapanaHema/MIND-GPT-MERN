const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src/main.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "assets/[name].[contenthash].js",
    assetModuleFilename: "assets/[name].[contenthash][ext]",
    clean: true,
    publicPath: "/",
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { targets: "defaults" }],
              ["@babel/preset-react", { runtime: "automatic" }],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
    }),
  ],
  devServer: {
    host: "localhost",
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
    client: {
      overlay: true,
    },
    proxy: [
      {
        context: ["/api"],
        target: "http://localhost:8999",
        changeOrigin: true,
      },
    ],
  },
  devtool: "source-map",
};
