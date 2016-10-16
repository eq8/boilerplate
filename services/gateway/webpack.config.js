var path = require('path');

module.exports = {
	entry: './lib/ui/index.jsx',
	output: {
		path: './public',
		filename: 'bundle.js',
	},
	module: {
		loaders: [{
			test: /(\.js|\.jsx)$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		}]
	}
}
