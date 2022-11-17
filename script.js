const { SlippiGame } = require("@slippi/slippi-js");
const chokidar = require('chokidar');
const _ = require("lodash");

// const game = new SlippiGame("test/test_1.slp");

// const frames = game.getFrames();

// console.log(frames[0].players);

const ME = "HEX#291"

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

		let selfIndex = getPlayerIndex(ME, game);
		if (selfIndex == -1) {
			throw `[ERROR] could not get player index for ${ME}`
		}

		latest = game.getLatestFrame();
		const frameData = _.get(latest, ["players", selfIndex]);
		const preID = _.get(frameData, ["pre", "actionStateId"]);
		const postID = _.get(frameData, ["post", "actionStateId"]);

		console.log(`Pre ID: ${preID} Post ID: ${postID}`);

	} catch (err) {
		console.log(err);
	}
});

let getPlayerIndex = (code, game) => {
	let index = -1;

	settings = game.getSettings();
	_.forEach(settings.players, (player) => {
		if (player.connectCode == code) {
			index = player.playerIndex
		}
	})

	// TODO: test file doens't have connect code. remove this
	// when using for unranked.
	index = 0;

	return index;
}