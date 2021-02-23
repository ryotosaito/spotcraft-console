const path = require("path");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const options = {
	path: "/log",
};
const io = require("socket.io")(server, options);
const port = 3000;
const development = app.get("env") == "development";
const fs = require("fs");
const Tail = require("tail").Tail;
require("dotenv").config({
	path: require("path").resolve(
		process.cwd(),
		`.env.${process.env.NODE_ENV}`
	),
});

const logFileName = process.env.LOG_FILENAME;
const tail = new Tail(logFileName);

const pipeFileName = process.env.PIPE_FILENAME;
let pipeFile;
fs.open(
	pipeFileName,
	fs.constants.O_RDWR | fs.constants.O_NONBLOCK,
	(err, fd) => {
		pipeFile = fd;
	}
);

// React
if (development) {
	app.get("/", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../client/public/index.html"));
	});
	const { createProxyMiddleware } = require("http-proxy-middleware");
	app.use(
		"/bundle.js",
		createProxyMiddleware({
			target: "http://localhost:8000/",
			changeOrigin: true,
		})
	);
} else {
	app.use("/", express.static(path.resolve(__dirname, "../client")));
}

// WebSocket
io.use((socket, next) => {
	const token = socket.handshake.auth.token;
	if (
		token ==
		"01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b"
	) {
		next();
	} else {
		const err = new Error("not authorized");
		err.data = { content: "Authorization token mismatched" };
		next(err);
	}
});

io.on("connection", (socket) => {
	console.log(socket.id);
	socket.emit("init_log", fs.readFileSync(logFileName).toString());
	socket.join("logs");

	socket.on("command", (command) => {
		fs.write(pipeFile, command + "\n", (err) => {
			if (err) console.error(err);
		});
	});
});

tail.on("line", function (data) {
	console.log(data);
	io.to("logs").emit("new_log", data + "\n");
});

tail.on("error", function (error) {
	console.log("ERROR: ", error);
});

server.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
	console.log(`mode: ${process.env.NODE_ENV}`);
});
