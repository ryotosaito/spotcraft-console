const tar = require("tar");
const path = require("path");
const fs = require("fs");

fs.mkdirSync("build/server", { recursive: true });

const files = ["server/server.js", "package.json"];
for (const file of files) {
	fs.copyFileSync(file, `build/${file}`);
}

tar.c(
	{
		gzip: true,
		file: "dist/release.tar.gz",
		cwd: path.resolve(__dirname, "build"),
	},
	["."]
);
