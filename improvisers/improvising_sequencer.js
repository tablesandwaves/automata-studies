import { Output as MidiOutput } from "easymidi";
import { Key, Scale } from "tblswvs";
import { LiveStepFollower } from "../common/live_step_follower.js";
import { PadVoice } from "./src/pad_voice.js";
import { KeysVoice } from "./src/keys_voice.js";


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
    // First notify the leaders so they can update their followers with data
    this.voices.forEach(voice => {
      if (voice.musicalRole === "Leader")
        voice.step(index);
    });

    // Then update the followers so they can respond to the current step index
    this.voices.forEach(voice => {
      if (voice.musicalRole !== "Leader")
        voice.step(index);
    });
  }


  #loadVoices() {
    const key = new Key(60, Scale.Minor);
    const midiOut = new MidiOutput("tblswvs.out", true);

    const leader = new PadVoice("Leader", key, midiOut, 1);
    const follower = new KeysVoice("MimickingListener", key, midiOut, 2);
    leader.followers.push(follower);

    this.voices.push(leader);
    this.voices.push(follower);
  }
}
