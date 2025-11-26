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
  // The pad and keys voices each choose the number of iterations will play for a leader
  // cycle. The consecutive leader count tracking will make sure no leader role is used
  // more than three times in a row.
  leaderCycles;
  reloadRoles;
  consecutiveLeaderCount = { voice: undefined, iterations: 0 };


  constructor() {
    this.key = new Key(60, Scale.MinPentatonic);
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
    if (state === "stopped") {
      this.voices.forEach(voice => {
        voice.stop();
      });
    }
  }


  step(index) {
    if (index === 15 && this.reloadRoles) {
      this.voices.forEach(voice => voice.stopActiveNotes());
      this.reloadRoles = false;
      this.leaderCycles = 0;
      this.loadVoices();
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
    const [keysRole, padRole] = this.getKeysAndPadRoles();

    const keys = new KeysVoice(keysRole, 2, this);
    const pad  = new PadVoice(padRole, 1, this);

    if (keys.musicalRole === "Leader") {
      keys.followers.push(pad);
    } else {
      pad.followers.push(keys);
    }

    this.voices = [keys, pad];
  }


  getKeysAndPadRoles() {
    const [keysRole, padRole] = (this.consecutiveLeaderCount.iterations == 3) ?
                                this.swapRoles() :
                                this.selectRandomRoles();

    console.log(`\nLeader: ${keysRole === "Leader" ? "Keys" : "Pad"} (${this.consecutiveLeaderCount.iterations})\n`);

    return [keysRole, padRole];
  }


  swapRoles() {
    let keysRole, padRole;

    if (this.consecutiveLeaderCount.voice == "Pad") {
      keysRole = "Leader";
      padRole  = "Follower";
      this.consecutiveLeaderCount.voice = "Keys";
    } else {
      keysRole = "Follower";
      padRole  = "Leader";
      this.consecutiveLeaderCount.voice = "Pad";
    }
    this.consecutiveLeaderCount.iterations = 1;

    return [keysRole, padRole];
  }


  selectRandomRoles() {
    const [keysRole, padRole] = Math.random() > 0.5 ? ["Leader", "Follower"] : ["Follower", "Leader"];

    // Which voice has been selected as the next leader.
    // If it was the leader in the previous round, increment the iteration count.
    // Otherwise, reset the iteration count to start over at 1.
    if (keysRole == "Leader") {
      this.consecutiveLeaderCount = this.consecutiveLeaderCount.voice === "Keys" ?
                                    { voice: "Keys", iterations: this.consecutiveLeaderCount.iterations + 1 } :
                                    { voice: "Keys", iterations: 1 };
    } else {
      this.consecutiveLeaderCount = this.consecutiveLeaderCount.voice === "Pad" ?
                                    { voice: "Pad", iterations: this.consecutiveLeaderCount.iterations + 1 } :
                                    { voice: "Pad", iterations: 1 };
    }

    return [keysRole, padRole];
  }
}
