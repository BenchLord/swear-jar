const { SlippiGame } = require("@slippi/slippi-js");

const game = new SlippiGame("test/test_1.slp");

const frames = game.getFrames();
console.log(frames[0].players);

