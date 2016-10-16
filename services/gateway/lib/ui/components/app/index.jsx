import React from 'react';

class App extends React.Component {
	constructor(props) {
		super(props);
		props.flux.subscribe(state => {
			this.setState({data: state});
		});
	}

	render() {
		return (
			<div>Hello World! {this.state ? this.state.data.get('increment') : 0}</div>
		);
	}
}

export default App;
