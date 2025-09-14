import { Key, Scale } from "tblswvs";
import { Output as MidiOutput } from "easymidi";
import { LiveStepFollower } from "../common/live_step_follower.js";
import { PhaseVoice } from "./phase_voice.js";


export class WobbleSequencer {
  #transport;
  voice1;
  voice2;
  voice1Last;
  voice2Last;


  constructor() {
    const key     = new Key(52, Scale.GS);
    const midiOut = new MidiOutput("tblswvs.out", true);

    this.voice1 = new PhaseVoice(midiOut, 1, key, [1, 3, 5, 7, 8], this);
    this.voice2 = new PhaseVoice(midiOut, 2, key, [5, 4, 3, 2, -1], this);

    this.#transport = new LiveStepFollower();
    this.#transport.on("step", step => this.tick(step));
  }


  tick(step) {
    this.voice1.tick(step);
    this.voice2.tick(step);

    if (this.voice1Last && this.voice2Last) {
      console.log(step, "evolve")
      this.voice1.initializeSequence();
      this.voice2.initializeSequence();
    }
  }


  setLastStep(voiceIndex, isLast) {
    if (voiceIndex === 1)
      this.voice1Last = isLast;
    else
      this.voice2Last = isLast;
  }
}
