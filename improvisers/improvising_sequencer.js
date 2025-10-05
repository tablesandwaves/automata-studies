import { Output as MidiOutput } from "easymidi";
import { Key, Scale } from "tblswvs";
import { LiveStepFollower } from "../common/live_step_follower.js";
import { PadVoice } from "./src/pad_voice.js";


export class ImprovisingSequencer {
  #transport;
  voices;


  constructor() {
    // Clock Step From Live
    this.#transport = new LiveStepFollower();
    this.#transport.on("step", index => this.step(index));
    this.#transport.on("transport", state => this.startStop(state))

    this.voices = new Array();
    this.#loadVoices();
  }


  startStop(state) {
    console.log(`Transport: ${state}`);

    if (state === "stopped") {
      this.voices.forEach(voice => {
        voice.stop();
      });
    }
  }


  step(index) {
    this.voices.forEach(voice => {
      if (voice.musicalRole === "Leader")
        voice.step(index);
    });
  }


  #loadVoices() {
    const key = new Key(60, Scale.Minor);
    const midiOut = new MidiOutput("tblswvs.out", true);

    this.voices.push(new PadVoice("Leader", key, midiOut, 1));
  }
}
