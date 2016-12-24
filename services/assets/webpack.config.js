module.exports = {
	entry: './lib/index.js',
	output: {
		path: './public/assets',
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
