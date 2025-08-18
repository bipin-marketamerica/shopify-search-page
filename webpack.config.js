const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  entry: "./src/index.ts",
  mode: "development",
  devServer: {
    static: path.join(__dirname, "dist"),
    port: 3002,
    hot: true,
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  resolve: {
    // alias: {
    //   react: require.resolve("react"),
    //   "react-dom": require.resolve("react-dom"),
    // },
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  devServer: {
    proxy: [
      {
        context: ["/api/2025-07/graphql.json"],
        target: "https://mark-mfe-test.myshopify.com",
      },
    ],
    static: {
      directory: path.join(__dirname, "dist"),
    },
    port: 3002,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.(css|s[ac]ss)$/i,
        use: [
          "style-loader",
          "css-loader",
          "postcss-loader",
          {
            loader: "sass-loader",
            options: {
              api: "modern-compiler",
              sassOptions: {
                silenceDeprications: ["legacy-js-api"],
              },
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },
  // externals: {
  //   react: "react",
  //   "react-dom": "react-dom",
  // },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new ModuleFederationPlugin({
      name: "remoteProduct",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductList": "./src/ProductList/ProductList",
      },
      remotes: {
        // define other remotes here
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        "react-dom": {
          singleton: true,
          requiredVersion: false,
        },
      },
    }),
  ],
};
