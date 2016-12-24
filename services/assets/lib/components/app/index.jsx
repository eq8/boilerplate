import React from 'react';
import RedBloom from 'redbloom';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.flux = RedBloom();
		this.flux.subscribe(state => {
			this.setState({data: state});
		});
	}

	render() {
		var self = this;
		return (
			<div>Hello World!</div>
		);
	}
}

export default App;
