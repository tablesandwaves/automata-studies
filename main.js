import { GuessingGameSequencer } from "./guessing-game/guessing_game_sequencer.js";
import { WobbleSequencer } from "./wobbly-time/wobble_sequencer.js";


const study = process.argv[2];

switch (study) {
  case "guessing-game":
    new GuessingGameSequencer();
    break;
  case "wobbly-time":
    new WobbleSequencer();
    break;
}
