const tar = require("tar");
const path = require("path");
const fs = require("fs");

const files = ["package.json", ".env.production"];

for (const file of files) {
	fs.copyFileSync(file, `build/${file}`);
}

fs.mkdirSync("dist", { recursive: true });

tar.c(
	{
		gzip: true,
		file: "dist/release.tar.gz",
		cwd: path.resolve(__dirname, "../build"),
	},
	["."]
);
