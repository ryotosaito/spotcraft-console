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
const logFile = "latest.log";

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/client/public/index.html");
});

// React
if (development) {
	const { createProxyMiddleware } = require("http-proxy-middleware");
	app.use(
		"/client/build/",
		createProxyMiddleware({
			target: "http://localhost:8000",
			changeOrigin: true,
		})
	);
} else {
	app.get("/client/build/bundle.js", (req, res) => {
		res.sendFile(__dirname + "/client/build/bundle.js");
	});
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
	socket.emit("init_log", fs.readFileSync(logFile).toString());
	socket.join("logs");
});

const tail = new Tail(logFile);

tail.on("line", function (data) {
	console.log(data);
	io.to("logs").emit("new_log", data + "\n");
});

tail.on("error", function (error) {
	console.log("ERROR: ", error);
});

server.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
