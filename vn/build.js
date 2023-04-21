import * as path from "node:path";
import * as fs from "node:fs";
import * as cp from "node:child_process";
import rimraf from "rimraf";
import archiver from "archiver";
import { blue, bold, cyan, gray, green, lightGreen, lightRed, magenta, red, reset, white, yellow } from "kolorist";

const __dirname = path.resolve();


function copyDir(from, to) { // cp from to/
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

const game = JSON.parse(fs.readFileSync(path.join(__dirname, "public", "game.json"), "utf-8"));

console.log(`${cyan("Copying assets...")} - cp dist/* packaging/`);
for (let _ = 0; _ < 5; _++) {
	try {
		if (fs.existsSync(path.join(__dirname, "packaging"))) rimraf.sync(path.join(__dirname, "packaging"));
		if (fs.existsSync(path.join(__dirname, "package"))) rimraf.sync(path.join(__dirname, "package"));

		break;
	} catch {
		Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000); // 1secs wait
		continue;
	}
}

fs.readdirSync(path.join(__dirname, "dist"))
	.forEach(r => {
		copyDir(
			path.join(__dirname, "dist", r),
			path.join(__dirname, "packaging"),
		);
	});

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf-8"));
const packageDirectory = `${packageJson.name}-${packageJson.version}-win-x64`;
const nwjsJson = JSON.stringify({
	name: packageJson.name,
	version: packageJson.version,
	main: "entry.js",
	window: {
		icon: "icon.png",
	},
	"nwjs-packager": {
		nwVersion: "0.60.0",
		// nwFlavor: "sdk",
		nwFlavor: "release",
		appFriendlyName: "VN",
		appWinIcon: "icon.ico",
		files: ["./**"],
		outputDir: `../package/${packageDirectory}`,
		builds: {
			linux: { "tar.gz": false },
			osx: { "zip": false },
			win: { "zip": false },
		},
	},
}, undefined, 4);
fs.writeFileSync(path.join(__dirname, "packaging", "package.json"), nwjsJson, "utf-8");

console.log(`${cyan("Building...")} - npx nwp`);
cp.execSync("npx nwp", {
	cwd: path.join(__dirname, "packaging"),
});

console.log(`${cyan("Rename...")} - mv package/${packageDirectory}/${packageDirectory} package/${packageDirectory}/game`);
fs.renameSync(
	path.join(__dirname, "package", packageDirectory, packageDirectory, "vn.exe"),
	path.join(__dirname, "package", packageDirectory, packageDirectory, `${game.title}.exe`),
);
fs.renameSync(
	path.join(__dirname, "package", packageDirectory, packageDirectory),
	path.join(__dirname, "package", packageDirectory, game.title),
);

console.log(`${cyan("Copying icon...")} - cp packaging/icon.png package/${packageDirectory}/game/icon.png`);
fs.copyFileSync(
	path.join(__dirname, "packaging", "icon.png"),
	path.join(__dirname, "package", packageDirectory, game.title, "icon.png"),
);

console.log(`${cyan("Zipping...")} - archiver.zip package/${packageDirectory}/ package/${packageDirectory}.zip`);
await (async () => {
	const zipStream = fs.createWriteStream(path.join(__dirname, "package", `${game.title} v${packageJson.version}.zip`));
	const zip = archiver("zip", { zlib: { level: 9 } });
	zip.pipe(zipStream);
	zip.directory(path.join(__dirname, "package", packageDirectory, game.title), false);
	await zip.finalize();
})();

console.log(`${yellow("Done")} - ${path.resolve(__dirname, "package")} ${packageDirectory}.zip`);
