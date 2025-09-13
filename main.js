import { WobbleSequencer } from "./wobbly-time/wobble_sequencer.js";


const study = process.argv[2];

switch (study) {
  case "wobbly-time":
    new WobbleSequencer();
    break;
}
