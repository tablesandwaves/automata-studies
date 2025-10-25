import { Output as MidiOutput } from "easymidi";
import { Key, Scale } from "tblswvs";
import { LiveStepFollower } from "../common/live_step_follower.js";
import { PadVoice } from "./src/pad_voice.js";
import { KeysVoice } from "./src/keys_voice.js";


export class ImprovisingSequencer {
  #transport;
  key;
  midiOut;
  voices;

  // Track the number of generative iterations this voice has been in the leadership role
  leaderCycles;
  reloadRoles;


  constructor() {
    this.key = new Key(60, Scale.Minor);
    this.midiOut = new MidiOutput("tblswvs.out", true);

    this.leaderCycles = 0;
    this.reloadRoles = false;

    // Clock Step From Live
    this.#transport = new LiveStepFollower();
    this.#transport.on("step", index => this.step(index));
    this.#transport.on("transport", state => this.startStop(state))

    this.voices = new Array();
    this.loadVoices();
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
    if (index === 15 && this.reloadRoles) {
      this.voices.forEach(voice => voice.stopActiveNotes());
      this.loadVoices();
      this.reloadRoles = false;
      this.leaderCycles = 0;
    }

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


  loadVoices() {
    const [keysRole, padRole] = Math.random() > 0.5 ? ["Leader", "Follower"] : ["Follower", "Leader"];
    const keys = new KeysVoice(keysRole, 2, this);
    const pad  = new PadVoice(padRole, 1, this);

    if (keys.musicalRole === "Leader") {
      keys.followers.push(pad);
    } else {
      pad.followers.push(keys);
    }

    this.voices = [keys, pad];
    console.log(`Leader: ${keysRole === "Leader" ? "Keys" : "Pad"}`);
  }
}
