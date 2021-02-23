const tar = require("tar");
const path = require("path");
const fs = require("fs");

fs.copyFileSync("package.json", "build/package.json");

tar.c(
	{
		gzip: true,
		file: "dist/release.tar.gz",
		cwd: path.resolve(__dirname, "../build"),
	},
	["."]
);
