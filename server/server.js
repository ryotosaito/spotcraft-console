import { resolve } from "path";
import { open, constants, readFileSync, write } from "fs";
import { Tail } from "tail";

// setup server
import express from "express";
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { path: "/log" });
require("dotenv").config({
	path: require("path").resolve(
		process.cwd(),
		`.env.${process.env.NODE_ENV}`
	),
});

// constants
const development = app.get("env") == "development";
const port = development ? 3000 : 80;
const tokenFileName = process.env.TOKEN_FILENAME;
const logFileName = process.env.LOG_FILENAME;
const pipeFileName = process.env.PIPE_FILENAME;

// open files
let pipeFile;
const tail = new Tail(logFileName);
open(pipeFileName, constants.O_RDWR | constants.O_NONBLOCK, (err, fd) => {
	pipeFile = fd;
});

// React
if (development) {
	const { createProxyMiddleware } = require("http-proxy-middleware");
	app.use(
		"/",
		createProxyMiddleware({
			target: "http://localhost:8000/",
			changeOrigin: true,
		})
	);
} else {
	app.use("/", express.static(resolve(__dirname, "../client")));
}

// WebSocket
io.use((socket, next) => {
	const token = socket.handshake.auth.token;
	if (token == readFileSync(tokenFileName).toString().trim()) {
		next();
	} else {
		const err = new Error("not authorized");
		err.data = { content: "Authorization token mismatched" };
		next(err);
	}
});

io.on("connection", (socket) => {
	console.log("connected:", socket.id);
	socket.emit("init_log", readFileSync(logFileName).toString());
	socket.join("logs");

	socket.on("command", (command) => {
		write(pipeFile, command + "\n", (err) => {
			if (err) console.error(err);
		});
	});
});

// watch minecraft server logs
tail.on("line", function (data) {
	io.to("logs").emit("new_log", data + "\n");
});

tail.on("error", function (error) {
	console.log("ERROR: ", error);
});

// start server
server.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
	console.log(`mode: ${process.env.NODE_ENV}`);
});
