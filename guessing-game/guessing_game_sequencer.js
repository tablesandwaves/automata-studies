import { Output as MidiOutput } from "easymidi";
import { Key, Scale } from "tblswvs";
import { LiveStepFollower } from "../common/live_step_follower.js";
import { LeadVoice } from "./src/lead_voice.js";
import { AccompanimentVoice } from "./src/accompaniment_voice.js";


export class GuessingGameSequencer {
  #transport;
  #leadVoice;


  constructor() {
    this.#loadVoices();

    // Clock Step From Live
    this.#transport = new LiveStepFollower();
    this.#transport.onStep((step) => this.#leadVoice.tick(step));
  }


  #loadVoices() {
    const key     = new Key(60, Scale.MinPentatonic);
    const midiOut = new MidiOutput("tblswvs.out", true);

    this.#leadVoice = new LeadVoice(key, midiOut, 1);
    this.#leadVoice.subscribe(new AccompanimentVoice(key, midiOut, 2, this.#leadVoice));

  }
}
