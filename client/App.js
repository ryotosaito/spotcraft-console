import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import { hot } from "react-hot-loader";
import "./App.css";

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			token: "",
			console: "",
			consoleStyle: { height: "30px" },
			disabled: true,
		};
		this.consoleRef = React.createRef();
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.consoleUpdate = this.consoleUpdate.bind(this);
		this.fixConsoleSize = this.fixConsoleSize.bind(this);
		for (let i = 1; i <= 50; i++) {
			this.state.console += `[INFO] ${i} this is testlog.\n`;
		}
	}

	fixConsoleSize() {
		const rect = findDOMNode(
			this.consoleRef.current
		).getBoundingClientRect();
		this.setState({
			consoleStyle: { height: `${window.innerHeight - rect.y - 20}px` },
		});
	}

	componentDidMount() {
		window.addEventListener("resize", this.fixConsoleSize);
		this.fixConsoleSize();
	}

	consoleUpdate() {
		this.consoleRef.current.scrollTop = this.consoleRef.current.scrollHeight;
	}

	handleChange(event) {
		this.setState({ token: event.target.value });
	}

	handleSubmit(event) {
		this.setState({ disabled: false });
		this.consoleUpdate();
		event.preventDefault();
	}

	render() {
		return (
			<div className="App">
				<h1> Minecraft Console </h1>
				<form onSubmit={this.handleSubmit}>
					<input
						id="token"
						type="text"
						size="40"
						placeholder="token"
						value={this.state.token}
						onChange={this.handleChange}
					></input>
					<input type="submit" value="auth"></input>
				</form>
				<form>
					<input
						id="command"
						type="text"
						placeholder="input command"
						disabled={this.state.disabled}
					></input>
				</form>
				<textarea
					id="console"
					readOnly="readOnly"
					ref={this.consoleRef}
					value={this.state.console}
					style={this.state.consoleStyle}
				></textarea>
			</div>
		);
	}
}

export default hot(module)(App);
