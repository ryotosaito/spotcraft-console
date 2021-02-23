const path = require("path");
const webpack = require("webpack");
const dotenv = require("dotenv");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./client/index.js",
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /(node_modules|bower_components)/,
				loader: "babel-loader",
				options: { presets: ["@babel/env"] },
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	resolve: { extensions: ["*", ".js", ".jsx"] },
	output: {
		path: path.resolve(__dirname, "build/client"),
		publicPath: "/",
		filename: "bundle.js",
	},
	devServer: {
		contentBase: path.join(__dirname, "client/"),
		port: 8000,
		publicPath: "http://localhost:8000/",
		hotOnly: true,
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			template: "./client/public/index.html",
		}),
		new webpack.DefinePlugin({
			"process.env": JSON.stringify(
				dotenv.config({
					path: path.resolve(
						process.cwd(),
						`.env.${process.env.NODE_ENV}`
					),
				}).parsed
			),
		}),
	],
};
