import React from 'react';
import { AppBar } from 'react-toolbox/lib/app_bar';

class App extends React.Component {
	constructor(props) {
		super(props);
		props.flux.subscribe(state => {
			this.setState({data: state});
		});
	}

	render() {
		return (
			<div>
				<AppBar>App Example</AppBar>
			</div>
		);
	}
}

export default App;
