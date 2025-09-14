import { ChordMelodySequencer } from "./chord-melody-interaction/chord_melody_sequencer.js";
import { GuessingGameSequencer } from "./guessing-game/guessing_game_sequencer.js";
import { PhasingSequencer } from "./phasing/phasing_sequencer.js";


const study = process.argv[2];

switch (study) {
  case "chord-melody-interaction":
    const configFilepath = process.argv[3];
    const sequencer = new ChordMelodySequencer(configFilepath);
    // Wait 2 seconds for the virtual MIDI port to be recognized.
    setTimeout(() => sequencer.run(), 2000);
    break;
  case "guessing-game":
    new GuessingGameSequencer();
    break;
  case "phasing":
    new PhasingSequencer();
    break;
}
