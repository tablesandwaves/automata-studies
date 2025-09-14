import { Key, Scale } from "tblswvs";
import { Output as MidiOutput } from "easymidi";
import { LiveStepFollower } from "../common/live_step_follower.js";
import { Voice } from "../common/voice.js";
import { PhaseVoice } from "./phase_voice.js";


export class WobbleSequencer {
  #transport;
  voice1;
  voice2;
  voice3;
  voice1Last;
  voice2Last;


  constructor() {
    const key     = new Key(52, Scale.Minor);
    const midiOut = new MidiOutput("tblswvs.out", true);

    this.voice1 = new PhaseVoice(midiOut, 1, key, [1, 3, 5, 7, 8], this);
    this.voice2 = new PhaseVoice(midiOut, 2, key, [5, 4, 3, 2, -1], this);
    this.voice3 = new Voice(midiOut, 10);

    this.#transport = new LiveStepFollower();
    this.#transport.on("step", step => this.tick(step));
  }


  tick(step) {
    if (step === 0 || step === 10) {
      this.voice3.playNote(44, 100);
    }

    this.voice1.tick(step);
    this.voice2.tick(step);

    if (this.voice1Last && this.voice2Last) {
      console.log("----")
      this.voice1.initializeSequence();
      this.voice2.initializeSequence();
    }
  }


  setLastStep(voiceId, isLast) {
    if (voiceId === 1)
      this.voice1Last = isLast;
    else
      this.voice2Last = isLast;
  }


  reportNotePlayed(voiceId, currentStep) {
    if (voiceId === 1 && currentStep !== 0 && (currentStep % 4 === 0))
      this.voice3.playNote(37, 100);
    else if (voiceId === 2 && currentStep !== 0 && (currentStep % 2 === 1))
      this.voice3.playNote(38, 100);
  }
}
