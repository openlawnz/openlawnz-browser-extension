const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common.webpack(["./src/livereload/injectLiveReload.json"]), {
	mode: "development",
	entry: {
		injectLiveReload: "./src/livereload/injectLiveReload.js"
	},
	devServer: {
		contentBase: common.distChrome,
		compress: true,
		port: 9000
	}
});
