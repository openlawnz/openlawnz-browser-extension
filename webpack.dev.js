const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common.webpack(["./src/livereload/injectLiveReload.json"]), {
	mode: "development",
	entry: {
		injectLiveReload: "./src/livereload/injectLiveReload.js"
	},
	plugins: [
		new webpack.DefinePlugin({
	      'process.env': {
	        API_URL: JSON.stringify("http://localhost:4000/graphql"),
	      },
	    }),
	],
	devServer: {
		contentBase: common.distChrome,
		compress: true,
		port: 9000
	}
});
