const path = require("path");
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const distBase = path.resolve(__dirname, "dist");
const distChrome = distBase + "/chrome";

const webpack = extraManifestJSON => ({
	entry: {
		injectTab: "./src/js/injectTab.js",
		background: "./src/js/background.js"
	},
	output: {
		filename: "[name].js",
		path: distChrome
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					"css-loader"
				]
			},
			{
				test: /\.(png|jpg)$/,
				loader: 'url-loader'
			  }
		]
	},
	plugins: [
		new MergeJsonWebpackPlugin({
			debug: true,
			files: [
				"./src/manifest/base.json",
				"./src/manifest/chrome.json",
				...extraManifestJSON
			],
			output: {
				fileName: "manifest.json"
			}
		}),
		new MiniCssExtractPlugin({
			filename: "[name].css",
			chunkFilename: "[id].css"
		}),
		new CopyWebpackPlugin([
			{ from: "./src/img/*", to: "img", flatten: true },
			{ from: "./src/html/*", to: "", flatten: true }
		])
	]
});

module.exports = {
	distBase,
	distChrome,
	webpack
};
