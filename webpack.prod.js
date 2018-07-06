const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = merge(common.webpack(["./src/manifest/production.json"]), {
	mode: "production",
	plugins: [
		new CleanWebpackPlugin(common.distBase)
	]
});
