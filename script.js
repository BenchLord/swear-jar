const { SlippiGame } = require("@slippi/slippi-js");
const chokidar = require('chokidar');

// const game = new SlippiGame("test/test_1.slp");

// const frames = game.getFrames();

// console.log(frames[0].players);

const watcher = chokidar.watch('test', {
	persistent: true,
	ignoreInitial: true,
	usePolling: true,
	depth: 0,
});

watcher.on('add', (path) => {
	console.log(`[INFO] ${path} created`);

	try {
		let game = new SlippiGame(path, { processOnTheFly: true });

		let settings = game.getSettings();
		console.log(settings.players);
	} catch (err) {
		console.log(err);
	}
});
