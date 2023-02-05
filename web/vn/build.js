import * as path from "node:path";
import * as fs from "node:fs";
import * as cp from "node:child_process";
import rimraf from "rimraf";

const __dirname = path.resolve();


function copyDir (from, to) { // cp from to/
	if (!fs.existsSync(from))
		throw new Error(`Path "${from}" not exists`);

	const stat = fs.statSync(from);
	if (!stat.isDirectory()) {
		const dirStat = fs.statSync(to);
		if (!fs.existsSync(to))
			fs.mkdirSync(to, { recursive: true });
		else {
			if (!dirStat.isDirectory())
				throw new Error(`Path "${to}" already exists, is not directory`);
		}

		const fto = path.join(to, path.basename(from));
		fs.copyFileSync(from, fto);
		return;
	}

	const _to = path.join(to, path.basename(from));
	if (!fs.existsSync(_to))
		fs.mkdirSync(_to, { recursive: true });
	else {
		const dirStat = fs.statSync(_to);
		if (!dirStat.isDirectory())
			throw new Error(`Path "${_to}" already exists, is not directory`);
	}

	fs.readdirSync(from).forEach(fname => {
		const ffrom = path.join(from, fname);
		const fto = path.join(_to, fname);

		const fromStat = fs.statSync(ffrom);
		if (fromStat.isDirectory()) {
			if (!fs.existsSync(fto))
				fs.mkdirSync(fto, { recursive: true });

			const toStat = fs.statSync(fto);
			if (!toStat.isDirectory())
				throw new Error(`Path "${fto}" already exists, is not directory`);

			copyDir(ffrom, _to);
		} else {
			if (fs.existsSync(fto)) {
				const toStat = fs.statSync(fto);
				if (toStat.isDirectory())
					throw new Error(`Path "${fto}" already exists, is directory`);

				fs.unlinkSync(fto);
			}

			fs.copyFileSync(ffrom, fto);
		}
	});
}

if (fs.existsSync(path.join(__dirname, "packaging"))) rimraf.sync(path.join(__dirname, "packaging"));
if (fs.existsSync(path.join(__dirname, "package"))) rimraf.sync(path.join(__dirname, "package"));

fs.readdirSync(path.join(__dirname, "dist"))
	.forEach(r => {
		copyDir(
			path.join(__dirname, "dist", r),
			path.join(__dirname, "packaging"),
		);
	});

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf-8"));
const nwjsJson = JSON.stringify({
	name: packageJson.name,
	version: packageJson.version,
	main: "entry.js",
	window: {
		icon: "icon.png",
	},
	"nwjs-packager": {
		nwVersion: "stable",
		nwFlavor: "sdk",
		appFriendlyName: "VN",
		appWinIcon: "icon.ico",
		files: ["./**"],
		outputDir: "../package",
		builds: {
			linux: { "tar.gz": true },
			osx: { "zip": true },
			win: { "zip": true },
		},
	},
}, undefined, 4);

fs.writeFileSync(path.join(__dirname, "packaging", "package.json"), nwjsJson, "utf-8");

cp.execSync("npx nwp", {
	cwd: path.join(__dirname, "packaging"),
});