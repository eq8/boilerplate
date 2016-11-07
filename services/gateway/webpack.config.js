module.exports = {
	entry: './lib/ui/index.js',
	output: {
		path: './public',
		filename: 'bundle.js',
	},
	module: {
		loaders: [{
			test: /\.jsx?$/,
			exclude: /node_modules/,
			loader: 'babel-loader',
			presets: ['es2015', 'react']
		}]
	}
}
