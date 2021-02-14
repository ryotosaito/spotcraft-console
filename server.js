const express = require("express");
const app = express();
const port = 3000;
const development = app.get("env") == "development";

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

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
