import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import { hot } from "react-hot-loader";
import { io } from "socket.io-client";
import "./App.css";

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			token: "",
			command: "",
			console: "",
			consoleStyle: { height: "30px" },
			disabled: true,
		};
		this.consoleRef = React.createRef();
		this.handleChange = this.handleChange.bind(this);
		this.submitToken = this.submitToken.bind(this);
		this.consoleUpdate = this.consoleUpdate.bind(this);
		this.fixConsoleSize = this.fixConsoleSize.bind(this);
		this.submitCommand = this.submitCommand.bind(this);
		this.socket = io({
			autoConnect: false,
			path: "/log",
			auth: {
				token: "",
			},
		});
		this.socket.on("connect_error", (err) => {
			alert(`${err.message}: ${err.data.content}`);
			this.socket.disconnect();
		});
		this.socket.on("connect", () => {
			this.setState({ disabled: false });
		});
		this.socket.on("init_log", (log) => {
			this.setState({ console: log });
			this.consoleUpdate();
		});
		this.socket.on("new_log", (log) => {
			this.setState({ console: this.state.console + log });
			this.consoleUpdate();
		});
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
		this.setState({ [event.target.name]: event.target.value });
	}

	submitToken(event) {
		try {
			this.socket.auth.token = this.state.token;
			this.socket.connect();
		} finally {
			event.preventDefault();
		}
	}

	submitCommand(event) {
		try {
			const command = this.state.command;
			this.socket.emit("command", command);
			this.setState({ console: this.state.console + command + "\n" });
			this.setState({ command: "" });
		} finally {
			event.preventDefault();
		}
	}

	render() {
		return (
			<div className="App">
				<h1> Minecraft Console ({process.env.NODE_ENV})</h1>
				<form onSubmit={this.submitToken}>
					<input
						autoFocus
						id="token"
						type="text"
						size="40"
						name="token"
						placeholder="token"
						value={this.state.token}
						onChange={this.handleChange}
					></input>
					<input type="submit" value="auth"></input>
				</form>
				<form onSubmit={this.submitCommand}>
					<input
						id="command"
						type="text"
						name="command"
						placeholder="input command"
						disabled={this.state.disabled}
						value={this.state.command}
						onChange={this.handleChange}
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
