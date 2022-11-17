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

		/* ACTION STATES
		0058	003A	AttackS4Hi	High Fsmash	
		0059	003B	AttackS4HiS	High-mid Fsmash	
		0060	003C	AttackS4S	  Mid Fsmash	
		0061	003D	AttackS4LwS	Low-mid Fsmash	
		0062	003E	AttackS4Lw	Low Fsmash

		0088	0058	DamageFlyN

		0178	00B2	GuardOn	    Shield startup
		0179	00B3	Guard	      Holding shield
		0180	00B4	GuardOff	  Shield release
		0181	00B5	GuardSetOff	Shield stun
		*/

		// TODO: I think marth always uses 60 but need to double check.
		// Opponents hit by fsmash seem to be placed in 88 but might have
		// other states depending on cc or percent.

		// Looks like in both cases where opponent took damage from fsmash
		// the state changed to 88. This occurred once from 0 to 14% (no tipper)
		// and 74 to 94% (tipper).

		// Marth fsmash has active hitbox during frames 10-13

		let count = 0;
		let frameCount = 0;
		let missed = 0;
		let hit = 0;

		_.forEach(game.getFrames(), (frame) => {
			const frameData = _.get(frame, ["players", selfIndex]);
			const preID = _.get(frameData, ["pre", "actionStateId"]);
			const postID = _.get(frameData, ["post", "actionStateId"]);

			// Check opponent state change during fsmash.
			const oppFrameData = _.get(frame, ["players", 3]);
			const oppPre = _.get(oppFrameData, ["pre"]);
			const oppPost = _.get(oppFrameData, ["post"]);

			if (preID == 60) {
				// if opponent state changes during fmsmash log info
				if (oppPre.actionStateId != oppPost.actionStateId) {
					console.log("Pre:", oppPre);
					console.log("Post:", oppPost);
				}
			}

			// Fsmash was started on this frame.
			if (preID != 60 && postID == 60) {
				count++;
				// fsmash takes 49 frames if no lag is incurred.
				frameCount = 49;
			}

			// log every frame of fsmash animation
			if (frameCount >= 0) {
				if (frameCount == 0) {
					// character is still in fsmash animation. must have
					// incurred lag of some kind
					if (preID == 60) {
						hit++;
					} else {
						missed++;
					}
				}

				frameCount--
			}
		})

		console.log(`Hit: ${hit} Missed: ${missed}`);

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